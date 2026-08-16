import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Sun, Cloud, Droplets, Wind, Eye, Thermometer, MapPin, ChevronRight, Bell, CloudRain, Sunset, Sunrise, AlertTriangle, RefreshCw } from 'lucide-react';
import { useEonetEvents, useOpenMeteo, useGeolocation } from '../hooks/useData';
import { districts, findNearestDistrict } from '../data/districts';
import { getWeatherCodeInfo, getCategoryIcon, getSeverityColor, formatRelativeTime } from '../utils/helpers';
import WeatherChart from '../components/WeatherChart';
import LiveMapMini from '../components/LiveMapMini';
import WarningStrip from '../components/WarningStrip';
import DistrictGrid from '../components/DistrictGrid';

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { location } = useGeolocation();
  const { current, hourly, daily, loading: weatherLoading, error: weatherError, refetch: refetchWeather } = useOpenMeteo(location?.lat || 22.57, location?.lng || 88.36);
  const { events, loading: eventsLoading, error: eventsError, lastUpdated, refetch: refetchEvents } = useEonetEvents();

  const nearestDistrict = location ? findNearestDistrict(location.lat, location.lng) : districts[0];
  const weatherInfo = current ? getWeatherCodeInfo(current.weatherCode) : null;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('home.greeting') : hour < 17 ? t('home.greeting_afternoon') : t('home.greeting_evening');

  const activeEvents = events.filter(e => !e.closed);
  const recentUpdated = lastUpdated ? formatRelativeTime(lastUpdated.toISOString()) : '';

  const handleEnableAlerts = () => {
    navigate('/alerts');
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Hero Section */}
      <section className="hero-gradient px-4 pt-5 pb-6">
        <div className="flex items-center gap-1.5 text-xs text-primary-600 font-medium mb-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>{i18n.language === 'bn' ? nearestDistrict.namebn : nearestDistrict.name}</span>
        </div>
        <p className="text-xs text-body/70 mb-3">{greeting}</p>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-poppins font-bold text-heading tracking-tight">
                {weatherLoading ? '--' : Math.round(current?.temperature || 0)}
              </span>
              <span className="text-xl text-heading/60">°C</span>
              {weatherError && !weatherLoading && (
                <button onClick={refetchWeather} className="ml-2 p-1 rounded-full hover:bg-white/50 transition-colors" title="Retry">
                  <RefreshCw className="w-3.5 h-3.5 text-primary-400" />
                </button>
              )}
            </div>
            <p className="text-sm text-body mt-0.5">
              {weatherInfo ? weatherInfo.condition : weatherLoading ? t('common.loading') : t('common.unavailable')}
            </p>
            <p className="text-xs text-body/60 mt-1">
              {t('home.feels_like')}: {weatherLoading ? '--' : Math.round(current?.feelsLike || 0)}°C
            </p>
          </div>
          <div className="text-5xl">
            {weatherInfo ? weatherInfo.icon : '☀️'}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { icon: Droplets, label: t('home.humidity'), value: `${current?.humidity || '--'}%` },
            { icon: Wind, label: t('home.wind'), value: `${Math.round(current?.windSpeed || 0)} km/h` },
            { icon: CloudRain, label: t('home.rainfall'), value: `${current?.rainfall || 0} mm` },
            { icon: Eye, label: t('home.uv_index'), value: `${current?.uvIndex?.toFixed(1) || '--'}` },
          ].map(({ icon: Icon, label, value }, i) => (
            <div key={i} className="glass-card p-2.5 text-center animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
              <Icon className="w-4 h-4 text-primary-500 mx-auto mb-1" />
              <p className="text-[10px] text-body/60 mb-0.5">{label}</p>
              <p className="text-xs font-semibold text-heading">{value}</p>
            </div>
          ))}
        </div>

        {/* Enable Alerts CTA */}
        <button
          onClick={handleEnableAlerts}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3 rounded-2xl font-semibold text-sm shadow-lg shadow-primary-500/20 hover:shadow-xl transition-all"
        >
          <Bell className="w-4 h-4" />
          {t('home.enable_alerts')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* Warning Strip */}
      <WarningStrip />

      {/* Sunrise/Sunset */}
      {current?.sunrise && (
        <section className="px-4">
          <div className="glass-card p-4 flex items-center justify-around">
            <div className="flex items-center gap-2">
              <Sunrise className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-[10px] text-body/60">{t('home.sunrise')}</p>
                <p className="text-sm font-semibold text-heading">{new Date(current.sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <Sunset className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-[10px] text-body/60">{t('home.sunset')}</p>
                <p className="text-sm font-semibold text-heading">{new Date(current.sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Events Near You Counter */}
      <section className="px-4">
        <div className="glass-card p-4 flex items-center justify-between" onClick={() => navigate('/map')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-heading">
                {eventsLoading ? t('common.loading') : `${activeEvents.length} ${t('home.events_near')}`}
              </p>
              <p className="text-xs text-body/60">{t('home.live_map')}</p>
            </div>
          </div>
          {eventsError && !eventsLoading ? (
            <button onClick={(e) => { e.stopPropagation(); refetchEvents(); }} className="p-1.5 rounded-full hover:bg-white/50">
              <RefreshCw className="w-4 h-4 text-primary-400" />
            </button>
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </section>

      {/* 24-Hour Forecast Chart */}
      {hourly.length > 0 && (
        <section className="px-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-heading">{t('home.forecast_24h')}</h3>
              <span className="text-[10px] text-primary-500 font-medium bg-primary-50 px-2 py-0.5 rounded-full">{t('common.live')}</span>
            </div>
            <WeatherChart hourly={hourly} />
          </div>
        </section>
      )}

      {/* 7-Day Forecast */}
      {daily.length > 0 && (
        <section className="px-4">
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-heading mb-3">{t('home.forecast_7day')}</h3>
            <div className="space-y-2">
              {daily.map((day, i) => {
                const info = getWeatherCodeInfo(day.weatherCode);
                const date = new Date(day.date);
                const dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
                return (
                  <div key={day.date} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <span className="text-xs font-medium text-heading w-12">{dayName}</span>
                    <span className="text-lg">{info.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-heading">{Math.round(day.tempMax)}°</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${((day.tempMax - day.tempMin) / 15) * 100}%`,
                              background: `linear-gradient(90deg, #38BDF8, #EF4444)`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-body/60">{Math.round(day.tempMin)}°</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-primary-400" />
                      <span className="text-[10px] text-body/60">{day.precipitationProbability}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Mini Map */}
      <section className="px-4">
        <div className="glass-card overflow-hidden">
          <div className="p-4 pb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-heading">{t('home.live_map')}</h3>
            <button onClick={() => navigate('/map')} className="text-xs text-primary-500 font-medium">
              {t('home.view_all')}
            </button>
          </div>
          <LiveMapMini events={events} />
        </div>
      </section>

      {/* District Grid Preview */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-heading">{t('home.districts_of_wb')}</h3>
          <button onClick={() => navigate('/districts')} className="text-xs text-primary-500 font-medium">
            {t('home.view_all')}
          </button>
        </div>
        <DistrictGrid compact />
      </section>

      {/* Data Updated */}
      <div className="px-4 py-2 text-center">
        <p className="text-[10px] text-body/40">
          {t('home.data_updated')}: {recentUpdated || t('home.just_now')}
        </p>
      </div>
    </div>
  );
}
