// src/lib/api.ts

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

// This will be set by AuthContext
let getAccessToken: () => string | null = () => null;

export const setAccessTokenProvider = (provider: () => string | null) => {
  getAccessToken = provider;
};

const getAuthHeader = () => {
  const token = getAccessToken(); // Get token from the provider
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

// Helper function to handle API responses and extract error messages
const handleApiResponse = async (response: Response, defaultErrorMessage: string) => {
  if (!response.ok) {
    let errorMessage = defaultErrorMessage;
    try {
      const errorData = await response.json();
      // Prioritize backend's 'message' field which can be a string or an array of strings
      if (errorData.message) {
        errorMessage = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message;
      } else if (errorData.error) {
        // Fallback to 'error' field, common in errorHandler middleware
        errorMessage = errorData.error;
      }
    } catch (e) {
      // If JSON parsing fails, use the response status text
      errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

export const fetchRoomDetails = async (roomId: string) => {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
  const fullApiResponse = await handleApiResponse(response, `Failed to fetch room details for ID: ${roomId}`);
  return fullApiResponse.data; // Explicitly unwrap .data
};

export const createContactMessage = async ({ roomId, message, checkInDate, checkOutDate }: { roomId: string; message: string; checkInDate?: Date; checkOutDate?: Date; }) => {
  const response = await fetch(`${API_BASE_URL}/contact/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ roomId, message, checkInDate, checkOutDate }),
  });
  return handleApiResponse(response, 'Failed to send message.'); // Returns full response
};

interface RoomFilterParams {
  city?: string;
  location?: string;
  roomType?: string;
  tenantType?: string;
  minRent?: number;
  maxRent?: number;
}

export const fetchRooms = async (filterParams: RoomFilterParams) => {
  const query = new URLSearchParams();
  if (filterParams.city) query.append("city", filterParams.city);
  if (filterParams.location) query.append("location", filterParams.location);
  if (filterParams.roomType) query.append("roomType", filterParams.roomType);
  if (filterParams.tenantType) query.append("tenantType", filterParams.tenantType);
  if (filterParams.minRent) query.append("minRent", filterParams.minRent.toString());
  if (filterParams.maxRent) query.append("maxRent", filterParams.maxRent.toString());

  const response = await fetch(`${API_BASE_URL}/rooms/search?${query.toString()}`);
  const fullApiResponse = await handleApiResponse(response, 'Failed to fetch rooms.');
  return fullApiResponse.data; // Explicitly unwrap .data
};

// Admin API calls
export const fetchAdminStats = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: getAuthHeader(),
  });
  const fullApiResponse = await handleApiResponse(response, 'Failed to fetch admin stats.');
  return fullApiResponse.data; // Explicitly unwrap .data
};

export const fetchAdminRooms = async (status?: string) => {
  const query = new URLSearchParams();
  if (status) query.append("status", status);

  const response = await fetch(`${API_BASE_URL}/admin/rooms?${query.toString()}`, {
    headers: getAuthHeader(),
  });
  const fullApiResponse = await handleApiResponse(response, 'Failed to fetch admin rooms.');
  return fullApiResponse.data; // Explicitly unwrap .data
};

export const approveRoom = async (roomId: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/approve/${roomId}`, {
    method: "PUT",
    headers: getAuthHeader(),
  });
  return handleApiResponse(response, 'Failed to approve room.');
};

export const rejectRoom = async (roomId: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/reject/${roomId}`, {
    method: "PUT",
    headers: getAuthHeader(),
  });
  return handleApiResponse(response, 'Failed to reject room.');
};

export interface AddRoomFormFields { // Renamed from AddRoomFormData to reflect it's for non-file fields
  title: string;
  city: string;
  location: string;
  roomType: string;
  rent: number;
  deposit: number;
  tenantType: string;
  description: string;
  amenities: string[];
}

export const addRoom = async (formData: FormData) => { // Now accepts FormData directly
  const response = await fetch(`${API_BASE_URL}/rooms/add`, {
    method: "POST",
    headers: {
      ...getAuthHeader(),
      // 'Content-Type': 'multipart/form-data' // DO NOT SET MANUALLY WITH FormData
    },
    body: formData,
  });
  return handleApiResponse(response, 'Failed to add room.');
};

// User Profile API calls
export interface UserProfile {
  _id: string;
  name?: string;
  mobile: string;
  role: 'user' | 'owner' | 'admin';
  createdAt: string;
}

export interface UpdateProfileData {
  name?: string;
  mobile?: string;
}

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    headers: getAuthHeader(),
  });
  const fullApiResponse = await handleApiResponse(response, 'Failed to fetch user profile.');
  return fullApiResponse.user; // Backend returns { success: true, user: {...} }
};

export const updateUserProfile = async (profileData: UpdateProfileData): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(profileData),
  });
  const fullApiResponse = await handleApiResponse(response, 'Failed to update user profile.');
  return fullApiResponse.user; // Backend returns { success: true, user: {...} }
};

export const fetchMyRooms = async (): Promise<Room[]> => { // Assuming Room interface is already defined or will be
  const response = await fetch(`${API_BASE_URL}/rooms/my-rooms`, {
    headers: getAuthHeader(),
  });
  const fullApiResponse = await handleApiResponse(response, 'Failed to fetch user rooms.');
  return fullApiResponse.data; // Backend returns { success: true, data: [...] }
};

// Admin User Management API calls
export const fetchAdminUsers = async (): Promise<UserProfile[]> => {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: getAuthHeader(),
  });
  const fullApiResponse = await handleApiResponse(response, 'Failed to fetch admin users.');
  return fullApiResponse.data; // Backend returns { success: true, data: [...] }
};

export const updateAdminUserRole = async ({ userId, role }: { userId: string; role: 'user' | 'owner' | 'admin' }) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ role }),
  });
  return handleApiResponse(response, `Failed to update user ${userId} role.`);
};

export const deleteAdminUser = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  return handleApiResponse(response, `Failed to delete user ${userId}.`);
};

// Auth API Calls
export const sendOtpRequest = async (mobile: string) => {
  // This is now handled by Firebase on the frontend, but we keep the stub if needed
  return { success: true, message: "Firebase handles OTP" };
};

export const verifyOtpRequest = async (firebaseToken: string, name?: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ firebaseToken, name }),
    credentials: 'include', // Important for sending/receiving HttpOnly cookies
  });
  return handleApiResponse(response, 'Failed to verify OTP.');
};

export const saveFcmToken = async (token: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/save-fcm-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ token }),
  });
  return handleApiResponse(response, 'Failed to save FCM token.');
};

// Payment API Calls
export const createPaymentOrder = async (roomId: string) => {
  const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ roomId }),
  });
  const fullApiResponse = await handleApiResponse(response, 'Failed to create payment order.');
  return fullApiResponse.data;
};

export const verifyPayment = async (paymentData: {
  roomId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/payment/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(paymentData),
  });
  return handleApiResponse(response, 'Payment verification failed.');
};

/**
 * Loads the Razorpay script dynamically
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};


