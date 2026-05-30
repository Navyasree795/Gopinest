import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Home, Users, Clock, CheckCircle, XCircle, Eye, Loader2, IndianRupee, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { useAdminStats, useAdminRooms, useApproveRoom, useRejectRoom } from "@/hooks/useAdmin";

interface Room {
  _id: string;
  title: string;
  ownerId: {
    _id: string;
    name: string;
    mobile: string;
  };
  city: string;
  rent: number;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const { data: stats, isLoading: isLoadingStats } = useAdminStats();
  const { data: pendingRooms, isLoading: isLoadingRooms, isError, error } = useAdminRooms("pending");
  const approveMutation = useApproveRoom();
  const rejectMutation = useRejectRoom();

  // Redirect if not admin
  useEffect(() => {
    if (isAuthenticated && user && !user.isAdmin) {
      navigate("/dashboard");
    } else if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [user, isAuthenticated, navigate]);

  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate(id);
  };

  const statCards = [
    {
      title: "Total Rooms",
      value: stats?.rooms?.total || "0",
      icon: Home,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Users",
      value: stats?.users?.total || "0",
      icon: Users,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Pending Approval",
      value: stats?.rooms?.pending || "0",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Total Paid",
      value: stats?.revenue?.totalPaidListings || "0",
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Revenue",
      value: stats?.revenue?.totalRevenue ? `₹${stats.revenue.totalRevenue}` : "₹0",
      icon: IndianRupee,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ];

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {statCards.map((stat, index) => (
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
                {isLoadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                )}
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
            {isLoadingRooms ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-muted-foreground">Fetching pending rooms...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-12 text-destructive">
                Error loading rooms: {(error as Error).message}
              </div>
            ) : !pendingRooms || pendingRooms.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No rooms pending approval.
              </div>
            ) : (
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
                    {pendingRooms.map((room: Room) => (
                      <TableRow key={room._id}>
                        <TableCell className="font-medium">{room.title}</TableCell>
                        <TableCell className="hidden sm:table-cell">{room.ownerId?.name || "N/A"}</TableCell>
                        <TableCell className="hidden sm:table-cell">{room.city}</TableCell>
                        <TableCell>₹{room.rent.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/room/${room._id}`)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-success hover:text-success hover:bg-success/10"
                              onClick={() => handleApprove(room._id)}
                              disabled={approveMutation.isPending}
                            >
                              {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle size={16} />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleReject(room._id)}
                              disabled={rejectMutation.isPending}
                            >
                              {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle size={16} />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
