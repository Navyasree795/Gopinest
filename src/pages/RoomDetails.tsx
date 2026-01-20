import { useParams } from "react-router-dom";
import { MapPin, IndianRupee, Users, Phone, Calendar, Check, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";

const mockRoom = {
  id: "1",
  title: "Spacious 1BHK in Andheri",
  location: "Andheri West",
  city: "Mumbai",
  rent: 15000,
  deposit: 30000,
  roomType: "1 BHK",
  tenantType: "Working Professional",
  images: [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
  ],
  amenities: ["WiFi", "AC", "Furnished", "Parking", "Power Backup", "Water Supply"],
  description:
    "Beautiful 1BHK apartment with modern amenities. Located in a prime area with excellent connectivity to metro stations and bus stops. The apartment is fully furnished with quality furniture and appliances. Ideal for working professionals.",
  owner: {
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
  },
  availableFrom: "2024-02-01",
  postedOn: "2024-01-15",
};

const RoomDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const handleContact = () => {
    toast({
      title: "Contact Request Sent!",
      description: "The owner will contact you soon.",
    });
  };

  return (
    <div className="min-h-screen gradient-hero pb-24">
      <PageHeader backTo="/rooms" title="Room Details" />

      <main className="container px-4 py-6 max-w-2xl mx-auto">
        {/* Image Gallery */}
        <div className="relative rounded-2xl overflow-hidden card-shadow mb-6 animate-fade-in">
          <img
            src={mockRoom.images[0]}
            alt={mockRoom.title}
            className="w-full h-64 object-cover"
          />
          <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
            {mockRoom.roomType}
          </Badge>
        </div>

        {/* Room Info Card */}
        <div className="bg-card rounded-2xl card-shadow p-6 mb-6 animate-slide-up">
          <h1 className="text-2xl font-bold text-foreground mb-3">
            {mockRoom.title}
          </h1>

          <div className="flex items-center text-muted-foreground mb-4">
            <MapPin size={18} className="mr-2 text-primary" />
            {mockRoom.location}, {mockRoom.city}
          </div>

          <div className="flex items-center gap-6 mb-6">
            <div>
              <div className="flex items-center text-primary text-2xl font-bold">
                <IndianRupee size={22} />
                {mockRoom.rent.toLocaleString()}
              </div>
              <span className="text-sm text-muted-foreground">per month</span>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div>
              <div className="flex items-center text-foreground text-lg font-semibold">
                <IndianRupee size={18} />
                {mockRoom.deposit.toLocaleString()}
              </div>
              <span className="text-sm text-muted-foreground">deposit</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center">
              <Users size={16} className="mr-2" />
              {mockRoom.tenantType}
            </div>
            <div className="flex items-center">
              <Calendar size={16} className="mr-2" />
              Available from {new Date(mockRoom.availableFrom).toLocaleDateString()}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Description
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {mockRoom.description}
            </p>
          </div>

          <Separator className="my-6" />

          {/* Amenities */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Amenities
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {mockRoom.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center text-muted-foreground"
                >
                  <Check size={16} className="mr-2 text-success" />
                  {amenity}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Owner Info Card */}
        <div className="bg-card rounded-2xl card-shadow p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Home size={20} className="text-primary" />
            Property Owner
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{mockRoom.owner.name}</p>
              <p className="text-sm text-muted-foreground">
                Posted on {new Date(mockRoom.postedOn).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
        <div className="container max-w-2xl mx-auto flex gap-4">
          <Button
            variant="outline"
            className="flex-1 h-14"
            onClick={() => window.open(`tel:${mockRoom.owner.phone}`)}
          >
            <Phone size={20} className="mr-2" />
            Call Owner
          </Button>
          <Button className="flex-1 h-14 btn-shadow" onClick={handleContact}>
            Contact Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
