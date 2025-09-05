"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { ChatMessageInterface } from "@/types/chat";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageInterface;
  sources?: string[];
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, sources }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-4 p-4 ${
        isUser ? "bg-transparent" : "bg-gray-50 dark:bg-gray-900/50"
      }`}
    >
      <div className="flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? "bg-blue-500 text-white" : "bg-green-500 text-white"
          }`}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                code: ({ className, children, ...props }) => {
                  const isInline = !className?.includes("language-");
                  return isInline ? (
                    <code
                      className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                },
                p: ({ children }) => (
                  <p className="mb-2 last:mb-0">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-2">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-2">{children}</ol>
                ),
                li: ({ children }) => <li className="mb-1">{children}</li>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {sources && sources.length > 0 && !isUser && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
              Sources:
            </p>
            <div className="flex flex-wrap gap-2">
              {sources.map((source, index) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded"
                >
                  {source}
                </span>
              ))}
            </div>
          </div>
        )}

        {message.timestamp && (
          <div className="mt-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
