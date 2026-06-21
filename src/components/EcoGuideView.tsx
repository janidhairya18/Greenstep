import { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, Quote, Compass, Trees, Loader2, Sparkles, HelpCircle, CheckCircle } from 'lucide-react';
import { SustainabilityResource } from '../types.ts';

interface EcoGuideProps {
  token: string;
}

export default function EcoGuideView({ token }: EcoGuideProps) {
  const [guides, setGuides] = useState<SustainabilityResource[]>([]);
  const [facts, setFacts] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Focus resource
  const [selectedGuide, setSelectedGuide] = useState<SustainabilityResource | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/eco-guide", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Could not grab guide resources.");
        const data = await response.json();
        
        setGuides(data.guides || []);
        setFacts(data.facts || []);
        setTips(data.tips || []);

        if (data.guides && data.guides.length > 0) {
          setSelectedGuide(data.guides[0]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load guides.");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-32 text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="font-mono text-xs uppercase tracking-widest">Loading Eco resources...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center space-x-2.5">
          <BookOpen className="w-6 h-6 text-emerald-400" />
          <span>Eco Guide Library</span>
        </h1>
        <p className="text-sm text-slate-400">Educate yourself with verified carbon-saving resources and revolving daily climate tips.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl text-xs flex items-center space-x-2 font-mono">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid displays */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3): Guide List and Select Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Guide List panel */}
            <div className="glass-panel p-5 rounded-2xl space-y-3.5 max-h-[460px] overflow-y-auto custom-scrollbar">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-2">Sustainable Articles</h3>
              {guides.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGuide(g)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between group ${
                    selectedGuide?.id === g.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-white'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-[10px] font-bold uppercase font-mono tracking-wide bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                      {g.category}
                    </span>
                    <span className="text-emerald-400 font-bold font-mono">-{g.co2Savings}kg CO₂</span>
                  </div>
                  <span className="font-semibold text-sm leading-snug group-hover:text-emerald-350">{g.title}</span>
                </button>
              ))}
            </div>

            {/* Selected detail panel description */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-slate-850 h-[460px] overflow-y-auto custom-scrollbar">
              {selectedGuide ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <span className="text-[10px] font-bold uppercase bg-slate-905 bg-slate-950 border px-2 py-0.5 rounded text-slate-405 text-emerald-400 border-emerald-900/40">
                      {selectedGuide.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Article #{selectedGuide.id}</span>
                  </div>

                  <h3 className="font-display font-bold text-[#f8fafc] text-lg leading-tight">
                    {selectedGuide.title}
                  </h3>

                  <p className="text-xs leading-relaxed text-slate-300 font-light font-sans whitespace-pre-line">
                    {selectedGuide.content}
                  </p>
                </div>
              ) : (
                <div className="text-center py-20 text-slate-500 text-xs">
                  Select an article to explore full guides.
                </div>
              )}
              
              {selectedGuide && (
                <div className="bg-emerald-950/20 border border-emerald-900/30 p-3.5 rounded-xl text-[11px] text-emerald-300 font-semibold flex items-center space-x-2 mt-4">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Doing this saves roughly {selectedGuide.co2Savings}kg CO₂ annually per person.</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column (1/3): Factoids & Tips lists */}
        <div className="space-y-6">
          
          {/* Factoids */}
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-emerald-500/10 p-2 rounded-xl text-emerald-400">
              <Quote className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono mb-4">Did You Know?</h3>
            <div className="space-y-4 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
              {facts.map((fact, idx) => (
                <p key={idx} className="text-xs text-slate-300 leading-relaxed font-light pl-3 border-l-2 border-emerald-500/20">
                  {fact}
                </p>
              ))}
            </div>
          </div>

          {/* Daily revolving sustainable tips */}
          <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-teal-500/10 p-2 rounded-xl text-teal-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-505 text-slate-500 font-mono mb-4">Daily Quick Tips</h3>
            <div className="space-y-3.5 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
              {tips.map((tip, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-slate-305">
                  <span className="text-emerald-400 text-xs mt-0.5">•</span>
                  <span className="text-slate-300 font-medium leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
