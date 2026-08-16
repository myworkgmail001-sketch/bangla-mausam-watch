import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Sun, Cloud, Droplets, Wind, Eye, Thermometer, MapPin, ChevronRight, Bell, CloudRain, Sunset, Sunrise, AlertTriangle, RefreshCw, Navigation, Loader2, ShieldCheck } from 'lucide-react';
import { useEonetEvents, useOpenMeteo } from '../hooks/useData';
import { findNearestDistrict } from '../data/districts';
import { getWeatherCodeInfo, formatRelativeTime } from '../utils/helpers';
import WeatherChart from '../components/WeatherChart';
import LiveMapMini from '../components/LiveMapMini';
import WarningStrip from '../components/WarningStrip';
import DistrictGrid from '../components/DistrictGrid';

interface SavedLocation {
  lat: number;
  lng: number;
  villageName: string;
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
    if (parsed.lat && parsed.lng && parsed.timestamp) return parsed;
  } catch {}
  return null;
}

function saveLocationToStorage(loc: SavedLocation) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(loc)); } catch {}
}

function extractVillageName(address: any): string {
  return address.hamlet || address.village || address.suburb || address.town || address.city_quarter || address.neighbourhood || address.city || '';
}

function formatCoords(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lng).toFixed(2)}°${lngDir}`;
}

interface ReverseGeocodeResult {
  isWB: boolean;
  villageName: string;
  displayName: string;
}

async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=bn&zoom=18`,
      { headers: { 'User-Agent': 'BanglaMausamWatch/1.0' } }
    );
    if (!res.ok) throw new Error('Reverse geocode failed');
    const data = await res.json();
    const addr = data.address || {};
    const state = addr.state || '';
    const isWB = state.includes('পশ্চিমবঙ্গ') || state.toLowerCase().includes('west bengal');
    const villageName = extractVillageName(addr);
    const displayName = data.display_name || '';
    return { isWB, villageName, displayName };
  } catch {
    return { isWB: false, villageName: '', displayName: '' };
  }
}

function ipGeolocate(): Promise<{ lat: number; lng: number } | null> {
  return fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(d => d.latitude && d.longitude ? { lat: d.latitude, lng: d.longitude } : null)
    .catch(() => null);
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userVillageName, setUserVillageName] = useState('');
  const [userDistrict, setUserDistrict] = useState('');
  const [userDistrictBn, setUserDistrictBn] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'denied' | 'failed'>('idle');
  const [outsideWB, setOutsideWB] = useState(false);
  const hasSaved = useRef(false);

  useEffect(() => {
    const saved = loadSavedLocation();
    if (saved) {
      setUserLocation({ lat: saved.lat, lng: saved.lng });
      setUserVillageName(saved.villageName || '');
      setUserDistrict(saved.districtName);
      setUserDistrictBn(saved.districtNameBn);
      hasSaved.current = true;
    }
  }, []);

  const effectiveLat = userLocation?.lat || DEFAULT_LAT;
  const effectiveLng = userLocation?.lng || DEFAULT_LNG;

  const { current, hourly, daily, loading: weatherLoading, error: weatherError, refetch: refetchWeather } = useOpenMeteo(effectiveLat, effectiveLng);
  const { events, loading: eventsLoading, error: eventsError, lastUpdated, refetch: refetchEvents } = useEonetEvents();

  const nearestDistrict = findNearestDistrict(effectiveLat, effectiveLng);
  const displayDistrict = i18n.language === 'bn'
    ? (userDistrictBn || nearestDistrict.namebn)
    : (userDistrict || nearestDistrict.name);

  const hasPreciseLocation = !!userLocation && !!userVillageName;
  const heroLocationLine = hasPreciseLocation
    ? userVillageName
    : displayDistrict;
  const weatherInfo = current ? getWeatherCodeInfo(current.weatherCode) : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('home.greeting') : hour < 17 ? t('home.greeting_afternoon') : hour < 21 ? t('home.greeting_evening') : t('home.greeting_night');

  const getSummaryText = () => {
    if (!current) return 'আজ স্বাভাবিক আবহাওয়া থাকবে।';
    const morningRain = hourly.filter(h => { const hr = new Date(h.time).getHours(); return hr >= 6 && hr <= 12; }).some(h => (h.precipitationProbability || 0) > 60);
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

  const applyLocation = async (lat: number, lng: number) => {
    const [geoResult, nearest] = await Promise.all([
      reverseGeocode(lat, lng),
      Promise.resolve(findNearestDistrict(lat, lng)),
    ]);

    let villageLabel = geoResult.villageName;
    if (!villageLabel && geoResult.displayName) {
      const parts = geoResult.displayName.split(',');
      villageLabel = parts[0]?.trim() || '';
    }
    if (!villageLabel) {
      villageLabel = `${t('home.your_location')} · ${formatCoords(lat, lng)}`;
    }

    setUserLocation({ lat, lng });
    setUserVillageName(villageLabel);
    setUserDistrict(nearest.name);
    setUserDistrictBn(nearest.namebn);
    setOutsideWB(!geoResult.isWB);
    saveLocationToStorage({
      lat, lng,
      villageName: villageLabel,
      districtName: nearest.name,
      districtNameBn: nearest.namebn,
      timestamp: Date.now(),
    });
  };

  const handleMyLocation = () => {
    setLocationLoading(true);
    setLocationStatus('idle');

    if (!navigator.geolocation) {
      ipGeolocate().then(coords => {
        if (coords) return applyLocation(coords.lat, coords.lng).then(() => setLocationLoading(false));
        setLocationStatus('failed');
        setLocationLoading(false);
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await applyLocation(pos.coords.latitude, pos.coords.longitude);
        } catch {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          setUserVillageName(formatCoords(lat, lng));
          const n = findNearestDistrict(lat, lng);
          setUserDistrict(n.name);
          setUserDistrictBn(n.namebn);
          saveLocationToStorage({ lat, lng, villageName: formatCoords(lat, lng), districtName: n.name, districtNameBn: n.namebn, timestamp: Date.now() });
        }
        setLocationLoading(false);
      },
      async () => {
        const coords = await ipGeolocate();
        if (coords) {
          await applyLocation(coords.lat, coords.lng);
          setLocationLoading(false);
        } else {
          setLocationStatus('denied');
          setLocationLoading(false);
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
    );
  };

  return (
    <div className="space-y-4 pb-4">
      {/* Hero Section */}
      <section className="hero-gradient px-4 pt-5 pb-6">
        {/* Location Header */}
        <div className="mb-2">
          <div className="flex items-center gap-1.5 text-primary-600 font-medium">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-base font-semibold text-heading leading-tight">{heroLocationLine}</span>
          </div>
          {hasPreciseLocation && (
            <p className="text-xs text-body/60 mt-0.5 ml-5">{displayDistrict}</p>
          )}
          {userLocation && (
            <p className="text-[10px] text-body/40 mt-0.5 ml-5 font-mono">{formatCoords(effectiveLat, effectiveLng)}</p>
          )}
        </div>

        {outsideWB && userLocation && (
          <p className="text-xs text-orange-500 font-medium mb-1">{t('home.outside_wb')}</p>
        )}

        {locationStatus === 'denied' && (
          <p className="text-xs text-orange-500 mb-1">{t('home.location_denied')} — {t('home.use_district_selector')}</p>
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

        {/* My Location Button + Privacy */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleMyLocation}
              disabled={locationLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-white/80 border border-primary-200 text-primary-600 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-primary-50 active:scale-[0.98] disabled:opacity-50"
            >
              {locationLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              <span>{locationLoading ? 'লোকেশন নির্ণয় করছে...' : `📍 ${t('home.my_location')}`}</span>
            </button>
            {hasSaved.current && !locationLoading && (
              <button
                onClick={handleMyLocation}
                className="px-3 py-2.5 rounded-xl bg-primary-50 text-primary-500 text-xs font-medium hover:bg-primary-100 transition-colors"
              >
                {t('home.update_location')}
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1.5 ml-1">
            <ShieldCheck className="w-3 h-3 text-body/40" />
            <p className="text-[10px] text-body/40">{t('home.location_privacy')}</p>
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
          onClick={() => navigate('/alerts')}
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
                const hourLabel = new Date(h.time).getHours();
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
                const maxProb = Math.max(...hourly.slice(0, 12).map(h => h.precipitationProbability || 0));
                return maxProb > 60 ? `${maxProb}%${t('home.rain_chance_high')}` : `${maxProb}%${t('home.rain_chance_low')}`;
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
                const dayName = i === 0 ? (i18n.language === 'bn' ? 'আজ' : 'Today') : date.toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' });
                return (
                  <div key={day.date} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <span className="text-xs font-medium text-heading w-12">{dayName}</span>
                    <span className="text-lg">{info.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-heading">{Math.round(day.tempMax)}°</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${((day.tempMax - day.tempMin) / 15) * 100}%`, background: 'linear-gradient(90deg, #38BDF8, #EF4444)' }} />
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
            <button onClick={() => navigate('/map')} className="text-xs text-primary-500 font-medium">{t('home.view_all')}</button>
          </div>
          <LiveMapMini events={events} />
        </div>
      </section>

      {/* District Grid Preview */}
      <section className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-heading">{t('home.districts_of_wb')}</h3>
          <button onClick={() => navigate('/districts')} className="text-xs text-primary-500 font-medium">{t('home.view_all')}</button>
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
