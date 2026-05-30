// src/pages/UserDashboard.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Phone, Mail, Home, Edit, Loader2, PlusCircle, MapPin, IndianRupee } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile, useUpdateUserProfile, useMyRooms } from "@/hooks/useUser";
import { useToast } from "@/hooks/use-toast";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user: authUser } = useAuth();
  const { toast } = useToast();

  const { data: userProfile, isLoading: isLoadingProfile, isError: isErrorProfile, error: profileError } = useUserProfile();
  const { data: myRooms, isLoading: isLoadingMyRooms, isError: isErrorMyRooms, error: myRoomsError } = useMyRooms();
  const { mutate: updateProfileMutation, isPending: isUpdatingProfile } = useUpdateUserProfile();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(userProfile?.name || "");
  const [mobile, setMobile] = useState(userProfile?.mobile || "");

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || "");
      setMobile(userProfile.mobile || "");
    }
  }, [userProfile]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);


  const handleProfileSave = () => {
    // Basic validation
    if (!mobile || mobile.length !== 10 || !/^[0-9]{10}$/.test(mobile)) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive",
      });
      return;
    }
    updateProfileMutation({ name, mobile });
    setIsEditingProfile(false);
  };

  if (isLoadingProfile || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (isErrorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <p className="text-lg text-destructive">Error loading profile: {profileError?.message}</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <p className="text-lg">User profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero pb-24">
      <PageHeader backTo="/dashboard" title="My Profile" />

      <main className="container px-4 py-6 max-w-2xl mx-auto">
        {/* User Profile Card */}
        <Card className="card-shadow mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User size={20} className="text-primary" />
              My Profile
            </CardTitle>
            {!isEditingProfile && (
              <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                <Edit size={16} className="mr-2" />
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              {isEditingProfile ? (
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
              ) : (
                <p className="font-medium text-lg">{userProfile.name || "N/A"}</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Mobile Number</Label>
              {isEditingProfile ? (
                <Input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} className="mt-1" />
              ) : (
                <p className="font-medium text-lg flex items-center gap-2">
                  <Phone size={18} /> {userProfile.mobile}
                </p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Role</Label>
              <Badge variant="secondary" className="ml-2">
                {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
              </Badge>
            </div>
            {isEditingProfile && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setIsEditingProfile(false); setName(userProfile.name || ""); setMobile(userProfile.mobile); }} disabled={isUpdatingProfile}>
                  Cancel
                </Button>
                <Button onClick={handleProfileSave} disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Listed Rooms */}
        <Card className="card-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Home size={20} className="text-primary" />
              My Listed Rooms
            </CardTitle>
            <Button size="sm" onClick={() => navigate("/add-room")}>
              <PlusCircle size={16} className="mr-2" />
              Add New Room
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingMyRooms ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="ml-2">Loading rooms...</p>
              </div>
            ) : isErrorMyRooms ? (
              <div className="text-destructive py-8 text-center">Error loading your rooms: {myRoomsError?.message}</div>
            ) : !myRooms || myRooms.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                <p>You haven't listed any rooms yet.</p>
                <Button onClick={() => navigate("/add-room")} className="mt-4">
                  Add Your First Room
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myRooms.map((room) => (
                  <Card key={room._id} className="overflow-hidden flex flex-col card-shadow hover:card-shadow-hover transition-all duration-300">
                    <Link to={`/room/${room._id}`} className="block">
                      <img
                        src={room.images[0] || "/placeholder.svg"}
                        alt={room.title}
                        className="w-full h-32 object-cover"
                      />
                    </Link>
                    <CardContent className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <Link to={`/room/${room._id}`} className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1">
                          {room.title}
                        </Link>
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin size={14} /> {room.location}, {room.city}
                        </p>
                        <p className="text-lg font-bold text-primary flex items-center mt-2">
                          <IndianRupee size={16} /> {room.rent.toLocaleString()}/month
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <Badge
                          variant={
                            room.status === "approved"
                              ? "default"
                              : room.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                          className={
                            room.status === "approved"
                              ? "bg-success text-success-foreground hover:bg-success"
                              : ""
                          }
                        >
                          Status: {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                        </Badge>
                        {/* Action buttons could go here */}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserDashboard;