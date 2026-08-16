import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import webpush from 'web-push';
import cron from 'node-cron';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:admin@bmwatch.example';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
}

// In-memory store (replace with PostgreSQL in production)
interface Subscription {
  id: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
  district: string;
  eventTypes: string[];
  language: string;
  createdAt: string;
}

interface Bulletin {
  id: string;
  title: string;
  titlebn: string;
  body: string;
  bodybn: string;
  severity: 'green' | 'yellow' | 'orange' | 'red';
  district: string | null;
  postedBy: string;
  createdAt: string;
  expiresAt: string;
}

const subscriptions: Subscription[] = [];
const bulletins: Bulletin[] = [];
const notifiedEvents = new Map<string, string>(); // eventId -> lastNotifiedAt
const notificationQueue: { sub: Subscription; payload: string }[] = [];

// Rate limiting: max 1 push per severity per district per hour (except Orange/Red)
const lastNotified = new Map<string, number>(); // `${severity}:${district}` -> timestamp

function canNotify(severity: string, district: string): boolean {
  const key = `${severity}:${district}`;
  const last = lastNotified.get(key) || 0;
  const now = Date.now();
  const hourMs = 3600000;
  // Orange and Red override the limit
  if (severity === 'orange' || severity === 'red') return true;
  return now - last > hourMs;
}

function markNotified(severity: string, district: string) {
  lastNotified.set(`${severity}:${district}`, Date.now());
}

// ─── Subscription Routes ───

app.post('/api/subscribe', (req, res) => {
  const { endpoint, keys, district, eventTypes, language } = req.body;
  if (!endpoint || !keys || !district) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existing = subscriptions.find(s => s.endpoint === endpoint);
  if (existing) {
    existing.district = district;
    existing.eventTypes = eventTypes || [];
    existing.language = language || 'bn';
    return res.json({ success: true, id: existing.id, message: 'Subscription updated' });
  }

  const sub: Subscription = {
    id: uuidv4(),
    endpoint,
    keys,
    district,
    eventTypes: eventTypes || ['floods', 'severeStorms', 'earthquakes'],
    language: language || 'bn',
    createdAt: new Date().toISOString(),
  };
  subscriptions.push(sub);
  res.json({ success: true, id: sub.id });
});

app.post('/api/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  const idx = subscriptions.findIndex(s => s.endpoint === endpoint);
  if (idx >= 0) {
    subscriptions.splice(idx, 1);
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Subscription not found' });
});

app.get('/api/subscriptions', (_req, res) => {
  res.json({ count: subscriptions.length, subscriptions: subscriptions.map(s => ({ id: s.id, district: s.district, eventTypes: s.eventTypes })) });
});

// ─── Bulletin Routes ───

app.get('/api/bulletins', (_req, res) => {
  const active = bulletins.filter(b => new Date(b.expiresAt) > new Date());
  res.json(active);
});

app.post('/api/bulletins', (req, res) => {
  const { title, titlebn, body, bodybn, severity, district, postedBy, expiresAt } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body required' });
  }
  const bulletin: Bulletin = {
    id: uuidv4(),
    title, titlebn: titlebn || title,
    body, bodybn: bodybn || body,
    severity: severity || 'yellow',
    district: district || null,
    postedBy: postedBy || 'admin',
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt || new Date(Date.now() + 24 * 3600000).toISOString(),
  };
  bulletins.unshift(bulletin);

  // Push to all subscribers (or district-specific)
  const targets = district
    ? subscriptions.filter(s => s.district === district)
    : subscriptions;

  targets.forEach(sub => {
    const lang = sub.language || 'bn';
    const titleText = lang === 'bn' ? (titlebn || title) : title;
    const bodyText = lang === 'bn' ? (bodybn || body) : body;
    const payload = JSON.stringify({
      title: `📋 ${titleText}`,
      body: bodyText,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: `bulletin-${bulletin.id}`,
      url: '/alerts',
    });
    sendPush(sub, payload);
  });

  res.json({ success: true, bulletin });
});

// ─── Push Notification Sender ───

async function sendPush(sub: Subscription, payload: string) {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: sub.keys },
      payload
    );
  } catch (err: any) {
    if (err.statusCode === 410 || err.statusCode === 404) {
      // Subscription expired, remove it
      const idx = subscriptions.findIndex(s => s.endpoint === sub.endpoint);
      if (idx >= 0) subscriptions.splice(idx, 1);
    } else {
      // Retry up to 3 times
      notificationQueue.push({ sub, payload });
    }
  }
}

// ─── EONET Polling (every 5 minutes) ───

const WB_BBOX = '85.77,21.38,89.99,27.05';
const EONET_BASE = 'https://eonet.gsfc.nasa.gov/api/v3';

async function pollEonet() {
  try {
    const res = await fetch(`${EONET_BASE}/events?status=open&days=1&bbox=${WB_BBOX}&limit=50`);
    if (!res.ok) return;
    const data: any = await res.json();
    const events = data.events || [];

    for (const event of events) {
      const eventId = event.id;
      const lastTime = notifiedEvents.get(eventId);
      const eventTime = event.geometry?.[0]?.date || event.closed || '';

      if (lastTime && lastTime >= eventTime) continue;

      const category = event.categories?.[0]?.id || 'unknown';
      const severity = category === 'earthquakes' ? 'orange' :
                       category === 'floods' ? 'red' :
                       category === 'severeStorms' ? 'orange' : 'yellow';

      for (const sub of subscriptions) {
        if (!sub.eventTypes.includes(category)) continue;
        if (!canNotify(severity, sub.district)) continue;

        const lang = sub.language || 'bn';
        const title = `⚠️ ${event.title}`;
        const body = lang === 'bn'
          ? `${event.categories?.[0]?.title || category} - ${sub.district} এর কাছে সক্রিয় ঘটনা`
          : `${event.categories?.[0]?.title || category} - Active event near ${sub.district}`;

        const payload = JSON.stringify({
          title, body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: `eonet-${eventId}`,
          url: '/map',
        });

        await sendPush(sub, payload);
        markNotified(severity, sub.district);
      }

      notifiedEvents.set(eventId, eventTime);
    }
  } catch (err) {
    console.error('EONET poll failed:', err);
  }
}

// ─── Retry Queue ───

async function processRetryQueue() {
  const queue = [...notificationQueue];
  notificationQueue.length = 0;

  for (const item of queue) {
    try {
      await webpush.sendNotification(
        { endpoint: item.sub.endpoint, keys: item.sub.keys },
        item.payload
      );
    } catch {
      // Give up after retries
    }
  }
}

// ─── Cron Jobs ───

// Poll EONET every 5 minutes
cron.schedule('*/5 * * * *', pollEonet);

// Process retry queue every minute
cron.schedule('* * * * *', processRetryQueue);

// ─── EONET Proxy (CORS bypass) ───

app.get('/api/eonet', async (_req, res) => {
  try {
    const eonetRes = await fetch(
      `${EONET_BASE}/events/geojson?status=open&days=7&bbox=${WB_BBOX}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!eonetRes.ok) {
      return res.status(eonetRes.status).json({ error: 'EONET fetch failed' });
    }
    const data = await eonetRes.json();
    res.set('Cache-Control', 'public, max-age=300');
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'EONET proxy error' });
  }
});

// ─── Health Check ───

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    subscriptions: subscriptions.length,
    bulletins: bulletins.length,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/vapid-key', (_req, res) => {
  res.json({ publicKey: VAPID_PUBLIC });
});

// ─── Start Server ───

app.listen(PORT, () => {
  console.log(`🛰️  BM Watch backend running on port ${PORT}`);
  console.log(`📡 EONET polling every 5 minutes`);
  console.log(`🔔 ${subscriptions.length} active subscriptions`);
});

export default app;
