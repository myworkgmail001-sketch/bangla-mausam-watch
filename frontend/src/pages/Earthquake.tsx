import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import { Mountain, MapPin, Clock, Ruler, AlertTriangle, Globe } from 'lucide-react';

interface EarthquakeData {
  id: string;
  magnitude: number;
  depth: number;
  place: string;
  placebn: string;
  lat: number;
  lng: number;
  time: string;
  distanceFromUser: number;
  region: string;
}

const MOCK_QUAKES: EarthquakeData[] = [
  {
    id: 'eq-001',
    magnitude: 5.4,
    depth: 12.3,
    place: 'Sikkim-India Border',
    placebn: 'সিকিম-ভারত সীমান্ত',
    lat: 27.65,
    lng: 88.42,
    time: '2026-08-16T04:23:00Z',
    distanceFromUser: 485,
    region: 'Near Bengal',
  },
  {
    id: 'eq-002',
    magnitude: 3.8,
    depth: 8.1,
    place: 'Darjeeling, West Bengal',
    placebn: 'দার্জিলিং, পশ্চিমবঙ্গ',
    lat: 27.04,
    lng: 88.26,
    time: '2026-08-16T01:47:00Z',
    distanceFromUser: 520,
    region: 'Near Bengal',
  },
  {
    id: 'eq-003',
    magnitude: 6.1,
    depth: 35.0,
    place: 'Sagaing Region, Myanmar',
    placebn: 'সাগাইং অঞ্চল, মিয়ানমার',
    lat: 22.38,
    lng: 95.82,
    time: '2026-08-15T18:12:00Z',
    distanceFromUser: 830,
    region: 'Myanmar',
  },
  {
    id: 'eq-004',
    magnitude: 4.7,
    depth: 18.5,
    place: 'Eastern Nepal',
    placebn: 'পূর্ব নেপাল',
    lat: 26.92,
    lng: 87.21,
    time: '2026-08-15T09:55:00Z',
    distanceFromUser: 580,
    region: 'Nepal',
  },
  {
    id: 'eq-005',
    magnitude: 4.2,
    depth: 22.0,
    place: 'Thimphu, Bhutan',
    placebn: 'থিম্পু, ভুটান',
    lat: 27.47,
    lng: 89.64,
    time: '2026-08-15T06:30:00Z',
    distanceFromUser: 620,
    region: 'Bhutan',
  },
];

function getMagnitudeColor(mag: number): string {
  if (mag < 4) return '#22C55E';
  if (mag < 5) return '#EAB308';
  if (mag < 6) return '#F97316';
  return '#EF4444';
}

function getMagnitudeBg(mag: number): string {
  if (mag < 4) return 'bg-green-100 text-green-700';
  if (mag < 5) return 'bg-yellow-100 text-yellow-700';
  if (mag < 6) return 'bg-orange-100 text-orange-700';
  return 'bg-red-100 text-red-700';
}

function getMagnitudeRadius(mag: number): number {
  return Math.max(mag * 3, 8);
}

function formatTimeAgo(iso: string, t: (key: string) => string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return t('earthquake.minutes_ago');
  if (hours < 24) return `${hours}${t('earthquake.hours_ago')}`;
  const days = Math.floor(hours / 24);
  return `${days}${t('earthquake.days_ago')}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('bn-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function QuakeCard({ quake, t }: { quake: EarthquakeData; t: (key: string) => string }) {
  const magColor = getMagnitudeColor(quake.magnitude);
  const magBg = getMagnitudeBg(quake.magnitude);

  return (
    <div className="glass-card glass-card-hover p-3.5 animate-slide-up">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl font-poppins font-bold text-lg text-white shadow-md"
            style={{ backgroundColor: magColor }}
          >
            {quake.magnitude.toFixed(1)}
          </div>
          <div>
            <p className="text-sm font-semibold text-heading">{quake.place}</p>
            <p className="text-xs text-body/60">{quake.placebn}</p>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${magBg}`}>
          {quake.magnitude < 4 ? t('earthquake.minor') : quake.magnitude < 5 ? t('earthquake.light') : quake.magnitude < 6 ? t('earthquake.moderate') : t('earthquake.strong')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-2">
          <Ruler className="w-3.5 h-3.5 text-primary-500" />
          <div>
            <p className="text-[10px] text-body/60">{t('earthquake.depth')}</p>
            <p className="text-xs font-semibold text-heading">{quake.depth} km</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 rounded-lg px-2.5 py-2">
          <MapPin className="w-3.5 h-3.5 text-primary-500" />
          <div>
            <p className="text-[10px] text-body/60">{t('earthquake.distance')}</p>
            <p className="text-xs font-semibold text-heading">{quake.distanceFromUser} km</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-body/50" />
          <span className="text-[10px] text-body/60">{formatTime(quake.time)}</span>
        </div>
        <span className="text-[10px] text-primary-600 font-medium">
          {formatTimeAgo(quake.time, t)}
        </span>
      </div>
    </div>
  );
}

export default function Earthquake() {
  const { t } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const [selectedQuake, setSelectedQuake] = useState<EarthquakeData | null>(null);
  const [sortBy, setSortBy] = useState<'time' | 'magnitude'>('time');

  const sortedQuakes = [...MOCK_QUAKES].sort((a, b) =>
    sortBy === 'magnitude' ? b.magnitude - a.magnitude : new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  const maxMag = Math.max(...MOCK_QUAKES.map((q) => q.magnitude));
  const avgDepth = (MOCK_QUAKES.reduce((sum, q) => sum + q.depth, 0) / MOCK_QUAKES.length).toFixed(1);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([25.5, 89.0], 5);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    MOCK_QUAKES.forEach((quake) => {
      const color = getMagnitudeColor(quake.magnitude);
      const radius = getMagnitudeRadius(quake.magnitude);

      const circle = L.circleMarker([quake.lat, quake.lng], {
        radius,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      }).addTo(map);

      circle.bindPopup(`
        <div style="font-family: 'Poppins', sans-serif; padding: 4px;">
          <strong style="font-size: 14px; color: ${color};">${quake.magnitude.toFixed(1)} M</strong><br/>
          <span style="font-size: 12px;">${quake.place}</span><br/>
          <span style="font-size: 10px; color: #666;">${quake.placebn}</span><br/>
          <span style="font-size: 10px; color: #999;">Depth: ${quake.depth} km</span>
        </div>
      `);

      circle.on('click', () => setSelectedQuake(quake));
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <div className="space-y-4 pb-4 animate-slide-up">
      {/* Header */}
      <section className="hero-gradient px-4 pt-5 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Mountain className="w-6 h-6 text-orange-600" />
          <h1 className="text-xl font-poppins font-bold text-heading">{t('earthquake.title')}</h1>
        </div>
        <p className="text-xs text-body/70 ml-8">{t('earthquake.subtitle')}</p>

        {/* Summary */}
        <div className="flex gap-2 mt-3 ml-8 flex-wrap">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            {MOCK_QUAKES.length} {t('earthquake.recent_quakes')}
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5" />
            {t('earthquake.max_mag')}: {maxMag.toFixed(1)}
          </span>
        </div>
      </section>

      {/* Map */}
      <div className="mx-4 glass-card overflow-hidden" style={{ height: '280px' }}>
        <div ref={mapRef} className="w-full h-full" />
      </div>

      {/* Sort controls */}
      <div className="px-4 flex items-center gap-2">
        <span className="text-xs text-body/60">{t('earthquake.sort_by')}:</span>
        <button
          onClick={() => setSortBy('magnitude')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${sortBy === 'magnitude' ? 'bg-primary-500 text-white shadow-md' : 'bg-slate-100 text-slate-600'}`}
        >
          {t('earthquake.magnitude')}
        </button>
        <button
          onClick={() => setSortBy('time')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${sortBy === 'time' ? 'bg-primary-500 text-white shadow-md' : 'bg-slate-100 text-slate-600'}`}
        >
          {t('earthquake.time')}
        </button>
        <span className="ml-auto text-[10px] text-body/50">
          {t('earthquake.avg_depth')}: {avgDepth} km
        </span>
      </div>

      {/* Quake cards */}
      <div className="space-y-3 px-4">
        {sortedQuakes.map((quake, idx) => (
          <div
            key={quake.id}
            className={`transition-all ${selectedQuake?.id === quake.id ? 'ring-2 ring-primary-400 rounded-2xl' : ''}`}
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <QuakeCard quake={quake} t={t} />
          </div>
        ))}
      </div>

      {/* Region legend */}
      <div className="glass-card mx-4 p-3 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <p className="text-xs font-semibold text-heading mb-2">{t('earthquake.magnitude_scale')}</p>
        <div className="flex items-center gap-3">
          {[
            { color: '#22C55E', label: `< 4.0` },
            { color: '#EAB308', label: '4.0 – 4.9' },
            { color: '#F97316', label: '5.0 – 5.9' },
            { color: '#EF4444', label: '≥ 6.0' },
          ].map(({ color, label }) => (
            <div key={color} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-body/60">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
