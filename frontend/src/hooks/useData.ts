import { useState, useEffect, useCallback, useRef } from 'react';
import { EonetEvent } from '../types';

const API_BASE = (typeof window !== 'undefined' && (window as any).__API_BASE__) || '';

export function useEonetEvents() {
  const [events, setEvents] = useState<EonetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const cachedRef = useRef<EonetEvent[]>([]);

  const fetchEvents = useCallback(async () => {
    try {
      const proxyUrl = `${API_BASE}/api/eonet?path=/events/geojson?status=open&days=7&bbox=85.77,21.38,89.99,27.05`;
      const fallbackUrl = `https://eonet.gsfc.nasa.gov/api/v3/events/geojson?status=open&days=7&bbox=85.77,21.38,89.99,27.05`;
      
      let data: any;
      try {
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error('proxy failed');
        data = await res.json();
      } catch {
        const res = await fetch(fallbackUrl);
        if (!res.ok) throw new Error('EONET fetch failed');
        data = await res.json();
      }

      const parsed: EonetEvent[] = (data.features || []).map((f: any) => ({
        id: f.id || f.properties?.id || String(Math.random()),
        title: f.properties?.title || 'Unknown Event',
        category: f.properties?.categories?.[0]?.id || 'unknown',
        categoryTitle: f.properties?.categories?.[0]?.title || 'Unknown',
        description: f.properties?.description || '',
        geometry: f.geometry ? [f.geometry] : [],
        sources: f.properties?.sources || [],
        closed: f.properties?.closed || null,
        link: f.properties?.link || '',
        magnitudeValue: f.properties?.magnitudeValue,
        magnitudeUnit: f.properties?.magnitudeUnit,
        date: f.properties?.date || new Date().toISOString(),
      }));
      
      cachedRef.current = parsed;
      setEvents(parsed);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      if (cachedRef.current.length > 0) {
        setEvents(cachedRef.current);
        setError('live_data_paused');
      } else {
        setError('failed');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  return { events, loading, error, lastUpdated, refetch: fetchEvents };
}

export function useOpenMeteo(lat: number, lng: number) {
  const [current, setCurrent] = useState<any>(null);
  const [hourly, setHourly] = useState<any[]>([]);
  const [daily, setDaily] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cachedRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    timeoutRef.current = setTimeout(() => {
      if (cachedRef.current) {
        setCurrent(cachedRef.current.current);
        setHourly(cachedRef.current.hourly);
        setDaily(cachedRef.current.daily);
        setError('timeout_showing_cached');
      }
      setLoading(false);
    }, 10000);

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,pressure_msl,visibility&hourly=temperature_2m,precipitation_probability,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&timezone=Asia%2FKolkata&forecast_days=7`;
      
      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 8000);
      
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(fetchTimeout);
      
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();

      const newCurrent = {
        temperature: data.current?.temperature_2m ?? 0,
        feelsLike: data.current?.apparent_temperature ?? 0,
        humidity: data.current?.relative_humidity_2m ?? 0,
        windSpeed: data.current?.wind_speed_10m ?? 0,
        windDirection: data.current?.wind_direction_10m ?? 0,
        rainfall: data.current?.precipitation ?? 0,
        uvIndex: data.current?.uv_index ?? 0,
        visibility: (data.current?.visibility ?? 10000) / 1000,
        pressure: data.current?.pressure_msl ?? 1013,
        weatherCode: data.current?.weather_code ?? 0,
        sunrise: data.daily?.sunrise?.[0] ?? '',
        sunset: data.daily?.sunset?.[0] ?? '',
      };

      const newHourly = (data.hourly?.time || []).slice(0, 24).map((t: string, i: number) => ({
        time: t,
        temperature: data.hourly.temperature_2m[i],
        precipitationProbability: data.hourly.precipitation_probability[i],
        humidity: data.hourly.relative_humidity_2m[i],
        windSpeed: data.hourly.wind_speed_10m[i],
      }));

      const newDaily = (data.daily?.time || []).map((t: string, i: number) => ({
        date: t,
        tempMax: data.daily.temperature_2m_max[i],
        tempMin: data.daily.temperature_2m_min[i],
        precipitation: data.daily.precipitation_sum[i],
        precipitationProbability: data.daily.precipitation_probability_max[i],
        windSpeedMax: data.daily.wind_speed_10m_max[i],
        weatherCode: data.daily.weather_code[i],
        sunrise: data.daily.sunrise?.[i] ?? '',
        sunset: data.daily.sunset?.[i] ?? '',
      }));

      cachedRef.current = { current: newCurrent, hourly: newHourly, daily: newDaily };
      setCurrent(newCurrent);
      setHourly(newHourly);
      setDaily(newDaily);
      setError(null);
    } catch (e) {
      console.error('Open-Meteo fetch failed:', e);
      if (cachedRef.current) {
        setCurrent(cachedRef.current.current);
        setHourly(cachedRef.current.hourly);
        setDaily(cachedRef.current.daily);
        setError('showing_cached');
      } else {
        setError('failed');
      }
    } finally {
      clearTimeout(timeoutRef.current);
      setLoading(false);
    }
  }, [lat, lng]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30 * 60 * 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeoutRef.current);
    };
  }, [fetchData]);

  return { current, hourly, daily, loading, error, refetch: fetchData };
}

export function useAirQuality(lat: number, lng: number) {
  const [aqi, setAqi] = useState<{ european: number; us: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=european_aqi,us_aqi`, { signal: controller.signal })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setAqi({ european: data.current?.european_aqi ?? 0, us: data.current?.us_aqi ?? 0 });
        setLoading(false);
      })
      .catch(() => { setAqi(null); setLoading(false); });
    return () => controller.abort();
  }, [lat, lng]);

  return { aqi, loading };
}

export function useGeolocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLocation({ lat: 22.57, lng: 88.36 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setError('Permission denied');
        setLocation({ lat: 22.57, lng: 88.36 });
      },
      { timeout: 5000, maximumAge: 600000 }
    );
  }, []);

  return { location, error };
}
