import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, Activity, Flame, ShieldAlert, Check, TrendingDown, ArrowRight, Sparkles, Plus, AlertCircle, HeartCrack } from 'lucide-react';
import { CarbonActivity } from '../types.ts';

interface DashboardViewProps {
  token: string;
  onActivityLogged: () => void;
  setActiveTab: (tab: string) => void;
}

export default function DashboardView({ token, onActivityLogged, setActiveTab }: DashboardViewProps) {
  const [stats, setStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<CarbonActivity[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick activity log states
  const [logType, setLogType] = useState('Transport');
  const [logDesc, setLogDesc] = useState('');
  const [logLoading, setLogLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${token}` };

      // Parallelize fetching
      const [statsRes, logsRes, recRes] = await Promise.all([
        fetch("/api/dashboard/stats", { headers }),
        fetch("/api/dashboard/recent-activities", { headers }),
        fetch("/api/dashboard/recommendations", { headers })
      ]);

      if (!statsRes.ok || !logsRes.ok || !recRes.ok) throw new Error("Could not load backend datasets.");

      const statsData = await statsRes.json();
      const logsData = await logsRes.json();
      const recData = await recRes.json();

      setStats(statsData);
      setRecentLogs(logsData);
      setRecommendations(recData);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const handleQuickLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logDesc) return;

    setLogLoading(true);
    setError(null);
    setSuccessMsg(null);

    // Calculate dynamic carbon savings estimate based on selected type
    let defaultCo2 = 1.5;
    let defaultXp = 15;

    if (logType === 'Transport') {
      defaultCo2 = 4.2;
      defaultXp = 25;
    } else if (logType === 'Food') {
      defaultCo2 = 2.1;
      defaultXp = 20;
    } else if (logType === 'Energy') {
      defaultCo2 = 3.6;
      defaultXp = 20;
    } else if (logType === 'Waste') {
      defaultCo2 = 1.2;
      defaultXp = 15;
    } else if (logType === 'Lifestyle') {
      defaultCo2 = 1.8;
      defaultXp = 15;
    }

    try {
      const response = await fetch("/api/dashboard/log-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          activityType: logType,
          description: logDesc,
          co2SavedKg: defaultCo2,
          xpEarned: defaultXp
        })
      });

      const body = await response.json();
      if (!response.ok || body.error) throw new Error(body.error || "Action log failed.");

      setSuccessMsg(`Action logged! Earned +${defaultXp} XP and saved ${defaultCo2}kg CO₂.`);
      setLogDesc('');
      
      // Refresh
      await fetchDashboardData();
      onActivityLogged(); // Notify parent so achievements or profiles sync
      
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setError(err.message || "Could not save carbon activity.");
    } finally {
      setLogLoading(false);
    }
  };

  // No blocking fullscreen loading guard. Dashboard elements will paint immediately with elegant default metrics and update in place.

  // Calculate carbon score color thresholds
  const getScoreColor = (score: number) => {
    if (score >= 800) return "text-emerald-400";
    if (score >= 550) return "text-teal-400";
    if (score >= 350) return "text-orange-400";
    return "text-rose-400";
  };

  const getScoreDescription = (score: number) => {
    if (score >= 800) return "Excellent High Sustainability Index. Fully carbon optimized.";
    if (score >= 550) return "Good Sustainable standing. Minor optimizations possible.";
    if (score >= 350) return "Moderate emissions. Highlighted sectors require green actions.";
    return "High Carbon Footprint. Highly advisable to adopt Gemini coach suggestions.";
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header title */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">Carbon Dashboard</h1>
        <p className="text-sm text-slate-400">Verifiably record daily sustainable swaps and scale your eco streaks.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl text-xs flex items-center space-x-2 font-mono">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of central stats metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Score indicator */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Estimated Eco Score</span>
          <div className={`text-3xl font-display font-black leading-none mb-1.5 ${getScoreColor(stats?.score || 600)}`}>
            {stats?.score || 600} <span className="text-sm text-slate-500 font-normal">/ 1000</span>
          </div>
          <span className="text-[11px] text-slate-400 block line-clamp-2 leading-relaxed">{getScoreDescription(stats?.score || 600)}</span>
        </div>

        {/* Estimated footprint */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-400">
            <TrendingDown className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Annual Footprint CO₂</span>
          <div className="text-3xl font-display font-semibold text-[#f8fafc] leading-none mb-1.5">
            {stats?.co2Emissions?.toLocaleString() || "3,200"} <span className="text-sm text-slate-500 font-normal">kg</span>
          </div>
          <span className="text-[11px] text-slate-400 block line-clamp-1 leading-relaxed">Sustainable target is below 2,000 kg.</span>
        </div>

        {/* Experience points block */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Sustainability XP</span>
          <div className="text-3xl font-display font-semibold text-[#f8fafc] leading-none mb-1.5">
            {stats?.xp || 25} <span className="text-xs text-emerald-400 font-mono">XP</span>
          </div>
          <span className="text-[11px] text-slate-400 block line-clamp-1 leading-relaxed">Level: <span className="text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-900/40 px-1 py-0.5 rounded-md text-[10px]">{stats?.xpLevel || "Green Beginner"}</span></span>
        </div>

        {/* Active streaks */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-yellow-500/10 p-2 rounded-xl border border-yellow-500/20 text-yellow-500">
            <Flame className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Active Eco Streak</span>
          <div className="text-3xl font-display font-semibold text-[#f8fafc] leading-none mb-1.5">
            {stats?.streakDays || 0} <span className="text-sm text-slate-500 font-normal">days</span>
          </div>
          <span className="text-[11px] text-slate-400 block leading-relaxed">Log entries tomorrow to grow your streak!</span>
        </div>
      </div>

      {/* Main dashboard splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Logging activity and Recent actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick carbon log form */}
          <div className="glass-panel p-6 rounded-2xl border-emerald-500/10 shadow-lg relative glow-green">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/30">
              <div className="flex items-center space-x-2.5">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h2 className="font-display font-bold text-white text-base">Record Eco-Saving Action</h2>
              </div>
              <span className="text-[10px] font-bold text-slate-500 font-mono">DURABLE CLOUD STORAGE</span>
            </div>

            {successMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3.5 rounded-xl text-xs mb-4 flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleQuickLog} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {['Transport', 'Food', 'Energy', 'Waste', 'Lifestyle'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setLogType(type)}
                    className={`text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer ${
                      logType === type
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 font-mono">Action description</label>
                <input
                  type="text"
                  placeholder="e.g. Swapped auto petrol car ride with MRT Train, ate a fully organic vegan lunch"
                  value={logDesc}
                  onChange={(e) => setLogDesc(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>Calculated impact: <strong className="text-emerald-400 font-mono text-[11px]">{logType === 'Transport' ? '4.2' : logType === 'Energy' ? '3.6' : '1.5'} kg CO₂</strong> saved.</span>
                <button
                  id="dashboard-log-submit"
                  type="submit"
                  disabled={!logDesc || logLoading}
                  className={`font-semibold px-4 py-2 text-xs rounded-xl transition-all flex items-center space-x-1 cursor-pointer ${
                    logDesc && !logLoading
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
                  }`}
                >
                  <span>Log Swap</span>
                </button>
              </div>
            </form>
          </div>

          {/* Recent logged activities */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="font-display font-semibold text-[#f8fafc] mb-4 text-sm flex items-center space-x-2">
              <span>My Carbon Action Stream</span>
            </h3>

            {recentLogs.length === 0 ? (
              <div className="border border-dashed border-slate-800 text-center py-10 rounded-xl text-slate-500 text-xs">
                You haven't logged any carbon saving actions yet. Record one above to kick-start!
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
                {recentLogs.map((log) => (
                  <div key={log.id} className="bg-[#0b101d]/60 border border-slate-900 p-3 rounded-xl flex items-center justify-between text-xs hover:border-slate-800/40 transition-colors">
                    <div className="flex items-center space-x-3 overflow-hidden mr-3">
                      <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/30 text-emerald-400 text-[10px] font-bold font-mono">
                        {log.activityType}
                      </div>
                      <span className="font-medium text-slate-300 truncate">{log.description}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-right flex-shrink-0">
                      <span className="text-[10px] text-slate-500 font-mono">{new Date(log.createdAt).toLocaleDateString()}</span>
                      <div className="text-emerald-400 font-bold font-mono">
                        -{log.co2SavedKg} kg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Gemini coach recommendations summary */}
        <div>
          <div className="glass-panel p-6 rounded-2xl h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/30 mb-4">
                <h3 className="font-display font-medium text-white text-sm flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Coach Action Items</span>
                </h3>
                <span className="bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded text-[9px] text-emerald-400 font-bold">GEMINI 3.5 FLASH</span>
              </div>

              {recommendations.length === 0 ? (
                <div className="border border-dashed border-slate-800 text-center py-16 rounded-xl text-xs text-slate-500">
                  <Sparkles className="w-5 h-5 mx-auto text-emerald-500/40 mb-2 animate-bounce" />
                  Generating personalized sustainability coaching insights...
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.slice(0, 3).map((plan, i) => (
                    <div key={i} className="bg-[#0c1222] p-4 rounded-xl border border-slate-850">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold bg-slate-900 border border-slate-800/60 text-slate-400 px-2 py-0.5 rounded">
                          {plan.recommendationType}
                        </span>
                        <span className={`text-[9px] font-bold uppercase ${
                          plan.impactLevel === 'High' ? 'text-emerald-400' : plan.impactLevel === 'Medium' ? 'text-emerald-400/80' : 'text-teal-400'
                        }`}>
                          {plan.impactLevel} Impact (-{plan.savedCo2Est}kg)
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-medium">{plan.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab('insights')}
              className="w-full text-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 mt-6 flex items-center justify-center space-x-1 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/30 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <span>Explore Full AI Coaching Plans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
