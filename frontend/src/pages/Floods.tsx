import { useTranslation } from 'react-i18next';
import { Droplets, TrendingUp, TrendingDown, Minus, AlertTriangle, MapPin, Info } from 'lucide-react';

interface RiverStation {
  name: string;
  namebn: string;
  currentLevel: number;
  dangerLevel: number;
  normalLevel: number;
  trend: 'rising' | 'falling' | 'steady';
  lastUpdated: string;
  trendChange: number;
  district: string;
  rainfall24h: number;
}

interface RiverData {
  name: string;
  namebn: string;
  riverId: string;
  district: string;
  stations: RiverStation[];
}

type StatusLevel = 'normal' | 'warning' | 'danger' | 'critical';

const MOCK_RIVERS: RiverData[] = [
  {
    name: 'Hooghly',
    namebn: 'হুগলি',
    riverId: 'hooghly',
    district: 'Kolkata',
    stations: [
      {
        name: 'Barrackpore',
        namebn: 'ব্যারাকপুর',
        currentLevel: 8.2,
        dangerLevel: 10.5,
        normalLevel: 5.8,
        trend: 'steady',
        lastUpdated: '2026-08-16T09:05:00Z',
        trendChange: 0.0,
        district: 'Kolkata',
        rainfall24h: 45,
      },
    ],
  },
  {
    name: 'Damodar',
    namebn: 'দামোদর',
    riverId: 'damodar',
    district: 'Burdwan',
    stations: [
      {
        name: 'Durgapur Barrage',
        namebn: 'দুর্গাপুর ব্যারাজ',
        currentLevel: 67.4,
        dangerLevel: 65.0,
        normalLevel: 58.0,
        trend: 'rising',
        lastUpdated: '2026-08-16T08:45:00Z',
        trendChange: 1.2,
        district: 'Burdwan',
        rainfall24h: 112,
      },
    ],
  },
  {
    name: 'Teesta',
    namebn: 'তিস্তা',
    riverId: 'teesta',
    district: 'Alipurduar / Jalpaiguri',
    stations: [
      {
        name: 'Gazole',
        namebn: 'গাজোল',
        currentLevel: 24.7,
        dangerLevel: 25.0,
        normalLevel: 18.0,
        trend: 'rising',
        lastUpdated: '2026-08-16T09:15:00Z',
        trendChange: 0.8,
        district: 'Alipurduar',
        rainfall24h: 78,
      },
    ],
  },
  {
    name: 'Ganga',
    namebn: 'গঙ্গা',
    riverId: 'ganga',
    district: 'Malda',
    stations: [
      {
        name: 'Farakka',
        namebn: 'ফরাক্কা',
        currentLevel: 36.2,
        dangerLevel: 34.5,
        normalLevel: 28.0,
        trend: 'rising',
        lastUpdated: '2026-08-16T08:30:00Z',
        trendChange: 0.4,
        district: 'Malda',
        rainfall24h: 55,
      },
    ],
  },
  {
    name: 'Mahananda',
    namebn: 'মহানন্দা',
    riverId: 'mahananda',
    district: 'Uttar Dinajpur',
    stations: [
      {
        name: 'Siliguri',
        namebn: 'শিলিগুড়ি',
        currentLevel: 15.8,
        dangerLevel: 16.0,
        normalLevel: 10.5,
        trend: 'rising',
        lastUpdated: '2026-08-16T09:10:00Z',
        trendChange: 0.5,
        district: 'Uttar Dinajpur',
        rainfall24h: 92,
      },
    ],
  },
  {
    name: 'Subarnarekha',
    namebn: 'সোনারেখা',
    riverId: 'subarnarekha',
    district: 'Jhargram',
    stations: [
      {
        name: 'Jhargram',
        namebn: 'ঝাড়গ্রাম',
        currentLevel: 11.3,
        dangerLevel: 12.0,
        normalLevel: 8.5,
        trend: 'falling',
        lastUpdated: '2026-08-16T08:55:00Z',
        trendChange: -0.2,
        district: 'Jhargram',
        rainfall24h: 38,
      },
    ],
  },
];

function getStatus(station: RiverStation): StatusLevel {
  let effectiveCurrent = station.currentLevel;
  if (station.rainfall24h > 100) {
    effectiveCurrent = station.dangerLevel * 1.1;
  }

  if (effectiveCurrent >= station.dangerLevel * 1.1) return 'critical';
  if (effectiveCurrent >= station.dangerLevel) return 'danger';
  if (effectiveCurrent >= station.dangerLevel * 0.8) return 'warning';
  return 'normal';
}

function getStatusColors(status: StatusLevel): string {
  switch (status) {
    case 'critical':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'danger':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'warning':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    default:
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
}

function getLevelPercent(station: RiverStation): number {
  const max = station.dangerLevel * 1.2;
  return Math.min((station.currentLevel / max) * 100, 100);
}

function getBarColor(station: RiverStation): string {
  const status = getStatus(station);
  if (status === 'critical' || status === 'danger') return 'bg-red-500';
  if (status === 'warning') return 'bg-amber-500';
  return 'bg-emerald-500';
}

function TrendIcon({ trend, className }: { trend: 'rising' | 'falling' | 'steady'; className?: string }) {
  switch (trend) {
    case 'rising':
      return <TrendingUp className={className || 'w-4 h-4 text-red-500'} />;
    case 'falling':
      return <TrendingDown className={className || 'w-4 h-4 text-emerald-500'} />;
    default:
      return <Minus className={className || 'w-4 h-4 text-slate-400'} />;
  }
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' });
}

function StationCard({
  station,
  t,
  isBn,
}: {
  station: RiverStation;
  t: (key: string) => string;
  isBn: boolean;
}) {
  const status = getStatus(station);
  const effectiveCurrent = station.rainfall24h > 100 ? station.dangerLevel * 1.1 : station.currentLevel;
  const pct = getLevelPercent(station);
  const barColor = getBarColor(station);
  const isAutoFlagged = station.rainfall24h > 100;

  return (
    <div className="glass-card p-3 space-y-2.5 animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-heading">
              {isBn ? station.namebn : station.name}
            </p>
            <p className="text-[11px] text-body/60">{station.namebn} · {station.district}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColors(status)} ${status === 'critical' ? 'animate-pulse' : ''}`}>
          {(status === 'danger' || status === 'critical') && <AlertTriangle className="w-3 h-3" />}
          {t(`floods.${status}`)}
        </span>
      </div>

      {isAutoFlagged && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-lg border border-red-100">
          <AlertTriangle className="w-3 h-3 text-red-500" />
          <span className="text-[10px] text-red-600 font-medium">
            {isBn
              ? `২৪ ঘণ্টায় বৃষ্টিপাত ${station.rainfall24h}মিমি (>১০০মিমি) — স্বয়ংক্রিয় বিপদ চিহ্নিত`
              : `24h rainfall ${station.rainfall24h}mm (>100mm) — auto-flagged to Danger`}
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-[10px] text-body/60 mb-0.5">{t('floods.current')}</p>
          <p className={`text-lg font-poppins font-bold ${
            status === 'danger' || status === 'critical' ? 'text-red-600' : 'text-heading'
          }`}>
            {isAutoFlagged ? effectiveCurrent.toFixed(1) : station.currentLevel}
          </p>
          <p className="text-[10px] text-body/50">m</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-body/60 mb-0.5">{t('floods.danger')}</p>
          <p className="text-lg font-poppins font-bold text-red-500">{station.dangerLevel}</p>
          <p className="text-[10px] text-body/50">m</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-body/60 mb-0.5">{t('floods.normal')}</p>
          <p className="text-lg font-poppins font-bold text-emerald-600">{station.normalLevel}</p>
          <p className="text-[10px] text-body/50">m</p>
        </div>
      </div>

      {/* Level bar */}
      <div className="space-y-1">
        <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-400"
            style={{ left: `${(station.dangerLevel / (station.dangerLevel * 1.2)) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-body/50">
          <span>0 m</span>
          <span>{t('floods.danger')}: {station.dangerLevel}m</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <TrendIcon trend={station.trend} className="w-3.5 h-3.5" />
          <span className={`text-xs font-medium ${
            station.trend === 'rising' ? 'text-red-600' : station.trend === 'falling' ? 'text-emerald-600' : 'text-slate-500'
          }`}>
            {station.trend === 'rising'
              ? `+${station.trendChange}m ${t('floods.rising')}`
              : station.trend === 'falling'
              ? `${station.trendChange}m ${t('floods.falling')}`
              : t('floods.steady')}
          </span>
        </div>
        <span className="text-[10px] text-body/50">{formatTime(station.lastUpdated)}</span>
      </div>
    </div>
  );
}

export default function Floods() {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';

  const allStations = MOCK_RIVERS.flatMap((r) => r.stations);
  const dangerCount = allStations.filter((s) => {
    const status = getStatus(s);
    return status === 'danger' || status === 'critical';
  }).length;
  const risingCount = allStations.filter((s) => s.trend === 'rising').length;

  return (
    <div className="space-y-4 pb-4 animate-slide-up">
      {/* Header */}
      <section className="hero-gradient px-4 pt-5 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Droplets className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-poppins font-bold text-heading">{t('floods.title')}</h1>
        </div>
        <p className="text-xs text-body/70 ml-8">{t('floods.subtitle')}</p>

        {/* Summary badges */}
        <div className="flex gap-2 mt-3 ml-8 flex-wrap">
          {dangerCount > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              {dangerCount} {t('floods.stations_above_danger')}
            </span>
          )}
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            {risingCount} {t('floods.rising')}
          </span>
        </div>
      </section>

      {/* Rivers */}
      <div className="space-y-4 px-4">
        {MOCK_RIVERS.map((river, rIdx) => {
          const riverDanger = river.stations.some((s) => {
            const status = getStatus(s);
            return status === 'danger' || status === 'critical';
          });

          return (
            <section key={river.riverId} className="animate-slide-up" style={{ animationDelay: `${rIdx * 100}ms` }}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Droplets className={`w-5 h-5 ${riverDanger ? 'text-red-500' : 'text-blue-500'}`} />
                  <div>
                    <h2 className="text-base font-poppins font-bold text-heading">
                      {river.name}
                      <span className="text-xs font-normal text-body/60 ml-1.5">
                        {river.namebn}
                      </span>
                    </h2>
                    <p className="text-[11px] text-body/60">{river.district}</p>
                  </div>
                </div>
                {riverDanger && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    {t('floods.alert')}
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                {river.stations.map((station, sIdx) => (
                  <StationCard
                    key={`${river.riverId}-${sIdx}`}
                    station={station}
                    t={t}
                    isBn={isBn}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Info footer */}
      <div className="glass-card mx-4 p-3 flex items-start gap-2 animate-slide-up" style={{ animationDelay: '500ms' }}>
        <Info className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-body/70">{t('floods.info')}</p>
          <p className="text-[10px] text-body/50 mt-1">{t('floods.last_sync')}</p>
        </div>
      </div>
    </div>
  );
}
