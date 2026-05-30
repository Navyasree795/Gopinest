import { Search, Navigation, Map as MapIcon, Layers, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { getSearchSuggestions } from "@/lib/mapUtils";

interface MapControlsProps {
  onSearch: (query: string, coords?: [number, number]) => void;
  onLocate: () => void;
  onToggle3D: () => void;
  onToggleStyle: () => void;
  is3D: boolean;
}

const MapControls = ({ onSearch, onLocate, onToggle3D, onToggleStyle, is3D }: MapControlsProps) => {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.length >= 3) {
        const results = await getSearchSuggestions(search);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (feature: any) => {
    setSearch(feature.place_name);
    setShowSuggestions(false);
    onSearch(feature.place_name, feature.center);
  };

  return (
    <div ref={containerRef} className="absolute top-4 left-4 right-4 md:right-auto md:w-80 z-20 space-y-3 pointer-events-none">
      {/* Search Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative pointer-events-auto"
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input 
          placeholder="Search for a location..." 
          className="pl-10 h-12 bg-background/90 backdrop-blur-md border-border shadow-2xl rounded-2xl focus-visible:ring-primary text-sm font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => search.length >= 3 && setShowSuggestions(true)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch(search)}
        />

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-lg border border-border rounded-2xl shadow-2xl overflow-hidden py-2"
            >
              {suggestions.map((feature) => (
                <button
                  key={feature.id}
                  className="w-full px-4 py-2.5 text-left text-xs hover:bg-muted flex items-center gap-3 transition-colors"
                  onClick={() => handleSuggestionClick(feature)}
                >
                  <MapPin size={14} className="text-primary shrink-0" />
                  <span className="truncate">{feature.place_name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Control Buttons */}
      <div className="flex gap-2">
        <ControlButton 
          onClick={onLocate} 
          icon={<Navigation size={18} />} 
          label="Locate" 
        />
        <ControlButton 
          onClick={onToggle3D} 
          icon={<Layers size={18} />} 
          label={is3D ? "2D View" : "3D View"} 
          active={is3D}
        />
        <ControlButton 
          onClick={onToggleStyle} 
          icon={<MapIcon size={18} />} 
          label="Style" 
        />
      </div>
    </div>
  );
};

const ControlButton = ({ onClick, icon, label, active = false }: { onClick: () => void, icon: React.ReactNode, label: string, active?: boolean }) => (
  <motion.div 
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="pointer-events-auto"
  >
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`h-10 rounded-xl bg-background/90 backdrop-blur-md border-border shadow-lg gap-2 font-bold text-[10px] uppercase tracking-wider ${active ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-primary/10 text-muted-foreground'}`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </Button>
  </motion.div>
);

export default MapControls;
