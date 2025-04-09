import { STORAGE_KEYS } from "@/lib/constants"
import type { AuthResponse, RegistrationData } from "@/types"

const API_BASE_URL = "https://limpiar-backend.onrender.com/api"

/**
 * Login with email and password
 * @returns userId for verification
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Login failed. Please check your credentials.",
      }
    }

    return {
      success: true,
      userId: data.userId,
      phoneNumber: data.phoneNumber,
      message: data.message || "Verification code sent to your phone.",
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

/**
 * Verify login with phone number and OTP code
 * @returns user data and token
 */
export async function verifyLogin(
  phoneNumber: string,
  code: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber, code }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Verification failed. Please try again.",
      };
    }
    console.log(data);
    // Store token in localStorage for future requests
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);

    // Store user data
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));

    return {
      success: true,
      token: data.token,
      user: data.user,
      message: data.message || "Login successful.",
    };
  } catch (error) {
    console.error("Verification error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Register a new user
 * Available roles: property_manager, admin, cleaning_business, cleaner
 */
export async function register(
  userData: RegistrationData
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Registration failed. Please try again.",
      };
    }

    // Store phone number for verification
    localStorage.setItem(STORAGE_KEYS.PHONE_NUMBER, userData.phoneNumber);

    return {
      success: true,
      message: data.message || "Verification code sent to your phone.",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Verify registration with phone number and OTP code
 */
export async function verifyRegistration(
  phoneNumber: string,
  code: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber, code }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Verification failed. Please try again.",
      };
    }

    // Store token in localStorage for future requests
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);

    // Store user data
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));

    return {
      success: true,
      token: data.token,
      user: data.user,
      message: data.message || "Registration successful.",
    };
  } catch (error) {
    console.error("Verification error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Resend OTP code
 */
export async function resendOTP(payload: {
  userId?: string;
  phoneNumber?: string;
}): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to resend OTP. Please try again.",
      };
    }

    return {
      success: true,
      message: data.message || "OTP code resent successfully.",
      userId: data.userId,
      phoneNumber: data.phoneNumber,
    };
  } catch (error) {
    console.error("Resend OTP error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(
  email: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message:
          data.message || "Password reset request failed. Please try again.",
      };
    }

    return {
      success: true,
      message: data.message || "Password reset link sent to your email.",
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<AuthResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/reset-password/confirm`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Password reset failed. Please try again.",
      };
    }

    return {
      success: true,
      message: data.message || "Password reset successful.",
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return !!token;
}

/**
 * Get current user data
 */
export function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const userJson = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userJson) return null;

  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
}

/**
 * Logout user
 */
export function logout(): void {
  if (typeof window === "undefined") return
  console.log("Logging out");
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
}

