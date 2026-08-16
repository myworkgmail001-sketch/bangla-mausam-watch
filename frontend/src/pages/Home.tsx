import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Sun, Cloud, Droplets, Wind, Eye, Thermometer, MapPin, ChevronRight, Bell, CloudRain, Sunset, Sunrise, AlertTriangle, RefreshCw, Navigation } from 'lucide-react';
import { useEonetEvents, useOpenMeteo, useGeolocation } from '../hooks/useData';
import { districts, findNearestDistrict } from '../data/districts';
import { getWeatherCodeInfo, getCategoryIcon, getSeverityColor, formatRelativeTime } from '../utils/helpers';
import WeatherChart from '../components/WeatherChart';
import LiveMapMini from '../components/LiveMapMini';
import WarningStrip from '../components/WarningStrip';
import DistrictGrid from '../components/DistrictGrid';

interface SavedLocation {
  lat: number;
  lng: number;
  districtName: string;
  districtNameBn: string;
  timestamp: number;
}

const STORAGE_KEY = 'bmwatch_location';
const DEFAULT_LAT = 22.57;
const DEFAULT_LNG = 88.36;

function loadSavedLocation(): SavedLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.lat && parsed.lng && parsed.districtName && parsed.timestamp) {
      return parsed;
    }
  } catch {}
  return null;
}

function saveLocationToStorage(loc: SavedLocation) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  } catch {}
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { location: autoLocation } = useGeolocation();

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userDistrict, setUserDistrict] = useState<string>('');
  const [userDistrictBn, setUserDistrictBn] = useState<string>('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [outsideWB, setOutsideWB] = useState(false);
  const [showUpdateBtn, setShowUpdateBtn] = useState(false);

  useEffect(() => {
    const saved = loadSavedLocation();
    if (saved) {
      setUserLocation({ lat: saved.lat, lng: saved.lng });
      setUserDistrict(saved.districtName);
      setUserDistrictBn(saved.districtNameBn);
      setShowUpdateBtn(true);
    }
  }, []);

  const effectiveLat = userLocation?.lat || autoLocation?.lat || DEFAULT_LAT;
  const effectiveLng = userLocation?.lng || autoLocation?.lng || DEFAULT_LNG;

  const { current, hourly, daily, loading: weatherLoading, error: weatherError, refetch: refetchWeather } = useOpenMeteo(effectiveLat, effectiveLng);
  const { events, loading: eventsLoading, error: eventsError, lastUpdated, refetch: refetchEvents } = useEonetEvents();

  const nearestDistrict = findNearestDistrict(effectiveLat, effectiveLng);
  const displayDistrict = i18n.language === 'bn' ? (userDistrictBn || nearestDistrict.namebn) : (userDistrict || nearestDistrict.name);
  const weatherInfo = current ? getWeatherCodeInfo(current.weatherCode) : null;

  const hour = new Date().getHours();
  const getGreeting = () => {
    if (hour >= 5 && hour < 12) return t('home.greeting');
    if (hour >= 12 && hour < 17) return t('home.greeting_afternoon');
    if (hour >= 17 && hour < 21) return t('home.greeting_evening');
    return t('home.greeting_night');
  };
  const greeting = getGreeting();

  const getSummaryText = () => {
    if (!current) return 'আজ স্বাভাবিক আবহাওয়া থাকবে।';
    const morningRain = hourly.filter(h => {
      const hr = new Date(h.time).getHours();
      return hr >= 6 && hr <= 12;
    }).some(h => (h.precipitationProbability || 0) > 60);
    if (morningRain) return 'সকালে ভারী বৃষ্টি, বিকেলে খুলবে — ছাতা নিন।';
    if (hourly.some(h => (h.precipitationProbability || 0) > 40)) return 'মাঝারি বৃষ্টির সম্ভাবনা — ছাতা রাখুন।';
    if ((current.temperature || 0) > 38) return 'তাপপ্রবাহ — বাইরে যাওয়া এড়িয়ে চলুন।';
    if ((current.temperature || 0) > 35) return 'গরম দিন — পানি বেশি খান।';
    if ((current.windSpeed || 0) > 40) return 'প্বাবলি বাতাস — সতর্ক থাকুন।';
    if ((daily[0]?.precipitationProbability || 0) > 70) return 'আজ ভারী বৃষ্টি হতে পারে — ছাতা নিন।';
    return 'আজ স্বাভাবিক আবহাওয়া থাকবে।';
  };
  const summaryText = getSummaryText();

  const activeEvents = events.filter(e => !e.closed);
  const recentUpdated = lastUpdated ? formatRelativeTime(lastUpdated.toISOString()) : '';

  const handleEnableAlerts = () => {
    navigate('/alerts');
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=bn`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'BanglaMausamWatch/1.0' },
      });
      if (!res.ok) throw new Error('Reverse geocode failed');
      const data = await res.json();
      const addr = data.address || {};
      const isWB = (addr.state || '').includes('পশ্চিমবঙ্গ') || (addr.state || '').toLowerCase().includes('west bengal');
      const district = addr.district || addr.county || addr.state_district || '';
      return { isWB, district };
    } catch {
      return { isWB: false, district: '' };
    }
  };

  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const { isWB, district } = await reverseGeocode(lat, lng);
          const nearest = findNearestDistrict(lat, lng);

          let districtName = district || nearest.name;
          let districtNameBn = nearest.namebn;

          if (isWB && district) {
            const matchedDistrict = districts.find(
              d => d.namebn.includes(district) || district.includes(d.namebn) || d.name.toLowerCase().includes(district.toLowerCase())
            );
            if (matchedDistrict) {
              districtName = matchedDistrict.name;
              districtNameBn = matchedDistrict.namebn;
            }
          }

          setUserLocation({ lat, lng });
          setUserDistrict(districtName);
          setUserDistrictBn(districtNameBn);
          setOutsideWB(!isWB);
          setShowUpdateBtn(true);

          saveLocationToStorage({
            lat,
            lng,
            districtName,
            districtNameBn,
            timestamp: Date.now(),
          });
        } catch {
          setUserLocation({ lat, lng });
          const nearest = findNearestDistrict(lat, lng);
          setUserDistrict(nearest.name);
          setUserDistrictBn(nearest.namebn);
          setShowUpdateBtn(true);
        }

        setLocationLoading(false);
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === 1) {
          setLocationError(t('home.location_denied'));
        } else {
          setLocationError(t('common.error'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [t]);

  return (
    <div className="space-y-4 pb-4">
      {/* Hero Section */}
      <section className="hero-gradient px-4 pt-5 pb-6">
        <div className="flex items-center gap-1.5 text-xs text-primary-600 font-medium mb-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>{displayDistrict}</span>
        </div>

        {outsideWB && userLocation && (
          <p className="text-xs text-orange-500 font-medium mb-1">{t('home.outside_wb')}</p>
        )}

        {locationError && (
          <p className="text-xs text-red-400 mb-1">{locationError}</p>
        )}

        <p className="text-xs text-body/70 mb-3">{greeting}</p>

        {/* Daily Summary */}
        <div className="glass-card p-3 mx-4 -mt-2 mb-2 flex items-center gap-2">
          <span className="text-lg">🌤️</span>
          <p className="text-xs font-medium text-heading">{summaryText}</p>
        </div>

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

        {/* My Location Button */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={showUpdateBtn ? handleMyLocation : handleMyLocation}
            disabled={locationLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-white/80 border border-primary-200 text-primary-600 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-primary-50 active:scale-[0.98] disabled:opacity-50"
          >
            {locationLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            <span>📍 {t('home.my_location')}</span>
          </button>
          {showUpdateBtn && !locationLoading && (
            <button
              onClick={handleMyLocation}
              className="px-3 py-2.5 rounded-xl bg-primary-50 text-primary-500 text-xs font-medium hover:bg-primary-100 transition-colors"
            >
              {t('home.update_location')}
            </button>
          )}
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

      {/* Rain in Next 12 Hours */}
      {hourly.length > 0 && (
        <section className="px-4">
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-heading mb-2">{t('home.rain_chance_title')}</h3>
            <div className="flex items-end gap-1 h-16 mb-2">
              {hourly.slice(0, 12).map((h, i) => {
                const prob = h.precipitationProbability || 0;
                const isHigh = prob > 60;
                const time = new Date(h.time);
                const hourLabel = time.getHours();
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className={`text-[8px] font-medium ${isHigh ? 'text-orange-500' : 'text-body/50'}`}>{prob}%</span>
                    <div className={`w-full rounded-t transition-all ${isHigh ? 'bg-orange-400' : 'bg-primary-200'}`} style={{ height: `${Math.max(prob * 0.6, 2)}px` }} />
                    <span className="text-[8px] text-body/40">{hourLabel}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-body/70">
              {(() => {
                const next12 = hourly.slice(0, 12);
                const maxProb = Math.max(...next12.map(h => h.precipitationProbability || 0));
                return maxProb > 60
                  ? `${maxProb}%${t('home.rain_chance_high')}`
                  : `${maxProb}%${t('home.rain_chance_low')}`;
              })()}
            </p>
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
