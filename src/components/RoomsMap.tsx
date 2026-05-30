import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createRoot } from 'react-dom/client';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

export interface RoomLocation {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
}

interface RoomsMapProps {
  rooms?: RoomLocation[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  interactive?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
}

const RoomsMap = ({ 
  rooms = [], 
  center = [77.5946, 12.9716], // [lng, lat] for Mapbox
  zoom = 12,
  className = "h-[400px] w-full rounded-xl border shadow-sm mb-6",
  interactive = true,
  onLocationSelect
}: RoomsMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const roomMarkersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: zoom,
      pitch: 45,
      bearing: -17.6,
      antialias: true,
      interactive: interactive
    });

    map.current.on('load', () => {
      // 3D Buildings
      const layers = map.current?.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id;

      map.current?.addLayer(
        {
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      );
    });

    if (onLocationSelect) {
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        onLocationSelect(lat, lng);

        if (markerRef.current) markerRef.current.remove();
        markerRef.current = new mapboxgl.Marker({ color: '#FF0000' })
          .setLngLat([lng, lat])
          .addTo(map.current!);
      });
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  // Sync Room Markers
  useEffect(() => {
    if (!map.current) return;

    Object.values(roomMarkersRef.current).forEach(m => m.remove());
    roomMarkersRef.current = {};

    rooms.forEach(room => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = `<div style="background-color: #0F172A; color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; border: 2px solid white; cursor: pointer shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">${room.title.split(' ')[0]}</div>`;
      
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div style="padding: 10px;">
          <h4 style="font-weight: bold; margin-bottom: 5px;">${room.title}</h4>
          <a href="/room/${room.id}" style="color: #0F172A; text-decoration: underline; font-size: 12px;">View Details</a>
        </div>`
      );

      const marker = new mapboxgl.Marker(el)
        .setLngLat([room.lng, room.lat])
        .setPopup(popup)
        .addTo(map.current!);

      roomMarkersRef.current[room.id] = marker;
    });

    if (rooms.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      rooms.forEach(r => bounds.extend([r.lng, r.lat]));
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    }
  }, [rooms]);

  return (
    <div className={className} style={{ position: 'relative', overflow: 'hidden' }}>
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />
    </div>
  );
};

export default RoomsMap;
