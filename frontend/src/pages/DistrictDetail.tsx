import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOpenMeteo, useEonetEvents } from '../hooks/useData';
import { getDistrictBySlug } from '../data/districts';
import { getWeatherCodeInfo, getCategoryIcon, getCategoryColor, formatRelativeTime, shareToWhatsApp } from '../utils/helpers';
import WeatherChart from '../components/WeatherChart';
import { ArrowLeft, MapPin, Droplets, Wind, Thermometer, Share2, ExternalLink, Users, Ruler, Building, Cloud, CloudRain } from 'lucide-react';

export default function DistrictDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const district = getDistrictBySlug(slug || '');

  const { current, hourly, daily, loading } = useOpenMeteo(district?.lat || 22.57, district?.lng || 88.36);
  const { events } = useEonetEvents();

  if (!district) {
    return (
      <div className="p-8 text-center">
        <p className="text-body">{t('common.error')}</p>
        <button onClick={() => navigate('/districts')} className="btn-primary mt-4">{t('common.back')}</button>
      </div>
    );
  }

  const weatherInfo = current ? getWeatherCodeInfo(current.weatherCode) : null;
  const districtEvents = events.filter(e => !e.closed).slice(0, 5);

  const sev = { color: '#22C55E', label: t('severity.safe') };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="hero-gradient px-4 pt-4 pb-5">
        <button onClick={() => navigate('/districts')} className="flex items-center gap-1 text-xs text-primary-600 mb-3">
          <ArrowLeft className="w-3.5 h-3.5" />
          {t('common.back')}
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-poppins font-bold text-heading">
              {i18n.language === 'bn' ? district.namebn : district.name}
            </h1>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-primary-500" />
              <span className="text-xs text-body/60">{i18n.language === 'bn' ? district.headquartersbn : district.headquarters}</span>
            </div>
            <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${sev.color}15`, color: sev.color }}>
              {sev.label}
            </span>
          </div>
          <div className="text-4xl">{weatherInfo?.icon || '☀️'}</div>
        </div>

        {/* Current Weather */}
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-4xl font-poppins font-bold text-heading">{Math.round(current?.temperature || 0)}</span>
          <span className="text-lg text-heading/60">°C</span>
        </div>
        <p className="text-sm text-body">{weatherInfo?.condition || '...'}</p>
        <p className="text-xs text-body/60">{t('home.feels_like')}: {Math.round(current?.feelsLike || 0)}°C</p>
      </div>

      <div className="px-4 space-y-4 -mt-2">
        {/* Info Cards */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Droplets, label: t('home.humidity'), value: `${current?.humidity || '--'}%` },
            { icon: Wind, label: t('home.wind'), value: `${Math.round(current?.windSpeed || 0)} km/h` },
            { icon: CloudRain, label: t('home.rainfall'), value: `${current?.rainfall || 0} mm` },
          ].map(({ icon: Icon, label, value }, i) => (
            <div key={i} className="glass-card p-3 text-center">
              <Icon className="w-4 h-4 text-primary-500 mx-auto mb-1" />
              <p className="text-[10px] text-body/50">{label}</p>
              <p className="text-xs font-semibold text-heading">{value}</p>
            </div>
          ))}
        </div>

        {/* District Info */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-heading mb-3">{t('common.about') || 'Info'}</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-body/40" />
              <div>
                <p className="text-body/50 text-[10px]">{t('districts.population')}</p>
                <p className="font-medium text-heading">{(district.population / 100000).toFixed(1)}L</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Ruler className="w-3.5 h-3.5 text-body/40" />
              <div>
                <p className="text-body/50 text-[10px]">{t('districts.area')}</p>
                <p className="font-medium text-heading">{district.area} km²</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-body/40" />
              <div>
                <p className="text-body/50 text-[10px]">{t('districts.headquarters')}</p>
                <p className="font-medium text-heading">{i18n.language === 'bn' ? district.headquartersbn : district.headquarters}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5 text-body/40" />
              <div>
                <p className="text-body/50 text-[10px]">{t('districts.rivers')}</p>
                <p className="font-medium text-heading">{district.rivers.join(', ') || '--'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* River Levels */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-heading mb-3">{t('districts.river_levels')}</h3>
          {district.rivers.map((river, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-xs font-medium text-heading">{river}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-severity-green font-medium">
                Normal
              </span>
            </div>
          ))}
          {district.rivers.length === 0 && (
            <p className="text-xs text-body/40">{t('districts.no_rivers')}</p>
          )}
        </div>

        {/* 24h Chart */}
        {hourly.length > 0 && (
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-heading mb-3">{t('home.forecast_24h')}</h3>
            <WeatherChart hourly={hourly} />
          </div>
        )}

        {/* 7-Day Forecast */}
        {daily.length > 0 && (
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-heading mb-3">{t('home.forecast_7day')}</h3>
            <div className="space-y-2">
              {daily.map((day, i) => {
                const info = getWeatherCodeInfo(day.weatherCode);
                const dayName = i === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <div key={day.date} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs font-medium text-heading w-12">{dayName}</span>
                    <span className="text-lg">{info.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-heading">{Math.round(day.tempMax)}°</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: '60%', background: 'linear-gradient(90deg, #38BDF8, #EF4444)' }} />
                        </div>
                        <span className="text-xs text-body/60">{Math.round(day.tempMin)}°</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-body/60">{day.precipitationProbability}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Nearby Events */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-heading mb-3">{t('home.active_events')}</h3>
          {districtEvents.length > 0 ? (
            <div className="space-y-2">
              {districtEvents.map(event => (
                <div key={event.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-lg">{getCategoryIcon(event.category)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-heading truncate">{event.title}</p>
                    <p className="text-[10px] text-body/50">{formatRelativeTime(event.date)}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${getCategoryColor(event.category)}15`, color: getCategoryColor(event.category) }}>
                    {event.categoryTitle}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-body/40">{t('home.no_events')}</p>
          )}
        </div>

        {/* Share */}
        <button
          onClick={() => shareToWhatsApp(`${district.name} weather update`, window.location.href)}
          className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-2xl font-semibold text-sm"
        >
          <Share2 className="w-4 h-4" />
          {t('common.whatsapp')}
        </button>
      </div>
    </div>
  );
}
