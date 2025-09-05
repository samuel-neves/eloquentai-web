"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import { chatAPI, fintechAPI, authAPI } from "@/services/api";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import UserWelcome from "./UserWelcome";
import UserProfile from "./UserProfile";
import QuickLogin from "./QuickLogin";
import {
  ChatMessageInterface,
  FintechCategoryInterface,
  CategoryListResponseInterface,
  SessionInfoInterface,
} from "@/types/chat";
import {
  Loader2,
  AlertCircle,
  Shield,
  CreditCard,
  UserPlus,
  FileText,
  Settings,
  ChevronDown,
  ChevronUp,
  Sparkles,
  LogIn,
} from "lucide-react";

interface ApiInfoInterface {
  message: string;
  version: string;
}

const categoryIcons = {
  "Account & Registration": UserPlus,
  "Payments & Transactions": CreditCard,
  "Security & Fraud Prevention": Shield,
  "Regulations & Compliance": FileText,
  "Technical Support & Troubleshooting": Settings,
};

const suggestionsQuestions = [
  "How do I create a new account?",
  "What are your transaction limits?",
  "How do you protect my account from fraud?",
  "Are you FDIC insured?",
  "The app is not working properly",
];

const FintechChatInterface: React.FC = () => {
  const {
    currentMessages,
    currentConversationId,
    isLoading,
    error,
    dispatch,
    createNewConversation,
  } = useChatContext();

  const { state: authState } = useAuth();

  const [categories, setCategories] = useState<FintechCategoryInterface[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showCategories, setShowCategories] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfoInterface | null>(
    null
  );
  const [apiInfo, setApiInfo] = useState<ApiInfoInterface | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [responseSources, setResponseSources] = useState<
    Record<string, string[]>
  >({});

  const initializeApp = useCallback(async () => {
    try {
      const apiData = await fetch("http://localhost:8000/").then((r) =>
        r.json()
      );
      setApiInfo(apiData);

      if (!localStorage.getItem("auth_token")) {
        const authResponse = await authAPI.createAnonymousSession();
        localStorage.setItem("auth_token", authResponse.token);
        localStorage.setItem("session_id", authResponse.session_id);
      }

      try {
        const session = await authAPI.getSession();
        setSessionInfo(session);
      } catch {
        try {
          const authResponse = await authAPI.createAnonymousSession();
          localStorage.setItem("auth_token", authResponse.token);
          localStorage.setItem("session_id", authResponse.session_id);
          const session = await authAPI.getSession();
          setSessionInfo(session);
        } catch {
          // Swallow error; AuthProvider will handle session lifecycle
        }
      }

      const categoriesData: CategoryListResponseInterface =
        await fintechAPI.getCategories();
      setCategories(categoriesData.categories);
    } catch {
      dispatch({
        type: "SET_ERROR",
        payload: "Failed to get categories. Please try again.",
      });
    }
  }, [dispatch]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      try {
        dispatch({ type: "SET_ERROR", payload: null });
        dispatch({ type: "SET_LOADING", payload: true });

        let conversationId = currentConversationId;
        if (!conversationId) {
          conversationId = createNewConversation(message);
        }

        const userMessage: ChatMessageInterface = {
          role: "user",
          content: message,
          timestamp: new Date().toISOString(),
        };
        dispatch({ type: "ADD_MESSAGE", payload: userMessage });

        let response;
        if (selectedCategory) {
          response = await fintechAPI.askByCategory({
            question: message,
            category: selectedCategory,
            session_id: conversationId,
          });

          response = {
            response: response.answer,
            conversation_id: response.session_id,
            sources: response.sources,
            confidence_score: response.confidence_score,
            category: response.category,
            related_categories: response.related_categories,
          };
        } else {
          response = await chatAPI.sendMessage({
            message,
            conversation_id: conversationId,
          });
        }

        let assistantContent = response.response;
        if (response.confidence_score !== undefined) {
          assistantContent += `\n\n*Category: ${
            response.category
          } (Confidence: ${(response.confidence_score * 100).toFixed(0)}%)*`;
          if (
            response.related_categories &&
            response.related_categories.length > 0
          ) {
            assistantContent += `\n*Related: ${response.related_categories.join(
              ", "
            )}*`;
          }
        }

        const assistantMessage: ChatMessageInterface = {
          role: "assistant",
          content: assistantContent,
          timestamp: new Date().toISOString(),
        };
        dispatch({ type: "ADD_MESSAGE", payload: assistantMessage });

        if (response.sources && response.sources.length > 0) {
          setResponseSources((prev) => ({
            ...prev,
            [assistantMessage.timestamp || ""]: response.sources || [],
          }));
        }

        const updatedMessages = [
          ...currentMessages,
          userMessage,
          assistantMessage,
        ];
        dispatch({
          type: "UPDATE_CONVERSATION",
          payload: { id: conversationId, messages: updatedMessages },
        });
      } catch {
        dispatch({
          type: "SET_ERROR",
          payload: "Failed to send message. Please try again.",
        });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [
      dispatch,
      currentMessages,
      currentConversationId,
      createNewConversation,
      selectedCategory,
    ]
  );

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName === selectedCategory ? "" : categoryName);
    setShowCategories(false);
  };

  const getSuggestedQuestions = () => {
    // prepared function to get suggestions questions with api on future
    return suggestionsQuestions;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    if (
      authState.isFirstTimeUser ||
      (!authState.isLoading && !authState.session)
    ) {
      setShowWelcome(true);
    }
  }, [authState.isFirstTimeUser, authState.isLoading, authState.session]);

  return (
    <>
      {showWelcome && <UserWelcome onClose={() => setShowWelcome(false)} />}
      {showQuickLogin && (
        <QuickLogin onClose={() => setShowQuickLogin(false)} />
      )}

      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="text-blue-500" size={24} />
                    {apiInfo?.message || "EloquentAI Fintech Assistant"}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your intelligent financial services assistant • Version{" "}
                    {apiInfo?.version || "2.0.0"}
                  </p>
                  {sessionInfo && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Session: {sessionInfo.user_type} •{" "}
                      {sessionInfo.conversation_count} conversations
                    </p>
                  )}
                </div>

                {/* User Profile & Category Selection */}
                <div className="flex items-center gap-3">
                  <UserProfile />
                  {!authState.isAuthenticated && authState.session && (
                    <button
                      onClick={() => setShowQuickLogin(true)}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                    >
                      <LogIn size={14} />
                      Sign In
                    </button>
                  )}

                  <div className="relative">
                    <button
                      onClick={() => setShowCategories(!showCategories)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                        selectedCategory
                          ? "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      <span className="text-sm">
                        {selectedCategory || "All Categories"}
                      </span>
                      {showCategories ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>

                    {showCategories && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                        <div className="p-2">
                          <button
                            onClick={() => handleCategorySelect("")}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                              !selectedCategory
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                : "hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            All Categories
                          </button>
                          {categories.map((category) => {
                            const IconComponent =
                              categoryIcons[
                                category.name as keyof typeof categoryIcons
                              ] || FileText;
                            return (
                              <button
                                key={category.name}
                                onClick={() =>
                                  handleCategorySelect(category.name)
                                }
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-start gap-3 ${
                                  selectedCategory === category.name
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                <IconComponent
                                  size={16}
                                  className="mt-0.5 flex-shrink-0"
                                />
                                <div>
                                  <div className="font-medium">
                                    {category.name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {category.description}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto">
            {currentMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-2xl mx-auto p-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Welcome to your Fintech Assistant
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    I can help you with account management, payments, security,
                    compliance, and technical support. Choose a category above
                    or ask me anything!
                  </p>

                  {/* Suggested Questions */}
                  <div className="grid gap-3">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                      Popular Questions:
                    </h3>
                    {getSuggestedQuestions().map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSendMessage(question)}
                        className="p-4 text-left bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        disabled={isLoading}
                      >
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {question}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                    <p>✨ Powered by AI with comprehensive FAQ knowledge</p>
                    <p>🔍 Smart category routing for better answers</p>
                    <p>🛡️ Secure and compliant financial guidance</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                {currentMessages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    sources={
                      message.role === "assistant" && message.timestamp
                        ? responseSources[message.timestamp]
                        : undefined
                    }
                  />
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex gap-4 p-4 bg-white/50 dark:bg-gray-800/50">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex items-center justify-center">
                        <Loader2 size={16} className="animate-spin" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-600 dark:text-gray-400">
                        {selectedCategory
                          ? `Searching ${selectedCategory} knowledge...`
                          : "Analyzing your question..."}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="max-w-4xl mx-auto px-4 py-2">
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
                <button
                  onClick={() => dispatch({ type: "SET_ERROR", payload: null })}
                  className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isLoading}
              showFileUpload={false}
              placeholder={
                isLoading
                  ? "Please wait..."
                  : selectedCategory
                    ? `Ask about ${selectedCategory}...`
                    : "Ask me anything about financial services..."
              }
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default FintechChatInterface;
