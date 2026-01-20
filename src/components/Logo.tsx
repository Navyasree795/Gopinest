import { Home } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const Logo = ({ size = "md", showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} gradient-primary rounded-xl flex items-center justify-center btn-shadow`}>
        <Home className="text-primary-foreground" size={iconSizes[size]} />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold text-foreground`}>
          Smart<span className="text-primary">Stay</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
