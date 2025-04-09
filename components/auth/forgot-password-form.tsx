"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export function ForgotPasswordForm() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "loading" | "success">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("loading")

    try {
      // TODO: Update this with the correct API call once we have more information
      const response = await fetch("https://limpiar-backend.onrender.com/api/auth/reset-password", {
        method: "GET",
        // We might need to add the email as a query parameter or in the request body
      })

      if (response.ok) {
        setStatus("success")
        localStorage.setItem("resetEmail", email)
        router.push("/check-email")
        toast({
          title: "Password reset link sent",
          description: "Please check your email for the password reset link.",
        })
      } else {
        throw new Error("Password reset request failed")
      }
    } catch (err) {
      console.error("Password reset error:", err)
      toast({
        title: "Password reset failed",
        description: "There was an error sending the password reset link. Please try again.",
        variant: "destructive",
      })
      setStatus("idle")
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
        <p className="text-muted-foreground">
          Enter the email you registered with and we&apos;ll send you a link to reset your password.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="hello@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-[#0082ed] hover:bg-[#0082ed]/90"
          disabled={status === "loading" || status === "success"}
        >
          {status === "loading" ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </div>
  )
}

