import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  BellOff,
  Filter,
  CheckCircle,
  Share2,
  AlertTriangle,
  MapPin,
  Clock,
  ChevronDown,
  X,
} from 'lucide-react';
import { districts } from '../data/districts';
import { EVENT_TYPES, EVENT_TYPE_LABELS } from '../utils/helpers';
import { getSeverityColor } from '../utils/helpers';

interface AlertItem {
  id: string;
  title: string;
  titleEn: string;
  message: string;
  messageEn: string;
  district: string;
  severity: 'green' | 'yellow' | 'orange' | 'red';
  eventType: string;
  timestamp: string;
  read: boolean;
}

interface SubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  district: string;
  eventTypes: string[];
  language: string;
}

const MOCK_ALERTS: AlertItem[] = [
  {
    id: '1',
    title: 'বন্যা সতর্কতা: কোলকাতা জেলা',
    titleEn: 'Flood Warning: Kolkata District',
    message: 'হুগলি নদীর জলস্তর বিপদ সীমার কাছে পৌঁছেছে। নিম্নাঞ্চলের বাসিন্দাদের সতর্ক থাকার অনুরোধ করা হচ্ছে।',
    messageEn: 'Hooghly river levels are near danger mark. Residents of low-lying areas are advised to stay alert.',
    district: 'kolkata',
    severity: 'red',
    eventType: 'floods',
    timestamp: '2026-08-16T08:30:00Z',
    read: false,
  },
  {
    id: '2',
    title: 'তীব্র ঝড় সতর্কতা: উত্তর ২৪ পরগনা',
    titleEn: 'Severe Storm Warning: North 24 Parganas',
    message: 'আসন্ন ৪৮ ঘণ্টায় উত্তর ২৪ পরগনা জেলায় তীব্র ঝড় ও বৃষ্টি হতে পারে। মৎস্যজীবীদের সমুদ্রে না যাওয়ার অনুরোধ।',
    messageEn: 'Heavy storms and rainfall expected in North 24 Parganas over the next 48 hours. Fishermen advised not to venture into the sea.',
    district: 'north-24-parganas',
    severity: 'orange',
    eventType: 'severeStorms',
    timestamp: '2026-08-16T06:15:00Z',
    read: false,
  },
  {
    id: '3',
    title: 'ভূমিকম্প সতর্কতা: জলপাইগুড়ি অঞ্চল',
    titleEn: 'Earthquake Alert: Jalpaiguri Region',
    message: 'জলপাইগুড়ি অঞ্চলে ৩.৮ মাত্রার ভূমিকম্প অনুভূত হয়েছে। ক্ষতির কোনো সূচনা নেই।',
    messageEn: 'A 3.8 magnitude earthquake has been felt in Jalpaiguri region. No reports of damage.',
    district: 'jalpaiguri',
    severity: 'yellow',
    eventType: 'earthquakes',
    timestamp: '2026-08-15T14:20:00Z',
    read: true,
  },
  {
    id: '4',
    title: 'ভূমিধস সতর্কতা: দার্জিলিং পাহাড়ি এলাকা',
    titleEn: 'Landslide Warning: Darjeeling Hill Area',
    message: 'অবিরাম বৃষ্টির কারণে দার্জিলিং পাহাড়ি এলাকায় ভূমিধসের ঝুঁকি বেশি।',
    messageEn: 'Increased risk of landslides in Darjeeling hill area due to continuous rainfall.',
    district: 'darjeeling',
    severity: 'orange',
    eventType: 'landslides',
    timestamp: '2026-08-15T10:00:00Z',
    read: true,
  },
  {
    id: '5',
    title: 'তাপপ্রবাহ সতর্কতা: পুরুলিয়া জেলা',
    titleEn: 'Heat Wave Alert: Purulia District',
    message: 'পুরুলিয়া জেলায় তাপমাত্রা ৪০ ডিগ্রি সেলসিয়াসের উপরে উঠতে পারে। বাইরে কাজ এড়িয়ে চলুন।',
    messageEn: 'Temperatures in Purulia District may exceed 40°C. Avoid outdoor work during peak hours.',
    district: 'purulia',
    severity: 'yellow',
    eventType: 'temperatureExtremes',
    timestamp: '2026-08-14T16:45:00Z',
    read: true,
  },
  {
    id: '6',
    title: 'সামুদ্রিক সতর্কতা: দীঘা উপকূল',
    titleEn: 'Sea Condition Alert: Digha Coast',
    message: 'দীঘা উপকূলে সমুদ্রের ঢেউ ২-৩ মিটার উচ্চতায় উঠতে পারে। মৎস্যজীবীদের সতর্ক থাকার অনুরোধ।',
    messageEn: 'Sea waves along Digha coast may rise to 2-3 meters. Fishermen advised to stay alert.',
    district: 'purba-medinipur',
    severity: 'green',
    eventType: 'severeStorms',
    timestamp: '2026-08-14T09:10:00Z',
    read: false,
  },
];

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function Alerts() {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [subscriptionLang, setSubscriptionLang] = useState<'bn' | 'en'>(
    isBn ? 'bn' : 'en'
  );
  const [subscribing, setSubscribing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_ALERTS);
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterEventType, setFilterEventType] = useState('');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
        });
      });
    }
  }, []);

  const toggleEventType = useCallback((eventType: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventType)
        ? prev.filter((e) => e !== eventType)
        : [...prev, eventType]
    );
  }, []);

  const handleSubscribe = async () => {
    if (!('Notification' in window)) {
      alert(t('alerts.notificationsNotSupported'));
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return;
    }

    if (!selectedDistrict || selectedEvents.length === 0) {
      return;
    }

    setSubscribing(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BFzqiFVC5mtEmRQcqg-VRTi4Inu21i6Lbdb0FuYQ-Ud1LEHsHox7lseVlRNg2VG4SdKoMsr4swnj63S-TZbRrX0'
        ) as BufferSource,
      });

      const subscriptionJSON = subscription.toJSON();
      const payload: SubscriptionPayload = {
        endpoint: subscriptionJSON.endpoint || '',
        keys: (subscriptionJSON.keys as { p256dh: string; auth: string }) || {
          p256dh: '',
          auth: '',
        },
        district: selectedDistrict,
        eventTypes: selectedEvents,
        language: subscriptionLang,
      };

      await fetch(`${__API_BASE__ || ''}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setIsSubscribed(true);
    } catch (err) {
      console.error('Push subscription failed:', err);
    } finally {
      setSubscribing(false);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error('Unsubscribe failed:', err);
    }
  };

  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const shareOnWhatsApp = (alert: AlertItem) => {
    const text = isBn
      ? `${alert.title}\n\n${alert.message}`
      : `${alert.titleEn}\n\n${alert.messageEn}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filterDistrict && alert.district !== filterDistrict) return false;
    if (filterSeverity && alert.severity !== filterSeverity) return false;
    if (filterEventType && alert.eventType !== filterEventType) return false;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white px-4 py-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="w-6 h-6 text-heading" />
          <h1 className="text-2xl font-bold text-heading">
            {t('alerts.title')}
          </h1>
          {unreadCount > 0 && (
            <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Push Notification Subscription */}
      <div className="glass-card rounded-2xl p-5 mb-6 border border-white/60 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          {isSubscribed ? (
            <Bell className="w-5 h-5 text-green-500" />
          ) : (
            <BellOff className="w-5 h-5 text-body" />
          )}
          <h2 className="text-lg font-semibold text-heading">
            {t('alerts.pushNotifications')}
          </h2>
        </div>

        <p className="text-body text-sm mb-4">
          {t('alerts.pushDescription')}
        </p>

        {/* District Selector */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-heading mb-1">
            {t('alerts.selectDistrict')}
          </label>
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full appearance-none bg-white/70 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="">{t('alerts.chooseDistrict')}</option>
              {districts.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {isBn ? d.namebn : d.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-body pointer-events-none" />
          </div>
        </div>

        {/* Event Type Checkboxes */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-heading mb-2">
            {t('alerts.eventTypes')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EVENT_TYPES.map((eventType) => (
              <label
                key={eventType}
                className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedEvents.includes(eventType)}
                  onChange={() => toggleEventType(eventType)}
                  className="w-4 h-4 rounded border-gray-300 text-sky-500 focus:ring-sky-400"
                />
                <span className="text-sm text-body">
                  {EVENT_TYPE_LABELS[eventType]?.[isBn ? 'bn' : 'en'] || eventType}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Language Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-heading mb-1">
            {t('alerts.preferredLanguage')}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setSubscriptionLang('bn')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                subscriptionLang === 'bn'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-white/70 border border-gray-200 text-body hover:bg-white'
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => setSubscriptionLang('en')}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                subscriptionLang === 'en'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-white/70 border border-gray-200 text-body hover:bg-white'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Subscribe / Unsubscribe */}
        {isSubscribed ? (
          <button
            onClick={handleUnsubscribe}
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 rounded-xl py-2.5 text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            <BellOff className="w-4 h-4" />
            {t('alerts.turnOffAlerts')}
          </button>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={
              subscribing || !selectedDistrict || selectedEvents.length === 0
            }
            className="w-full flex items-center justify-center gap-2 bg-sky-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Bell className="w-4 h-4" />
            {subscribing ? t('alerts.subscribing') : t('alerts.turnOnAlerts')}
          </button>
        )}
      </div>

      {/* Alert History */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-heading">
            {t('alerts.alertHistory')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 text-sm text-body hover:text-heading transition-colors"
            >
              <Filter className="w-4 h-4" />
              {t('alerts.filters')}
            </button>
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-sm text-sky-600 hover:text-sky-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              {t('alerts.markAllRead')}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="glass-card rounded-xl p-4 mb-4 border border-white/60 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-heading">
                {t('alerts.filterAlerts')}
              </span>
              <button
                onClick={() => setShowFilters(false)}
                className="text-body hover:text-heading"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* District Filter */}
            <div>
              <label className="block text-xs font-medium text-body mb-1">
                {t('alerts.district')}
              </label>
              <div className="relative">
                <select
                  value={filterDistrict}
                  onChange={(e) => setFilterDistrict(e.target.value)}
                  className="w-full appearance-none bg-white/70 border border-gray-200 rounded-lg px-3 py-2 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  <option value="">{t('alerts.allDistricts')}</option>
                  {districts.map((d) => (
                    <option key={d.slug} value={d.slug}>
                      {isBn ? d.namebn : d.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-body pointer-events-none" />
              </div>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-xs font-medium text-body mb-1">
                {t('alerts.severity')}
              </label>
              <div className="flex gap-2 flex-wrap">
                {(['', 'green', 'yellow', 'orange', 'red'] as const).map(
                  (sev) => (
                    <button
                      key={sev}
                      onClick={() => setFilterSeverity(sev)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        filterSeverity === sev
                          ? 'ring-2 ring-sky-400'
                          : ''
                      }`}
                      style={
                        sev
                          ? {
                              backgroundColor: getSeverityColor(sev) + '20',
                              color: getSeverityColor(sev),
                              borderColor: getSeverityColor(sev) + '40',
                            }
                          : {
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                              borderColor: '#e2e8f0',
                            }
                      }
                    >
                      {sev
                        ? t(`alerts.severityLevels.${sev}`)
                        : t('alerts.all')}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Event Type Filter */}
            <div>
              <label className="block text-xs font-medium text-body mb-1">
                {t('alerts.eventType')}
              </label>
              <div className="relative">
                <select
                  value={filterEventType}
                  onChange={(e) => setFilterEventType(e.target.value)}
                  className="w-full appearance-none bg-white/70 border border-gray-200 rounded-lg px-3 py-2 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  <option value="">{t('alerts.allEventTypes')}</option>
                  {EVENT_TYPES.map((eventType) => (
                    <option key={eventType} value={eventType}>
                      {EVENT_TYPE_LABELS[eventType]?.[isBn ? 'bn' : 'en'] || eventType}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-body pointer-events-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 && (
          <div className="glass-card rounded-2xl p-8 text-center border border-white/60">
            <AlertTriangle className="w-10 h-10 text-body mx-auto mb-2 opacity-40" />
            <p className="text-body text-sm">{t('alerts.noAlertsFound')}</p>
          </div>
        )}

        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`glass-card rounded-2xl p-4 border shadow-sm transition-all ${
              alert.read
                ? 'border-white/60'
                : 'border-sky-200 ring-1 ring-sky-100'
            }`}
          >
            {/* Top bar: severity badge + timestamp */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getSeverityColor(alert.severity) }}
                />
                <span
                  className="text-xs font-semibold uppercase tracking-wide"
                  style={{ color: getSeverityColor(alert.severity) }}
                >
                  {t(`alerts.severityLevels.${alert.severity}`)}
                </span>
                <span className="text-xs text-body bg-gray-100 rounded px-1.5 py-0.5">
                  {EVENT_TYPE_LABELS[alert.eventType]?.[isBn ? 'bn' : 'en'] || alert.eventType}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-body">
                <Clock className="w-3 h-3" />
                {new Date(alert.timestamp).toLocaleDateString(
                  isBn ? 'bn-BD' : 'en-US',
                  { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-sm font-bold text-heading mb-1">
              {isBn ? alert.title : alert.titleEn}
            </h3>

            {/* District */}
            <div className="flex items-center gap-1 mb-2">
              <MapPin className="w-3 h-3 text-body" />
              <span className="text-xs text-body">
                {districts.find((d) => d.slug === alert.district)
                  ? isBn
                    ? districts.find((d) => d.slug === alert.district)!.namebn
                    : districts.find((d) => d.slug === alert.district)!.name
                  : alert.district}
              </span>
            </div>

            {/* Message */}
            <p className="text-sm text-body leading-relaxed mb-3">
              {isBn ? alert.message : alert.messageEn}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setAlerts((prev) =>
                    prev.map((a) =>
                      a.id === alert.id ? { ...a, read: true } : a
                    )
                  );
                }}
                className={`text-xs ${
                  alert.read
                    ? 'text-gray-400 cursor-default'
                    : 'text-sky-600 hover:text-sky-700'
                } transition-colors`}
                disabled={alert.read}
              >
                {alert.read ? t('alerts.read') : t('alerts.markAsRead')}
              </button>

              <button
                onClick={() => shareOnWhatsApp(alert)}
                className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 bg-green-50 rounded-lg px-3 py-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                WhatsApp
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
