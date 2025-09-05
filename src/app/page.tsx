"use client";

import FintechChatInterface from "@/components/FintechChatInterface";
import { ChatProvider } from "@/contexts/ChatContext";
import { AuthProvider } from "@/contexts/AuthContext";

export default function Home() {
  return (
    <AuthProvider>
      <ChatProvider>
        <FintechChatInterface />
      </ChatProvider>
    </AuthProvider>
  );
}
