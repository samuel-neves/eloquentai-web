"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/services/api";
import { DemoCredentialsInterface } from "@/types/chat";
import { User, LogIn, Shield, Sparkles, Eye, EyeOff } from "lucide-react";

interface UserWelcomeProps {
  onClose: () => void;
}

const UserWelcome: React.FC<UserWelcomeProps> = ({ onClose }) => {
  const { state, login } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [demoCredentials, setDemoCredentials] =
    useState<DemoCredentialsInterface | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    const success = await login(email, password);
    if (success) {
      onClose();
    }

    setIsLoggingIn(false);
  };

  const handleDemoLogin = async (accountIndex: number = 0) => {
    if (demoCredentials && demoCredentials.available_accounts[accountIndex]) {
      setIsLoggingIn(true);
      const account = demoCredentials.available_accounts[accountIndex];
      const success = await login(account.email, account.password);
      if (success) {
        onClose();
      }
      setIsLoggingIn(false);
    }
  };

  const handleContinueAnonymously = () => {
    onClose();
  };

  useEffect(() => {
    authAPI
      .getDemoCredentials()
      .then(setDemoCredentials)
      .catch(() => {});
  }, []);

  if (!state.isFirstTimeUser && state.session?.user_type === "authenticated") {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {state.isFirstTimeUser ? "Welcome to EloquentAI!" : "Welcome Back!"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {state.isFirstTimeUser
              ? "Your intelligent fintech assistant is ready to help"
              : "Continue your financial services journey"}
          </p>
        </div>

        {!showLogin ? (
          <div className="space-y-4">
            {/* Continue Anonymously */}
            <button
              onClick={handleContinueAnonymously}
              className="w-full p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <User size={20} />
              Continue as Guest
            </button>

            {/* Login Options */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowLogin(true)}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <LogIn size={16} />
                Sign In
              </button>

              <button
                onClick={() => handleDemoLogin(0)}
                disabled={!demoCredentials || isLoggingIn}
                className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                <Shield size={16} />
                Demo Account
              </button>
            </div>

            {/* Benefits */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                What you can do:
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Ask questions about accounts & registration
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Get help with payments & transactions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Learn about security & compliance
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Receive technical support
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
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
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50"
              >
                {isLoggingIn ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {demoCredentials && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                  <strong>Available Demo Accounts:</strong>
                </p>
                <div className="space-y-2">
                  {demoCredentials.available_accounts.map((account, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div className="text-xs text-blue-700 dark:text-blue-400">
                        <div className="font-medium">{account.role}</div>
                        <div>
                          {account.email} / {account.password}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDemoLogin(index)}
                        disabled={isLoggingIn}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowLogin(false)}
              className="w-full p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              ← Back to options
            </button>
          </div>
        )}

        {state.error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">
              {state.error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserWelcome;
