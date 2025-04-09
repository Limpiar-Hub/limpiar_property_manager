"use server"

export async function requestPasswordReset(email: string) {
 
  await new Promise((resolve) => setTimeout(resolve, 1000))


  return {
    success: true,
    message: "Password reset link sent successfully",
  }
}

export async function resetPassword(token: string, newPassword: string) {
 
  await new Promise((resolve) => setTimeout(resolve, 1000))

 
  return {
    success: true,
    message: "Password reset successfully",
  }
}

