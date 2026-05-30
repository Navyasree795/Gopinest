import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, IndianRupee, Users, Bed, Filter, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";
import { useRooms } from "@/hooks/useRooms";
import RoomsMap, { RoomLocation } from "@/components/RoomsMap";
import * as turf from "@turf/turf";
import { formatDistance } from "@/lib/mapUtils";

interface Room {
  _id: string;
  title: string;
  location: string;
  city: string;
  rent: number;
  deposit: number;
  roomType: string;
  tenantType: string;
  images: string[];
  amenities: string[];
  lat?: number;
  lng?: number;
}

const RoomCard = ({ room, onClick, distance }: { room: Room; onClick: () => void; distance?: number }) => {
  const imageUrl = room.images && room.images.length > 0 
    ? (room.images[0].startsWith('http') ? room.images[0] : `${import.meta.env.VITE_API_BASE_URL || ''}/${room.images[0]}`)
    : "/placeholder.svg";

  return (
    <button
      onClick={onClick}
      className="w-full bg-card rounded-xl card-shadow overflow-hidden text-left transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1 animate-fade-in"
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={room.title}
          className="w-full h-40 object-cover"
        />
        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground shadow-sm">
          {room.roomType}
        </Badge>
        {distance !== undefined && (
          <div className="absolute bottom-3 left-3 bg-background/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-primary flex items-center gap-1 shadow-sm">
            <Navigation size={10} />
            {formatDistance(distance * 1000)} away
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
          {room.title}
        </h3>
        <div className="flex items-center text-muted-foreground text-sm mb-3">
          <MapPin size={14} className="mr-1" />
          {room.location}, {room.city}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-primary font-bold text-lg">
            <IndianRupee size={18} />
            {room.rent.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground ml-1">
              /month
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users size={14} className="mr-1" />
            {room.tenantType}
          </div>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {room.amenities.slice(0, 3).map((amenity) => (
            <Badge key={amenity} variant="secondary" className="text-xs">
              {amenity}
            </Badge>
          ))}
        </div>
      </div>
    </button>
  );
};

const RoomListings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.longitude, pos.coords.latitude]),
      () => console.log("Location access denied")
    );
  }, []);

  const city = searchParams.get("city") || "";
  const location = searchParams.get("location") || "";
  const minRent = searchParams.get("minRent") ? parseInt(searchParams.get("minRent")!) : undefined;
  const maxRent = searchParams.get("maxRent") ? parseInt(searchParams.get("maxRent")!) : undefined;
  const tenantType = searchParams.get("tenantType") || "";

  const { data: roomsData, isLoading, isError } = useRooms({
    city,
    location,
    minRent,
    maxRent,
    tenantType: tenantType === 'any' ? undefined : tenantType
  });

  const rooms = useMemo(() => {
    const rawRooms = (roomsData?.rooms as Room[]) || [];
    if (!userLocation) return rawRooms;

    return [...rawRooms].sort((a, b) => {
      if (a.lat === undefined || a.lng === undefined || b.lat === undefined || b.lng === undefined) return 0;
      const distA = turf.distance([userLocation[0], userLocation[1]], [a.lng, a.lat]);
      const distB = turf.distance([userLocation[0], userLocation[1]], [b.lng, b.lat]);
      return distA - distB;
    });
  }, [roomsData, userLocation]);

  // Map real rooms to map markers (only those with valid coords)
  const mapRooms: RoomLocation[] = rooms
    .filter((r: any) => r && typeof r.lat === 'number' && typeof r.lng === 'number')
    .map((room: any) => ({
      id: room._id,
      lat: room.lat,
      lng: room.lng,
      title: room.title
    }));

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero">
        <PageHeader backTo="/find-room" title="Available Rooms" />
        <main className="container px-4 py-16 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Finding the best rooms for you...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero pb-12">
      <PageHeader backTo="/find-room" title="Available Rooms" />

      <main className="container px-4 py-6">
        {/* Toggle View */}
        <div className="flex gap-2 mb-6">
          <Button 
            variant={showMap ? "outline" : "default"} 
            className="flex-1 h-12"
            onClick={() => setShowMap(false)}
          >
            List View
          </Button>
          <Button 
            variant={showMap ? "default" : "outline"} 
            className="flex-1 h-12"
            onClick={() => setShowMap(true)}
          >
            Map View
          </Button>
        </div>

        {showMap ? (
          <div className="animate-fade-in mb-6">
            <RoomsMap 
              rooms={mapRooms} 
              className="h-[60vh] w-full rounded-2xl border shadow-lg"
              center={mapRooms.length > 0 ? [mapRooms[0].lng, mapRooms[0].lat] : [77.5946, 12.9716]}
              zoom={11}
            />
          </div>
        ) : null}

        {/* Filter Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground font-medium">
            {rooms?.length || 0} rooms available
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate("/find-room")} className="rounded-full px-4">
            <Filter size={14} className="mr-2" />
            Filters
          </Button>
        </div>

        {/* Room Grid */}
        <div className={showMap ? "hidden" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"}>
          {rooms?.map((room: Room, index: number) => {
            const distance = userLocation && room.lat && room.lng 
              ? turf.distance([userLocation[0], userLocation[1]], [room.lng, room.lat])
              : undefined;
            
            return (
              <div key={room._id} style={{ animationDelay: `${index * 50}ms` }}>
                <RoomCard
                  room={room}
                  distance={distance}
                  onClick={() => navigate(`/room/${room._id}`)}
                />
              </div>
            );
          })}
        </div>

        {(!rooms || rooms.length === 0) && (
          <div className="text-center py-16">
            <Bed className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No rooms found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search filters
            </p>
            <Button onClick={() => navigate("/find-room")}>
              Modify Search
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default RoomListings;
