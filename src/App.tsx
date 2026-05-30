import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import FindRoom from "./pages/FindRoom";
import RoomListings from "./pages/RoomListings";
import RoomDetails from "./pages/RoomDetails";
import AddRoom from "./pages/AddRoom";
import AdminDashboard from "./pages/AdminDashboard";
import Room3DMap from "./components/map/Room3DMap";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/find-room" element={<FindRoom />} />
          <Route path="/rooms" element={<RoomListings />} />
          <Route path="/room/:id" element={<RoomDetails />} />
          <Route path="/add-room" element={<AddRoom />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/map" element={<Room3DMap />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
