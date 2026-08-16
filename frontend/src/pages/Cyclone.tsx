import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import { Wind, Eye, Navigation, Clock, AlertTriangle, ChevronDown } from 'lucide-react';
import { districts } from '../data/districts';
import { CycloneData } from '../types';
import { getSeverityColor } from '../utils/helpers';

const CATEGORY_COLORS: Record<string, string> = {
  'Depression': '#38BDF8',
  'Deep Depression': '#0EA5E9',
  'Cyclonic Storm': '#F59E0B',
  'Severe Cyclonic Storm': '#F97316',
  'Very Severe Cyclonic Storm': '#EF4444',
  'Extremely Severe Cyclonic Storm': '#DC2626',
  'Super Cyclonic Storm': '#7C3AED',
};

const SEVERITY_BG: Record<string, string> = {
  Low: 'bg-sky-100 text-sky-700',
  Moderate: 'bg-amber-100 text-amber-700',
  High: 'bg-orange-100 text-orange-700',
  'Very High': 'bg-red-100 text-red-700',
};

const MOCK_CYCLONE: CycloneData = {
  id: 'cyclone-bo-2026-01',
  name: 'Cyclone Mocha',
  namebn: 'ঘূর্ণিঝড় মোকা',
  basin: 'Bay of Bengal',
  category: 'Very Severe Cyclonic Storm',
  windSpeed: 155,
  pressure: 952,
  direction: 'NNW',
  speed: 18,
  latitude: 15.2,
  longitude: 88.7,
  forecastTrack: [
    { lat: 15.2, lng: 88.7, time: '2026-08-17T06:00:00Z', windSpeed: 155 },
    { lat: 16.1, lng: 88.3, time: '2026-08-17T18:00:00Z', windSpeed: 165 },
    { lat: 17.0, lng: 87.9, time: '2026-08-18T06:00:00Z', windSpeed: 170 },
    { lat: 18.0, lng: 87.6, time: '2026-08-18T18:00:00Z', windSpeed: 160 },
    { lat: 19.1, lng: 87.5, time: '2026-08-19T06:00:00Z', windSpeed: 140 },
    { lat: 20.3, lng: 87.8, time: '2026-08-19T18:00:00Z', windSpeed: 110 },
  ],
  bulletins: [
    {
      id: 'b1',
      time: '2026-08-16T12:00:00Z',
      headline: 'Cyclone Mocha intensifying rapidly over central BoB',
      headlinebn: 'ঘূর্ণিঝড় মোকা বঙ্গোপসাগরে দ্রুত তীব্র হচ্ছে',
      body: 'IMD reports Cyclone Mocha has intensified into a Very Severe Cyclonic Storm. Wind speeds have increased to 155 km/h gusting to 185 km/h. Expected to continue moving NNW towards the West Bengal–Odisha coast over the next 48 hours.',
      bodybn: 'আইএমডি জানিয়েছে যে ঘূর্ণিঝড় মোকা একটি তীব্র ঘূর্ণিঝড়ে পরিণত হয়েছে। বাতাসের গতি ১৫৫ কিমি/ঘণ্টা বৃদ্ধি পেয়েছে।',
      severity: 'Very High',
    },
    {
      id: 'b2',
      time: '2026-08-16T06:00:00Z',
      headline: 'Red warning issued for coastal districts',
      headlinebn: 'উপকূলীয় জেলাগুলোর জন্য লাল সতর্কতা জারি',
      body: 'IMD has issued a Red warning for Purba Medinipur, South 24 Parganas, and North 24 Parganas. Heavy to very heavy rainfall of 200–250mm expected in 24 hours. Fishermen advised not to venture into the sea.',
      bodybn: 'আইএমডি পূর্ব মেদিনীপুর, দক্ষিণ ২৪ পরগনা এবং উত্তর ২৪ পরগনার জন্য লাল সতর্কতা জারি করেছে।',
      severity: 'Very High',
    },
    {
      id: 'b3',
      time: '2026-08-15T18:00:00Z',
      headline: 'Storm surge warning: 2–3 meters above astronomical tide',
      headlinebn: 'ঝড়ের জোয়ার সতর্কতা: ২-৩ মিটার জোয়ারের উপরে',
      body: 'A storm surge of 2–3 meters above the astronomical tide is expected along the coast of West Bengal and Odisha when the cyclone makes landfall. Low-lying areas in Sundarbans may face inundation.',
      bodybn: 'ঘূর্ণিঝড় স্থলভাগে পৌঁছালে পশ্চিমবঙ্গ ও ওড়িশা উপকূলে ২-৩ মিটার ঝড়ের জোয়ার প্রত্যাশিত।',
      severity: 'High',
    },
    {
      id: 'b4',
      time: '2026-08-15T12:00:00Z',
      headline: 'Cyclone watch issued for Bay of Bengal',
      headlinebn: 'বঙ্গোপসাগরের জন্য ঘূর্ণিঝড় সতর্কতা জারি',
      body: 'A depression over the central Bay of Bengal has intensified into a Deep Depression and is likely to further intensify into a cyclonic storm within the next 12 hours. Coastal residents are advised to stay alert.',
      bodybn: 'বঙ্গোপসাগরের কেন্দ্রীয় অংশে একটি অবনতি গভীর অবনতিতে পরিণত হয়েছে।',
      severity: 'Moderate',
    },
  ],
};

function getCategoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] || '#64748B';
}

function getCountdown(target: string): string {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return '00:00:00';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Cyclone() {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [countdown, setCountdown] = useState('');
  const [showAllBulletins, setShowAllBulletins] = useState(false);

  const cyclone = MOCK_CYCLONE;
  const landfallTime = cyclone.forecastTrack[cyclone.forecastTrack.length - 1].time;
  const displayedBulletins = showAllBulletins
    ? cyclone.bulletins
    : cyclone.bulletins.slice(0, 2);

  useEffect(() => {
    const tick = () => setCountdown(getCountdown(landfallTime));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [landfallTime]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [18.5, 87.5],
      zoom: 6,
      zoomControl: false,
      maxBounds: [[5, 80], [28, 95]],
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 18,
    }).addTo(map);

    const catColor = getCategoryColor(cyclone.category);

    const trackCoords: [number, number][] = cyclone.forecastTrack.map(
      (pt) => [pt.lat, pt.lng]
    );

    L.polyline(trackCoords, {
      color: catColor,
      weight: 3,
      opacity: 0.7,
      dashArray: '8,6',
      lineCap: 'round',
    }).addTo(map);

    cyclone.forecastTrack.forEach((pt, i) => {
      const isCurrent = i === 0;
      const marker = L.circleMarker([pt.lat, pt.lng], {
        radius: isCurrent ? 10 : 5,
        fillColor: isCurrent ? catColor : '#fff',
        color: isCurrent ? '#fff' : catColor,
        weight: isCurrent ? 3 : 2,
        opacity: 1,
        fillOpacity: isCurrent ? 1 : 0.7,
      }).addTo(map);

      marker.bindPopup(
        `<div style="font-family:Inter,sans-serif;padding:4px 0;">
          <div style="font-size:12px;font-weight:600;color:#0F172A;">${
            isCurrent ? cyclone.name : `Forecast #${i}`
          }</div>
          <div style="font-size:11px;color:#475569;margin-top:2px;">
            ${new Date(pt.time).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })} · ${pt.windSpeed} km/h
          </div>
        </div>`,
        { closeButton: false }
      );
    });

    const eyeIcon = L.divIcon({
      className: '',
      html: `<div style="
        width:28px;height:28px;border-radius:50%;
        background:${catColor};
        border:3px solid #fff;
        box-shadow:0 0 20px ${catColor}80, 0 0 40px ${catColor}40;
        display:flex;align-items:center;justify-content:center;
      ">
        <div style="width:8px;height:8px;border-radius:50%;background:#fff;"></div>
      </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    L.marker([cyclone.latitude, cyclone.longitude], { icon: eyeIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:Inter,sans-serif;padding:4px 0;">
          <div style="font-size:13px;font-weight:700;color:#0F172A;">🌀 ${cyclone.name}</div>
          <div style="font-size:11px;color:#475569;margin-top:3px;">
            ${cyclone.category}<br/>
            Wind: ${cyclone.windSpeed} km/h · ${cyclone.pressure} hPa
          </div>
        </div>`,
        { closeButton: false }
      );

    map.flyTo([17.5, 88.0], 7, { duration: 1.5 });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌀</span>
          <h1 className="text-2xl font-bold text-white">{t('cyclone.title')}</h1>
          <span className="ml-auto bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
            {t('common.live')}
          </span>
        </div>
      </div>

      {/* Countdown Banner */}
      <div className="px-4 mb-3">
        <div className="bg-gradient-to-r from-red-600/30 to-orange-500/20 backdrop-blur-sm rounded-2xl p-4 border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="text-xs font-medium text-red-300 uppercase tracking-wide">
              {t('cyclone.countdown')}
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-poppins font-bold text-white tabular-nums tracking-wider">
              {countdown}
            </span>
            <span className="text-xs text-red-300/70">
              {isBn ? 'সম্ভাব্য স্থলভাগ' : 'Est. Landfall'}
            </span>
          </div>
        </div>
      </div>

      {/* Cyclone Info Card */}
      <div className="px-4 mb-3">
        <div className="glass-card p-4 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-heading">
                {isBn ? cyclone.namebn : cyclone.name}
              </h2>
              <p className="text-xs text-body/60">
                {cyclone.basin} · {cyclone.category}
              </p>
            </div>
            <span
              className="severity-badge text-[11px]"
              style={{
                backgroundColor: getCategoryColor(cyclone.category) + '20',
                color: getCategoryColor(cyclone.category),
              }}
            >
              {cyclone.category}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Wind className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[10px] text-body/50 uppercase tracking-wide">
                  {t('cyclone.wind_speed')}
                </span>
              </div>
              <p className="text-lg font-bold text-heading">
                {cyclone.windSpeed} <span className="text-xs font-normal text-body/60">km/h</span>
              </p>
            </div>

            <div className="bg-surface/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Eye className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-[10px] text-body/50 uppercase tracking-wide">
                  {t('cyclone.pressure')}
                </span>
              </div>
              <p className="text-lg font-bold text-heading">
                {cyclone.pressure} <span className="text-xs font-normal text-body/60">hPa</span>
              </p>
            </div>

            <div className="bg-surface/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-body/50 uppercase tracking-wide">
                  {t('cyclone.direction')}
                </span>
              </div>
              <p className="text-lg font-bold text-heading">
                {cyclone.direction}{' '}
                <span className="text-xs font-normal text-body/60">
                  {cyclone.speed} km/h
                </span>
              </p>
            </div>

            <div className="bg-surface/50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] text-body/50 uppercase tracking-wide">
                  {t('cyclone.category')}
                </span>
              </div>
              <p
                className="text-sm font-bold"
                style={{ color: getCategoryColor(cyclone.category) }}
              >
                {cyclone.category}
              </p>
            </div>
          </div>

          {/* Coordinates */}
          <div className="mt-3 flex items-center gap-4 text-[10px] text-body/40">
            <span>Lat: {cyclone.latitude.toFixed(2)}°N</span>
            <span>Lng: {cyclone.longitude.toFixed(2)}°E</span>
            <span>
              {isBn ? 'শেষ আপডেট' : 'Updated'}:{' '}
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Full-screen Map */}
      <div className="px-4 mb-3">
        <div className="rounded-2xl overflow-hidden border border-white/10">
          <div className="flex items-center justify-between px-4 py-2 bg-surface/50 backdrop-blur-sm">
            <span className="text-xs font-semibold text-heading">
              {t('cyclone.projected_path')}
            </span>
            <span className="text-[10px] text-body/50">
              {cyclone.forecastTrack.length} {isBn ? 'পূর্বাভাস বিন্দু' : 'forecast points'}
            </span>
          </div>
          <div ref={mapRef} className="w-full h-[55vh]" />
        </div>
      </div>

      {/* IMD Bulletins */}
      <div className="px-4 pb-24">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-base font-bold text-heading">
            {t('cyclone.bulletins')}
          </h3>
          <span className="ml-1 bg-amber-500/20 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            IMD
          </span>
        </div>

        <div className="space-y-3">
          {displayedBulletins.map((bulletin, i) => (
            <div
              key={bulletin.id}
              className="glass-card p-4 border border-white/10 animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-body/50" />
                  <span className="text-[10px] text-body/50">
                    {new Date(bulletin.time).toLocaleString(
                      isBn ? 'bn-BD' : 'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      }
                    )}
                  </span>
                </div>
                <span
                  className={`severity-badge text-[10px] ${
                    SEVERITY_BG[bulletin.severity] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {bulletin.severity}
                </span>
              </div>

              <h4 className="text-sm font-bold text-heading mb-1.5 leading-snug">
                {isBn ? bulletin.headlinebn : bulletin.headline}
              </h4>

              <p className="text-xs text-body/70 leading-relaxed">
                {isBn ? bulletin.bodybn : bulletin.body}
              </p>
            </div>
          ))}
        </div>

        {cyclone.bulletins.length > 2 && (
          <button
            onClick={() => setShowAllBulletins(!showAllBulletins)}
            className="w-full mt-3 flex items-center justify-center gap-1.5 glass-card py-2.5 text-xs font-medium text-body hover:text-heading transition-colors border border-white/10"
          >
            <span>
              {showAllBulletins
                ? isBn
                  ? 'কম দেখুন'
                  : 'Show Less'
                : isBn
                ? `আরও ${cyclone.bulletins.length - 2}টি বুলেটিন দেখুন`
                : `View ${cyclone.bulletins.length - 2} more bulletins`}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${
                showAllBulletins ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
