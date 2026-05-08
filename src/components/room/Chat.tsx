import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import { Send } from 'lucide-react';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUser: string;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, currentUser }) => {
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
      inputRef.current?.focus();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-dark-700/50">
        <h3 className="font-semibold text-sm">Chat en vivo</h3>
        <p className="text-xs text-dark-500">{messages.length} mensajes</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-8 text-dark-500 text-sm">
            <p>Sin mensajes aún</p>
            <p className="text-xs mt-1">¡Sé el primero en escribir!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.userName === currentUser;
          return (
            <div
              key={msg.id}
              className={`animate-slide-in ${isMe ? 'ml-4' : 'mr-4'}`}
            >
              <div
                className={`rounded-xl px-3 py-2 text-sm ${
                  isMe
                    ? 'bg-primary-600/30 border border-primary-500/20'
                    : 'bg-dark-700/50 border border-dark-600/30'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs font-semibold ${isMe ? 'text-primary-400' : 'text-accent-400'}`}>
                    {isMe ? 'Tú' : msg.userName}
                  </span>
                  <span className="text-[10px] text-dark-500 ml-2">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="text-dark-200 break-words">{msg.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-dark-700/50">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500 transition-colors"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-2 bg-primary-600 rounded-lg hover:bg-primary-500 transition-colors disabled:opacity-30 disabled:hover:bg-primary-600"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
