import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Send, Sparkles, User, RefreshCw, MessageSquare, 
  HelpCircle, CheckCircle2, ChevronRight, Database, AlertCircle 
} from 'lucide-react';
import { getAssistantSuggestions, sendAssistantMessage } from '../services/api';
import { ChatMessage } from '../types';

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Hello! I am your AI Water Resources Assistant. I analyze live municipal records across all 5 zones (A–E) and sectors (Residential, Commercial, Industrial, Agriculture, Institutional). How can I assist your operations today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'Municipal Water Records (9,075 records)',
      suggestedFollowUps: [
        'Which zone consumes the most water?',
        'What is the current average reservoir level?',
        'Show me high-risk anomalies detected today',
        'Compare residential vs industrial consumption'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSuggestions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadSuggestions = async () => {
    try {
      const res = await getAssistantSuggestions();
      setSuggestions(res.suggestions || []);
    } catch (err) {
      console.error('Failed to load suggestions', err);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const resp = await sendAssistantMessage(text);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: resp.response || resp.reply || '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: resp.source || (resp.sources ? resp.sources[0] : undefined),
        suggestedFollowUps: resp.suggestedFollowUps || resp.suggested_followups
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: 'Sorry, I encountered an error communicating with the water intelligence engine. Please ensure the backend server is running.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: 'Conversation cleared. What would you like to investigate next from the municipal dataset?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedFollowUps: [
          'What is the next-day demand prediction?',
          'How does rainfall impact consumption?',
          'Which sector has the highest demand?'
        ]
      }
    ]);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Water Intelligence Assistant</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300">
                Ground-Truth AI
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Query municipal water records, environmental metrics, forecasts, and balance statistics in natural language.
            </p>
          </div>
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
        >
          <RefreshCw className="w-4 h-4" />
          Clear Chat
        </button>
      </div>

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat History and Input Area */}
        <div className="lg:col-span-3 flex flex-col h-[650px] bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-cyan-600 dark:bg-cyan-500 flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-tl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  
                  {/* Source Citation for Assistant */}
                  {msg.source && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Database className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Source: {msg.source}</span>
                    </div>
                  )}

                  {/* Follow-up suggestions */}
                  {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 space-y-1.5">
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-500" /> Suggested queries:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedFollowUps.map((fu, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSend(fu)}
                            className="text-xs px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 rounded-lg text-left transition flex items-center gap-1"
                          >
                            <span>{fu}</span>
                            <ChevronRight className="w-3 h-3 opacity-60" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-blue-100 text-right' : 'text-slate-400 text-left'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 flex-shrink-0 mt-1 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white flex-shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-700/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                  Querying municipal database & ML pipeline...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about water demand, zones, sectors, anomalies, reservoir levels..."
                disabled={loading}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading}
                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-medium rounded-xl transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar: Suggestions & Info */}
        <div className="space-y-6">
          {/* Quick Prompts */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              Operational Queries
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any question below to immediately interrogate the 9,075-row municipal dataset:
            </p>
            <div className="space-y-2">
              {suggestions.length > 0 ? (
                suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(sug)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 text-xs text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700 transition group flex items-start gap-2"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-500 group-hover:translate-x-0.5 transition flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{sug}</span>
                  </button>
                ))
              ) : (
                <div className="text-xs text-slate-400 py-2">Loading suggestions...</div>
              )}
            </div>
          </div>

          {/* Architecture Note */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              Factual Grounding
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This assistant executes deterministic analytics directly on the active dataset in memory. It computes exact zone sums, environmental regressions, and ML predictions without fabricating values.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              Dataset: 9,075 records &bull; 5 Zones &bull; 5 Sectors &bull; AI Water Intelligence Engine
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
