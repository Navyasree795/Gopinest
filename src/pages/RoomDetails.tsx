import { useParams, useNavigate } from "react-router-dom";
import { MapPin, IndianRupee, Users, Phone, Calendar, Check, Home, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PageHeader from "@/components/PageHeader";
import { useRoomDetails } from "@/hooks/useRoomDetails";
import { useToast } from "@/hooks/use-toast";

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: room, isLoading, isError, error } = useRoomDetails(id || "");

  const handleWhatsApp = () => {
    if (!room?.ownerId?.mobile) return;
    
    // Robust number formatting for WhatsApp
    const cleaned = room.ownerId.mobile.replace(/\D/g, "");
    const phone = cleaned.length === 10 ? `91${cleaned}` : cleaned;
    
    const message = encodeURIComponent(`Hi, I saw your room "${room.title}" in ${room.city} on SmartStay Hub. Is it still available?`);
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleCall = () => {
    if (!room?.ownerId?.mobile) {
      console.warn("[CALL] No mobile number available for owner");
      toast({
        title: "Number Unavailable",
        description: "Owner's phone number is not listed.",
        variant: "destructive",
      });
      return;
    }
    
    // Clean number and format for dialer
    const cleaned = room.ownerId.mobile.replace(/\D/g, "");
    const phone = cleaned.length === 10 ? `+91${cleaned}` : `+${cleaned}`;
    
    console.log(`[CALL] Opening dialer for: ${phone}`);
    window.location.href = `tel:${phone}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg text-muted-foreground">Loading room details...</p>
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-xl text-destructive mb-4">Error: {(error as Error)?.message || "Room not found"}</p>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  const images = room.images && room.images.length > 0 
    ? room.images.map((img: string) => img.startsWith('http') ? img : `${import.meta.env.VITE_API_BASE_URL || ''}/${img}`)
    : ["/placeholder.svg"];

  return (
    <div className="min-h-screen gradient-hero pb-32">
      <PageHeader backTo="/rooms" title="Room Details" />

      <main className="container px-4 py-6 max-w-2xl mx-auto">
        {/* Image Gallery */}
        <div className="relative rounded-2xl overflow-hidden card-shadow mb-6 animate-fade-in">
          <img
            src={images[0]}
            alt={room.title}
            className="w-full h-64 object-cover"
          />
          <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground shadow-lg">
            {room.roomType.toUpperCase()}
          </Badge>
        </div>

        {/* Room Info Card */}
        <div className="bg-card rounded-2xl card-shadow p-6 mb-6 animate-slide-up">
          <h1 className="text-2xl font-bold text-foreground mb-3 leading-tight">
            {room.title}
          </h1>

          <div className="flex items-center text-muted-foreground mb-4">
            <MapPin size={18} className="mr-2 text-primary" />
            <span className="font-medium">{room.location}, {room.city}</span>
          </div>

          <div className="flex items-center gap-6 mb-6">
            <div>
              <div className="flex items-center text-primary text-3xl font-extrabold">
                <IndianRupee size={24} strokeWidth={3} />
                {room.rent.toLocaleString()}
              </div>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Rent per month</span>
            </div>
            <Separator orientation="vertical" className="h-12" />
            <div>
              <div className="flex items-center text-foreground text-xl font-bold">
                <IndianRupee size={20} strokeWidth={2.5} />
                {room.deposit.toLocaleString()}
              </div>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Deposit</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center bg-muted/50 p-3 rounded-xl">
              <Users size={18} className="mr-2 text-primary" />
              <span className="font-semibold text-foreground capitalize">{room.tenantType}</span>
            </div>
            <div className="flex items-center bg-muted/50 p-3 rounded-xl">
              <Calendar size={18} className="mr-2 text-primary" />
              <span className="font-semibold text-foreground">Immediate</span>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              About this property
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {room.description}
            </p>
          </div>

          <Separator className="my-6" />

          {/* Amenities */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">
              Property Amenities
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {room.amenities.map((amenity: string) => (
                <div
                  key={amenity}
                  className="flex items-center text-muted-foreground bg-muted/30 p-2 rounded-lg"
                >
                  <Check size={16} className="mr-2 text-green-600 font-bold" />
                  <span className="text-sm font-medium capitalize">{amenity}</span>
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
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl uppercase">
                {room.ownerId?.name?.charAt(0) || "O"}
              </div>
              <div>
                <p className="font-bold text-foreground">{room.ownerId?.name || "Verified Owner"}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">
                  Posted on {new Date(room.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Communication Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border p-4 z-50">
        <div className="container max-w-2xl mx-auto">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-14 border-primary/20 hover:border-primary hover:bg-primary/5 shadow-sm text-lg"
              onClick={handleCall}
              disabled={!room.ownerId?.mobile}
            >
              <Phone size={20} className="mr-2 text-primary" />
              <span className="font-semibold text-foreground">Call Owner</span>
            </Button>
            <Button
              className="flex-[1.5] h-14 bg-green-600 hover:bg-green-700 text-white text-lg font-bold btn-shadow"
              onClick={handleWhatsApp}
              disabled={!room.ownerId?.mobile}
            >
              <MessageCircle size={22} className="mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal icon for description
const FileText = ({ className, size }: { className?: string; size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <line x1="10" y1="9" x2="8" y2="9"/>
  </svg>
);

export default RoomDetails;
