// src/hooks/useRoomDetails.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchRoomDetails, createContactMessage } from "@/lib/api";
import { useToast } from "./use-toast"; // Assuming useToast is in the same directory

export const useRoomDetails = (roomId: string) => {
  return useQuery({
    queryKey: ["roomDetails", roomId],
    queryFn: () => fetchRoomDetails(roomId),
    enabled: !!roomId, // Only run the query if roomId is available
  });
};

export const useCreateContactMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createContactMessage,
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: data.message || "Message sent successfully.",
      });
      // Optionally invalidate or refetch related queries
      queryClient.invalidateQueries({ queryKey: ["roomDetails"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error!",
        description: error.message || "Failed to send message.",
        variant: "destructive",
      });
    },
  });
};
