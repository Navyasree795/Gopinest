import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Import hooks
import { useRoomDetails, useCreateContactMessage } from "./useRoomDetails";
import { useRooms } from "./useRooms";
import { useAdminStats, useAdminRooms, useApproveRoom, useRejectRoom } from "./useAdmin";
import { useAddRoom } from "./useAddRoom";

// Import API functions
import * as api from "@/lib/api";

// Mock toast
vi.mock("./use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock react-router-dom
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe("React Query Hooks", () => {
  const navigate = vi.fn();

  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
    (require("react-router-dom") as { useNavigate: vi.Mock }).useNavigate.mockReturnValue(navigate);
  });

  describe("useRooms", () => {
    it("should refetch rooms when filters change", async () => {
      const mockRooms1 = [{ _id: "1", title: "Room 1" }];
      const mockRooms2 = [{ _id: "2", title: "Room 2" }];

      vi.spyOn(api, "fetchRooms")
        .mockResolvedValueOnce(mockRooms1)
        .mockResolvedValueOnce(mockRooms2);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result, rerender } = renderHook(
        ({ filters }) => useRooms(filters),
        {
          wrapper,
          initialProps: { filters: { city: "mumbai" } },
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockRooms1);
      expect(api.fetchRooms).toHaveBeenCalledWith({ city: "mumbai" });

      rerender({ filters: { city: "delhi" } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockRooms2);
      expect(api.fetchRooms).toHaveBeenCalledWith({ city: "delhi" });
    });
  });
});
