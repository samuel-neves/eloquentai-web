"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import { chatAPI, documentsAPI } from "@/services/api";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ChatSidebar from "./ChatSidebar";
import { ChatMessageInterface } from "@/types/chat";
import { Loader2, AlertCircle, Upload, CheckCircle } from "lucide-react";

const ChatInterface: React.FC = () => {
  const {
    currentMessages,
    currentConversationId,
    isLoading,
    error,
    dispatch,
    createNewConversation,
  } = useChatContext();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [responseSources, setResponseSources] = useState<
    Record<string, string[]>
  >({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const handleSendMessage = async (message: string) => {
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

      const response = await chatAPI.sendMessage({
        message,
        conversation_id: conversationId,
      });

      const assistantMessage: ChatMessageInterface = {
        role: "assistant",
        content: response.response,
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
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploadStatus("uploading");

      await documentsAPI.uploadFile(file);

      setUploadStatus("success");
      setTimeout(() => setUploadStatus(null), 3000);
    } catch {
      setUploadStatus("error");
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <ChatSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      <div className="flex-1 flex flex-col">
        {/* Main chat area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {currentConversationId ? "Chat" : "Welcome to EloquentAI"}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    AI-powered assistant with knowledge retrieval
                  </p>
                </div>

                {/* Upload status indicator */}
                {uploadStatus && (
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                      uploadStatus === "uploading"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : uploadStatus === "success"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {uploadStatus === "uploading" && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    {uploadStatus === "success" && <CheckCircle size={16} />}
                    {uploadStatus === "error" && <AlertCircle size={16} />}
                    <span>
                      {uploadStatus === "uploading" && "Uploading document..."}
                      {uploadStatus === "success" &&
                        "Document uploaded successfully!"}
                      {uploadStatus === "error" &&
                        "Upload failed. Please try again."}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto">
            {currentMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md mx-auto p-8">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Start a conversation
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Ask me anything or upload documents to enhance my knowledge
                    base.
                  </p>
                  <div className="text-sm text-gray-400 dark:text-gray-500">
                    <p>✨ Powered by OpenAI GPT</p>
                    <p>🔍 Enhanced with RAG and Pinecone</p>
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
                  <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                        <Loader2 size={16} className="animate-spin" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-500 dark:text-gray-400">
                        Thinking...
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
        </div>

        {/* Input area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          disabled={isLoading}
          placeholder={isLoading ? "Please wait..." : "Type your message..."}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
