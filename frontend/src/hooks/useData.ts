import { useState, useEffect, useCallback } from 'react';
import { EONET_BASE, WB_BBOX } from '../utils/helpers';
import { EonetEvent } from '../types';

export function useEonetEvents() {
  const [events, setEvents] = useState<EonetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`${EONET_BASE}/events/geojson?status=open&days=7&bbox=${WB_BBOX}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
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
      setEvents(parsed);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError('Failed to fetch EONET events');
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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,pressure_msl,visibility&hourly=temperature_2m,precipitation_probability,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset&timezone=Asia/Kolkata&forecast_days=7`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();

      setCurrent({
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
      });

      setHourly((data.hourly?.time || []).slice(0, 24).map((t: string, i: number) => ({
        time: t,
        temperature: data.hourly.temperature_2m[i],
        precipitationProbability: data.hourly.precipitation_probability[i],
        humidity: data.hourly.relative_humidity_2m[i],
        windSpeed: data.hourly.wind_speed_10m[i],
      })));

      setDaily((data.daily?.time || []).map((t: string, i: number) => ({
        date: t,
        tempMax: data.daily.temperature_2m_max[i],
        tempMin: data.daily.temperature_2m_min[i],
        precipitation: data.daily.precipitation_sum[i],
        precipitationProbability: data.daily.precipitation_probability_max[i],
        windSpeedMax: data.daily.wind_speed_10m_max[i],
        weatherCode: data.daily.weather_code[i],
        sunrise: data.daily.sunrise?.[i] ?? '',
        sunset: data.daily.sunset?.[i] ?? '',
      })));
    } catch (e) {
      console.error('Open-Meteo fetch failed:', e);
    } finally {
      setLoading(false);
    }
  }, [lat, lng]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { current, hourly, daily, loading, refetch: fetchData };
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
