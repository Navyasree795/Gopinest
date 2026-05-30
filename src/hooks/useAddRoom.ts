// src/hooks/useAddRoom.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addRoom, AddRoomFormData } from "@/lib/api";
import { useToast } from "./use-toast";
import { useNavigate } from "react-router-dom";

export const useAddRoom = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (formData: FormData) => addRoom(formData),
    onSuccess: (response) => {
      // We don't toast or navigate here anymore, AddRoom.tsx will handle it
      queryClient.invalidateQueries({ queryKey: ["adminRooms"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error!",
        description: error.message || "Failed to add room.",
        variant: "destructive",
      });
    },
  });
};
