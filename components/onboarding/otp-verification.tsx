"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { LoadingScreen } from "@/components/onboarding/loading-screen"
import { toast } from "@/components/ui/use-toast"

interface OTPVerificationProps {
  phoneNumber?: string
}

type VerificationStatus = "idle" | "loading" | "success" | "error"

export function OTPVerification({ phoneNumber }: OTPVerificationProps) {
  const router = useRouter()
  const [otp, setOtp] = React.useState(["", "", "", "", "", ""])
  const [status, setStatus] = React.useState<VerificationStatus>("idle")
  const [timeLeft, setTimeLeft] = React.useState(60)
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  React.useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0]
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join("")
    if (otpString.length !== 6) return

    setStatus("loading")

    try {
      // Get the phone number from localStorage
      const phoneNumber = localStorage.getItem("phoneNumber")
      if (!phoneNumber) {
        throw new Error("Phone number not found. Please try again.")
      }

      const response = await fetch("https://limpiar-backend.onrender.com/api/auth/verify-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          code: otpString,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        // Store token and user data
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        toast({
          title: "Verification successful",
          description: "Your account has been verified successfully.",
        })

        // Clear the phone number from localStorage
        localStorage.removeItem("phoneNumber")

        // Redirect to dashboard or property page
        router.push("/users")
      } else {
        if (response.status === 400 && data.message === "Session data is missing. Please register again.") {
          router.push("/sign-up")
        } else {
          throw new Error(data.message || "Verification failed")
        }
      }
    } catch (error) {
      console.error("Verification error:", error)
      setStatus("error")
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "There was an error verifying your account.",
        variant: "destructive",
      })
    }
  }

  const handleResend = async () => {
    try {
      const phoneNumber = localStorage.getItem("phoneNumber")
      if (!phoneNumber) {
        throw new Error("Phone number not found. Please try again.")
      }

      const response = await fetch("https://limpiar-backend.onrender.com/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      })

      const data = await response.json()

      if (response.ok) {
        setTimeLeft(60)
        toast({
          title: "OTP Resent",
          description: "A new OTP has been sent to your phone number.",
        })
      } else {
        throw new Error(data.message || "Failed to resend OTP")
      }
    } catch (error) {
      console.error("Resend OTP error:", error)
      toast({
        title: "Failed to resend OTP",
        description: error instanceof Error ? error.message : "There was an error resending the OTP.",
        variant: "destructive",
      })
    }
  }

  if (status === "loading") {
    return <LoadingScreen />
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Enter OTP Code</h1>
        {phoneNumber && <p className="text-muted-foreground">Enter the code sent to {phoneNumber}</p>}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                if (el) inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={cn(
                "w-12 h-12 text-center text-2xl rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0082ed]",
                status === "error" && "border-red-500 text-red-500",
                status === "success" && "border-green-500 text-green-500",
              )}
              maxLength={1}
            />
          ))}
        </div>
        {status === "error" && <p className="text-red-500 text-center">Invalid OTP. Please try again.</p>}
        <Button
          type="submit"
          className="w-full bg-[#0082ed] hover:bg-[#0082ed]/90"
          disabled={status === ("loading" as VerificationStatus)}
        >
          {status === ("loading" as VerificationStatus) ? "Verifying..." : "Confirm"}
        </Button>
      </form>
      <button
        onClick={handleResend}
        disabled={timeLeft > 0}
        className="w-full text-sm text-center text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        {timeLeft > 0 ? `Resend code in ${timeLeft}s` : "Resend code"}
      </button>
    </div>
  )
}

