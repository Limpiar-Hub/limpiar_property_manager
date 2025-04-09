"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/actions/password-reset"

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter()
  const [formData, setFormData] = React.useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [error, setError] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "loading" | "success">("idle")

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const hasThreeNumbers = (password.match(/\d/g) || []).length >= 3
    return { hasMinLength, hasSpecialChar, hasThreeNumbers }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    const validation = validatePassword(formData.password)
    if (!validation.hasMinLength || !validation.hasSpecialChar || !validation.hasThreeNumbers) {
      setError("Password does not meet requirements")
      return
    }

    setStatus("loading")
    try {
      const result = await resetPassword(token, formData.password)
      if (result.success) {
        setStatus("success")
        // Redirect to login page after successful password reset
        setTimeout(() => router.push("/login"), 1500)
      } else {
        setError(result.message)
        setStatus("idle")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      setStatus("idle")
    }
  }

  const validation = validatePassword(formData.password)

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground mt-2">
            <div className={validation.hasMinLength ? "text-green-500" : ""}>✓ Min 8 characters</div>
            <div className={validation.hasSpecialChar ? "text-green-500" : ""}>✓ 1 special character</div>
            <div className={validation.hasThreeNumbers ? "text-green-500" : ""}>✓ 3 numbers</div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        {status === "success" && (
          <p className="text-sm text-green-500 text-center">Password reset successful. Redirecting to login...</p>
        )}
        <Button
          type="submit"
          className="w-full bg-[#0082ed] hover:bg-[#0082ed]/90"
          disabled={status === "loading" || status === "success"}
        >
          {status === "loading" ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </div>
  )
}

