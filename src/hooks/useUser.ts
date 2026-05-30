// src/hooks/useUser.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserProfile, updateUserProfile, fetchMyRooms, UpdateProfileData } from "@/lib/api";
import { useToast } from "./use-toast";
import { useAuth } from "@/context/AuthContext";

export const useUserProfile = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserProfile,
    enabled: isAuthenticated, // Only fetch if authenticated
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (profileData: UpdateProfileData) => updateUserProfile(profileData),
    onSuccess: (updatedUser) => {
      toast({
        title: "Profile Updated!",
        description: "Your profile information has been successfully updated.",
      });
      queryClient.setQueryData(["userProfile"], updatedUser); // Optimistically update cache
      // Optionally invalidate current user's token or update AuthContext if roles change
    },
    onError: (error: any) => {
      toast({
        title: "Error!",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });
};

export const useMyRooms = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["myRooms"],
    queryFn: fetchMyRooms,
    enabled: isAuthenticated, // Only fetch if authenticated
  });
};
