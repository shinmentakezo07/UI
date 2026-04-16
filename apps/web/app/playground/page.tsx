"use client";

import { motion, useMotionValue, useTransform, useMotionTemplate, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, Settings, MessageSquare, Send, Loader2, X, ChevronDown, Check, User, Bot, Copy, ThumbsUp, ThumbsDown, RotateCcw, Terminal, Zap, Activity } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import openRouterModels from "../models/openrouter-models-2026.json";
import { getProviderLogo } from "@/lib/provider-logos";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  modelId?: string;
}

interface ChatSession {
  id: string;
  model: any;
  messages: Message[];
  isTyping: boolean;
}

export default function PlaygroundPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedModels, setSelectedModels] = useState<any[]>([]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sharedMessages, setSharedMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

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
    setSharedMessages([]);
    setSessions(sessions.map(s => ({ ...s, messages: [], isTyping: false })));
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || selectedModels.length === 0 || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setSharedMessages([...sharedMessages, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Set all sessions to typing
    setSessions(sessions.map(s => ({ ...s, isTyping: true })));

    // Simulate API calls with different delays for each model
    selectedModels.forEach((model, index) => {
      const delay = 800 + (index * 300) + Math.random() * 500;
      setTimeout(() => {
        const assistantMessage: Message = {
          role: "assistant",
          content: `This is a simulated response from ${model.name}. In production, this would connect to the actual OpenRouter API.\n\nThe model would process your prompt: "${userMessage.content}" and return a real response based on its capabilities.`,
          timestamp: new Date(),
          modelId: model.id,
        };

        setSessions(prevSessions => 
          prevSessions.map(s => 
            s.id === model.id 
              ? { ...s, messages: [...s.messages, assistantMessage], isTyping: false }
              : s
          )
        );

        // Check if all models finished
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

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      {/* Cyberpunk Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Dynamic Spotlight */}
        <motion.div 
          className="absolute inset-0 opacity-20"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                600px circle at ${mouseX}px ${mouseY}px,
                rgba(59,130,246,0.08),
                transparent 80%
              )
            `
          }}
        />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)]" />
        
        {/* Corner Brackets */}
        <div className="absolute top-10 left-10 w-16 h-16 border-l-2 border-t-2 border-white/10 rounded-tl-2xl" />
        <div className="absolute top-10 right-10 w-16 h-16 border-r-2 border-t-2 border-white/10 rounded-tr-2xl" />
        <div className="absolute bottom-10 left-10 w-16 h-16 border-l-2 border-b-2 border-white/10 rounded-bl-2xl" />
        <div className="absolute bottom-10 right-10 w-16 h-16 border-r-2 border-b-2 border-white/10 rounded-br-2xl" />
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Glass Header */}
        <div className="border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/10 border border-white/20">
                    <Terminal className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold tracking-tight">AI Playground</h1>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">Compare Models</p>
                  </div>
                </div>
                {selectedModels.length > 0 && (
                  <>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                      {selectedModels.map((model) => (
                        <motion.div
                          key={model.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-xs group hover:bg-white/10 hover:border-white/20 transition-all"
                        >
                          {model.logo && (
                            <Image src={model.logo} alt="" width={16} height={16} unoptimized />
                          )}
                          <span className="text-gray-300 font-medium">{model.name.split(':')[0]}</span>
                          <button
                            onClick={() => removeModel(model.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-white/10"
                          >
                            <X className="w-3 h-3 text-gray-500 hover:text-white" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {sharedMessages.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetChat}
                    className="p-2 hover:bg-white/5 transition-all border border-white/10 hover:border-white/20"
                    title="Reset chat"
                  >
                    <RotateCcw className="w-4 h-4 text-gray-400 hover:text-white" />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModelSelector(true)}
                  className="relative group/btn px-4 py-2 font-mono text-sm font-bold tracking-wider overflow-hidden text-white flex items-center gap-2"
                  title="Add model"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-600 group-hover/btn:from-blue-600 group-hover/btn:to-violet-700 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover/btn:shadow-[0_0_30px_rgba(59,130,246,0.5)]" />
                  <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                  <div className="relative z-10 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Model</span>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 overflow-hidden">
          {sessions.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-3xl px-6 space-y-8"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="group inline-flex items-center gap-3 px-3 py-1.5 rounded bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all cursor-default hover:border-white/30"
                >
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold">
                    <Sparkles className="w-3 h-3" />
                    COMPARE
                  </div>
                  <span className="text-xs font-mono text-gray-400 tracking-wide group-hover:text-white transition-colors">
                    Side-by-side model evaluation
                  </span>
                </motion.div>

                {/* Headline */}
                <div className="space-y-4">
                  <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter leading-[0.9] text-white">
                    Compare AI <br />
                    <span className="relative inline-block">
                      <span className="relative text-white">Models</span>
                      <div className="absolute -inset-2 bg-white/5 blur-xl -z-10" />
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                    Select up to <span className="text-white font-medium">4 models</span> and compare their responses 
                    <span className="text-white font-medium"> side-by-side</span> in 
                    <span className="text-white font-medium"> real-time</span>
                  </p>
                </div>

                {/* CTA Button - Cyber Style */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowModelSelector(true)}
                  className="relative group/btn px-8 py-4 font-mono text-sm font-bold tracking-wider overflow-hidden text-white"
                >
                  {/* Background & Borders */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-600 group-hover/btn:from-blue-600 group-hover/btn:to-violet-700 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover/btn:shadow-[0_0_30px_rgba(59,130,246,0.5)]" />
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-in-out" />

                  {/* Content */}
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Select Models
                  </div>
                </motion.button>

                {/* Stats */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-400 text-sm border-t border-white/5">
                  <span className="uppercase tracking-widest text-[10px] font-mono opacity-50">AVAILABLE</span>
                  <div className="flex gap-8 items-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{allModels.length}+</div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mt-1">Models</div>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">4</div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mt-1">Max Compare</div>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Activity className="w-5 h-5 text-white" />
                        <div className="text-2xl font-bold text-white">Live</div>
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mt-1">Real-Time</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-6 py-8">
                  <div className="space-y-8">
                    {sharedMessages.map((msg, msgIndex) => (
                      <div key={msgIndex} className="space-y-6">
                        {/* User Message */}
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-4"
                        >
                          <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                            <User className="w-5 h-5 text-white/70" />
                          </div>
                          <div className="flex-1 pt-1">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">You</div>
                            <div className="text-sm text-white leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </div>
                          </div>
                        </motion.div>

                        {/* Model Responses Grid */}
                        <div className={`grid gap-4 ${sessions.length === 1 ? 'grid-cols-1' : sessions.length === 2 ? 'grid-cols-1 lg:grid-cols-2' : sessions.length === 3 ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
                          {sessions.map((session) => {
                            const response = session.messages.find(m => m.role === 'assistant' && sharedMessages.indexOf(msg) === msgIndex);
                            return (
                              <motion.div 
                                key={session.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative border border-white/10 bg-[#0A0A0A]/90 backdrop-blur-xl p-5 hover:border-white/20 transition-all group/response"
                              >
                                {/* Corner Accents */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />

                                {/* Model Header */}
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    {session.model.logo ? (
                                      <Image src={session.model.logo} alt="" width={16} height={16} unoptimized />
                                    ) : (
                                      <Bot className="w-4 h-4 text-gray-500" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs font-medium text-white truncate">{session.model.name}</div>
                                    <div className="text-[10px] font-mono text-white/40 truncate">{session.model.id}</div>
                                  </div>
                                  {session.isTyping && (
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                      <span className="text-[10px] font-mono text-white/60">Processing</span>
                                    </div>
                                  )}
                                </div>

                                {/* Response Content */}
                                {session.isTyping ? (
                                  <div className="flex items-center gap-3 text-gray-500 py-4">
                                    <Loader2 className="w-4 h-4 animate-spin text-white/70" />
                                    <span className="text-sm font-mono text-white/60">Generating response...</span>
                                  </div>
                                ) : response ? (
                                  <div className="space-y-4">
                                    <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                      {response.content}
                                    </div>
                                    <div className="flex items-center gap-1 pt-2 border-t border-white/5">
                                      <button
                                        className="p-2 hover:bg-white/5 transition-all border border-white/10 hover:border-white/20"
                                        title="Copy"
                                        onClick={() => navigator.clipboard.writeText(response.content)}
                                      >
                                        <Copy className="w-3.5 h-3.5 text-gray-500 hover:text-white" />
                                      </button>
                                      <button className="p-2 hover:bg-white/5 transition-all border border-white/10 hover:border-white/20" title="Good response">
                                        <ThumbsUp className="w-3.5 h-3.5 text-gray-500 hover:text-white" />
                                      </button>
                                      <button className="p-2 hover:bg-white/5 transition-all border border-white/10 hover:border-white/20" title="Bad response">
                                        <ThumbsDown className="w-3.5 h-3.5 text-gray-500 hover:text-white" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-600 py-4 font-mono">Waiting for response...</div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </div>

              {/* Input Area - Cyberpunk Glass Style */}
              <div className="border-t border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 py-5">
                  <div className="flex items-end gap-4">
                    <div className="flex-1 relative">
                      {/* Glass Input Container */}
                      <div className="relative border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden hover:border-white/20 transition-all focus-within:border-white/30">
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
                          className="w-full bg-transparent px-5 py-4 text-sm resize-none outline-none placeholder:text-gray-600 text-white"
                          rows={1}
                          style={{ minHeight: '56px', maxHeight: '200px' }}
                        />
                      </div>
                      {/* Character Counter */}
                      <div className="absolute -bottom-5 right-0 text-[10px] font-mono text-white/30">
                        {inputMessage.length} / 4000
                      </div>
                    </div>
                    
                    {/* Send Button - Cyber Style */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isLoading}
                      className="relative group/btn px-6 py-4 font-mono text-sm font-bold tracking-wider overflow-hidden text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-violet-600 group-hover/btn:from-blue-600 group-hover/btn:to-violet-700 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover/btn:shadow-[0_0_30px_rgba(59,130,246,0.5)]" />
                      <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                      <div className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="hidden sm:inline">Processing</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span className="hidden sm:inline">Send</span>
                          </>
                        )}
                      </div>
                    </motion.button>
                  </div>
                  
                  {/* Status Bar */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-4 text-[10px] font-mono text-white/40">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
                        <span>{isLoading ? 'Processing' : 'Ready'}</span>
                      </div>
                      <div className="h-3 w-px bg-white/10" />
                      <span>{sessions.length} Model{sessions.length !== 1 ? 's' : ''} Active</span>
                    </div>
                    <div className="text-[10px] font-mono text-white/40">
                      Press Enter to send • Shift+Enter for new line
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Model Selector Modal - Cyberpunk Glass Style */}
      <AnimatePresence>
        {showModelSelector && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-3xl rounded-2xl bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 ring-1 ring-white/5 overflow-hidden max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 bg-black/40">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/10 border border-white/20">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold tracking-tight">Select AI Model</h2>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-white/40">
                        {filteredModels.length} Available • Max 4
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModelSelector(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-all border border-white/10 hover:border-white/20"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or provider..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-white/30 focus:bg-black/40 transition-all placeholder:text-gray-600"
                    autoFocus
                  />
                </div>
              </div>
              
              {/* Model List */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredModels.slice(0, 100).map((model) => {
                    const isSelected = selectedModels.find(m => m.id === model.id);
                    return (
                      <motion.button
                        key={model.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => addModel(model)}
                        disabled={!!isSelected}
                        className={`relative group/card flex items-center gap-4 p-4 transition-all text-left ${
                          isSelected
                            ? 'bg-white/10 border border-white/30 cursor-not-allowed'
                            : 'hover:bg-white/5 border border-white/10 hover:border-white/20'
                        }`}
                      >
                        {/* Logo */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                          isSelected 
                            ? 'bg-white/10 border border-white/30' 
                            : 'bg-white/5 border border-white/10 group-hover/card:border-white/20'
                        }`}>
                          {model.logo ? (
                            <Image src={model.logo} alt="" width={24} height={24} unoptimized />
                          ) : (
                            <Bot className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-white">{model.name}</p>
                          <p className="text-xs text-gray-500 truncate font-mono">{model.id}</p>
                        </div>
                        
                        {/* Metadata */}
                        <div className="flex items-center gap-4 shrink-0">
                          {model.context_length && (
                            <div className="text-center">
                              <div className="text-xs font-bold text-white">
                                {(model.context_length / 1000).toFixed(0)}K
                              </div>
                              <div className="text-[9px] font-mono text-white/40">Context</div>
                            </div>
                          )}
                          {isSelected && (
                            <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/40 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/10 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                      </motion.button>
                    );
                  })}
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-black/40">
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
                  <span>Scroll for more models</span>
                  <span>{selectedModels.length} / 4 Selected</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
