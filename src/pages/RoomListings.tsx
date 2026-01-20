import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, IndianRupee, Users, Bed, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";

interface Room {
  id: string;
  title: string;
  location: string;
  city: string;
  rent: number;
  deposit: number;
  roomType: string;
  tenantType: string;
  image: string;
  amenities: string[];
}

const mockRooms: Room[] = [
  {
    id: "1",
    title: "Spacious 1BHK in Andheri",
    location: "Andheri West",
    city: "Mumbai",
    rent: 15000,
    deposit: 30000,
    roomType: "1 BHK",
    tenantType: "Working Professional",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    amenities: ["WiFi", "AC", "Furnished"],
  },
  {
    id: "2",
    title: "Cozy Single Room",
    location: "Koramangala",
    city: "Bangalore",
    rent: 8000,
    deposit: 16000,
    roomType: "Single Room",
    tenantType: "Student",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
    amenities: ["WiFi", "Meals"],
  },
  {
    id: "3",
    title: "Modern 2BHK Apartment",
    location: "Banjara Hills",
    city: "Hyderabad",
    rent: 22000,
    deposit: 44000,
    roomType: "2 BHK",
    tenantType: "Family",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
    amenities: ["Parking", "AC", "Furnished", "Gym"],
  },
  {
    id: "4",
    title: "Shared Room for Students",
    location: "Powai",
    city: "Mumbai",
    rent: 6000,
    deposit: 12000,
    roomType: "Shared Room",
    tenantType: "Student",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop",
    amenities: ["WiFi", "Meals", "Laundry"],
  },
  {
    id: "5",
    title: "Premium Studio Apartment",
    location: "Indiranagar",
    city: "Bangalore",
    rent: 18000,
    deposit: 36000,
    roomType: "Studio",
    tenantType: "Working Professional",
    image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop",
    amenities: ["WiFi", "AC", "Furnished", "Kitchen"],
  },
  {
    id: "6",
    title: "Budget Friendly Single Room",
    location: "BTM Layout",
    city: "Bangalore",
    rent: 5500,
    deposit: 11000,
    roomType: "Single Room",
    tenantType: "Any",
    image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400&h=300&fit=crop",
    amenities: ["WiFi"],
  },
];

const RoomCard = ({ room, onClick }: { room: Room; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-card rounded-xl card-shadow overflow-hidden text-left transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1 animate-fade-in"
    >
      <div className="relative">
        <img
          src={room.image}
          alt={room.title}
          className="w-full h-40 object-cover"
        />
        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
          {room.roomType}
        </Badge>
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
  const [rooms] = useState<Room[]>(mockRooms);

  const city = searchParams.get("city");
  const location = searchParams.get("location");

  const filteredRooms = rooms.filter((room) => {
    if (city && room.city.toLowerCase() !== city) return false;
    if (location && !room.location.toLowerCase().includes(location.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen gradient-hero">
      <PageHeader backTo="/find-room" title="Available Rooms" />

      <main className="container px-4 py-6">
        {/* Filter Summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {filteredRooms.length} rooms found
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate("/find-room")}>
            <Filter size={16} className="mr-2" />
            Filters
          </Button>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room, index) => (
            <div key={room.id} style={{ animationDelay: `${index * 50}ms` }}>
              <RoomCard
                room={room}
                onClick={() => navigate(`/room/${room.id}`)}
              />
            </div>
          ))}
        </div>

        {filteredRooms.length === 0 && (
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
