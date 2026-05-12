import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, X, MessageCircle, Zap } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const PREDEFINED_RESPONSES: Record<string, string> = {
  recommend: '¡Claro! 🎬 Te recomiendo **Inception** de Christopher Nolan — es la película más vista en NetSync con la mayor cantidad de salas creadas. Es una aventura alucinante de ciencia ficción que combina acción con una historia que te vuela la cabeza. ¡Perfecta para ver con amigos y debatir el final! 🤯\n\nSi prefieres algo más reciente, **Dune** (2021) también es una excelente opción con un IMDb de 8.0 y una cinematografía espectacular. 🏜️',
  popular: '🔥 ¡La película más popular en NetSync es **Inception**! Ha sido elegida en más salas que cualquier otra película del catálogo. Los usuarios la adoran por su trama compleja y sus escenas de acción increíbles.\n\nLe siguen de cerca **Spider-Man: Into the Spider-Verse** y **The Dark Knight**. ¡La comunidad tiene muy buen gusto! 🎯',
  rated: '⭐ Según las calificaciones de nuestra comunidad, **The Dark Knight** lidera con un impresionante **9.0 en IMDb**. Heath Ledger como el Joker es simplemente legendario. 🃏\n\nTambién destacan **Inception** (8.8) e **Interstellar** (8.7), ambas de Christopher Nolan. ¡Parece que Nolan es el rey de NetSync! 👑',
  funny: '😂 ¡Para pasarla bien con amigos te recomiendo **Spider-Man: Into the Spider-Verse**! Es animada, tiene humor genial, acción espectacular y un estilo visual único que te va a encantar. Rating IMDb: 8.4 ⭐\n\nEs perfecta para una noche de risas y momentos épicos. ¡Además, la comunidad de NetSync la ha elegido muchas veces — es de las favoritas! 🕷️✨',
};

const SUGGESTED_PROMPTS = [
  { text: '🎬 ¿Qué película me recomiendas?', prompt: '¿Qué película me recomiendas ver hoy?', responseKey: 'recommend' },
  { text: '🔥 ¿Cuál es la más popular?', prompt: '¿Cuál es la película más popular en la plataforma?', responseKey: 'popular' },
  { text: '⭐ Mejor calificada', prompt: '¿Cuál es la película mejor calificada por los usuarios?', responseKey: 'rated' },
  { text: '😂 Algo para reír', prompt: 'Recomiéndame algo divertido para ver con amigos', responseKey: 'funny' },
];

export const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '¡Hola! 👋 Soy **SyncBot**, tu asistente cinéfilo de NetSync. Puedo recomendarte películas basándome en lo que está pasando en la plataforma. ¿Qué te gustaría saber? 🎬',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    };

    const assistantMsgId = `assistant-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsStreaming(true);
    setIsThinking(true);

    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream reader');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6);
          try {
            const data = JSON.parse(jsonStr);

            // Skip heartbeats (just keep-alive)
            if (data.heartbeat) continue;

            // Thinking notification
            if (data.thinking) {
              setIsThinking(true);
              continue;
            }

            if (data.error) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsgId
                    ? { ...m, content: `❌ ${data.error}` }
                    : m
                )
              );
              setIsStreaming(false);
              setIsThinking(false);
              return;
            }

            if (data.token) {
              setIsThinking(false);
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMsgId
                    ? { ...m, content: m.content + data.token }
                    : m
                )
              );
            }

            if (data.done) {
              setIsStreaming(false);
              setIsThinking(false);
              return;
            }
          } catch {
            // Skip malformed lines
          }
        }
      }
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, content: '❌ No pude conectarme con el asistente de IA. Verifica que Ollama esté corriendo.' }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
      setIsThinking(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const sendPredefined = (prompt: string, responseKey: string) => {
    if (isStreaming) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);

    // Simulate a short typing delay then show predefined response
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: PREDEFINED_RESPONSES[responseKey] || 'No tengo una respuesta para eso aún.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    }, 400);
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  // Floating toggle button when closed
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 group"
        title="Abrir SyncBot - Asistente IA"
        id="syncbot-toggle"
      >
        <div className="relative">
          {/* Pulse ring */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl animate-ping opacity-20" />
          {/* Button */}
          <div className="relative flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl shadow-2xl shadow-primary-500/30 transition-all duration-300 group-hover:shadow-primary-500/50 group-hover:scale-105">
            <div className="relative">
              <Bot className="w-6 h-6 text-white" />
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" />
            </div>
            <span className="text-white font-semibold text-sm">SyncBot IA</span>
            <Zap className="w-4 h-4 text-yellow-300" />
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] animate-in" id="syncbot-panel">
      {/* Chat Container */}
      <div className="bg-dark-900/95 backdrop-blur-2xl border border-dark-700/60 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col" style={{ height: '580px' }}>

        {/* Header */}
        <div className="relative px-5 py-4 border-b border-dark-700/50 bg-gradient-to-r from-primary-900/40 to-accent-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                {/* Online indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-dark-900 shadow-sm shadow-emerald-400/50" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">SyncBot</h3>
                  <span className="px-1.5 py-0.5 bg-primary-500/20 text-primary-300 text-[10px] font-bold rounded-md uppercase tracking-wider">IA</span>
                </div>
                <p className="text-dark-400 text-xs">Asistente de recomendaciones</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl hover:bg-dark-700/50 transition-colors"
              title="Cerrar"
            >
              <X className="w-4 h-4 text-dark-400 hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center mr-2 mt-1 shadow-sm">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-br-md shadow-lg shadow-primary-500/20'
                    : 'bg-dark-800/80 text-dark-100 border border-dark-700/40 rounded-bl-md'
                }`}
              >
                {msg.content ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                  />
                ) : (
                  isStreaming && msg.role === 'assistant' && (
                    <div className="flex items-center gap-1.5">
                      {isThinking ? (
                        <>
                          <span className="text-lg animate-pulse">🧠</span>
                          <span className="text-dark-400 text-xs ml-1">Analizando datos del dashboard...</span>
                        </>
                      ) : (
                        <>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-dark-400 text-xs ml-1">Escribiendo...</span>
                        </>
                      )}
                    </div>
                  )
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-7 h-7 bg-dark-700 rounded-lg flex items-center justify-center ml-2 mt-1">
                  <MessageCircle className="w-3.5 h-3.5 text-dark-300" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions - only show when few messages and not streaming */}
        {messages.length <= 2 && !isStreaming && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendPredefined(s.prompt, s.responseKey)}
                  className="px-3 py-1.5 bg-dark-800/60 border border-dark-700/50 rounded-xl text-xs text-dark-300 hover:text-white hover:border-primary-500/40 hover:bg-dark-700/60 transition-all duration-200"
                >
                  {s.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t border-dark-700/30">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isStreaming ? 'SyncBot está respondiendo...' : 'Pregúntame sobre películas...'}
              disabled={isStreaming}
              className="flex-1 px-4 py-2.5 bg-dark-800/80 border border-dark-700/50 rounded-xl text-white text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all duration-200 disabled:opacity-50"
              id="syncbot-input"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="p-2.5 bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl text-white transition-all duration-200 hover:from-primary-500 hover:to-primary-400 hover:shadow-lg hover:shadow-primary-500/30 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              title="Enviar"
              id="syncbot-send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-center text-[10px] text-dark-600 mt-2">
            Potenciado por Gemma 4 · Ollama local
          </p>
        </div>
      </div>

      <style>{`
        .animate-in {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
};
