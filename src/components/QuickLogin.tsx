"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/services/api";
import { DemoCredentialsInterface } from "@/types/chat";
import { LogIn, X, Eye, EyeOff } from "lucide-react";

interface QuickLoginProps {
  onClose: () => void;
}

const QuickLogin: React.FC<QuickLoginProps> = ({ onClose }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoCredentials, setDemoCredentials] =
    useState<DemoCredentialsInterface | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);

    const success = await login(email, password);
    if (success) {
      onClose();
    } else {
      setError("Login failed. Please check your credentials.");
    }

    setIsLoggingIn(false);
  };

  const handleDemoLogin = async () => {
    if (demoCredentials) {
      setError(null);
      setIsLoggingIn(true);
      const success = await login(
        demoCredentials.email,
        demoCredentials.password
      );
      if (success) {
        onClose();
      } else {
        setError("Demo login failed. Please try again.");
      }
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    const normalizeDemoCredentials = (
      data: unknown
    ): DemoCredentialsInterface | null => {
      if (!data || typeof data !== "object") return null;

      const obj = data as Record<string, unknown>;
      const available = obj["available_accounts"] as unknown;

      if (Array.isArray(available) && available.length > 0) {
        const first = available[0] as unknown;
        const email =
          typeof (first as { email?: unknown }).email === "string"
            ? (first as { email: string }).email
            : "";
        const password =
          typeof (first as { password?: unknown }).password === "string"
            ? (first as { password: string }).password
            : "";
        return {
          email,
          password,
          note: typeof obj["note"] === "string" ? (obj["note"] as string) : "",
          anonymous_option:
            typeof obj["anonymous_option"] === "string"
              ? (obj["anonymous_option"] as string)
              : "",
        };
      }

      const email =
        typeof obj["email"] === "string" ? (obj["email"] as string) : "";
      const password =
        typeof obj["password"] === "string" ? (obj["password"] as string) : "";
      if (email && password) {
        return {
          email,
          password,
          note: typeof obj["note"] === "string" ? (obj["note"] as string) : "",
          anonymous_option:
            typeof obj["anonymous_option"] === "string"
              ? (obj["anonymous_option"] as string)
              : "",
        };
      }

      return null;
    };

    authAPI
      .getDemoCredentials()
      .then((data) => {
        const normalized = normalizeDemoCredentials(data);
        setDemoCredentials(normalized);
        if (normalized) {
          setEmail(normalized.email);
          setPassword(normalized.password);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 whitespace-nowrap">
            Sign In
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Access your secure account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Email address"
              required
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {isLoggingIn ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Demo Login */}
        {demoCredentials && (
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  or
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                <strong>Demo Credentials:</strong>
              </p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-blue-700 dark:text-blue-400">
                  {demoCredentials.email} / {demoCredentials.password}
                </div>
                <button
                  onClick={handleDemoLogin}
                  disabled={
                    isLoggingIn ||
                    !demoCredentials?.email ||
                    !demoCredentials?.password
                  }
                  className="px-2 py-1 text-xs whitespace-nowrap bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Use
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickLogin;
