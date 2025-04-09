"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { requestPasswordReset } from "@/actions/password-reset"

export function CheckEmailForm() {
  const handleResend = async () => {
    // Implement resend logic
    await requestPasswordReset(localStorage.getItem("resetEmail") || "")
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Check your email for password reset link</h1>
        <p className="text-muted-foreground">
          Password reset link has been sent to the email associated with your account.
        </p>
      </div>
      <div className="space-y-4">
        <Button onClick={handleResend} className="w-full bg-[#0082ed] hover:bg-[#0082ed]/90">
          Resend link again
        </Button>
        <Link href="/forgot-password">
          <Button variant="outline" className="w-full">
            Re-enter email
          </Button>
        </Link>
      </div>
      <div className="text-center">
        <Link href="/LoginForm" className="text-sm text-muted-foreground hover:text-foreground">
          Go to sign in
        </Link>
      </div>
    </div>
  )
}

