"use server"

export async function verifyLoginOTP(phoneNumber: string, code: string) {
  try {
    const response = await fetch("https://limpiar-backend.onrender.com/api/auth/verify-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        code,
      }),
      credentials: "include", // This is important for including cookies
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Verification failed",
      }
    }

 

    return {
      success: true,
      message: "Verification successful",
      user: data.user,
    }
  } catch (error) {
    console.error("Verification error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

export async function resendOTP(payload: { userId?: string; phoneNumber?: string }) {
  try {
    const response = await fetch("https://limpiar-backend.onrender.com/api/auth/resend-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to resend OTP",
      }
    }

    return {
      success: true,
      message: "OTP resent successfully",
      userId: data.userId,
      phoneNumber: data.phoneNumber,
    }
  } catch (error) {
    console.error("Resend OTP error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

export async function verifyRegistrationOTP(phoneNumber: string, code: string) {
  try {
    const response = await fetch("https://limpiar-backend.onrender.com/api/auth/verify-register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        code,
      }),
      credentials: "include",
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Verification failed",
      }
    }

    return {
      success: true,
      message: "Verification successful",
      user: data.user,
    }
  } catch (error) {
    console.error("Verification error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}