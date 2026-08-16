import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import { useEonetEvents } from '../hooks/useData';
import { EonetEvent } from '../types';
import { getCategoryIcon, getCategoryColor, getSeverityColor, formatRelativeTime, shareToWhatsApp, WB_BBOX } from '../utils/helpers';
import { haversineDistance } from '../data/districts';
import { X, ExternalLink, Share2, ChevronDown, Layers, ToggleLeft, ToggleRight } from 'lucide-react';

const WB_BBOX_OBJ = { minLng: 85.77, minLat: 21.38, maxLng: 89.99, maxLat: 27.05 };
const NEARBY_BBOX = { minLng: 83.5, minLat: 19.5, maxLng: 92.5, maxLat: 29.5 };
const DEFAULT_LOCATION = { lat: 22.57, lng: 88.36 };

function getUserLocation(): { lat: number; lng: number } {
  try {
    const raw = localStorage.getItem('bmwatch_location');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') return parsed;
    }
  } catch {}
  return DEFAULT_LOCATION;
}

export default function MapPage() {
  const { t, i18n } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const { events, loading, lastUpdated } = useEonetEvents();
  const [selectedEvent, setSelectedEvent] = useState<EonetEvent | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [showNearby, setShowNearby] = useState(false);
  const [nearbyEvents, setNearbyEvents] = useState<EonetEvent[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  const userLocation = getUserLocation();

  const fetchNearby = useCallback(async (bbox: { minLng: number; minLat: number; maxLng: number; maxLat: number }) => {
    setNearbyLoading(true);
    try {
      const bboxStr = `${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}`;
      const API_BASE = (typeof window !== 'undefined' && (window as any).__API_BASE__) || '';
      const proxyUrl = `${API_BASE}/api/eonet?path=/events/geojson?status=open&days=7&bbox=${bboxStr}`;
      const fallbackUrl = `https://eonet.gsfc.nasa.gov/api/v3/events/geojson?status=open&days=7&bbox=${bboxStr}`;

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

      setNearbyEvents(parsed);
    } catch (e) {
      console.error('Nearby EONET fetch failed:', e);
      setNearbyEvents([]);
    } finally {
      setNearbyLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showNearby) {
      fetchNearby(NEARBY_BBOX);
      const interval = setInterval(() => fetchNearby(NEARBY_BBOX), 5 * 60 * 1000);
      return () => clearInterval(interval);
    } else {
      setNearbyEvents([]);
    }
  }, [showNearby, fetchNearby]);

  const allOpenEvents = events.filter(e => !e.closed);
  const nearbyOpen = showNearby ? nearbyEvents.filter(e => !e.closed && !allOpenEvents.some(ae => ae.id === e.id)) : [];
  const mergedEvents = [...allOpenEvents, ...nearbyOpen];

  const eventsWithDistance = mergedEvents.map(event => {
    const geom = event.geometry?.[0];
    let lat = 0, lng = 0;
    if (geom) {
      if (geom.type === 'Point') {
        [lng, lat] = geom.coordinates as number[];
      } else if (geom.type === 'Polygon' && Array.isArray(geom.coordinates)) {
        const coords = geom.coordinates[0];
        if (coords && Array.isArray(coords)) {
          lat = (coords as unknown as number[][]).reduce((s, c) => s + (c as number[])[1], 0) / coords.length;
          lng = (coords as unknown as number[][]).reduce((s, c) => s + (c as number[])[0], 0) / coords.length;
        }
      }
    }
    const dist = haversineDistance(userLocation.lat, userLocation.lng, lat, lng);
    return { ...event, _distance: dist, _lat: lat, _lng: lng };
  }).sort((a, b) => a._distance - b._distance);

  const filteredEvents = filter === 'all' ? eventsWithDistance : eventsWithDistance.filter(e => e.category === filter);
  const categories = [...new Set(mergedEvents.map(e => e.category))];
  const wbEventsCount = allOpenEvents.length;

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const center: [number, number] = userLocation
      ? [userLocation.lat, userLocation.lng]
      : [23.5, 87.5];
    const zoom = userLocation ? 10 : 6;

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: false,
      maxBounds: [[18, 82], [30, 94]],
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    L.rectangle(
      [[WB_BBOX_OBJ.minLat, WB_BBOX_OBJ.minLng], [WB_BBOX_OBJ.maxLat, WB_BBOX_OBJ.maxLng]],
      { color: '#0EA5E9', weight: 1, fillOpacity: 0.03, dashArray: '5,5' }
    ).addTo(map);

    if (userLocation) {
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#0EA5E9;border:3px solid white;box-shadow:0 0 0 2px #0EA5E9, 0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
      userMarker.bindPopup(`<div style="font-family:Inter,sans-serif;font-size:12px;font-weight:600;color:#0EA5E9;">আপনি এখানে আছেন</div>`, { closeButton: false });
      userMarker.openPopup();
      setTimeout(() => userMarker.closePopup(), 3000);
    }

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker || layer instanceof L.Popup) map.removeLayer(layer);
    });

    filteredEvents.forEach((event) => {
      const geom = event.geometry?.[0];
      if (!geom) return;

      let lat: number, lng: number;
      if (geom.type === 'Point') {
        [lng, lat] = geom.coordinates as number[];
      } else if (geom.type === 'Polygon' && Array.isArray(geom.coordinates)) {
        const coords = geom.coordinates[0];
        if (!coords || !Array.isArray(coords)) return;
        lat = (coords as unknown as number[][]).reduce((s, c) => s + (c as number[])[1], 0) / coords.length;
        lng = (coords as unknown as number[][]).reduce((s, c) => s + (c as number[])[0], 0) / coords.length;

        const polyCoords = (coords as unknown as number[][]).map((c) => [c[1], c[0]] as [number, number]);
        L.polygon(polyCoords, {
          color: getCategoryColor(event.category),
          weight: 2,
          fillOpacity: 0.2,
        }).addTo(map);
      } else {
        return;
      }

      const color = getCategoryColor(event.category);
      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.9,
        className: 'animate-bounce-pin',
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;padding:4px 0;">
          <div style="font-size:13px;font-weight:600;color:#0F172A;margin-bottom:4px;">${event.title}</div>
          <div style="font-size:11px;color:#475569;">${event.categoryTitle} · ${formatRelativeTime(event.date)}</div>
        </div>
      `, { closeButton: false });

      marker.on('click', () => {
        setSelectedEvent(event);
      });
    });
  }, [filteredEvents]);

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-[calc(100vh-8rem)]" />

      {/* Filter Bar */}
      <div className="absolute top-3 left-3 right-3 z-40 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            filter === 'all' ? 'bg-heading text-white shadow-lg' : 'bg-white/90 text-heading shadow-card'
          }`}
        >
          {t('map.events_in_wb')} ({wbEventsCount})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-all ${
              filter === cat ? 'bg-heading text-white shadow-lg' : 'bg-white/90 text-heading shadow-card'
            }`}
          >
            <span>{getCategoryIcon(cat)}</span>
            {cat}
          </button>
        ))}
      </div>

      {/* Nearby Toggle */}
      <div className="absolute top-14 left-3 z-40">
        <button
          onClick={() => setShowNearby(!showNearby)}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-card px-3 py-2 text-xs font-medium text-heading transition-all hover:shadow-lg"
        >
          {showNearby ? (
            <ToggleRight className="w-5 h-5 text-primary" />
          ) : (
            <ToggleLeft className="w-5 h-5 text-gray-400" />
          )}
          <span className="whitespace-nowrap">{t('map.show_nearby')}</span>
        </button>
        {showNearby && (
          <div className="mt-1 bg-primary-50/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
            <p className="text-[10px] font-medium text-primary">{t('map.expand_200km')}</p>
          </div>
        )}
      </div>

      {/* Zero Events Empty State */}
      {!loading && wbEventsCount === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-80">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-sm font-semibold text-heading leading-relaxed">
              {t('map.no_active_events')}
            </p>
            {lastUpdated && (
              <p className="text-[10px] text-body/50 mt-2">
                {t('map.last_checked')}: {formatRelativeTime(lastUpdated.toISOString())}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Event Count Badge */}
      <div className="absolute bottom-24 left-3 z-40">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-card px-3 py-2">
          <p className="text-xs font-semibold text-heading">
            {filteredEvents.length} {t('home.active_events')}
          </p>
        </div>
      </div>

      {/* Selected Event Detail Card */}
      {selectedEvent && (
        <div className="absolute bottom-20 left-3 right-3 z-50 animate-slide-up">
          <div className="glass-card p-4 shadow-xl">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getCategoryIcon(selectedEvent.category)}</span>
                <div>
                  <h3 className="text-sm font-semibold text-heading leading-tight">{selectedEvent.title}</h3>
                  <p className="text-xs text-body/60">{selectedEvent.categoryTitle}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-1">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
              <div className="bg-surface rounded-lg p-2">
                <p className="text-body/50 text-[10px]">Date</p>
                <p className="font-medium text-heading">{new Date(selectedEvent.date).toLocaleDateString()}</p>
              </div>
              {selectedEvent.magnitudeValue && (
                <div className="bg-surface rounded-lg p-2">
                  <p className="text-body/50 text-[10px]">{t('map.magnitude')}</p>
                  <p className="font-medium text-heading">{selectedEvent.magnitudeValue} {selectedEvent.magnitudeUnit || ''}</p>
                </div>
              )}
              <div className="bg-surface rounded-lg p-2">
                <p className="text-body/50 text-[10px]">{t('map.distance')}</p>
                <p className="font-medium text-heading">{Math.round((selectedEvent as any)._distance)} {t('map.km_from_you')}</p>
              </div>
            </div>

            {selectedEvent.description && (
              <p className="text-xs text-body mb-3 line-clamp-2">{selectedEvent.description}</p>
            )}

            <div className="flex gap-2">
              {selectedEvent.sources?.[0]?.url && (
                <a
                  href={selectedEvent.sources[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-surface py-2 rounded-xl text-xs font-medium text-heading hover:bg-primary-50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t('map.view_satellite')}
                </a>
              )}
              <button
                onClick={() => shareToWhatsApp(
                  `⚠️ ${selectedEvent.title}\n${selectedEvent.categoryTitle}\n${selectedEvent.sources?.[0]?.url || ''}`,
                  selectedEvent.sources?.[0]?.url || window.location.href
                )}
                className="flex items-center justify-center gap-1.5 bg-green-500 py-2 px-4 rounded-xl text-xs font-medium text-white hover:bg-green-600 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                {t('common.whatsapp')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
