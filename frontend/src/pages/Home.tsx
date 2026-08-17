import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MapPin, ChevronRight, Bell, AlertTriangle, RefreshCw, Navigation, Loader2, ShieldCheck, Droplets, Wind, Eye, Thermometer, CloudRain, Sunrise, Sunset } from 'lucide-react';
import { useEonetEvents, useOpenMeteo, useAirQuality } from '../hooks/useData';
import { findNearestDistrict } from '../data/districts';
import { getWeatherCodeInfo, formatRelativeTime, toBengaliNum, bengaliTime, banglaDayName, getWindLabel, getUVLabel, getAQILabel, getPrecipLabel } from '../utils/helpers';
import AccordionCard from '../components/AccordionCard';
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

async function reverseGeocode(lat: number, lng: number): Promise<{ isWB: boolean; villageName: string; displayName: string }> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=bn&zoom=18`, { headers: { 'User-Agent': 'BanglaMausamWatch/1.0' } });
    if (!res.ok) throw new Error('fail');
    const data = await res.json();
    const addr = data.address || {};
    const state = addr.state || '';
    return {
      isWB: state.includes('পশ্চিমবঙ্গ') || state.toLowerCase().includes('west bengal'),
      villageName: extractVillageName(addr),
      displayName: data.display_name || '',
    };
  } catch { return { isWB: false, villageName: '', displayName: '' }; }
}

function ipGeolocate(): Promise<{ lat: number; lng: number } | null> {
  return fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(d => d.latitude && d.longitude ? { lat: d.latitude, lng: d.longitude } : null)
    .catch(() => null);
}

function getStatusBanner(hourly: any[], current: any): string {
  if (!current) return 'স্বাভাবিক আবহাওয়া, আরামদায়ক';
  if ((current.windSpeed || 0) > 60) return 'ঝড়ের সতরকতা — বাইরে যাওয়া এড়িয়ে চলুন';
  if ((current.temperature || 0) > 38) return 'তাপপ্রবাহ — বাইরে যাওয়া এড়াও';
  if (hourly.some(h => (h.precipitationProbability || 0) > 80)) return 'ভারী বৃষ্টি হতে পারে — সতর্ক থাকুন';
  const rainHours = hourly.filter(h => (h.precipitationProbability || 0) > 60).length;
  if (rainHours > hourly.length * 0.5) return 'সারাদিন বৃষ্টির সম্ভাবনা — ছাতা নিন';
  return 'স্বাভাবিক আবহাওয়া, আরামদায়ক';
}

function getStatusTimeEnd(hourly: any[]): string | null {
  let lastRainIdx = -1;
  for (let i = hourly.length - 1; i >= 0; i--) {
    if ((hourly[i].precipitationProbability || 0) > 40) { lastRainIdx = i; break; }
  }
  if (lastRainIdx < 0) return null;
  return bengaliTime(hourly[lastRainIdx].time);
}

function getTrendText(daily: any[]): string {
  if (daily.length < 4) return '';
  const next4 = daily.slice(1, 5);
  const first = next4[0]?.tempMax || 0;
  const last = next4[next4.length - 1]?.tempMax || 0;
  const diff = last - first;
  if (diff > 3) return `পরবর্তী ৪ দিন তাপমাত্রা বাড়বে ↗`;
  if (diff < -3) return `পরবর্তী ৪ দিন তাপমাত্রা কমবে ↘`;
  return `পরবর্তী ৪ দিন স্থিতিশীল আবহাওয়া →`;
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const bn = i18n.language === 'bn';

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
  const { aqi, loading: aqiLoading } = useAirQuality(effectiveLat, effectiveLng);

  const nearestDistrict = findNearestDistrict(effectiveLat, effectiveLng);
  const displayDistrict = bn ? (userDistrictBn || nearestDistrict.namebn) : (userDistrict || nearestDistrict.name);
  const hasPreciseLocation = !!userLocation && !!userVillageName;
  const heroLocationLine = hasPreciseLocation ? userVillageName : displayDistrict;
  const weatherInfo = current ? getWeatherCodeInfo(current.weatherCode) : null;

  const statusBanner = getStatusBanner(hourly, current);
  const statusTimeEnd = getStatusTimeEnd(hourly);
  const trendText = getTrendText(daily);
  const activeEvents = events.filter(e => !e.closed);
  const recentUpdated = lastUpdated ? formatRelativeTime(lastUpdated.toISOString()) : '';

  const currentHour = new Date().getHours();
  const windLabel = getWindLabel(current?.windSpeed || 0);
  const uvInfo = getUVLabel(current?.uvIndex || 0);
  const aqiInfo = getAQILabel(aqi?.european || 0);

  const applyLocation = async (lat: number, lng: number) => {
    const [geoResult, nearest] = await Promise.all([reverseGeocode(lat, lng), Promise.resolve(findNearestDistrict(lat, lng))]);
    let villageLabel = geoResult.villageName;
    if (!villageLabel && geoResult.displayName) villageLabel = geoResult.displayName.split(',')[0]?.trim() || '';
    if (!villageLabel) villageLabel = `${t('home.your_location')} · ${formatCoords(lat, lng)}`;
    setUserLocation({ lat, lng });
    setUserVillageName(villageLabel);
    setUserDistrict(nearest.name);
    setUserDistrictBn(nearest.namebn);
    setOutsideWB(!geoResult.isWB);
    saveLocationToStorage({ lat, lng, villageName: villageLabel, districtName: nearest.name, districtNameBn: nearest.namebn, timestamp: Date.now() });
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
        try { await applyLocation(pos.coords.latitude, pos.coords.longitude); } catch {
          const lat = pos.coords.latitude, lng = pos.coords.longitude;
          setUserLocation({ lat, lng }); setUserVillageName(formatCoords(lat, lng));
          const n = findNearestDistrict(lat, lng); setUserDistrict(n.name); setUserDistrictBn(n.namebn);
          saveLocationToStorage({ lat, lng, villageName: formatCoords(lat, lng), districtName: n.name, districtNameBn: n.namebn, timestamp: Date.now() });
        }
        setLocationLoading(false);
      },
      async () => {
        const coords = await ipGeolocate();
        if (coords) { await applyLocation(coords.lat, coords.lng); setLocationLoading(false); }
        else { setLocationStatus('denied'); setLocationLoading(false); }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
    );
  };

  return (
    <div className="pb-20">
      {/* 1. STATUS BANNER + CURRENT TEMP */}
      <section className="px-4 pt-5 pb-5 bg-gradient-to-b from-primary-50/80 via-white to-white">
        <div className="flex items-center gap-1.5 text-primary-600 font-medium mb-1">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-sm font-semibold text-heading">{heroLocationLine}</span>
        </div>
        {hasPreciseLocation && <p className="text-xs text-body/50 ml-5 mb-0.5">{displayDistrict}</p>}
        {userLocation && <p className="text-[10px] text-body/35 ml-5 font-mono mb-3">{formatCoords(effectiveLat, effectiveLng)}</p>}
        {!userLocation && <div className="mb-3" />}

        {outsideWB && <p className="text-xs text-orange-500 font-medium mb-1">{t('home.outside_wb')}</p>}
        {locationStatus === 'denied' && <p className="text-xs text-orange-500 mb-1">{t('home.location_denied')}</p>}

        {/* Status sentence */}
        <div className="flex items-start gap-2 mb-4">
          <span className="text-lg mt-0.5">{weatherInfo?.icon || '☀️'}</span>
          <div>
            <p className="text-[15px] font-semibold text-heading leading-snug">{statusBanner}</p>
            {statusTimeEnd && (
              <p className="text-xs text-body/50 mt-0.5">{statusTimeEnd} {t('home.status_until')}</p>
            )}
          </div>
        </div>

        {/* Current Temp Block — Google style */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-[56px] font-poppins font-bold text-heading leading-none tracking-tight">
              {weatherLoading ? '--' : toBengaliNum(Math.round(current?.temperature || 0))}
            </span>
            <span className="text-2xl text-heading/50 font-light">°</span>
          </div>
          <div className="text-right">
            <div className="text-5xl mb-1">{weatherInfo?.icon || '☀️'}</div>
            <p className="text-xs text-body/70 font-medium">
              {bn ? (weatherInfo?.condition || '') : (weatherInfo?.condition || '')}
            </p>
          </div>
        </div>
        <p className="text-sm text-body/60 mt-1">
          {t('home.feels_like')} {weatherLoading ? '--' : toBengaliNum(Math.round(current?.feelsLike || 0))}°
        </p>

        {/* My Location Button + Privacy */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <button onClick={handleMyLocation} disabled={locationLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-white/80 border border-primary-200 text-primary-600 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-primary-50 active:scale-[0.98] disabled:opacity-50">
              {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
              <span>{locationLoading ? 'লোকেশন নির্ণয় করছে...' : `📍 ${t('home.my_location')}`}</span>
            </button>
            {hasSaved.current && !locationLoading && (
              <button onClick={handleMyLocation} className="px-3 py-2.5 rounded-xl bg-primary-50 text-primary-500 text-xs font-medium hover:bg-primary-100 transition-colors">
                {t('home.update_location')}
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1.5 ml-1">
            <ShieldCheck className="w-3 h-3 text-body/40" />
            <p className="text-[10px] text-body/40">{t('home.location_privacy')}</p>
          </div>
        </div>

        {/* Enable Alerts CTA */}
        <button onClick={() => navigate('/alerts')}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3 rounded-2xl font-semibold text-sm shadow-lg shadow-primary-500/20 hover:shadow-xl transition-all">
          <Bell className="w-4 h-4" />
          {t('home.enable_alerts')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

      {/* 2. HOURLY ROW */}
      {hourly.length > 0 && (
        <section className="px-4 mt-2">
          <h3 className="text-xs font-semibold text-body/60 uppercase tracking-wider mb-2 px-1">{t('home.hourly_title')}</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory -mx-4 px-4 scrollbar-hide">
            {hourly.map((h, i) => {
              const hr = new Date(h.time).getHours();
              const isNow = i === 0;
              const prob = h.precipitationProbability || 0;
              const isRainy = prob > 40;
              const hInfo = getWeatherCodeInfo(h.temperature > 0 ? 0 : 0);
              return (
                <div key={i} className={`flex-shrink-0 w-[72px] snap-center rounded-2xl p-2.5 text-center transition-colors ${isRainy ? 'bg-primary-50 border border-primary-100' : 'bg-white border border-gray-100'}`}>
                  <p className="text-[11px] font-medium text-body/60 mb-1">{isNow ? t('home.now') : `${toBengaliNum(hr)}:০০`}</p>
                  <p className="text-base font-bold text-heading">{toBengaliNum(Math.round(h.temperature))}°</p>
                  {isRainy && <Droplets className="w-3 h-3 text-primary-400 mx-auto my-0.5" />}
                  <p className={`text-[10px] font-medium ${isRainy ? 'text-primary-500' : 'text-body/40'}`}>{toBengaliNum(prob)}%</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. TREND + 7-DAY */}
      {daily.length > 0 && (
        <section className="px-4 mt-3">
          {trendText && <p className="text-xs text-body/60 mb-2 px-1">{trendText}</p>}
          <div className="glass-card p-3 space-y-0">
            {daily.map((day, i) => {
              const info = getWeatherCodeInfo(day.weatherCode);
              const isToday = i === 0;
              return (
                <div key={day.date} className={`flex items-center gap-3 py-2.5 ${i < daily.length - 1 ? 'border-b border-gray-100' : ''} ${isToday ? 'bg-primary-50/30 -mx-3 px-3 rounded-xl' : ''}`}>
                  <span className={`text-xs w-10 ${isToday ? 'font-bold text-primary-600' : 'font-medium text-heading'}`}>
                    {banglaDayName(day.date, isToday)}
                  </span>
                  <span className="text-base w-7 text-center">{info.icon}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-heading w-8 text-right">{toBengaliNum(Math.round(day.tempMax))}°</span>
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.max(((day.tempMax - day.tempMin) / 15) * 100, 10)}%`, background: 'linear-gradient(90deg, #38BDF8, #F59E0B, #EF4444)' }} />
                    </div>
                    <span className="text-xs text-body/50 w-8">{toBengaliNum(Math.round(day.tempMin))}°</span>
                  </div>
                  <div className="flex items-center gap-0.5 w-10 justify-end">
                    {(day.precipitationProbability || 0) > 10 && <Droplets className="w-2.5 h-2.5 text-primary-300" />}
                    <span className="text-[10px] text-body/40">{toBengaliNum(day.precipitationProbability || 0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. ACCORDION DETAIL CARDS */}
      <section className="px-4 mt-3 space-y-2">
        {/* Precipitation */}
        {daily.length > 0 && (
          <AccordionCard
            title={`${t('home.precipitation_title')} · ${daily[0]?.precipitationProbability || 0}%`}
            summary={`${t('home.precipitation_amount')}: ${daily[0]?.precipitation || 0} মিমি`}
            accentColor="#3B82F6"
          >
            <div className="space-y-3">
              {hourly.filter((_, i) => i % 3 === 0).slice(0, 8).map((h, i) => {
                const prob = h.precipitationProbability || 0;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] text-body/50 w-8">{toBengaliNum(new Date(h.time).getHours())}:০০</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden relative">
                      <div className="h-full rounded bg-primary-300 transition-all" style={{ width: `${Math.min(prob, 100)}%` }} />
                      <span className="absolute right-1 top-0.5 text-[9px] font-medium text-heading/70">{toBengaliNum(prob)}%</span>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-3 text-[10px] text-body/50 pt-1 border-t border-gray-100">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-primary-200" /> হালকা</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-primary-400" /> মাঝারি</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-primary-600" /> ভারী</span>
              </div>
            </div>
          </AccordionCard>
        )}

        {/* Wind */}
        {current && (
          <AccordionCard
            title={`${t('home.wind_title')} · ${toBengaliNum(Math.round(current.windSpeed || 0))} কিমি/ঘ`}
            summary={`${t('home.wind_max_today')}: ${toBengaliNum(Math.round(Math.max(...hourly.map(h => h.windSpeed || 0))))} কিমি/ঘ, ${windLabel}`}
            accentColor="#6366F1"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🧭</div>
                <div>
                  <p className="text-2xl font-bold text-heading">{toBengaliNum(Math.round(current.windSpeed || 0))} <span className="text-sm font-normal text-body/60">কিমি/ঘ</span></p>
                  <p className="text-xs text-body/60">{windLabel} · {current.windDirection || 0}°</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-body/50 pt-1 border-t border-gray-100">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-400" /> হালকা (&lt;১২)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-400" /> মাঝারি (১২-২৮)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-400" /> বিপজ্জনক (৫০+)</span>
              </div>
            </div>
          </AccordionCard>
        )}

        {/* Humidity */}
        {current && (
          <AccordionCard
            title={`${t('home.humidity')} · ${toBengaliNum(Math.round(current.humidity || 0))}%`}
            summary={`${t('home.humidity_avg_today')}: ${toBengaliNum(Math.round(hourly.reduce((s, h) => s + (h.humidity || 0), 0) / Math.max(hourly.length, 1)))}%`}
            accentColor="#06B6D4"
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl">💧</div>
              <div>
                <p className="text-2xl font-bold text-heading">{toBengaliNum(Math.round(current.humidity || 0))}%</p>
                <p className="text-xs text-body/60">
                  {(current.humidity || 0) > 80 ? 'আর্দ্র' : (current.humidity || 0) > 50 ? 'স্বাভাবিক' : 'শুষ্ক'}
                </p>
              </div>
            </div>
          </AccordionCard>
        )}

        {/* Temperature detail */}
        {current && (
          <AccordionCard
            title={`${t('home.temp_title')} · ${toBengaliNum(Math.round(current.temperature || 0))}° (অনুভূত ${toBengaliNum(Math.round(current.feelsLike || 0))}°)`}
            summary={uvInfo.text}
            accentColor="#F59E0B"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface rounded-xl p-3 text-center">
                  <p className="text-[10px] text-body/50 mb-1">{t('home.sunrise')}</p>
                  <Sunrise className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-heading">{current.sunrise ? new Date(current.sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--'}</p>
                </div>
                <div className="bg-surface rounded-xl p-3 text-center">
                  <p className="text-[10px] text-body/50 mb-1">{t('home.sunset')}</p>
                  <Sunset className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                  <p className="text-sm font-semibold text-heading">{current.sunset ? new Date(current.sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-surface rounded-xl p-3">
                <Eye className="w-4 h-4 text-body/50" />
                <span className="text-xs text-body/70">{t('home.uv_index')}: <span className="font-semibold text-heading" style={{ color: uvInfo.color }}>{toBengaliNum(current.uvIndex || 0)}</span> · {uvInfo.text}</span>
              </div>
            </div>
          </AccordionCard>
        )}

        {/* AQI */}
        {!aqiLoading && aqi && (
          <AccordionCard
            title={`${t('home.aqi_title')} · ${toBengaliNum(aqi.european)}`}
            summary={aqiInfo.text}
            accentColor={aqiInfo.color}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: aqiInfo.color }} />
                <div>
                  <p className="text-2xl font-bold text-heading">{toBengaliNum(aqi.european)}</p>
                  <p className="text-xs font-medium" style={{ color: aqiInfo.color }}>{aqiInfo.text}</p>
                </div>
              </div>
              <div className="h-2 rounded-full overflow-hidden flex">
                {['#22C55E', '#EAB308', '#F97316', '#EF4444', '#DC2626', '#7C3AED'].map((c, i) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: c, opacity: aqi.european <= [50, 100, 150, 200, 300, 500][i] ? 1 : 0.2 }} />
                ))}
              </div>
            </div>
          </AccordionCard>
        )}
      </section>

      {/* 5. WARNING STRIP */}
      <section className="px-4 mt-3">
        <WarningStrip />
      </section>

      {/* 6. EVENTS + MINI MAP */}
      <section className="px-4 mt-3">
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
        <div className="glass-card overflow-hidden mt-2">
          <LiveMapMini events={events} />
        </div>
      </section>

      {/* 7. DISTRICT GRID */}
      <section className="px-4 mt-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-body/60 uppercase tracking-wider">{t('home.districts_of_wb')}</h3>
          <button onClick={() => navigate('/districts')} className="text-xs text-primary-500 font-medium">{t('home.view_all')}</button>
        </div>
        <DistrictGrid compact />
      </section>

      {/* Data Updated */}
      <div className="px-4 py-3 mt-2 text-center">
        <p className="text-[10px] text-body/40">
          {t('home.data_updated')}: {recentUpdated || t('home.just_now')}
        </p>
      </div>
    </div>
  );
}
