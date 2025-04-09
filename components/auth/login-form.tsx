"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Use named export

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { STORAGE_KEYS } from "@/lib/constants";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface DecodedToken {
  userId: string;
  [key: string]: any; // Allow other fields in the token
}

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    if (rememberedEmail) {
      setRememberMe(true);
    }
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError("");

    try {
      const { email, password } = data;
      const loginData = { email, password };

      console.log("📤 Submitting Login:", loginData);

      // Step 1: Login to get the token
      const { data: loginResponse } = await api.post("auth/login", loginData);
      console.log("⬇️ Login API Response:", loginResponse);

      if (!loginResponse.token) {
        throw new Error(`No token received: ${JSON.stringify(loginResponse)}`);
      }

      // Store token
      localStorage.setItem(STORAGE_KEYS.TOKEN, loginResponse.token);

      // Handle "Remember Me"
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
      } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
      }

      // Step 2: Decode token to get userId
      const decodedToken: DecodedToken = jwtDecode(loginResponse.token);
      console.log("Decoded Token:", decodedToken);
      const userId = decodedToken.userId;

      if (!userId) {
        throw new Error("User ID not found in token");
      }

      // Step 3: Fetch phone number from /api/users/:id
      const { data: userResponse } = await api.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${loginResponse.token}` },
      });
      console.log("User Data:", userResponse);

      const phoneNumber = userResponse.phoneNumber;
      if (!phoneNumber) {
        throw new Error("Phone number not found in user data");
      }

      // Store phone number for later use (optional)
      localStorage.setItem("phoneNumber", phoneNumber);

      toast({
        title: "OTP Sent",
        description: "Please enter the OTP sent to your registered phone number.",
      });

      // Step 4: Redirect to /verify with phoneNumber as a query param
      router.push(`/verify?phoneNumber=${encodeURIComponent(phoneNumber)}`);
    } catch (error) {
      console.error("❌ Login Error:", error);

      if (axios.isAxiosError(error)) {
        console.log("Error Response:", error.response);
        console.log("Error Status:", error.response?.status);
        console.log("Error Data:", error.response?.data);
      }

      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Request failed. Please check your credentials and try again."
        : error.message || "An unexpected error occurred.";

      setServerError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      </div>

      {serverError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="hello@example.com"
            type="email"
            className={`w-full p-3 border ${
              errors.email ? "border-red-500" : "border-gray-200"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e7eea] focus:border-transparent`}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              className={`w-full p-3 border ${
                errors.password ? "border-red-500" : "border-gray-200"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e7eea] focus:border-transparent`}
              {...register("password")}
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
              <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
            </Button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <Label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Keep me signed in
            </Label>
          </div>
          <Link href="/forgot-password" className="text-sm text-[#0082ed] hover:underline">
            Forgot Password?
          </Link>
        </div>
        <Button
          type="submit"
          className="w-full bg-[#0082ed] hover:bg-[#0082ed]/90"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>

      <div className="text-center text-sm">
        If you don’t have an account{" "}
        <Link href="/sign-up" className="text-[#0082ed] hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
}