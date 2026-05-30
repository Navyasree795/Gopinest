import "@testing-library/jest-dom/extend-expect";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import React from "react";
import { BrowserRouter } from "react-router-dom";

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

// Mock jwt-decode
vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn((token: string) => {
    if (token === "expired") return { exp: Date.now() / 1000 - 100 };
    return { exp: Date.now() / 1000 + 3600 };
  }),
}));

// Mock useToast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock API
vi.mock("@/lib/api", () => ({
  setAccessTokenProvider: vi.fn(),
  sendOtpRequest: vi.fn(),
  verifyOtpRequest: vi.fn(),
  fetchUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
  fetchMyRooms: vi.fn(),
  fetchAdminUsers: vi.fn(),
  updateAdminUserRole: vi.fn(),
  deleteAdminUser: vi.fn(),
  fetchRoomDetails: vi.fn(),
  createContactMessage: vi.fn(),
  fetchRooms: vi.fn(),
  fetchAdminStats: vi.fn(),
  fetchAdminRooms: vi.fn(),
  approveRoom: vi.fn(),
  rejectRoom: vi.fn(),
  addRoom: vi.fn(),
}));

// (Rest of your test file continues unchanged...)
