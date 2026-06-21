import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Send, Loader2, RefreshCw, AlertCircle, Bookmark, Compass, Brain, Trees } from 'lucide-react';

interface AiInsightsViewProps {
  token: string;
}

export default function AiInsightsView({ token }: AiInsightsViewProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chat/Interaction states
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: "Hello! I am your GreenStep AI Sustainability Coach. Ask me how to make your home, diet, or commute more eco-friendly today!" }
  ]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/dashboard/recommendations", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Could not retrieve AI recommendations.");
      const list = await response.json();
      setRecommendations(list);
    } catch (err: any) {
      setError(err.message || "Failed to load coaching plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [token]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatLoading(true);
    
    // Optimistic state
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Gemini API error.");

      setChatHistory(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (err: any) {
      setChatHistory(prev => [...prev, { role: 'ai', text: `Sorry, I hit a slight connection roadblock: ${err.message}. Please verify process.env.GEMINI_API_KEY is active.` }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center space-x-2.5">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <span>AI Coach Insights</span>
          </h1>
          <p className="text-sm text-slate-400">Dynamic carbon recommendation lists and customized action plans driven by Gemini 3.5 Flash.</p>
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl text-xs flex items-center space-x-2 font-mono">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3): Actionable Coach items */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center space-x-2">
            <Bookmark className="w-4 h-4 text-emerald-400" />
            <span>Structured Recommendations Plan</span>
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 text-slate-500 text-xs font-mono bg-slate-950/20 rounded-2xl border border-slate-900">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mb-3" />
              <span>Analyzing carbon footprints calculations...</span>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="border border-dashed border-slate-800 p-12 text-center rounded-2xl text-slate-500 text-xs">
              <Brain className="w-10 h-10 mx-auto text-slate-700 mb-3" />
              <span>No recommendations found. Complete onboarding profiling to generate custom action structures.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div key={rec.id} className="glass-panel p-5 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row sm:items-start justify-between border-slate-850 gap-4 hover:border-emerald-500/20 transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-[10px] font-bold bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 px-2.5 py-0.5 rounded">
                        {rec.recommendationType}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: #{rec.id}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-200 font-medium pr-6">{rec.content}</p>
                  </div>
                  
                  <div className="flex-shrink-0 text-left sm:text-right flex flex-col justify-between py-1.5 border-t sm:border-t-0 border-slate-900 pt-3 sm:pt-0">
                    <span className={`text-[10px] uppercase font-bold tracking-wider block mb-1 ${
                      rec.impactLevel === 'High' ? 'text-emerald-400' : rec.impactLevel === 'Medium' ? 'text-emerald-400/80' : 'text-teal-400'
                    }`}>
                      {rec.impactLevel} Impact Action
                    </span>
                    <span className="text-emerald-400 font-display font-black text-lg block leading-none">
                      -{rec.savedCo2Est} kg <span className="text-xs text-slate-500 font-normal">CO₂ / year</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sponsoring eco quotes */}
          <div className="bg-[#10b981]/5 border border-emerald-500/10 p-5 rounded-xl flex items-start space-x-4">
            <Trees className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wide mb-1">Global Sustainability Tip</h4>
              <p className="text-xs text-slate-300 leading-relaxed">Adopting standard LED light fixtures and committing to single vegetarian commute swaps can offset roughly the combined weight of 2 mature trees floating in our atmospheres.</p>
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Interactive Coach Chat Console */}
        <div>
          <div className="glass-panel rounded-2xl border-emerald-500/10 flex flex-col h-[520px] shadow-lg sticky top-6">
            
            {/* Top info */}
            <div className="p-4 border-b border-slate-900 flex items-center space-x-2.5 bg-[#0b101d]">
              <div className="bg-emerald-600/20 p-1.5 rounded-lg border border-emerald-500/20 text-emerald-400">
                <Brain className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Coach Consultation Mode</h3>
                <span className="text-[9px] text-emerald-400 font-bold bg-[#0d1627]/40">Active real-time neural session</span>
              </div>
            </div>

            {/* Chats stream container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-slate-950/15">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] font-mono text-slate-500 mb-1">
                    {msg.role === 'user' ? 'Me (Eco Stepper)' : 'Coach Gemini'}
                  </span>
                  <div className={`p-3 max-w-[90%] text-xs rounded-2xl leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-500 text-slate-950 font-semibold rounded-tr-none'
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none font-medium'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-center space-x-2 text-slate-500 text-xs font-mono italic">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Coach parsing recommendations...</span>
                </div>
              )}
            </div>

            {/* Text input footer */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-slate-900 bg-[#070b14]/50 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Ask advice: 'How can I cook sustainably?'..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
                className="flex-1 bg-slate-950 text-xs p-2.5 rounded-xl text-white outline-none border border-slate-800 focus:border-emerald-500 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                  chatInput.trim() && !chatLoading
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-slate-800 text-slate-600 border border-slate-705/30'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
}
