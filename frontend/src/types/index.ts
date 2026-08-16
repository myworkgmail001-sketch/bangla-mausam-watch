export interface District {
  slug: string;
  name: string;
  namebn: string;
  lat: number;
  lng: number;
  population: number;
  area: number;
  headquarters: string;
  headquartersbn: string;
  rivers: string[];
  coordinates: [number, number][];
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  rainfall: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
  sunrise: string;
  sunset: string;
  condition: string;
  icon: string;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  precipitationProbability: number;
  windSpeedMax: number;
  condition: string;
  icon: string;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  precipitationProbability: number;
  windSpeed: number;
  humidity: number;
}

export interface EonetEvent {
  id: string;
  title: string;
  titlebn?: string;
  category: string;
  categoryTitle: string;
  categoryTitlebn?: string;
  description: string;
  geometry: { type: string; coordinates: number[][] | number[] }[];
  sources: { id: string; url: string }[];
  closed: string | null;
  link: string;
  magnitudeValue?: number;
  magnitudeUnit?: string;
  date: string;
}

export interface IMDWarning {
  district: string;
  severity: 'Green' | 'Yellow' | 'Orange' | 'Red';
  title: string;
  titlebn: string;
  description: string;
  descriptionbn: string;
  issuedAt: string;
  validTill: string;
}

export interface FloodLevel {
  river: string;
  riverbn: string;
  station: string;
  stationbn: string;
  currentLevel: number;
  dangerLevel: number;
  normalLevel: number;
  trend: 'rising' | 'falling' | 'steady';
  lastUpdated: string;
}

export interface EarthquakeData {
  id: string;
  magnitude: number;
  depth: number;
  place: string;
  lat: number;
  lng: number;
  time: string;
  distanceFromUser?: number;
}

export interface CycloneData {
  id: string;
  name: string;
  namebn: string;
  basin: string;
  category: string;
  windSpeed: number;
  pressure: number;
  direction: string;
  speed: number;
  latitude: number;
  longitude: number;
  forecastTrack: { lat: number; lng: number; time: string; windSpeed: number }[];
  bulletins: CycloneBulletin[];
}

export interface CycloneBulletin {
  id: string;
  time: string;
  headline: string;
  headlinebn: string;
  body: string;
  bodybn: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Very High';
}

export interface NotificationSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  district: string;
  eventTypes: string[];
  language: string;
}

export interface AlertHistoryItem {
  id: string;
  title: string;
  titlebn: string;
  body: string;
  bodybn: string;
  severity: 'green' | 'yellow' | 'orange' | 'red';
  district: string;
  eventType: string;
  createdAt: string;
  read: boolean;
}

export interface Bulletin {
  id: string;
  title: string;
  titlebn: string;
  body: string;
  bodybn: string;
  severity: 'green' | 'yellow' | 'orange' | 'red';
  district: string | null;
  postedBy: string;
  createdAt: string;
  expiresAt: string;
}
