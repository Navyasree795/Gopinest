import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Home, Users, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface PendingRoom {
  id: string;
  title: string;
  owner: string;
  city: string;
  rent: number;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
}

const initialPendingRooms: PendingRoom[] = [
  {
    id: "1",
    title: "2BHK in Powai",
    owner: "Amit Kumar",
    city: "Mumbai",
    rent: 25000,
    submittedAt: "2024-01-20",
    status: "pending",
  },
  {
    id: "2",
    title: "Single Room near IIT",
    owner: "Priya Sharma",
    city: "Delhi",
    rent: 8000,
    submittedAt: "2024-01-19",
    status: "pending",
  },
  {
    id: "3",
    title: "Studio Apartment",
    owner: "Ravi Patel",
    city: "Bangalore",
    rent: 15000,
    submittedAt: "2024-01-18",
    status: "pending",
  },
  {
    id: "4",
    title: "PG for Girls",
    owner: "Sunita Devi",
    city: "Hyderabad",
    rent: 6000,
    submittedAt: "2024-01-17",
    status: "pending",
  },
];

const stats = [
  {
    title: "Total Rooms",
    value: "156",
    icon: Home,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Active Users",
    value: "1,234",
    icon: Users,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "Pending Approval",
    value: "12",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [pendingRooms, setPendingRooms] = useState<PendingRoom[]>(initialPendingRooms);

  // Redirect if not admin
  if (!user?.isAdmin) {
    navigate("/dashboard");
    return null;
  }

  const handleApprove = (id: string) => {
    setPendingRooms((prev) =>
      prev.map((room) =>
        room.id === id ? { ...room, status: "approved" as const } : room
      )
    );
    toast({
      title: "Room Approved",
      description: "The room listing is now visible to users.",
    });
  };

  const handleReject = (id: string) => {
    setPendingRooms((prev) =>
      prev.map((room) =>
        room.id === id ? { ...room, status: "rejected" as const } : room
      )
    );
    toast({
      title: "Room Rejected",
      description: "The owner will be notified.",
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen gradient-hero">
      <PageHeader backTo="/dashboard" title="Admin Panel" />

      <main className="container px-4 py-6">
        {/* Admin Badge */}
        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center">
            <ShieldCheck className="text-accent-foreground" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage rooms and approvals</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={stat.title} className="card-shadow animate-scale-in" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={stat.color} size={20} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Approvals Table */}
        <Card className="card-shadow animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              Pending Room Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead className="hidden sm:table-cell">Owner</TableHead>
                    <TableHead className="hidden sm:table-cell">City</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.title}</TableCell>
                      <TableCell className="hidden sm:table-cell">{room.owner}</TableCell>
                      <TableCell className="hidden sm:table-cell">{room.city}</TableCell>
                      <TableCell>₹{room.rent.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            room.status === "approved"
                              ? "default"
                              : room.status === "rejected"
                              ? "destructive"
                              : "secondary"
                          }
                          className={
                            room.status === "approved"
                              ? "bg-success text-success-foreground"
                              : ""
                          }
                        >
                          {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {room.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/room/${room.id}`)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-success hover:text-success hover:bg-success/10"
                              onClick={() => handleApprove(room.id)}
                            >
                              <CheckCircle size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleReject(room.id)}
                            >
                              <XCircle size={16} />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
