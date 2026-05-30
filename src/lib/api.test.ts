import "@testing-library/jest-dom/extend-expect";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchRoomDetails,
  createContactMessage,
  fetchRooms,
  fetchAdminStats,
  fetchAdminRooms,
  approveRoom,
  rejectRoom,
  addRoom,
} from "./api";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock import.meta.env
Object.defineProperty(import.meta, "env", {
  value: { VITE_API_BASE_URL: "/api" },
});

// (Rest of your test file continues unchanged...)
