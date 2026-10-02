import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X, Send, Bot, User, ArrowRight, RefreshCw, MessageSquare } from "lucide-react";
import { queryGlobalAssistant } from "../services/aiAgentService.js";

export default function AIAssistantWidget({ mode = "student" }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "m_init",
      sender: "ai",
      text: "Hi! I am **CampusCare AI Agent**. How can I help you today with complaints, lost & found, cafeteria, syllabus, or campus facilities?",
      suggestedPrompts: [
        "File complaint for broken AC",
        "Search lost laptop bag",
        "Cafeteria menu today",
        "Syllabus study guide"
      ],
      time: "Just now"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const prompt = textToSend || input;
    if (!prompt.trim() || loading) return;

    const userMsg = {
      id: `u_${Date.now()}`,
      sender: "user",
      text: prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const response = await queryGlobalAssistant(prompt, messages, mode);
      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: response.text,
        action: response.action,
        suggestedPrompts: response.suggestedPrompts,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI Agent query error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-neutral-900 via-neutral-800 to-indigo-950 text-white rounded-full shadow-2xl hover:shadow-indigo-900/40 hover:scale-105 transition-all duration-300 border border-white/20"
          aria-label="CampusCare AI Assistant"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-neutral-900 animate-ping" />
          </div>
          <span className="text-xs font-bold tracking-wide pr-1">Campus AI Agent</span>
        </button>
      </div>

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-22 right-4 md:right-8 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[580px] h-[520px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-neutral-200/80 flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-4 bg-neutral-900 text-white flex items-center justify-between border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold flex items-center gap-1.5 leading-tight">
                  CampusCare AI Copilot
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-semibold">v2.5 AI</span>
                </h3>
                <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Always Active
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-medium bg-neutral-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "ai" && (
                  <div className="w-7 h-7 rounded-xl bg-neutral-900 text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-indigo-300" />
                  </div>
                )}

                <div className={`max-w-[82%] space-y-2`}>
                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      m.sender === "user"
                        ? "bg-neutral-900 text-white rounded-br-none shadow-sm"
                        : "bg-white text-neutral-800 rounded-bl-none border border-neutral-200/80 shadow-sm"
                    }`}
                  >
                    {m.text}

                    {/* Interactive Action Button */}
                    {m.action && (
                      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center">
                        <button
                          onClick={() => handleActionClick(m.action.path)}
                          className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-2 transition-all shadow-xs"
                        >
                          {m.action.label} <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Suggested Prompts */}
                  {m.suggestedPrompts && m.suggestedPrompts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggestedPrompts.map((sp, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(sp)}
                          className="text-[10px] font-semibold bg-white hover:bg-indigo-50 text-indigo-700 hover:text-indigo-900 border border-indigo-200/70 px-2.5 py-1 rounded-full transition-all flex items-center gap-1 shadow-2xs"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-indigo-500" /> {sp}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className={`text-[9px] text-neutral-400 px-1 ${m.sender === "user" ? "text-right" : "text-left"}`}>
                    {m.time}
                  </div>
                </div>

                {m.sender === "user" && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-neutral-400 text-xs italic">
                <div className="w-7 h-7 rounded-xl bg-neutral-900 text-white flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-4 h-4 text-indigo-300 animate-spin" />
                </div>
                <span>Campus AI Agent is thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-neutral-200/80 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask AI agent anything about campus..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-neutral-100 rounded-xl text-xs text-neutral-900 font-medium placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white rounded-xl transition-all"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
