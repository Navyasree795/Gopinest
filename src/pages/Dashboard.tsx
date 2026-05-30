import { useNavigate } from "react-router-dom";
import { Search, List, PlusCircle, ShieldCheck, LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  variant?: "default" | "admin";
}

const ActionCard = ({ icon, title, description, onClick, variant = "default" }: ActionCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-6 rounded-2xl card-shadow bg-card text-left transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1 animate-scale-in ${
        variant === "admin" ? "border-2 border-accent" : ""
      }`}
    >
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
          variant === "admin" ? "gradient-accent" : "gradient-primary"
        }`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const actions = [
    {
      icon: <Search className="text-primary-foreground" size={24} />,
      title: "Find Room",
      description: "Search for available rooms based on your preferences",
      path: "/find-room",
    },
    {
      icon: <List className="text-primary-foreground" size={24} />,
      title: "List Rooms",
      description: "Browse all available rooms in your area",
      path: "/rooms",
    },
    {
      icon: <PlusCircle className="text-primary-foreground" size={24} />,
      title: "Add Room",
      description: "List your room for tenants to find",
      path: "/add-room",
    },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16 px-4">
          <Logo size="sm" />
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut size={18} />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to SmartStay
          </h1>
          <p className="text-muted-foreground">
            Hello, +91 {user?.mobile}
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {actions.map((action, index) => (
            <div key={action.title} style={{ animationDelay: `${index * 100}ms` }}>
              <ActionCard
                icon={action.icon}
                title={action.title}
                description={action.description}
                onClick={() => navigate(action.path)}
              />
            </div>
          ))}

          {/* Admin Panel - Only visible for admin */}
          {user?.isAdmin && (
            <div style={{ animationDelay: "300ms" }}>
              <ActionCard
                icon={<ShieldCheck className="text-accent-foreground" size={24} />}
                title="Admin Panel"
                description="Manage rooms, users, and approvals"
                onClick={() => navigate("/admin")}
                variant="admin"
              />
            </div>
          )}
        </div>

        {/* Admin Notice */}
        {user?.isAdmin && (
          <p className="text-center text-sm text-accent mt-6 animate-fade-in">
            You have admin access
          </p>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
