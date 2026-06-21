import { useState, useEffect } from 'react';
import { Trophy, AlertCircle, Loader2, RefreshCw, Medal, Leaf, Search, Sparkles } from 'lucide-react';

interface LeaderboardViewProps {
  token: string;
}

export default function LeaderboardView({ token }: LeaderboardViewProps) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRankings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/leaderboard", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Could not retrieve leaderboard rankings.");
      const list = await response.json();
      setLeaderboard(list);
    } catch (err: any) {
      setError(err.message || "Failed to load rankings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [token]);

  const filtered = leaderboard.filter(item =>
    item.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center space-x-2.5">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>Community Leaderboard</span>
          </h1>
          <p className="text-sm text-slate-400">Compete with global eco-warriors and scale rankings through active sustainable logs.</p>
        </div>
        <button
          onClick={fetchRankings}
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

      {/* Main Container */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        
        {/* Search and Quick Metric headers */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search eco warriors by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl py-3 pl-9 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-mono bg-[#0b101d] px-3.5 py-2 rounded-xl border border-slate-900 flex items-center space-x-1.5 select-none">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span>Updates every 10 minutes</span>
          </div>
        </div>

        {/* Podiums (Top 3 quick display visualization) */}
        {filtered.length >= 3 && !searchQuery && (
          <div className="grid grid-cols-3 gap-3 pt-4 pb-6 border-b border-slate-900">
            
            {/* 2nd Place */}
            <div className="bg-[#0b101c]/40 border border-slate-900 rounded-2xl p-4 text-center mt-6 relative order-1">
              <div className="absolute top-2 left-2 text-[10px] text-slate-500 font-bold font-mono">#2</div>
              <Medal className="w-6 h-6 text-slate-300 mx-auto mb-2 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]" />
              <h3 className="text-white font-bold text-xs truncate max-w-full leading-tight">{filtered[1].displayName}</h3>
              <p className="text-emerald-400 font-bold text-xs font-mono mt-1">+{filtered[1].xp} XP</p>
            </div>

            {/* 1st Place */}
            <div className="bg-emerald-950/10 border-2 border-yellow-500/30 rounded-2xl p-4 text-center relative order-2 glow-green scale-105">
              <div className="absolute top-2 left-2 text-[10px] text-yellow-500 font-bold font-mono">🏆 #1</div>
              <Medal className="w-8 h-8 text-yellow-500 mx-auto mb-2 filter drop-shadow-[0_0_12px_rgba(234,179,8,0.25)]" />
              <h3 className="text-white font-black text-sm truncate max-w-full leading-tight">{filtered[0].displayName}</h3>
              <p className="text-yellow-500 font-bold text-xs font-mono mt-1">+{filtered[0].xp} XP</p>
            </div>

            {/* 3rd Place */}
            <div className="bg-[#0b101c]/40 border border-slate-900 rounded-2xl p-4 text-center mt-10 relative order-3">
              <div className="absolute top-2 left-2 text-[10px] text-slate-500 font-bold font-mono">#3</div>
              <Medal className="w-6 h-6 text-amber-600 mx-auto mb-2 filter drop-shadow-[0_0_8px_rgba(217,119,6,0.15)]" />
              <h3 className="text-white font-bold text-xs truncate max-w-full leading-tight">{filtered[2].displayName}</h3>
              <p className="text-emerald-400 font-bold text-xs font-mono mt-1">+{filtered[2].xp} XP</p>
            </div>

          </div>
        )}

        {/* List Table */}
        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No rankings logged matches search criteria.
          </div>
        ) : (
          <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
            {filtered.map((row) => (
              <div
                key={row.userId}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-xs transition-colors ${
                  row.rank === 1
                    ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-100 font-bold'
                    : 'bg-[#0f172a]/40 border-slate-900/60 text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className={`font-mono text-xs font-black p-2 w-8 text-center rounded-lg ${
                    row.rank === 1 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-slate-950 text-slate-500'
                  }`}>
                    #{row.rank}
                  </span>
                  
                  <span className="font-medium text-slate-200">{row.displayName}</span>
                </div>

                <div className="flex items-center space-x-6 font-mono text-right">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Carbon Score</span>
                    <strong className="text-emerald-400 font-black">{row.carbonScore}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">XP points</span>
                    <strong className="text-white font-black">+{row.xp}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
