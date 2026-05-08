// ============================================
// NetSync Frontend - useChat Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { ChatMessage } from '../types';

interface UseChatReturn {
  messages: ChatMessage[];
  sendMessage: (roomId: string, userName: string, text: string) => void;
}

export function useChat(socket: Socket): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    socket.on('chat:history', (history: ChatMessage[]) => {
      setMessages(history);
    });

    socket.on('chat:message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('chat:history');
      socket.off('chat:message');
    };
  }, [socket]);

  const sendMessage = useCallback(
    (roomId: string, userName: string, text: string) => {
      if (text.trim()) {
        socket.emit('chat:message', { roomId, userName, text: text.trim() });
      }
    },
    [socket]
  );

  return { messages, sendMessage };
}
