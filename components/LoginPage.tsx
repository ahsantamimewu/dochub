"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { useAuth } from "@/firebase/auth";
import { createUserProfile } from "@/firebase/firestore";
import { auth } from "@/firebase/config";
import Image from "next/image";

interface LoginPageProps {
  loginError?: string | null; // To display login errors
}

export default function LoginPage({
  loginError: propLoginError,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(
    propLoginError || null
  );
  const [isLoading, setIsLoading] = useState(false);

  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    try {
      if (isRegistering) {
        // Sign up without automatically logging in
        const user = await signup(email, password, displayName);

        // Create user profile in Firestore if user was created
        if (user) {
          await createUserProfile(user.uid, {
            displayName,
            email,
          });

          // Switch to login mode and show success message
          setIsRegistering(false);
          setLoginError(
            "Registration successful! Please log in with your new credentials."
          );
          // Clear the password field for security
          setPassword("");
        }
      } else {
        // Login
        await login(email, password);
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      let errorMessage = "Authentication failed. Please try again.";

      if (error && error.code) {
        // Handle Firebase auth errors
        switch (error.code) {
          case "auth/invalid-email":
            errorMessage = "Invalid email address format.";
            break;
          case "auth/user-disabled":
            errorMessage = "This account has been disabled.";
            break;
          case "auth/user-not-found":
            errorMessage = "No account found with this email.";
            break;
          case "auth/wrong-password":
            errorMessage = "Incorrect password.";
            break;
          case "auth/email-already-in-use":
            errorMessage = "This email is already registered.";
            break;
          case "auth/weak-password":
            errorMessage = "Password should be at least 6 characters.";
            break;
          default:
            errorMessage = `Authentication error: ${
              error.message || "Unknown error"
            }`;
        }
      }

      setLoginError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        {" "}
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 p-2">
            <Image
              src="/icons/logo.png"
              alt="DocHub Logo"
              width={48}
              height={48}
              className="rounded-full"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Welcome to DocHub
          </CardTitle>
          <CardDescription className="text-md text-gray-600 pt-2">
            {isRegistering
              ? "Create a new account to get started"
              : "Please enter your credentials to access the hub"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full"
                />
              </div>
            )}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full"
              />
            </div>
            {loginError && (
              <p
                className={`text-sm ${
                  loginError.includes("successful")
                    ? "text-green-600"
                    : "text-red-600"
                } text-center`}
              >
                {loginError}
              </p>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 text-lg font-semibold shadow-md hover:shadow-lg transition-all duration-150 ease-in-out transform hover:-translate-y-0.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white mr-3"></div>
              ) : isRegistering ? (
                <UserPlus className="w-5 h-5 mr-3" />
              ) : (
                <LogIn className="w-5 h-5 mr-3" />
              )}
              {isRegistering ? "Sign Up" : "Login"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setLoginError(null);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              {isRegistering
                ? "Already have an account? Login"
                : "Don't have an account? Sign up"}
            </Button>
          </div>
          {!isRegistering && (
            <p className="text-xs text-gray-500 mt-4 text-center">
              For demo purposes, create an account or contact admin for
              credentials.
            </p>
          )}
        </CardContent>
      </Card>
      <footer className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          DocHub - Your Centralized Documentation Hub
        </p>
      </footer>
    </div>
  );
}
