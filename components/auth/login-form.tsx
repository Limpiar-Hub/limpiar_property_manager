import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { STORAGE_KEYS } from "@/lib/constants";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const resetPasswordSchema = z.object({
  code: z.string().min(1, "Reset code is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface DecodedToken {
  userId: string;
  role?: string;
  [key: string]: any;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(!!searchParams.get("userId"));
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  React.useEffect(() => {
    setIsResetPassword(!!searchParams.get("userId"));
  }, [searchParams]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: "",
      newPassword: "",
    },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL);
    if (rememberedEmail) {
      setRememberMe(true);
      loginForm.setValue("email", rememberedEmail);
    }
  }, [loginForm]);

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError("");

    try {
      const { email, password } = data;
      const loginData = { email, password };
      const { data: loginResponse } = await api.post("auth/login", loginData);

      if (!loginResponse.token) {
        throw new Error("No token received");
      }

      const decodedToken: DecodedToken = jwtDecode(loginResponse.token);
      const userId = decodedToken.userId;
      const role = decodedToken.role;

      if (!userId) {
        throw new Error("User ID not found in token");
      }

      if (!role) {
        throw new Error("Role not found in token");
      }
      if (role !== "admin") {
        throw new Error(`Unauthorized Access!!`);
      }

      localStorage.setItem(STORAGE_KEYS.TOKEN, loginResponse.token);
      localStorage.setItem(STORAGE_KEYS.USER_ID, userId);

      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
      } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
      }

      const { data: userResponse } = await api.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${loginResponse.token}` },
      });

      const phoneNumber = userResponse.phoneNumber;
      if (!phoneNumber) {
        throw new Error("Phone number not found in user data");
      }

      localStorage.setItem("phoneNumber", phoneNumber);

      alert("OTP Sent: Please enter the OTP sent to your registered phone number.");

      router.push(`/verify?phoneNumber=${encodeURIComponent(phoneNumber)}`);
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Request failed. Please check your credentials and try again."
        : error.message || "An unexpected error occurred.";
      setServerError(errorMessage);
      alert(`Login Failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPasswordSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setServerError("");

    try {
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID) || searchParams.get("userId");
      if (!userId) {
        throw new Error("User ID is missing from your session.");
      }

      const resetData = {
        userId,
        code: data.code,
        newPassword: data.newPassword,
      };

      await api.post("auth/reset-password", resetData);

      alert("Password Reset Successful: Your password has been updated. Please log in with your new password.");

      await new Promise(resolve => setTimeout(resolve, 3000));

      setIsResetPassword(false);
      setIsForgotPassword(false);
      router.push("/log-in");
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to reset password. Please try again."
        : error.message || "An unexpected error occurred.";

      setServerError(errorMessage);
      alert(`Password Reset Failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotPasswordSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setServerError("");

    try {
      const { email } = data;
      const { data: response } = await api.post("auth/forgot-password", { email });

      if (!response.userId) {
        throw new Error("User ID not found in response.");
      }

      localStorage.setItem(STORAGE_KEYS.USER_ID, response.userId);

      alert("Reset Password Request Sent: Please check your email for the reset code.");

      setIsForgotPassword(false);
      setIsResetPassword(true);
      router.push(`/log-in?userId=${response.userId}`);
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to send forgot password request."
        : error.message || "An unexpected error occurred.";

      setServerError(errorMessage);
      alert(`Forgot Password Failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isResetPassword ? "Reset Password" : isForgotPassword ? "Forgot Password" : "Sign in"}
        </h1>
        {isResetPassword && (
          <p className="text-sm text-muted-foreground">
            Enter the reset code sent to you and your new password.
          </p>
        )}
        {isForgotPassword && (
          <p className="text-sm text-muted-foreground">
            Enter your email address to receive a password reset code.
          </p>
        )}
      </div>

      {serverError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {serverError}
        </div>
      )}

      {isResetPassword ? (
        <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Reset Code</Label>
            <Input
              id="code"
              placeholder="Enter reset code"
              className={`w-full p-3 border ${
                resetPasswordForm.formState.errors.code ? "border-red-500" : "border-gray-200"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e7eea] focus:border-transparent`}
              {...resetPasswordForm.register("code")}
            />
            {resetPasswordForm.formState.errors.code && (
              <p className="text-red-500 text-sm mt-1">{resetPasswordForm.formState.errors.code.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                className={`w-full p-3 border ${
                  resetPasswordForm.formState.errors.newPassword ? "border-red-500" : "border-gray-200"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e7eea] focus:border-transparent`}
                {...resetPasswordForm.register("newPassword")}
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
            {resetPasswordForm.formState.errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">{resetPasswordForm.formState.errors.newPassword.message}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-[#0082ed] hover:bg-[#0082ed]/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsResetPassword(false);
                setIsForgotPassword(false);
                router.push("/log-in");
              }}
              className="text-[#0082ed] hover:underline"
            >
              Back to Sign in
            </button>
          </div>
        </form>
      ) : isForgotPassword ? (
        <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgotEmail">Email</Label>
            <Input
              id="forgotEmail"
              placeholder="hello@example.com"
              type="email"
              className={`w-full p-3 border ${
                forgotPasswordForm.formState.errors.email ? "border-red-500" : "border-gray-200"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e7eea] focus:border-transparent`}
              {...forgotPasswordForm.register("email")}
            />
            {forgotPasswordForm.formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">{forgotPasswordForm.formState.errors.email.message}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-[#0082ed] hover:bg-[#0082ed]/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Reset Code...
              </>
            ) : (
              "Send Reset Code"
            )}
          </Button>
          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                router.push("/log-in");
              }}
              className="text-[#0082ed] hover:underline"
            >
              Back to Sign in
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="hello@example.com"
              type="email"
              className={`w-full p-3 border ${
                loginForm.formState.errors.email ? "border-red-500" : "border-gray-200"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e7eea] focus:border-transparent`}
              {...loginForm.register("email")}
            />
            {loginForm.formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`w-full p-3 border ${
                  loginForm.formState.errors.password ? "border-red-500" : "border-gray-200"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[#2e7eea] focus:border-transparent`}
                {...loginForm.register("password")}
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
            {loginForm.formState.errors.password && (
              <p className="text-red-500 text-sm mt-1">{loginForm.formState.errors.password.message}</p>
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
            <button
              type="button"
              onClick={() => setIsForgotPassword(true)}
              className="text-sm text-[#0082ed] hover:underline"
              disabled={isLoading}
            >
              Forgot Password?
            </button>
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
          <div className="text-center text-sm">
            If you don’t have an account{" "}
            <Link href="/sign-up" className="text-[#0082ed] hover:underline">
              Sign Up
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}