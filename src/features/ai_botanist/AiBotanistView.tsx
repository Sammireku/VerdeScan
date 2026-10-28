// AI Botanist Agent: Fixed Header & Textbox with Gemini 3.8 Flash & Multi-Tier Fallback Reasoning
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  History,
  Droplets,
  Plus,
  Send,
  Camera,
  ChevronDown,
  ChevronUp,
  Bot,
  Sprout,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { getGardenPlants } from '../../lib/garden';
import { askAiBotanist, type WeatherContext } from '../../lib/botanist-agent';
import type { Plant } from '@verdescan/shared';

export interface AiBotanistViewProps {
  onOpenHistory: () => void;
  onOpenScan?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  thought?: string;
  timestamp: string;
  source?: 'gemini' | 'kb_engine' | 'offline_heuristics';
}

const STORAGE_CHAT_KEY = 'verdescan_botanist_chat_history';

export function AiBotanistView({ onOpenHistory, onOpenScan }: AiBotanistViewProps) {
  const [isInChat, setIsInChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userPlants, setUserPlants] = useState<Plant[]>([]);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [weatherContext, setWeatherContext] = useState<WeatherContext | undefined>(undefined);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load garden plants and local weather for grounding
  useEffect(() => {
    getGardenPlants().then((plants) => setUserPlants(plants));

    // Read stored weather if available from WeatherWidget
    try {
      const storedWeather = localStorage.getItem('verdescan_cached_weather');
      if (storedWeather) {
        setWeatherContext(JSON.parse(storedWeather));
      }
    } catch {
      // Fallback
    }

    try {
      const stored = localStorage.getItem(STORAGE_CHAT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          setIsInChat(true);
        }
      } else {
        // Initial default conversation thread matching mockups
        const defaultThread: ChatMessage[] = [
          {
            id: 'msg-1',
            sender: 'user',
            text: "My plant's leaves are drooping.",
            timestamp: '10:14 AM',
          },
          {
            id: 'msg-2',
            sender: 'bot',
            thought: "Checking user's plants information",
            text: "Is this about your Snake Plant or Monstera? I noticed they were watered recently.",
            timestamp: '10:14 AM',
            source: 'gemini',
          },
          {
            id: 'msg-3',
            sender: 'user',
            text: 'Yes I watered it along with other plants',
            timestamp: '10:15 AM',
          },
          {
            id: 'msg-4',
            sender: 'bot',
            thought: 'Checking plants record & moisture tolerances',
            text: "Snake Plants prefer dry, aerated soil. Let's check: is the soil damp to the touch, and does the pot have drainage holes?",
            timestamp: '10:15 AM',
            source: 'kb_engine',
          },
          {
            id: 'msg-5',
            sender: 'user',
            text: 'No, should I repot it?',
            timestamp: '10:16 AM',
          },
          {
            id: 'msg-6',
            sender: 'bot',
            thought: 'Waiting for confirmation & repotting schedule',
            text: 'Yes you should! To help you faster, should I re-schedule a watering & repotting reminder for your plant?',
            timestamp: '10:16 AM',
            source: 'gemini',
          },
        ];
        setMessages(defaultThread);
        setExpandedThoughts({
          'msg-2': true,
          'msg-4': true,
          'msg-6': true,
        });
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (isInChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isInChat, isTyping]);

  const toggleThought = (msgId: string) => {
    setExpandedThoughts((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText ?? inputText).trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputText('');
    setIsInChat(true);
    setIsTyping(true);

    try {
      // Call Gemini Botanist agent with multi-tier fallbacks
      const botResponse = await askAiBotanist(textToSend, userPlants, weatherContext);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        thought: botResponse.thought,
        text: botResponse.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: botResponse.source,
      };

      setMessages((prev) => [...prev, botMsg]);
      setExpandedThoughts((prev) => ({ ...prev, [botMsg.id]: true }));
    } catch {
      // Tier 3 Emergency local response
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        thought: 'Offline botanical guidelines activated',
        text: 'Ensure morning irrigation at root depth and check drainage holes. Would you like to run a leaf scan to confirm symptoms?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'offline_heuristics',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setExpandedThoughts((prev) => ({ ...prev, [fallbackMsg.id]: true }));
    } finally {
      setIsTyping(false);
    }
  };

  const startQuestion = (q: string) => {
    setIsInChat(true);
    handleSend(q);
  };

  const handleResetChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_CHAT_KEY);
    setIsInChat(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] relative px-4">
      {/* 1. FIXED HEADER: Stays permanently at top of view */}
      <div className="sticky top-0 z-30 bg-[#F6F8F5] pb-2.5 pt-2 border-b border-[#E6EBE4]/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {isInChat && (
            <button
              type="button"
              onClick={() => setIsInChat(false)}
              className="w-9 h-9 rounded-full bg-white border border-[#E6EBE4] flex items-center justify-center text-[#19201D] hover:bg-stone-50 shadow-2xs touch-target"
              title="Back to Welcome"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-extrabold text-[#19201D] tracking-tight leading-none">
              Ai Botanist
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#78C441] animate-ping" />
              <span className="text-[10px] font-bold text-[#5E6D65]">
                Gemini 3.8 Flash & Agronomy Engine
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isInChat && (
            <button
              type="button"
              onClick={handleResetChat}
              className="w-9 h-9 rounded-full bg-white border border-[#E6EBE4] text-[#5E6D65] hover:text-[#BC4749] flex items-center justify-center shadow-2xs touch-target"
              title="Reset Chat"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenHistory}
            className="w-10 h-10 rounded-full bg-white border border-[#E6EBE4] text-[#19201D] flex items-center justify-center shadow-2xs hover:bg-[#F6F8F5] active:scale-95 transition-all touch-target"
            title="History"
            aria-label="History"
          >
            <History className="w-5 h-5 text-[#5E6D65]" />
          </button>
        </div>
      </div>

      {/* 2. SCROLLABLE BODY (Only the middle message/content thread scrolls) */}
      <div className="flex-1 overflow-y-auto px-1 py-3 space-y-4 scroll-smooth">
        {!isInChat ? (
          /* STATE 1: WELCOME SCREEN (matching mockup 4 & 5) */
          <div className="space-y-4">
            {/* Greeting Box */}
            <div className="relative p-5 rounded-3xl bg-white border border-[#E6EBE4] shadow-xs overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 opacity-10 pointer-events-none">
                <svg viewBox="0 0 100 100" fill="#78C441">
                  <path d="M50 0 C70 30 100 50 100 100 C50 100 30 70 0 50 C30 50 50 30 50 0 Z" />
                </svg>
              </div>

              <div className="relative z-10 space-y-1">
                <div className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-[#78C441] bg-[#D8F3DC]/70 px-2.5 py-0.5 rounded-full mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Gemini Botanist Online</span>
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#19201D] leading-tight">
                  Hello I&apos;m here to help you every step of the way.
                </h2>
                <p className="text-sm font-extrabold text-[#78C441]">How can I assist you?</p>
              </div>
            </div>

            {/* Quick Actions (2 columns) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#5E6D65]">Quick actions</span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => startQuestion('Calculate water amount of my plants')}
                  className="bg-white rounded-2xl p-3.5 border border-[#E6EBE4] hover:border-[#78C441] shadow-2xs text-left transition-all touch-target flex flex-col justify-between min-h-[90px]"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#EBF5FF] text-[#3B82F6] flex items-center justify-center mb-2">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-[#19201D] leading-tight">
                    Calculate water amount of my plants
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => startQuestion('List of crops that appeal to my garden and soil')}
                  className="bg-white rounded-2xl p-3.5 border border-[#E6EBE4] hover:border-[#78C441] shadow-2xs text-left transition-all touch-target flex flex-col justify-between min-h-[90px]"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#D8F3DC] text-[#78C441] flex items-center justify-center mb-2">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-[#19201D] leading-tight">
                    List of plant for plants appeals to me
                  </p>
                </button>
              </div>
            </div>

            {/* Popular question you can try */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-[#5E6D65]">Popular question you can try</span>
              <div className="space-y-2">
                {[
                  'Wondering plant is easiest to care for?',
                  'What to consider for plants for home?',
                  'What plant to gift someone?',
                  'How to stop caterpillars without chemicals?',
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => startQuestion(q)}
                    className="w-full bg-white rounded-2xl p-3.5 border border-[#E6EBE4] hover:border-[#78C441] shadow-2xs text-left transition-all flex items-center justify-between gap-3 touch-target"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-stone-400">🌱</span>
                      <span className="text-xs font-semibold text-[#19201D]">{q}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-300" />
                  </button>
                ))}
              </div>
            </div>

            {/* Large + New Chat Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsInChat(true)}
                className="touch-target w-full bg-[#78C441] hover:bg-[#6BB536] text-white font-extrabold text-xs sm:text-sm py-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] min-h-[48px]"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ New Chat</span>
              </button>
            </div>
          </div>
        ) : (
          /* STATE 2: ACTIVE CHAT THREAD */
          <div className="space-y-3.5 pb-2">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                >
                  {/* Thought Step Accordion for Bot */}
                  {isBot && msg.thought && (
                    <div className="mb-1 ml-9">
                      <button
                        type="button"
                        onClick={() => toggleThought(msg.id)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#5E6D65] hover:text-[#19201D] bg-[#EBF0E9] hover:bg-[#dfe6dc] px-2.5 py-1 rounded-full transition-colors border border-black/5"
                      >
                        <Cpu className="w-3 h-3 text-[#78C441]" />
                        <span>{msg.thought}</span>
                        {expandedThoughts[msg.id] ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}

                  <div
                    className={`flex items-start gap-2.5 max-w-[85%] ${
                      isBot ? 'flex-row' : 'flex-row-reverse'
                    }`}
                  >
                    {/* Avatars */}
                    {isBot ? (
                      <div className="w-8 h-8 rounded-full bg-[#78C441] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#182635] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                        🧑‍🌾
                      </div>
                    )}

                    {/* Speech Bubble */}
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isBot
                          ? 'bg-white border border-[#E6EBE4] text-[#19201D] rounded-tl-xs'
                          : 'bg-[#182635] text-white rounded-tr-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>
                      <div
                        className={`text-[9px] mt-1 text-right ${
                          isBot ? 'text-[#8C9B90]' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-[#5E6D65] pl-10 animate-pulse">
                <Bot className="w-4 h-4 text-[#78C441] animate-spin" />
                <span className="font-medium">
                  AI Botanist is consulting Gemini & agronomy records...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Quick Suggestion Chips (when in chat) */}
      {isInChat && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none shrink-0">
          {[
            'Calculate water amount',
            'Should I repot it?',
            'Organic pest treatment',
            'Compost recipe tips',
            'Nutrient yellowing fix',
          ].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSend(s)}
              className="text-[11px] font-semibold text-[#1A3B29] bg-[#D8F3DC]/70 hover:bg-[#D8F3DC] px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border border-[#B7E4C7]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* 3. FIXED BOTTOM INPUT TEXTBOX: Stays permanently at bottom of view */}
      <div className="sticky bottom-0 z-30 bg-[#F6F8F5] pt-2 pb-2 border-t border-[#E6EBE4]/80 shrink-0">
        <div className="bg-white rounded-2xl border border-[#E6EBE4] p-1.5 flex items-center gap-2 shadow-sm">
          <button
            type="button"
            onClick={onOpenScan}
            className="w-9 h-9 rounded-xl bg-[#F6F8F5] hover:bg-stone-100 text-[#5E6D65] flex items-center justify-center touch-target"
            title="Scan crop with camera"
          >
            <Camera className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask AI Botanist about your crops..."
            className="flex-1 text-xs sm:text-sm font-medium bg-transparent focus:outline-none px-2"
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="w-9 h-9 rounded-full bg-[#78C441] hover:bg-[#6BB536] disabled:bg-stone-200 text-white flex items-center justify-center shadow-xs transition-all active:scale-95 touch-target"
            title="Send message"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
