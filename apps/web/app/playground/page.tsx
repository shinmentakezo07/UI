"use client";

import { motion, useMotionValue, useMotionTemplate, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, MessageSquare, Send, Loader2, X, Check, Bot, Copy, ThumbsUp, ThumbsDown, RotateCcw, PanelLeftClose, PanelLeftOpen, Trash2, Edit3, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import openRouterModels from "../models/openrouter-models-2026.json";
import { getProviderLogo } from "@/lib/provider-logos";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  modelId?: string;
}

interface ChatSession {
  id: string;
  model: any;
  messages: Message[];
  isTyping: boolean;
}

interface HistoryChat {
  id: string;
  title: string;
  sharedMessages: Message[];
  sessions: ChatSession[];
  selectedModels: any[];
  updatedAt: number;
}

const HISTORY_KEY = "yapapa.playground.history.v1";
const ACTIVE_KEY = "yapapa.playground.activeChatId.v1";

function deriveTitle(messages: Message[]) {
  const first = messages.find((m) => m.role === "user");
  const raw = first?.content || "New Chat";
  return raw.length > 40 ? `${raw.slice(0, 40)}…` : raw;
}

export default function PlaygroundPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedModels, setSelectedModels] = useState<any[]>([]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sharedMessages, setSharedMessages] = useState<Message[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [chatHistory, setChatHistory] = useState<HistoryChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const spotlightBackground = useMotionTemplate`
    radial-gradient(
      800px circle at ${mouseX}px ${mouseY}px,
      rgba(59,130,246,0.12),
      transparent 60%
    )
  `;

  useEffect(() => {
    setIsMounted(true);
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    const savedActive = localStorage.getItem(ACTIVE_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory) as HistoryChat[];
        setChatHistory(parsed);
        if (savedActive && parsed.some((c) => c.id === savedActive)) {
          setActiveChatId(savedActive);
          const chat = parsed.find((c) => c.id === savedActive)!;
          setSharedMessages(chat.sharedMessages);
          setSessions(chat.sessions.map((s) => ({ ...s, isTyping: false })));
          setSelectedModels(chat.selectedModels);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(chatHistory));
  }, [chatHistory, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem(ACTIVE_KEY, activeChatId || "");
  }, [activeChatId, isMounted]);

  useEffect(() => {
    function handleMouseMove({ clientX, clientY }: { clientX: number, clientY: number }) {
      mouseX.set(clientX);
      mouseY.set(clientY);
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sharedMessages, sessions]);

  const allModels = openRouterModels.map((model: any) => ({
    ...model,
    logo: getProviderLogo(model.id),
    provider: model.id.split('/')[0],
  }));

  const filteredModels = allModels.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const saveCurrentChat = () => {
    if (sharedMessages.length === 0) return;
    const title = deriveTitle(sharedMessages);
    const chat: HistoryChat = {
      id: activeChatId || `chat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      title,
      sharedMessages,
      sessions: sessions.map((s) => ({ ...s, isTyping: false })),
      selectedModels,
      updatedAt: Date.now(),
    };
    setChatHistory((prev) => {
      const filtered = prev.filter((c) => c.id !== chat.id);
      return [chat, ...filtered].slice(0, 50);
    });
    return chat.id;
  };

  const handleNewChat = () => {
    if (sharedMessages.length > 0) {
      saveCurrentChat();
    }
    setSharedMessages([]);
    setSessions([]);
    setSelectedModels([]);
    const newId = `chat_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    setActiveChatId(newId);
    inputRef.current?.focus();
  };

  const handleLoadChat = (chat: HistoryChat) => {
    if (chat.id === activeChatId) return;
    if (sharedMessages.length > 0) {
      saveCurrentChat();
    }
    setActiveChatId(chat.id);
    setSharedMessages(chat.sharedMessages);
    setSessions(chat.sessions.map((s) => ({ ...s, isTyping: false })));
    setSelectedModels(chat.selectedModels);
    inputRef.current?.focus();
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChatHistory((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) {
      setActiveChatId(null);
      setSharedMessages([]);
      setSessions([]);
      setSelectedModels([]);
    }
  };

  const addModel = (model: any) => {
    if (selectedModels.length >= 4) {
      alert("Maximum 4 models can be compared at once");
      return;
    }
    if (!selectedModels.find(m => m.id === model.id)) {
      setSelectedModels([...selectedModels, model]);
      setSessions([...sessions, { id: model.id, model, messages: [], isTyping: false }]);
    }
    setShowModelSelector(false);
    setSearchQuery("");
  };

  const removeModel = (modelId: string) => {
    setSelectedModels(selectedModels.filter(m => m.id !== modelId));
    setSessions(sessions.filter(s => s.id !== modelId));
  };

  const resetChat = () => {
    if (sharedMessages.length > 0) {
      saveCurrentChat();
    }
    setSharedMessages([]);
    setSessions(sessions.map(s => ({ ...s, messages: [], isTyping: false })));
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || selectedModels.length === 0 || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: Date.now(),
    };

    setSharedMessages([...sharedMessages, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    setSessions(sessions.map(s => ({ ...s, isTyping: true })));

    selectedModels.forEach((model, index) => {
      const delay = 800 + (index * 300) + Math.random() * 500;
      setTimeout(() => {
        const assistantMessage: Message = {
          role: "assistant",
          content: `This is a simulated response from ${model.name}. In production, this would connect to the actual OpenRouter API.\n\nThe model would process your prompt: "${userMessage.content}" and return a real response based on its capabilities.`,
          timestamp: Date.now(),
          modelId: model.id,
        };

        setSessions(prevSessions => 
          prevSessions.map(s => 
            s.id === model.id 
              ? { ...s, messages: [...s.messages, assistantMessage], isTyping: false }
              : s
          )
        );

        setSessions(prevSessions => {
          const allFinished = prevSessions.every(s => !s.isTyping);
          if (allFinished) {
            setIsLoading(false);
          }
          return prevSessions;
        });
      }, delay);
    });
  };

  if (!isMounted) return null;

  return (
    <div className="h-screen bg-[#020202] text-white relative overflow-hidden flex">
      {/* Enhanced Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_60%,transparent_100%)]" />
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{ background: spotlightBackground }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020202_80%)]" />
      </div>

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {showSidebar && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="relative z-20 flex flex-col border-r border-white/10 bg-[#0A0A0A]/80 backdrop-blur-2xl overflow-hidden shrink-0"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <Link href="/" className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-white/10">
                  <Image src="/nervous-cat.jpg" alt="Yapapa" fill className="object-cover" unoptimized />
                </div>
                <div>
                  <span className="font-bold text-sm">Yapapa</span>
                  <span className="text-[9px] text-white/40 block">AI Playground</span>
                </div>
              </Link>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-2 rounded-lg hover:bg-white/10"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            <div className="px-3 py-3">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600/20 to-violet-600/20 hover:from-blue-600/30 hover:to-violet-600/30 border border-blue-500/20 text-sm font-semibold"
              >
                <Edit3 className="w-4 h-4" />
                New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-3">
              <div className="space-y-1">
                {chatHistory.map((chat) => {
                  const isActive = chat.id === activeChatId;
                  return (
                    <div
                      key={chat.id}
                      onClick={() => handleLoadChat(chat)}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${
                        isActive ? "bg-white/10 border-white/10" : "bg-transparent border-transparent hover:bg-white/5"
                      }`}
                    >
                      <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-gray-500"}`} />
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs truncate ${isActive ? "text-white font-medium" : "text-gray-300"}`}>
                          {chat.title}
                        </div>
                        <div className="text-[10px] text-gray-500 truncate">
                          {new Date(chat.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/10 text-gray-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
                {chatHistory.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No chats yet
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <AnimatePresence>
        {!showSidebar && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={() => setShowSidebar(true)}
            className="absolute top-4 left-4 z-30 p-2.5 rounded-xl bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="relative border-b border-white/10 bg-[#050505]/90 backdrop-blur-2xl">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Logo + Title */}
              <div className={`flex items-center gap-4 ${!showSidebar ? 'ml-14 md:ml-0' : ''}`}>
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                  >
                    <Image src="/nervous-cat.jpg" alt="Yapapa" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
                  </motion.div>
                  <div className="flex flex-col">
                    <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                      AI Playground
                    </h1>
                    <div className="flex items-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wide text-white/50">Compare Models</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Model Pills + Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                {selectedModels.length > 0 && (
                  <>
                    <div className="hidden sm:flex items-center gap-2 max-w-md overflow-hidden">
                      <AnimatePresence mode="popLayout">
                        {selectedModels.map((model) => (
                          <motion.div
                            key={model.id}
                            layout
                            initial={{ opacity: 0, scale: 0.85, y: -8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: -8 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="group flex items-center gap-2 pl-2 pr-1.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 rounded-full transition-colors"
                          >
                            {model.logo && (
                              <div className="relative w-4 h-4 rounded-full overflow-hidden bg-white/5">
                                <Image src={model.logo} alt="" fill className="object-cover" unoptimized />
                              </div>
                            )}
                            <span className="text-xs font-medium text-white/90 truncate max-w-[100px]">
                              {model.name.split(':')[0]}
                            </span>
                            <button
                              onClick={() => removeModel(model.id)}
                              className="p-0.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                              title="Remove model"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Mobile: compact model count badge */}
                    <div className="sm:hidden flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-white/80">
                      <span className="text-emerald-400">●</span>
                      {selectedModels.length}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetChat}
                      className="p-2 text-white/50 hover:text-white hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/15 rounded-xl transition-colors"
                      title="Reset chat"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </motion.button>
                  </>
                )}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowModelSelector(true)}
                  disabled={selectedModels.length >= 4}
                  className="relative px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_28px_rgba(59,130,246,0.35)] transition-all overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Model</span>
                  <span className="sm:hidden">Add</span>
                  {selectedModels.length > 0 && (
                    <span className="ml-0.5 text-[10px] font-bold opacity-80">
                      {selectedModels.length}/4
                    </span>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <button
                  onClick={() => setShowModelSelector(true)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-600 rounded-xl font-bold"
                >
                  Select Models to Start
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-6 py-6">
              {sharedMessages.map((msg, idx) => (
                <div key={idx} className="mb-8">
                  <div className="flex justify-end mb-4">
                    <div className="px-4 py-2 bg-blue-600 rounded-lg max-w-2xl">
                      {msg.content}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sessions.map((session) => {
                      const response = session.messages.find((m) => m.role === "assistant");
                      return (
                        <div key={session.id} className="border border-white/10 bg-[#0A0A0A]/90 p-4 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            {session.model.logo && <Image src={session.model.logo} alt="" width={20} height={20} unoptimized />}
                            <span className="text-sm font-semibold">{session.model.name}</span>
                          </div>
                          {session.isTyping ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">Generating...</span>
                            </div>
                          ) : response ? (
                            <div className="text-sm text-gray-300">{response.content}</div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        {sessions.length > 0 && (
          <div className="border-t border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl p-4">
            <div className="max-w-7xl mx-auto flex gap-3">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Enter your prompt..."
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 resize-none outline-none"
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-5 py-3 bg-gradient-to-r from-blue-500 to-violet-600 rounded-xl disabled:opacity-30"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Model Selector Modal */}
      <AnimatePresence>
        {showModelSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowModelSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl rounded-2xl bg-[#0A0A0A]/95 border border-white/10 overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Select AI Model</h2>
                  <button onClick={() => setShowModelSelector(false)} className="p-2 hover:bg-white/10 rounded-xl">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-3 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search models..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredModels.slice(0, 100).map((model: any) => {
                    const isSelected = selectedModels.find(m => m.id === model.id);
                    return (
                      <button
                        key={model.id}
                        onClick={() => addModel(model)}
                        disabled={!!isSelected}
                        className={`flex items-center gap-4 p-4 text-left rounded-xl border transition-all ${
                          isSelected ? 'bg-white/10 border-white/30 cursor-not-allowed' : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                          {model.logo ? <Image src={model.logo} alt="" width={24} height={24} unoptimized /> : <Bot className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{model.name}</p>
                          <p className="text-xs text-gray-500 truncate">{model.id}</p>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
