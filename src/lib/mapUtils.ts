import mapboxgl from "mapbox-gl";

export interface RouteData {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: any;
}

export const getRoute = async (start: [number, number], end: [number, number]): Promise<RouteData | null> => {
  const query = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
    { method: 'GET' }
  );
  const json = await query.json();
  if (!json.routes || json.routes.length === 0) return null;
  
  const data = json.routes[0];
  return {
    distance: data.distance,
    duration: data.duration,
    geometry: data.geometry
  };
};

export const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

export const formatDuration = (seconds: number): string => {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} mins`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

export const getSearchSuggestions = async (query: string): Promise<any[]> => {
  if (!query || query.length < 3) return [];
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&limit=5`
  );
  const json = await res.json();
  return json.features || [];
};
