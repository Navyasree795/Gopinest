import { motion } from "framer-motion";
import { Home } from "lucide-react";

interface RoomMarkerProps {
  price: number;
  title: string;
  onClick: () => void;
}

const RoomMarker = ({ price, title, onClick }: RoomMarkerProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.1, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="cursor-pointer group flex flex-col items-center"
    >
      <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-background flex items-center gap-1 group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-200">
        <Home size={12} strokeWidth={3} />
        <span>₹{price >= 1000 ? `${(price / 1000).toFixed(1)}k` : price}</span>
      </div>
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary group-hover:border-t-accent transition-colors duration-200 -mt-[1px]"></div>
      
      {/* Tooltip on hover */}
      <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform duration-200 bg-background text-foreground px-3 py-1.5 rounded-lg text-[10px] font-semibold shadow-xl border border-border whitespace-nowrap pointer-events-none z-10">
        {title}
      </div>
    </motion.div>
  );
};

export default RoomMarker;
