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
}

interface RiverData {
  name: string;
  namebn: string;
  riverId: string;
  stations: RiverStation[];
}

const MOCK_RIVERS: RiverData[] = [
  {
    name: 'Ganga',
    namebn: 'গঙ্গা',
    riverId: 'ganga',
    stations: [
      {
        name: 'Farakka Barrage',
        namebn: 'ফরাক্কা ব্যারাজ',
        currentLevel: 36.2,
        dangerLevel: 34.5,
        normalLevel: 28.0,
        trend: 'rising',
        lastUpdated: '2026-08-16T08:30:00Z',
        trendChange: 0.4,
      },
      {
        name: 'Patna',
        namebn: 'পাটনা',
        currentLevel: 42.8,
        dangerLevel: 43.0,
        normalLevel: 35.0,
        trend: 'rising',
        lastUpdated: '2026-08-16T08:15:00Z',
        trendChange: 0.6,
      },
      {
        name: 'Kanpur',
        namebn: 'কানপুর',
        currentLevel: 115.3,
        dangerLevel: 116.0,
        normalLevel: 110.5,
        trend: 'steady',
        lastUpdated: '2026-08-16T08:00:00Z',
        trendChange: 0.0,
      },
    ],
  },
  {
    name: 'Damodar',
    namebn: 'দামোদর',
    riverId: 'damodar',
    stations: [
      {
        name: 'Panchet Dam',
        namebn: 'পাঁচেট বাঁধ',
        currentLevel: 52.6,
        dangerLevel: 50.0,
        normalLevel: 42.0,
        trend: 'rising',
        lastUpdated: '2026-08-16T09:00:00Z',
        trendChange: 1.2,
      },
      {
        name: 'Durgapur Barrage',
        namebn: 'দুর্গাপুর ব্যারাজ',
        currentLevel: 67.4,
        dangerLevel: 65.0,
        normalLevel: 58.0,
        trend: 'falling',
        lastUpdated: '2026-08-16T08:45:00Z',
        trendChange: -0.3,
      },
      {
        name: 'Burdwan',
        namebn: 'বর্ধমান',
        currentLevel: 18.9,
        dangerLevel: 22.0,
        normalLevel: 14.0,
        trend: 'steady',
        lastUpdated: '2026-08-16T08:30:00Z',
        trendChange: 0.1,
      },
    ],
  },
  {
    name: 'Teesta',
    namebn: 'তিস্তা',
    riverId: 'teesta',
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
      },
      {
        name: 'Jalpaiguri',
        namebn: 'জলপাইগুড়ি',
        currentLevel: 31.2,
        dangerLevel: 29.0,
        normalLevel: 22.0,
        trend: 'rising',
        lastUpdated: '2026-08-16T09:00:00Z',
        trendChange: 1.5,
      },
    ],
  },
  {
    name: 'Mahananda',
    namebn: 'মহানন্দা',
    riverId: 'mahananda',
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
      },
      {
        name: 'Malda',
        namebn: 'মালদা',
        currentLevel: 22.4,
        dangerLevel: 21.0,
        normalLevel: 16.0,
        trend: 'falling',
        lastUpdated: '2026-08-16T08:55:00Z',
        trendChange: -0.2,
      },
    ],
  },
  {
    name: 'Hooghly',
    namebn: 'হুগলি',
    riverId: 'hooghly',
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
      },
      {
        name: 'Pragati Maidan',
        namebn: 'প্রগতি ময়দান',
        currentLevel: 4.6,
        dangerLevel: 7.0,
        normalLevel: 3.2,
        trend: 'falling',
        lastUpdated: '2026-08-16T08:50:00Z',
        trendChange: -0.1,
      },
    ],
  },
];

function isAboveDanger(station: RiverStation): boolean {
  return station.currentLevel > station.dangerLevel;
}

function getLevelPercent(station: RiverStation): number {
  const max = station.dangerLevel * 1.2;
  return Math.min((station.currentLevel / max) * 100, 100);
}

function getBarColor(station: RiverStation): string {
  if (isAboveDanger(station)) return 'bg-red-500';
  if (station.currentLevel > station.dangerLevel * 0.9) return 'bg-amber-500';
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

function StationCard({ station, t }: { station: RiverStation; t: (key: string) => string }) {
  const aboveDanger = isAboveDanger(station);
  const pct = getLevelPercent(station);
  const barColor = getBarColor(station);

  return (
    <div className="glass-card p-3 space-y-2.5 animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-heading">{station.name}</p>
            <p className="text-xs text-body/70">{station.namebn}</p>
          </div>
        </div>
        {aboveDanger && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            {t('floods.above_danger')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <p className="text-[10px] text-body/60 mb-0.5">{t('floods.current')}</p>
          <p className={`text-lg font-poppins font-bold ${aboveDanger ? 'text-red-600' : 'text-heading'}`}>
            {station.currentLevel}
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
          <div className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
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
          <span className={`text-xs font-medium ${station.trend === 'rising' ? 'text-red-600' : station.trend === 'falling' ? 'text-emerald-600' : 'text-slate-500'}`}>
            {station.trend === 'rising' ? `+${station.trendChange}m ${t('floods.rising')}` : station.trend === 'falling' ? `${station.trendChange}m ${t('floods.falling')}` : t('floods.steady')}
          </span>
        </div>
        <span className="text-[10px] text-body/50">{formatTime(station.lastUpdated)}</span>
      </div>
    </div>
  );
}

export default function Floods() {
  const { t } = useTranslation();

  const allStations = MOCK_RIVERS.flatMap((r) => r.stations);
  const dangerCount = allStations.filter(isAboveDanger).length;
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
        <div className="flex gap-2 mt-3 ml-8">
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
          const riverDanger = river.stations.some(isAboveDanger);
          const maxLevel = Math.max(...river.stations.map((s) => s.currentLevel));
          const maxDanger = Math.max(...river.stations.map((s) => s.dangerLevel));

          return (
            <section key={river.riverId} className="animate-slide-up" style={{ animationDelay: `${rIdx * 100}ms` }}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Droplets className={`w-5 h-5 ${riverDanger ? 'text-red-500' : 'text-blue-500'}`} />
                  <div>
                    <h2 className="text-base font-poppins font-bold text-heading">{river.name}</h2>
                    <p className="text-xs text-body/60">{river.namebn}</p>
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
