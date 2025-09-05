"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { ChatMessageInterface, ConversationInterface } from "@/types/chat";
import { chatAPI } from "@/services/api";

interface ChatStateInterface {
  conversations: ConversationInterface[];
  currentConversationId: string | null;
  currentMessages: ChatMessageInterface[];
  isLoading: boolean;
  error: string | null;
}

type ChatActionType =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "ADD_MESSAGE"; payload: ChatMessageInterface }
  | { type: "SET_MESSAGES"; payload: ChatMessageInterface[] }
  | { type: "SET_CONVERSATIONS"; payload: ConversationInterface[] }
  | { type: "ADD_CONVERSATION"; payload: ConversationInterface }
  | { type: "SET_CURRENT_CONVERSATION"; payload: string | null }
  | {
      type: "UPDATE_CONVERSATION";
      payload: { id: string; messages: ChatMessageInterface[] };
    }
  | { type: "DELETE_CONVERSATION"; payload: string }
  | { type: "CLEAR_CURRENT_CONVERSATION" };

const initialState: ChatStateInterface = {
  conversations: [],
  currentConversationId: null,
  currentMessages: [],
  isLoading: false,
  error: null,
};

function chatReducer(
  state: ChatStateInterface,
  action: ChatActionType
): ChatStateInterface {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "ADD_MESSAGE":
      return {
        ...state,
        currentMessages: [...state.currentMessages, action.payload],
      };
    case "SET_MESSAGES":
      return { ...state, currentMessages: action.payload };
    case "SET_CONVERSATIONS":
      return { ...state, conversations: action.payload };
    case "ADD_CONVERSATION":
      return {
        ...state,
        conversations: [action.payload, ...state.conversations],
      };
    case "SET_CURRENT_CONVERSATION":
      return {
        ...state,
        currentConversationId: action.payload,
        currentMessages: action.payload
          ? state.conversations.find((c) => c.id === action.payload)
              ?.messages || []
          : [],
      };
    case "UPDATE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.map((conv) =>
          conv.id === action.payload.id
            ? {
                ...conv,
                messages: action.payload.messages,
                updated_at: new Date().toISOString(),
              }
            : conv
        ),
        currentMessages:
          state.currentConversationId === action.payload.id
            ? action.payload.messages
            : state.currentMessages,
      };
    case "DELETE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.filter(
          (c) => c.id !== action.payload
        ),
        currentConversationId:
          state.currentConversationId === action.payload
            ? null
            : state.currentConversationId,
        currentMessages:
          state.currentConversationId === action.payload
            ? []
            : state.currentMessages,
      };
    case "CLEAR_CURRENT_CONVERSATION":
      return {
        ...state,
        conversations: [],
        currentMessages: [],
        currentConversationId: null,
      };
    default:
      return state;
  }
}

interface ChatContextType extends ChatStateInterface {
  dispatch: React.Dispatch<ChatActionType>;
  createNewConversation: (firstMessage?: string) => string;
  loadConversation: (conversationId: string) => void;
  saveConversationToStorage: () => void;
  loadConversationsFromStorage: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  useEffect(() => {
    const handleAuthChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.history) {
        const messages = customEvent.detail.history;
        const now = new Date().toISOString();
        const conversation = {
          id: localStorage.getItem("session_id") || "",
          title: "Previous Conversation",
          messages,
          created_at: now,
          updated_at: now,
        };
        dispatch({ type: "SET_CONVERSATIONS", payload: [conversation] });
        dispatch({
          type: "SET_CURRENT_CONVERSATION",
          payload: conversation.id,
        });
      } else {
        loadConversationsFromStorage();
      }
    };

    const clearOnLogout = () => {
      dispatch({ type: "CLEAR_CURRENT_CONVERSATION" });
      loadConversationsFromStorage();
    };

    window.addEventListener(
      "auth-session-changed",
      handleAuthChange as EventListener
    );
    window.addEventListener("auth-logged-out", clearOnLogout as EventListener);
    loadConversationsFromStorage();

    return () => {
      window.removeEventListener(
        "auth-session-changed",
        handleAuthChange as EventListener
      );
      window.removeEventListener(
        "auth-logged-out",
        clearOnLogout as EventListener
      );
    };
  }, []);

  useEffect(() => {
    const userType = localStorage.getItem("user_type") || "anonymous";
    const sessionId = localStorage.getItem("session_id") || "";
    const key = `eloquentai-conversations-${userType}-${sessionId}`;
    localStorage.setItem(key, JSON.stringify(state.conversations));
  }, [state.conversations]);

  const createNewConversation = (firstMessage?: string): string => {
    const sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
      throw new Error("No active session");
    }

    const now = new Date().toISOString();
    const title = firstMessage
      ? firstMessage.length > 50
        ? firstMessage.substring(0, 50) + "..."
        : firstMessage
      : "New Conversation";

    const newConversation: ConversationInterface = {
      id: sessionId,
      title,
      messages: [],
      created_at: now,
      updated_at: now,
    };

    dispatch({ type: "ADD_CONVERSATION", payload: newConversation });
    dispatch({ type: "SET_CURRENT_CONVERSATION", payload: sessionId });

    return sessionId;
  };

  const loadConversation = (conversationId: string) => {
    dispatch({ type: "SET_CURRENT_CONVERSATION", payload: conversationId });
  };

  const saveConversationToStorage = () => {
    const userType = localStorage.getItem("user_type") || "anonymous";
    const sessionId = localStorage.getItem("session_id") || "";
    const key = `eloquentai-conversations-${userType}-${sessionId}`;
    localStorage.setItem(key, JSON.stringify(state.conversations));
  };

  const loadConversationsFromStorage = async () => {
    try {
      const userType = localStorage.getItem("user_type") || "anonymous";
      const sessionId = localStorage.getItem("session_id") || "";

      if (userType === "authenticated" && sessionId) {
        const history = await chatAPI.getConversationHistory(sessionId);
        if (history.messages?.length > 0) {
          const now = new Date().toISOString();
          const conversation = {
            id: sessionId,
            title: "Previous Conversation",
            messages: history.messages,
            created_at: now,
            updated_at: now,
          };
          dispatch({ type: "SET_CONVERSATIONS", payload: [conversation] });
          dispatch({ type: "SET_CURRENT_CONVERSATION", payload: sessionId });
          return;
        }
      }

      const key = `eloquentai-conversations-${userType}-${sessionId}`;
      const stored = localStorage.getItem(key);
      const conversations = stored ? JSON.parse(stored) : [];
      dispatch({ type: "SET_CONVERSATIONS", payload: conversations });
      dispatch({ type: "SET_CURRENT_CONVERSATION", payload: null });
    } catch {
      dispatch({ type: "SET_ERROR", payload: "Failed to load conversations" });
    }
  };

  const value: ChatContextType = {
    ...state,
    dispatch,
    createNewConversation,
    loadConversation,
    saveConversationToStorage,
    loadConversationsFromStorage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
