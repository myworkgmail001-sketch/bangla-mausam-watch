import { EonetEvent, IMDWarning } from '../types';

export const WB_BBOX = '85.77,21.38,89.99,27.05';
export const EONET_BASE = 'https://eonet.gsfc.nasa.gov/api/v3';
export const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1';

export function getSeverityColor(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'red': return '#EF4444';
    case 'orange': return '#F59E0B';
    case 'yellow': return '#EAB308';
    case 'green': return '#22C55E';
    default: return '#94A3B8';
  }
}

export function getSeverityClass(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'red': return 'severity-red';
    case 'orange': return 'severity-orange';
    case 'yellow': return 'severity-yellow';
    case 'green': return 'severity-green';
    default: return 'severity-green';
  }
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    floods: '🌊',
    wildfires: '🔥',
    severeStorms: '⛈️',
    volcanoes: '🌋',
    earthquakes: '🔴',
    landslides: '⛰️',
    temperatureExtremes: '🌡️',
    dustAndHaze: '🌫️',
    seaLakeIce: '🧊',
    storms: '🌀',
  };
  return icons[category] || '⚠️';
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    floods: '#3B82F6',
    wildfires: '#EF4444',
    severeStorms: '#8B5CF6',
    volcanoes: '#F97316',
    earthquakes: '#EF4444',
    landslides: '#A16207',
    temperatureExtremes: '#F59E0B',
    dustAndHaze: '#78716C',
    seaLakeIce: '#06B6D4',
    storms: '#6366F1',
  };
  return colors[category] || '#64748B';
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}

export function isPointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function getWeatherCodeInfo(code: number): { condition: string; icon: string } {
  const codes: Record<number, { condition: string; icon: string }> = {
    0: { condition: 'Clear sky', icon: '☀️' },
    1: { condition: 'Mainly clear', icon: '🌤️' },
    2: { condition: 'Partly cloudy', icon: '⛅' },
    3: { condition: 'Overcast', icon: '☁️' },
    45: { condition: 'Fog', icon: '🌫️' },
    48: { condition: 'Depositing rime fog', icon: '🌫️' },
    51: { condition: 'Light drizzle', icon: '🌦️' },
    53: { condition: 'Moderate drizzle', icon: '🌦️' },
    55: { condition: 'Dense drizzle', icon: '🌧️' },
    61: { condition: 'Slight rain', icon: '🌧️' },
    63: { condition: 'Moderate rain', icon: '🌧️' },
    65: { condition: 'Heavy rain', icon: '🌧️' },
    71: { condition: 'Slight snow', icon: '🌨️' },
    73: { condition: 'Moderate snow', icon: '🌨️' },
    75: { condition: 'Heavy snow', icon: '❄️' },
    80: { condition: 'Slight showers', icon: '🌦️' },
    81: { condition: 'Moderate showers', icon: '🌧️' },
    82: { condition: 'Violent showers', icon: '⛈️' },
    95: { condition: 'Thunderstorm', icon: '⛈️' },
    96: { condition: 'Thunderstorm with hail', icon: '⛈️' },
    99: { condition: 'Thunderstorm with heavy hail', icon: '⛈️' },
  };
  return codes[code] || { condition: 'Unknown', icon: '❓' };
}

export function shareToWhatsApp(text: string, url: string) {
  const encoded = encodeURIComponent(`${text}\n\n${url}`);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNum(n: number): string {
  return String(Math.round(n)).replace(/[0-9]/g, d => BENGALI_DIGITS[parseInt(d)]);
}

export function bengaliTime(dateStr: string): string {
  const d = new Date(dateStr);
  const h = d.getHours();
  const m = d.getMinutes();
  return `${toBengaliNum(h)}:${m < 10 ? '০' : ''}${toBengaliNum(m)}`;
}

export function banglaDayName(dateStr: string, isToday: boolean): string {
  if (isToday) return 'আজ';
  const days = ['রবি', 'সোম', 'মঙ্ল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
  return days[new Date(dateStr).getDay()];
}

export function getWindLabel(speed: number): string {
  if (speed < 12) return 'হালকা';
  if (speed < 29) return 'মাঝারি';
  if (speed < 50) return 'প্রবল';
  return 'বিপজ্জনক';
}

export function getWindLabelEn(speed: number): string {
  if (speed < 12) return 'Light';
  if (speed < 29) return 'Moderate';
  if (speed < 50) return 'Strong';
  return 'Dangerous';
}

export function getUVLabel(uv: number): { text: string; color: string } {
  if (uv <= 2) return { text: 'নিচু', color: '#22C55E' };
  if (uv <= 5) return { text: 'মাঝারি', color: '#EAB308' };
  if (uv <= 7) return { text: 'উচ্চ — সানস্ক্রিন দিন', color: '#F59E0B' };
  if (uv <= 10) return { text: 'খুব উচ্চ', color: '#EF4444' };
  return { text: 'চরম — বাইরে যাবেন না', color: '#7C3AED' };
}

export function getUVLabelEn(uv: number): { text: string; color: string } {
  if (uv <= 2) return { text: 'Low', color: '#22C55E' };
  if (uv <= 5) return { text: 'Moderate', color: '#EAB308' };
  if (uv <= 7) return { text: 'High — use sunscreen', color: '#F59E0B' };
  if (uv <= 10) return { text: 'Very High', color: '#EF4444' };
  return { text: 'Extreme — stay indoors', color: '#7C3AED' };
}

export function getAQILabel(aqi: number): { text: string; color: string } {
  if (aqi <= 50) return { text: 'ভালো', color: '#22C55E' };
  if (aqi <= 100) return { text: 'গ্রহণযোগ্য', color: '#EAB308' };
  if (aqi <= 150) return { text: 'সংবেদনশীলদের জন্য খারাপ', color: '#F97316' };
  if (aqi <= 200) return { text: 'খারাপ', color: '#EF4444' };
  if (aqi <= 300) return { text: 'খুব খারাপ', color: '#DC2626' };
  return { text: 'বিপজ্জনক', color: '#7C3AED' };
}

export function getAQILabelEn(aqi: number): { text: string; color: string } {
  if (aqi <= 50) return { text: 'Good', color: '#22C55E' };
  if (aqi <= 100) return { text: 'Fair', color: '#EAB308' };
  if (aqi <= 150) return { text: 'Poor (sensitive)', color: '#F97316' };
  if (aqi <= 200) return { text: 'Bad', color: '#EF4444' };
  if (aqi <= 300) return { text: 'Very Bad', color: '#DC2626' };
  return { text: 'Hazardous', color: '#7C3AED' };
}

export function getPrecipLabel(mm: number): string {
  if (mm < 2.5) return 'হালকা';
  if (mm < 10) return 'মাঝারি';
  if (mm < 50) return 'ভারী';
  return 'অতি ভারী';
}

export const EVENT_TYPES = ['floods', 'severeStorms', 'earthquakes', 'landslides', 'temperatureExtremes', 'dustAndHaze'] as const;
export const EVENT_TYPE_LABELS: Record<string, { en: string; bn: string }> = {
  floods: { en: 'Floods', bn: 'বন্যা' },
  severeStorms: { en: 'Severe Storms', bn: 'তীব্র ঝড়' },
  earthquakes: { en: 'Earthquakes', bn: 'ভূমিকম্প' },
  landslides: { en: 'Landslides', bn: 'ভূমিধস' },
  temperatureExtremes: { en: 'Heat/Cold Waves', bn: 'তাপ/শীত প্রবাহ' },
  dustAndHaze: { en: 'Dust & Haze', bn: 'ধুলো ও কুয়াশা' },
  volcanoes: { en: 'Volcanoes', bn: 'আগ্নেয়গিরি' },
  wildfires: { en: 'Wildfires', bn: 'বন আগুন' },
  storms: { en: 'Storms', bn: 'ঝড়' },
};
