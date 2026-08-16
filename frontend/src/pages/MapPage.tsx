import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import { useEonetEvents } from '../hooks/useData';
import { EonetEvent } from '../types';
import { getCategoryIcon, getCategoryColor, getSeverityColor, formatRelativeTime, shareToWhatsApp, WB_BBOX } from '../utils/helpers';
import { X, ExternalLink, Share2, ChevronDown, Layers } from 'lucide-react';

export default function MapPage() {
  const { t, i18n } = useTranslation();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const { events, loading, lastUpdated } = useEonetEvents();
  const [selectedEvent, setSelectedEvent] = useState<EonetEvent | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const activeEvents = events.filter(e => !e.closed);
  const filteredEvents = filter === 'all' ? activeEvents : activeEvents.filter(e => e.category === filter);

  const categories = [...new Set(activeEvents.map(e => e.category))];

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [23.5, 87.5],
      zoom: 6,
      zoomControl: false,
      maxBounds: [[19, 84], [29, 92]],
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Draw WB outline (approximate bbox)
    L.rectangle(
      [[21.38, 85.77], [27.05, 89.99]],
      { color: '#0EA5E9', weight: 1, fillOpacity: 0.03, dashArray: '5,5' }
    ).addTo(map);

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

        // Draw polygon for area events
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
          {t('map.events_in_wb')} ({activeEvents.length})
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

            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
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
