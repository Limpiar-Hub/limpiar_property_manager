"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { register } from "@/services/auth-service"
import { STORAGE_KEYS } from "@/lib/constants"

export default function SignUpPage() {
  const router = useRouter()
  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [phoneError, setPhoneError] = React.useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validatePassword = (password: string) => {
    return {
      hasMinLength: password.length >= 8,
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasThreeNumbers: (password.match(/\d/g) || []).length >= 3,
    }
  }

  const validation = validatePassword(formData.password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate phone number
    if (!formData.phoneNumber) {
      setPhoneError("Please enter a valid phone number.")
      return
    } else {
      setPhoneError("")
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await register({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: "admin", // Default role for admin dashboard
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      // Store phone number in localStorage for OTP verification
      localStorage.setItem(STORAGE_KEYS.PHONE_NUMBER, formData.phoneNumber)

      // Display success message
      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code.",
      })

      // Redirect to OTP verification page with registration flag
      router.push("/verify?isRegistration=true")
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description:
          error instanceof Error ? error.message : "There was an error during registration. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Logo */}
      <Image src="/logo.jpg" alt="LIMPIAR Logo" width={165} height={48} className="mb-6" priority />

      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center mb-4">Sign up</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              type="text"
              name="fullName"
              id="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              name="email"
              id="email"
              placeholder="hello@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Phone Number */}
          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <PhoneInput
              country={"us"}
              value={formData.phoneNumber}
              onChange={(phone) => {
                setFormData({ ...formData, phoneNumber: "+" + phone })
                setPhoneError("")
              }}
              inputClass="w-full !h-10 !pl-12 !border-gray-300 rounded-md"
              containerClass="w-full"
            />
            {phoneError && <p className="text-red-500 text-sm">{phoneError}</p>}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button type="button" className="absolute right-3 top-2.5" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="text-xs text-gray-500 flex gap-2 mt-1">
              <span className={validation.hasMinLength ? "text-green-500" : ""}>✔ Min 8 characters</span>
              <span className={validation.hasSpecialChar ? "text-green-500" : ""}>✔ 1 special character</span>
              <span className={validation.hasThreeNumbers ? "text-green-500" : ""}>✔ 3 numbers</span>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2.5"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-[#0082ed] hover:bg-[#0082ed]/90 mt-6"
            disabled={
              isLoading ||
              !formData.fullName.trim() ||
              !formData.email.trim() ||
              !formData.phoneNumber.trim() ||
              !formData.password.trim() ||
              !formData.confirmPassword.trim() ||
              formData.password !== formData.confirmPassword
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

