import { motion } from "framer-motion";
import { MapPin, IndianRupee, ExternalLink, X, Navigation, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { formatDistance, formatDuration } from "@/lib/mapUtils";

interface RoomPopupProps {
  room: {
    id: string;
    title: string;
    price: number;
    address: string;
    image: string;
    lng: number;
    lat: number;
  };
  distance?: number;
  duration?: number;
  onClose: () => void;
  onDirections: (room: any) => void;
}

const RoomPopup = ({ room, distance, duration, onClose, onDirections }: RoomPopupProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="w-72 bg-card rounded-2xl overflow-hidden shadow-2xl border border-border"
    >
      <div className="relative h-36 w-full overflow-hidden">
        <img 
          src={room.image} 
          alt={room.title} 
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-2 right-2 p-1.5 bg-background/50 backdrop-blur-md rounded-full text-foreground hover:bg-background/80 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-bold text-foreground line-clamp-1 text-sm">{room.title}</h3>
          <div className="flex items-center text-muted-foreground text-[10px] mt-1">
            <MapPin size={10} className="mr-1 shrink-0 text-primary" />
            <span className="truncate">{room.address}</span>
          </div>
        </div>

        {distance !== undefined && duration !== undefined && (
          <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-lg text-[10px]">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Navigation size={12} className="text-primary" />
              {formatDistance(distance)}
            </div>
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Clock size={12} className="text-primary" />
              {formatDuration(duration)}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-center text-primary font-bold text-sm">
              <IndianRupee size={12} className="mr-0.5" />
              <span>{room.price.toLocaleString()}</span>
            </div>
            <span className="text-[9px] text-muted-foreground">per month</span>
          </div>
          <div className="flex gap-1.5">
            <Button 
              size="sm" 
              variant="outline"
              className="h-8 text-[10px] px-2.5 gap-1 border-primary/20 hover:border-primary hover:bg-primary/10"
              onClick={() => onDirections(room)}
            >
              <Navigation size={10} />
              Directions
            </Button>
            <Button 
              size="sm" 
              className="h-8 text-[10px] px-2.5 gap-1"
              onClick={() => navigate(`/room/${room.id}`)}
            >
              <ExternalLink size={10} />
              Details
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RoomPopup;
