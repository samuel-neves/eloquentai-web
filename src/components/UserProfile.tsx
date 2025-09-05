"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/services/api";
import { SessionInfoInterface } from "@/types/chat";
import {
  User,
  LogOut,
  Clock,
  MessageSquare,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const UserProfile: React.FC = () => {
  const { state, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionInfoInterface | null>(
    null
  );

  const loadSessionStats = async () => {
    try {
      const stats = await authAPI.getSession();
      setSessionStats(stats);
    } catch {}
  };

  const handleLogout = async () => {
    await logout();
    setShowProfile(false);
  };

  useEffect(() => {
    if (state.session) {
      loadSessionStats();
    }
  }, [state.session]);

  if (!state.session) {
    return null;
  }

  const isAuthenticated = state?.session?.user_type === "authenticated";
  const userName = isAuthenticated
    ? state.session.email?.split("@")[0] || "User"
    : "Guest";

  return (
    <div className="relative">
      <button
        onClick={() => setShowProfile(!showProfile)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
          isAuthenticated
            ? "bg-green-50 border-green-200 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-800/30"
            : "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-800/30"
        }`}
      >
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isAuthenticated
              ? "bg-green-200 dark:bg-green-700"
              : "bg-blue-200 dark:bg-blue-700"
          }`}
        >
          {isAuthenticated ? (
            <Shield size={12} className="text-green-700 dark:text-green-300" />
          ) : (
            <User size={12} className="text-blue-700 dark:text-blue-300" />
          )}
        </div>
        <span className="text-sm font-medium">{userName}</span>
        {showProfile ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showProfile && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isAuthenticated
                    ? "bg-green-100 dark:bg-green-900/50"
                    : "bg-blue-100 dark:bg-blue-900/50"
                }`}
              >
                {isAuthenticated ? (
                  <Shield
                    size={20}
                    className="text-green-600 dark:text-green-400"
                  />
                ) : (
                  <User
                    size={20}
                    className="text-blue-600 dark:text-blue-400"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {userName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isAuthenticated ? "Authenticated User" : "Guest Session"}
                </p>
              </div>
            </div>

            {/* Session Info */}
            {sessionStats && (
              <div className="py-3 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Statistics
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MessageSquare size={14} />
                    <span>{sessionStats.conversation_count} conversations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock size={14} />
                    <span>
                      Active since{" "}
                      {new Date(sessionStats.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {sessionStats.last_activity && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock size={14} />
                      <span>
                        Last active:{" "}
                        {new Date(sessionStats.last_activity).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Account Info */}
            {isAuthenticated && state.session.email && (
              <div className="py-3 border-b border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {state.session.email}
                </div>
              </div>
            )}

            {/* Session Type Badge */}
            <div className="py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Session Type:
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isAuthenticated
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                  }`}
                >
                  {isAuthenticated ? "Secure" : "Guest"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 space-y-2">
              {!isAuthenticated && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                    <strong>Guest Session</strong>
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    Your conversations are temporary. Sign in to save your chat
                    history and access advanced features.
                  </p>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
              >
                <LogOut size={14} />
                {isAuthenticated ? "Sign Out" : "End Session"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
