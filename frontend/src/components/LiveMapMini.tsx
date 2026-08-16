import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { EonetEvent } from '../types';
import { getCategoryColor } from '../utils/helpers';

interface Props {
  events: EonetEvent[];
}

export default function LiveMapMini({ events }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [23.0, 87.5],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
    }).addTo(map);

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
      if (layer instanceof L.CircleMarker) map.removeLayer(layer);
    });

    events.filter(e => !e.closed).forEach((event) => {
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
      } else {
        return;
      }

      L.circleMarker([lat, lng], {
        radius: 6,
        fillColor: getCategoryColor(event.category),
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      })
        .addTo(map)
        .on('click', () => navigate('/map'));
    });
  }, [events, navigate]);

  return (
    <div ref={mapRef} className="w-full h-48 cursor-pointer" onClick={() => navigate('/map')} />
  );
}
