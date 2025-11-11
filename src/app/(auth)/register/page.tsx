"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  CheckCircle,
  User,
  Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const [mounted, setMounted] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    success: boolean;
    needsVerification?: boolean;
    message?: string;
  } | null>(null);

  const { register, loading, error } = useAuth();
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirmation) {
      return;
    }

    const result = await register(name, email, password, passwordConfirmation);

    if (result.success) {
      setRegistrationSuccess(result);

      // If email verification is not needed, redirect to home
      if (!result.needsVerification) {
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`;
  };

  // Show success message if registration was successful
  if (registrationSuccess?.success) {
    return (
      <div className="relative container grid min-h-screen flex-col items-center justify-center lg:max-w-none lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardHeader className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
              <CardTitle className="text-2xl text-green-700 dark:text-green-400">
                Registration Successful!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-green-700 dark:text-green-300">
                {registrationSuccess.message}
              </p>

              {registrationSuccess.needsVerification ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-amber-600">
                    <Mail className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Email Verification Required
                    </span>
                  </div>

                  <p className="text-muted-foreground text-sm">
                    Please check your email and click the verification link to
                    activate your account.
                  </p>

                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full"
                  >
                    Continue to Sign In
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-green-600">
                    You have been automatically signed in.
                  </p>

                  <p className="text-muted-foreground text-sm">
                    Redirecting to home page...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative container grid min-h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Link href="/" className="flex items-center">
            <Image
              src="/rantale-dark.svg"
              alt="Rantale"
              width={120}
              height={32}
              className="mr-2 h-8 w-auto"
              priority
            />
          </Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Join thousands of readers and start your amazing reading
              journey with us.&rdquo;
            </p>
            <footer className="text-sm">Create your account today</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your details below to create your account
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      type="text"
                      autoCapitalize="words"
                      autoComplete="name"
                      autoCorrect="off"
                      disabled={loading}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={loading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="password"
                      placeholder="Create a password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      disabled={loading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 pl-10"
                      minLength={8}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Must be at least 8 characters long
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="passwordConfirmation">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="passwordConfirmation"
                      placeholder="Confirm your password"
                      type={showPasswordConfirmation ? "text" : "password"}
                      autoComplete="new-password"
                      disabled={loading}
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      className={`pr-10 pl-10 ${password !== passwordConfirmation && passwordConfirmation ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowPasswordConfirmation(!showPasswordConfirmation)
                      }
                      disabled={loading}
                    >
                      {showPasswordConfirmation ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                      <span className="sr-only">
                        {showPasswordConfirmation
                          ? "Hide password"
                          : "Show password"}
                      </span>
                    </Button>
                  </div>
                  {password !== passwordConfirmation &&
                    passwordConfirmation && (
                      <p className="text-destructive text-xs">
                        Passwords do not match
                      </p>
                    )}
                </div>
                <Button
                  disabled={loading || password !== passwordConfirmation}
                  className="w-full"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background text-muted-foreground px-2">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              disabled={loading}
              onClick={handleGoogleRegister}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Google
            </Button>
          </div>

          <p className="text-muted-foreground px-8 text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="hover:text-primary underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
