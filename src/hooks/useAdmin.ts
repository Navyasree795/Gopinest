// src/hooks/useAdmin.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAdminStats, fetchAdminRooms, approveRoom, rejectRoom, fetchAdminUsers, updateAdminUserRole, deleteAdminUser } from "@/lib/api";
import { useToast } from "./use-toast";
import { useAuth } from "@/context/AuthContext";

export const useAdminStats = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: fetchAdminStats,
    enabled: !!user?.isAdmin,
  });
};

export const useAdminRooms = (status?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["adminRooms", status],
    queryFn: () => fetchAdminRooms(status),
    enabled: !!user?.isAdmin,
  });
};

export const useApproveRoom = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: approveRoom,
    onSuccess: () => {
      toast({ title: "Room Approved", description: "The room listing is now visible to users." });
      queryClient.invalidateQueries({ queryKey: ["adminRooms"] }); // Invalidate all admin rooms queries
      queryClient.invalidateQueries({ queryKey: ["adminStats"] }); // Invalidate stats to update pending count
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to approve room.", variant: "destructive" });
    },
  });
};

export const useRejectRoom = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: rejectRoom,
    onSuccess: () => {
      toast({ title: "Room Rejected", description: "The owner will be notified.", variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: ["adminRooms"] }); // Invalidate all admin rooms queries
      queryClient.invalidateQueries({ queryKey: ["adminStats"] }); // Invalidate stats to update pending count
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to reject room.", variant: "destructive" });
    },
  });
};

export const useAdminUsers = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["adminUsers"],
    queryFn: fetchAdminUsers,
    enabled: !!user?.isAdmin,
  });
};

export const useUpdateAdminUserRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateAdminUserRole,
    onSuccess: (data, variables) => {
      toast({ title: "User Role Updated", description: `User ${variables.userId}'s role changed to ${variables.role}.` });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] }); // Invalidate users to reflect role change
      queryClient.invalidateQueries({ queryKey: ["adminStats"] }); // Invalidate stats to update owner count
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update user role.", variant: "destructive" });
    },
  });
};

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: () => {
      toast({ title: "User Deleted", description: "The user account has been successfully deleted." });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] }); // Invalidate users
      queryClient.invalidateQueries({ queryKey: ["adminStats"] }); // Invalidate stats to update user count
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete user.", variant: "destructive" });
    },
  });
};
