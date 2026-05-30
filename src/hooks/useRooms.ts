// src/hooks/useRooms.ts
import { useQuery } from "@tanstack/react-query";
import { fetchRooms } from "@/lib/api";

interface RoomFilterParams {
  city?: string;
  location?: string;
  roomType?: string;
  tenantType?: string;
  minRent?: number;
  maxRent?: number;
}

export const useRooms = (filters: RoomFilterParams) => {
  return useQuery({
    queryKey: ["rooms", filters], // Query key includes filters to re-fetch when filters change
    queryFn: () => fetchRooms(filters),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new
  });
};
