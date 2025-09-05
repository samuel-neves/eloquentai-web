"use client";

import React, { useState } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import {
  Plus,
  MessageSquare,
  Trash2,
  Search,
  FileText,
  X,
  Menu,
  Settings,
} from "lucide-react";

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isOpen, onToggle }) => {
  const {
    conversations,
    currentConversationId,
    createNewConversation,
    loadConversation,
    dispatch,
  } = useChatContext();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewChat = () => {
    createNewConversation();
    if (window.innerWidth < 768) {
      onToggle();
    }
  };

  const handleDeleteConversation = (
    conversationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this conversation?")) {
      dispatch({ type: "DELETE_CONVERSATION", payload: conversationId });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        w-80 md:relative md:translate-x-0
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              EloquentAI
            </h1>
            <button
              onClick={onToggle}
              className="md:hidden p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Plus size={18} />
              New Chat
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pb-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {filteredConversations.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  {searchTerm
                    ? "No conversations found"
                    : "No conversations yet"}
                </p>
                <p className="text-xs mt-1">
                  {searchTerm
                    ? "Try a different search term"
                    : "Start a new chat to begin"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      loadConversation(conversation.id);
                      if (window.innerWidth < 768) {
                        onToggle();
                      }
                    }}
                    className={`
                      group relative p-3 rounded-lg cursor-pointer transition-colors
                      ${
                        currentConversationId === conversation.id
                          ? "bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conversation.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatDate(conversation.updated_at)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {conversation.messages.length} messages
                        </p>
                      </div>

                      <button
                        onClick={(e) =>
                          handleDeleteConversation(conversation.id, e)
                        }
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <FileText size={16} />
              <span>RAG-powered responses</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mt-2">
              <Settings size={14} />
              <span>EloquentAI v1.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-40 md:hidden p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
      >
        <Menu size={20} />
      </button>
    </>
  );
};

export default ChatSidebar;
