import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useRooms } from "@/hooks/useRooms";
import RoomPopup from "./RoomPopup";
import MapControls from "./MapControls";
import MapLoading from "./MapLoading";
import { createRoot } from "react-dom/client";
import { useSearchParams } from "react-router-dom";
import { getRoute, RouteData } from "@/lib/mapUtils";
import { useToast } from "@/hooks/use-toast";
import * as turf from "@turf/turf";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const Room3DMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // State
  const [isLoaded, setIsLoaded] = useState(false);
  const [is3D, setIs3D] = useState(true);
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/dark-v11");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [activeRoute, setActiveRoute] = useState<RouteData | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [distances, setDistances] = useState<{ [key: string]: { distance: number; duration: number } }>({});

  // Refs
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null);

  // Fetch Rooms
  const { data: roomsData, isLoading } = useRooms({
    city: searchParams.get("city") || "",
    location: searchParams.get("location") || "",
  });

  const rooms = useMemo(() => roomsData?.rooms || [], [roomsData]);

  // Handle Route generation
  const handleDirections = useCallback(async (room: any) => {
    if (!userLocation) {
      toast({ title: "Location needed", description: "Calculating route from your current location..." });
      return;
    }
    const route = await getRoute(userLocation, [room.lng, room.lat]);
    if (route) setActiveRoute(route);
  }, [userLocation]);

  // Initial Map Load
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    // Use current location as initial center if possible, else fallback
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: userLocation || [77.5946, 12.9716], // Defaults to Bangalore if no location yet
      zoom: 12,
      pitch: 45,
      antialias: true
    });

    map.current.on('load', () => {
      setIsLoaded(true);
      
      // 1. Setup Geolocate Control (Native Blue Dot)
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserLocation: true,
        showAccuracyCircle: true
      });
      
      geolocateControlRef.current = geolocate;
      map.current?.addControl(geolocate, 'bottom-right');

      // Sync user location state when geolocate triggers
      geolocate.on('geolocate', (e: any) => {
        const coords: [number, number] = [e.coords.longitude, e.coords.latitude];
        console.log("[MAP] Geolocated:", coords);
        setUserLocation(coords);
      });

      geolocate.on('error', (e: any) => {
        console.error("[MAP] Geolocation error:", e);
        if (e.code === 1) { // PERMISSION_DENIED
          toast({ 
            title: "Location Permission Denied", 
            description: "Please enable GPS to see nearby rooms and get directions.",
            variant: "destructive"
          });
        }
      });

      // AUTO-TRIGGER Geolocation on load
      setTimeout(() => {
        geolocate.trigger();
      }, 500);

      // 2. Setup Room Source (GeoJSON with Clustering)
      map.current?.addSource('rooms', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // 3. Setup Route Source
      map.current?.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }
      });

      // 4. Add Layers
      map.current?.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'rooms',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#3b82f6', 5, '#2563eb', 15, '#1d4ed8'],
          'circle-radius': ['step', ['get', 'point_count'], 20, 5, 25, 15, 30],
          'circle-stroke-width': 3,
          'circle-stroke-color': 'rgba(255,255,255,0.3)'
        }
      });

      map.current?.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'rooms',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: { 'text-color': '#ffffff' }
      });

      map.current?.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'rooms',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#3b82f6',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      map.current?.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#38bdf8', 'line-width': 6, 'line-opacity': 0.8 }
      });

      // 3D Buildings
      const layers = map.current?.getStyle().layers;
      const labelLayerId = layers?.find(l => l.type === 'symbol' && l.layout?.['text-field'])?.id;
      map.current?.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height']],
          'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height']],
          'fill-extrusion-opacity': 0.6
        }
      }, labelLayerId);

      // Event: Cluster Click
      map.current?.on('click', 'clusters', (e) => {
        const features = map.current?.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features?.[0].properties?.cluster_id;
        const source = map.current?.getSource('rooms') as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.current?.easeTo({ center: (features?.[0].geometry as any).coordinates, zoom });
        });
      });

      // Event: Point Click
      map.current?.on('click', 'unclustered-point', (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const room = JSON.parse(feature.properties?.room);
        setSelectedRoom(room);
      });
    });

    return () => map.current?.remove();
  }, []);

  // Update Data Sources
  useEffect(() => {
    if (!map.current || !isLoaded) return;
    const source = map.current.getSource('rooms') as mapboxgl.GeoJSONSource;
    if (source) {
      const features = rooms.filter(r => r.lat && r.lng).map(room => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [room.lng, room.lat] },
        properties: { room: JSON.stringify(room) }
      }));
      source.setData({ type: 'FeatureCollection', features });
    }
  }, [rooms, isLoaded]);

  // Update Route Layer
  useEffect(() => {
    if (!map.current || !isLoaded) return;
    const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
    if (source) {
      if (activeRoute) {
        source.setData({ type: 'Feature', properties: {}, geometry: activeRoute.geometry });
        const bounds = new mapboxgl.LngLatBounds();
        activeRoute.geometry.coordinates.forEach((c: any) => bounds.extend(c));
        map.current.fitBounds(bounds, { padding: { top: 50, bottom: 250, left: 50, right: 50 }, speed: 1.5 });
      } else {
        source.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } });
      }
    }
  }, [activeRoute, isLoaded]);

  // Handle Selection Lifecycle
  useEffect(() => {
    if (!map.current || !isLoaded || !selectedRoom) return;

    handleDirections(selectedRoom);

    if (popupRef.current) popupRef.current.remove();
    const popupEl = document.createElement('div');
    const popupRoot = createRoot(popupEl);
    
    const popup = new mapboxgl.Popup({ offset: 15, closeButton: false, className: 'custom-popup' })
      .setLngLat([selectedRoom.lng, selectedRoom.lat])
      .setDOMContent(popupEl)
      .addTo(map.current!);
    
    popupRef.current = popup;

    popupRoot.render(
      <RoomPopup 
        room={{
          id: selectedRoom._id,
          title: selectedRoom.title,
          price: selectedRoom.rent,
          address: `${selectedRoom.location}, ${selectedRoom.city}`,
          image: selectedRoom.images?.[0]?.startsWith('http') ? selectedRoom.images[0] : `${import.meta.env.VITE_API_BASE_URL}/${selectedRoom.images?.[0]}`,
          lng: selectedRoom.lng,
          lat: selectedRoom.lat
        }}
        distance={distances[selectedRoom._id]?.distance}
        duration={distances[selectedRoom._id]?.duration}
        onClose={() => {
          popup.remove();
          setSelectedRoom(null);
          setActiveRoute(null);
        }}
        onDirections={handleDirections}
      />
    );

    map.current.flyTo({ center: [selectedRoom.lng, selectedRoom.lat], zoom: 15, offset: [0, -100] });
  }, [selectedRoom, isLoaded, distances]);

  const handleLocateClick = () => {
    if (geolocateControlRef.current) {
      geolocateControlRef.current.trigger();
    }
  };

  const handleSearch = (query: string, coords?: [number, number]) => {
    if (coords) map.current?.flyTo({ center: coords, zoom: 14 });
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-background overflow-hidden">
      {!isLoaded && <MapLoading />}
      <div ref={mapContainer} className="absolute inset-0" />
      
      <MapControls 
        onLocate={handleLocateClick} 
        onSearch={handleSearch} 
        onToggle3D={() => { setIs3D(!is3D); map.current?.easeTo({ pitch: is3D ? 0 : 60 }); }} 
        onToggleStyle={() => { 
          const s = mapStyle.includes("dark") ? "mapbox://styles/mapbox/streets-v12" : "mapbox://styles/mapbox/dark-v11"; 
          setMapStyle(s); 
          map.current?.setStyle(s); 
        }} 
        is3D={is3D} 
      />
      
      {activeRoute && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3 w-full px-4 max-w-sm animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-background/95 backdrop-blur-xl border border-primary/20 px-6 py-4 rounded-3xl shadow-2xl flex items-center justify-between w-full">
            <div className="flex gap-8">
              <Metric label="Distance" value={`${(activeRoute.distance / 1000).toFixed(1)} km`} />
              <div className="w-px h-8 bg-border self-center" />
              <Metric label="Time" value={`${Math.round(activeRoute.duration / 60)} mins`} />
            </div>
            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full hover:bg-destructive/10" onClick={() => { setActiveRoute(null); setSelectedRoom(null); popupRef.current?.remove(); }}>
              <XIcon />
            </Button>
          </div>
          <Button 
            className="h-14 w-full rounded-2xl shadow-2xl bg-primary text-primary-foreground font-black text-lg gap-3 hover:scale-[1.02] active:scale-95 transition-all"
            onClick={() => {
              const [lng, lat] = activeRoute.geometry.coordinates.at(-1);
              window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, "_blank");
            }}
          >
            <NavigationIcon />
            START NAVIGATION
          </Button>
        </div>
      )}

      <style>{`
        .mapboxgl-popup-content { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        .mapboxgl-popup-tip { display: none !important; }
        .mapboxgl-ctrl-bottom-right { bottom: 80px !important; right: 20px !important; }
        .mapboxgl-ctrl-geolocate { border-radius: 12px !important; width: 40px !important; height: 40px !important; background: white !important; border: 1px solid #e2e8f0 !important; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important; }
      `}</style>
    </div>
  );
};

const Metric = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col">
    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{label}</span>
    <span className="text-xl font-black text-foreground">{value}</span>
  </div>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const NavigationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
);

const Button = ({ children, className, onClick, size, variant }: any) => (
  <button onClick={onClick} className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 ${className}`}>
    {children}
  </button>
);

export default Room3DMap;
