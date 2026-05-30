import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

const MapLoading = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md"
    >
      <div className="relative">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center"
        >
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </motion.div>
        
        <motion.div
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap font-semibold text-primary tracking-wider"
        >
          Initializing 3D World...
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MapLoading;
