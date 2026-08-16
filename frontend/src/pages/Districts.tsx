import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { districts } from '../data/districts';
import { useGeolocation } from '../hooks/useData';
import { findNearestDistrict } from '../data/districts';

export default function Districts() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { location } = useGeolocation();
  const [search, setSearch] = useState('');

  const nearest = location ? findNearestDistrict(location.lat, location.lng) : null;

  const filtered = districts.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.namebn.includes(search)
  );

  const severityData = districts.map(() => {
    const r = Math.random();
    if (r < 0.6) return { color: '#22C55E', label: t('severity.safe'), labelBn: 'নিরাপদ' };
    if (r < 0.85) return { color: '#EAB308', label: t('severity.watch'), labelBn: 'সতর্ক' };
    if (r < 0.95) return { color: '#F59E0B', label: t('severity.danger'), labelBn: 'বিপদ' };
    return { color: '#EF4444', label: t('severity.severe'), labelBn: 'তীব্র' };
  });

  return (
    <div className="px-4 py-4 space-y-4">
      <h1 className="text-lg font-poppins font-bold text-heading">{t('districts.title')}</h1>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={t('districts.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface rounded-xl text-sm text-heading placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {/* Your District */}
      {nearest && (
        <div className="glass-card p-3 border-l-3" style={{ borderLeftColor: '#0EA5E9' }}>
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-3.5 h-3.5 text-primary-500" />
            <span className="text-[10px] font-medium text-primary-600">{t('home.your_district')}</span>
          </div>
          <p className="text-sm font-semibold text-heading">{i18n.language === 'bn' ? nearest.namebn : nearest.name}</p>
        </div>
      )}

      {/* District Grid */}
      <div className="grid grid-cols-2 gap-2">
        {filtered.map((d, i) => {
          const idx = districts.indexOf(d);
          const sev = severityData[idx];
          return (
            <div
              key={d.slug}
              className="glass-card-hover p-3 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${i * 25}ms` }}
              onClick={() => navigate(`/district/${d.slug}`)}
            >
              <div className="flex items-start justify-between mb-1">
                <p className="text-xs font-semibold text-heading leading-tight flex-1 mr-1">
                  {i18n.language === 'bn' ? d.namebn : d.name}
                </p>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: sev.color }} />
              </div>
              <p className="text-[10px] text-body/50 mb-1.5">{i18n.language === 'bn' ? d.headquartersbn : d.headquarters}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${sev.color}15`, color: sev.color }}>
                  {i18n.language === 'bn' ? sev.labelBn : sev.label}
                </span>
                {d.rivers.length > 0 && (
                  <span className="text-[9px] text-body/40">{d.rivers[0]}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
