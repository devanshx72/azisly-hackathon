import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Trash2,
  Minimize2,
  Leaf,
  Activity,
  ArrowRight,
} from 'lucide-react';


import { marked } from 'marked';
import { streamChatMessage } from '../api/client';
import type { ChatMessage, CurrentWeekSummary } from '../types';

// Configure marked for smooth inline breaks and GFM tables/lists
marked.setOptions({
  breaks: true,
  gfm: true,
});


interface ChatBotProps {
  currentWeek?: CurrentWeekSummary | null;
}

const QUICK_PROMPTS = [
  { label: '🌱 How is my progress this week?', text: 'How is my carbon footprint progress looking for this week?' },
  { label: '💡 Tips to cut my footprint', text: 'Give me top 3 high-impact tips to reduce my carbon emissions based on my habits.' },
  { label: '🚗 How are travel emissions calculated?', text: 'How does PlanetPulse calculate emissions for car, bus, and flights?' },
  { label: '🔄 What is rollover compensation?', text: 'Can you explain how PlanetPulse\'s carbon budget rollover feature works?' },
];

export const ChatBot: React.FC<ChatBotProps> = ({ currentWeek }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('planetpulse_leafy_chat');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore parse error
      }
    }
    return [];
  });
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasUnread, setHasUnread] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('planetpulse_leafy_chat', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);


  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const botMessageId = crypto.randomUUID();
    const botPlaceholder: ChatMessage = {
      id: botMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, botPlaceholder]);

    try {
      const payloadMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      let accumulatedContent = '';

      await streamChatMessage(
        {
          messages: payloadMessages,
          include_progress: true,
        },
        (token) => {
          accumulatedContent += token;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMessageId ? { ...m, content: accumulatedContent } : m
            )
          );
        }
      );

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err: any) {
      console.error('Chat stream error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMessageId
            ? {
                ...m,
                content:
                  m.content ||
                  '**Sorry!** I could not connect to the backend server. Please verify the FastAPI backend is running and that `MISTRAL_API_KEY` is configured in `backend/.env`.',
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear conversation history with Leafy?')) {
      setMessages([]);
      localStorage.removeItem('planetpulse_leafy_chat');
    }
  };

  // Render markdown with marked library
  const renderMessageContent = (text: string) => {
    if (!text.trim()) return null;
    const parsedHtml = marked.parse(text) as string;
    return (
      <div
        className="leafy-markdown"
        dangerouslySetInnerHTML={{ __html: parsedHtml }}
      />
    );
  };


  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setHasUnread(false);
          }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#132B20] text-[#F5F2EB] rounded-full border border-[#74C043]/40 shadow-2xl hover:scale-105 hover:border-[#74C043] transition-all duration-300 group cursor-pointer"
          aria-label="Open Leafy Chatbot"
        >

          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#74C043]/20 text-[#74C043] group-hover:bg-[#74C043] group-hover:text-[#0D2117] transition-colors">
            <Leaf className="w-4 h-4 animate-pulse" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#B83220] rounded-full ring-2 ring-[#0D2117]" />
            )}
          </div>
          <div className="text-xs font-semibold text-white flex items-center gap-1.5 pr-1">
            <span>Leafy</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#74C043] animate-ping" />
          </div>
        </button>

      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[88vh] flex flex-col rounded-3xl bg-[#0D2117]/95 border border-[#2F4F2F]/60 shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          
          {/* Header */}
          <div className="px-5 py-4 bg-[#132B20]/90 border-b border-[#2F4F2F]/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#132B20] to-[#2F4F2F] border border-[#74C043]/40 flex items-center justify-center text-[#74C043] shadow-inner">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">Leafy</h3>
                  {/* <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-[#74C043]/20 text-[#85D450] border border-[#74C043]/30">
                    Mistral AI
                  </span> */}
                </div>
                <div className="text-xs text-[#C8D9CB]/70 flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#74C043]" />
                  <span>Data Synced</span>
                </div>

              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={handleClearChat}
                  title="Clear conversation"
                  className="p-2 rounded-xl text-[#C8D9CB]/60 hover:text-[#B83220] hover:bg-[#132B20] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                className="p-2 rounded-xl text-[#C8D9CB]/60 hover:text-white hover:bg-[#132B20] transition-colors cursor-pointer"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Live Progress Bar Widget in Header */}
          {currentWeek && (
            <div className="px-5 py-2 bg-[#132B20]/50 border-b border-[#2F4F2F]/30 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#C8D9CB]">
                <Activity className="w-3.5 h-3.5 text-[#74C043]" />
                <span>
                  Week: <strong className="text-white font-medium">{currentWeek.week_co2_kg.toFixed(1)} kg</strong> /{' '}
                  {(currentWeek.effective_target_kg ?? currentWeek.target_kg ?? 30).toFixed(1)} kg budget
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                currentWeek.is_over_target
                  ? 'bg-[#B83220]/20 text-[#ff8070] border border-[#B83220]/40'
                  : currentWeek.pacing_status === 'caution'
                  ? 'bg-[#8C6824]/20 text-[#eac374] border border-[#8C6824]/40'
                  : 'bg-[#74C043]/20 text-[#85D450] border border-[#74C043]/40'
              }`}>
                {currentWeek.days_remaining}d left
              </span>
            </div>
          )}

          {/* Chat Message Scroll Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="py-6 px-2 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-3xl bg-[#132B20] border border-[#74C043]/30 flex items-center justify-center text-[#74C043] mb-3 shadow-lg">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h4 className="text-base font-semibold text-white">Hello! I'm Leafy 🌿</h4>
                <p className="text-xs text-[#C8D9CB]/80 mt-1 max-w-[280px] leading-relaxed">
                  Your official PlanetPulse AI companion. I have full context of your weekly carbon target and can help you cut emissions!
                </p>

                {/* Quick Suggestion Chips */}
                <div className="w-full mt-6 space-y-2 text-left">
                  <span className="text-[11px] font-medium tracking-wide uppercase text-[#74C043]/80 px-1">
                    Suggested Questions
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {QUICK_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt.text)}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-[#132B20]/70 hover:bg-[#132B20] border border-[#2F4F2F]/50 hover:border-[#74C043]/50 text-xs text-[#F5F2EB] transition-all group cursor-pointer text-left"
                      >
                        <span className="line-clamp-1">{prompt.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#74C043] opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-xl bg-[#132B20] border border-[#74C043]/40 flex items-center justify-center text-[#74C043] shrink-0 mt-0.5">
                        <Leaf className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        isUser
                          ? 'bg-[#74C043] text-[#0D2117] rounded-tr-sm shadow-md font-medium'
                          : 'bg-[#132B20]/90 text-[#F5F2EB] border border-[#2F4F2F]/60 rounded-tl-sm shadow-lg'
                      }`}
                    >
                      {isUser ? (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      ) : !msg.content ? (
                        <div className="flex items-center gap-1.5 py-1 text-xs text-[#C8D9CB]/80">
                          <span className="inline-block w-2 h-2 rounded-full bg-[#74C043] animate-bounce [animation-delay:-0.3s]" />
                          <span className="inline-block w-2 h-2 rounded-full bg-[#74C043] animate-bounce [animation-delay:-0.15s]" />
                          <span className="inline-block w-2 h-2 rounded-full bg-[#74C043] animate-bounce" />
                          <span className="ml-1 text-[11px] font-medium">Thinking...</span>
                        </div>
                      ) : (
                        <div className="relative">
                          {renderMessageContent(msg.content)}
                          {isLoading && index === messages.length - 1 && (
                            <span className="inline-block w-1.5 h-3.5 bg-[#74C043] ml-1 animate-pulse align-middle" />
                          )}
                        </div>
                      )}
                      {msg.timestamp && (
                        <div
                          className={`text-[10px] mt-1.5 text-right ${
                            isUser ? 'text-[#0D2117]/60' : 'text-[#C8D9CB]/50'
                          }`}
                        >
                          {msg.timestamp}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}


            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-[#132B20]/90 border-t border-[#2F4F2F]/50">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Leafy about your emissions..."
                disabled={isLoading}
                className="w-full pl-4 pr-12 py-3 bg-[#0D2117] text-[#F5F2EB] placeholder-[#C8D9CB]/40 rounded-2xl border border-[#2F4F2F]/70 focus:outline-none focus:border-[#74C043] focus:ring-1 focus:ring-[#74C043] text-sm transition-all disabled:opacity-50"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                aria-label="Send message"
                className="absolute right-2 p-2 rounded-xl bg-[#74C043] hover:bg-[#85D450] text-[#0D2117] disabled:opacity-30 disabled:hover:bg-[#74C043] transition-all cursor-pointer disabled:cursor-not-allowed shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[10px] text-center text-[#C8D9CB]/40 mt-2">
              Leafy uses AI &amp; live weekly carbon data. Check reduction tips for accurate carbon guidance.
            </div>

          </div>

        </div>
      )}
    </>
  );
};
