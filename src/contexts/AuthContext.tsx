"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "@/services/api";
import { AuthResponseInterface, SessionInfoInterface } from "@/types/chat";

interface AuthStateInterface {
  isAuthenticated: boolean;
  user: { user_type: string; session_id: string } | null;
  session: SessionInfoInterface | null;
  isFirstTimeUser: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthActionType =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | {
      type: "LOGIN_SUCCESS";
      payload: {
        user: { user_type: string; session_id: string };
        session: SessionInfoInterface;
      };
    }
  | { type: "LOGOUT" }
  | { type: "SET_SESSION"; payload: SessionInfoInterface }
  | { type: "SET_FIRST_TIME_USER"; payload: boolean };

const initialState: AuthStateInterface = {
  isAuthenticated: false,
  user: null,
  session: null,
  isFirstTimeUser: true,
  isLoading: true,
  error: null,
};

const authReducer = (
  state: AuthStateInterface,
  action: AuthActionType
): AuthStateInterface => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: action.payload.user.user_type !== "anonymous",
        user: action.payload.user,
        session: action.payload.session,
        isFirstTimeUser: false,
        error: null,
      };
    case "LOGOUT":
      localStorage.removeItem("auth_token");
      localStorage.removeItem("session_id");
      localStorage.removeItem("user_visited");
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        session: null,
        isFirstTimeUser: true,
      };
    case "SET_SESSION":
      return { ...state, session: action.payload };
    case "SET_FIRST_TIME_USER":
      return { ...state, isFirstTimeUser: action.payload };
    default:
      return state;
  }
};

const AuthContext = createContext<{
  state: AuthStateInterface;
  dispatch: React.Dispatch<AuthActionType>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  createAnonymousSession: () => Promise<void>;
  checkSession: () => Promise<void>;
} | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const createAnonymousSession = React.useCallback(async () => {
    try {
      const response: AuthResponseInterface =
        await authAPI.createAnonymousSession();
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("session_id", response.session_id);
      localStorage.setItem("user_visited", "true");

      const session = await authAPI.getSession();
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: { user_type: "anonymous", session_id: response.session_id },
          session,
        },
      });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to create session" });
    }
  }, []);

  // Initialize session
  const initializeSession = React.useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const token = localStorage.getItem("auth_token");
      if (token) {
        // Try to get existing session
        try {
          const session = await authAPI.getSession();
          dispatch({ type: "SET_SESSION", payload: session });
          dispatch({ type: "SET_FIRST_TIME_USER", payload: false });
        } catch {
          // Session expired, create new anonymous session
          await createAnonymousSession();
        }
      } else {
        // No token, create anonymous session
        await createAnonymousSession();
      }
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to initialize session" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [createAnonymousSession]);

  // Check if user has visited before
  useEffect(() => {
    const hasVisited = localStorage.getItem("user_visited");
    if (hasVisited) {
      dispatch({ type: "SET_FIRST_TIME_USER", payload: false });
    }

    // Initialize session
    initializeSession();
  }, [initializeSession]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      const response: AuthResponseInterface = await authAPI.login({
        email,
        password,
      });
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("session_id", response.session_id);
      localStorage.setItem("user_visited", "true");

      const session = await authAPI.getSession();
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: {
            user_type: response.user_type,
            session_id: response.session_id,
          },
          session,
        },
      });

      return true;
    } catch {
      dispatch({
        type: "SET_ERROR",
        payload: "Login failed. Please check your credentials.",
      });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
    } finally {
      dispatch({ type: "LOGOUT" });
      // Create new anonymous session after logout
      await createAnonymousSession();
    }
  };

  const checkSession = async () => {
    try {
      const session = await authAPI.getSession();
      dispatch({ type: "SET_SESSION", payload: session });
    } catch {
      // Session expired, create new anonymous session
      await createAnonymousSession();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
        login,
        logout,
        createAnonymousSession,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
