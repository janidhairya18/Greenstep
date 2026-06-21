import { useState, useEffect } from 'react';
import { User, Award, Flame, Zap, ShieldAlert, Sparkles, TrendingDown, BookOpen, Clock, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { CarbonActivity } from '../types.ts';

interface ProfileViewProps {
  token: string;
}

export default function ProfileView({ token }: ProfileViewProps) {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<'weekly' | 'monthly'>('weekly');

  const fetchProfileDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile/full", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Could not load carbon profile details.");
      const data = await response.json();
      setProfileData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, [token]);

  if (loading && !profileData) {
    return (
      <div className="flex flex-col items-center justify-center p-32 text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="font-mono text-xs uppercase tracking-widest">Loading Carbon Profile...</span>
      </div>
    );
  }

  const profile = profileData?.profile || { xp: 0, carbonScore: 600, ecoStreak: 0, sustainabilityLevel: "Green Beginner" };
  const user = profileData?.user || { displayName: "Eco Stepper", email: "user@greenstep.org" };
  const badgesList = profileData?.badges || [];
  const activities = profileData?.recentActivities || [];
  const chartData = profileData?.charts || { weekly: [], monthly: [] };

  // Calculate dynamic SVG sizing for our premium charts
  const maxVal = chartMode === 'weekly' 
    ? Math.max(1, ...chartData.weekly.map((d: any) => d.co2Saved))
    : Math.max(1, ...chartData.monthly.map((d: any) => d.co2Saved));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Profile card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-emerald-500/10 shadow-lg relative glow-green overflow-hidden">
        <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-2xl shadow-inner relative">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'E'}
              <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-slate-950 p-1 rounded-full border-2 border-[#090d16]">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>
            
            <div>
              <span className="bg-emerald-950/40 border border-emerald-950 text-emerald-400 px-3 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest leading-none block w-max mb-1.5 font-mono">
                {profile.sustainabilityLevel}
              </span>
              <h2 className="font-display font-black text-2xl text-white leading-tight">{user.displayName || "Anonymous Eco Stepper"}</h2>
              <span className="text-xs text-slate-400 font-medium font-mono">{user.email}</span>
            </div>
          </div>

          <div className="flex items-center space-x-6 border-t sm:border-t-0 border-slate-900 pt-4 sm:pt-0 w-full sm:w-auto justify-around sm:justify-end">
            <div className="text-center sm:text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Impact Level Score</span>
              <div className="text-2xl font-display font-bold text-emerald-400 leading-none">{profile.carbonScore} <span className="text-xs text-slate-500 font-normal">/ 1000</span></div>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">XP Achieved</span>
              <div className="text-2xl font-display font-bold text-white leading-none">{profile.xp} <span className="text-xs text-slate-500 font-normal">XP</span></div>
            </div>

            <div className="text-center sm:text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Active Streak</span>
              <div className="text-2xl font-display font-bold text-yellow-500 leading-none">{profile.ecoStreak} <span className="text-xs text-slate-500 font-normal">Days</span></div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl text-xs flex items-center space-x-2 font-mono">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3): SVG Charts and Recent Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Custom SVG Carbon Savings Chart panel */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/30 mb-6">
              <div>
                <h3 className="font-display font-bold text-[#f8fafc] text-sm flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <span>Verified Carbon Reductions Trend</span>
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">ESTIMATED CO₂ SAVED IN KG</span>
              </div>

              {/* Mode switch */}
              <div className="flex bg-[#0b101d] rounded-xl p-1 border border-slate-900 text-[10px] font-bold uppercase font-mono">
                <button
                  onClick={() => setChartMode('weekly')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    chartMode === 'weekly' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setChartMode('monthly')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    chartMode === 'monthly' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Simulated premium custom SVG Bar-chart visualization */}
            <div className="h-[200px] w-full flex items-end justify-between px-3 border-b border-l border-slate-800/40 pb-2 relative font-mono pt-4 select-none">
              
              {/* Background metrics guidelines */}
              <div className="absolute top-1/4 left-0 w-full border-t border-slate-900 border-dashed pointer-events-none" />
              <div className="absolute top-2/4 left-0 w-full border-t border-slate-900 border-dashed pointer-events-none" />
              <div className="absolute top-3/4 left-0 w-full border-t border-slate-900 border-dashed pointer-events-none" />

              {chartMode === 'weekly' ? (
                chartData.weekly.map((d: any, i: number) => {
                  const percentHeight = Math.max(10, Math.min(95, Math.round((d.co2Saved / maxVal) * 90)));
                  return (
                    <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group px-2.5">
                      <span className="text-[10px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                        {d.co2Saved}kg
                      </span>
                      <div
                        className="w-full bg-gradient-to-t from-emerald-600/40 to-emerald-400 rounded-t-lg transition-all duration-300 hover:brightness-110 shadow-lg group-hover:shadow-emerald-500/20"
                        style={{ height: `${percentHeight}%` }}
                      />
                      <span className="text-[10px] text-slate-400 mt-2 font-semibold">
                        {d.day}
                      </span>
                    </div>
                  );
                })
              ) : (
                chartData.monthly.map((d: any, i: number) => {
                  const percentHeight = Math.max(10, Math.min(95, Math.round((d.co2Saved / maxVal) * 91)));
                  return (
                    <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group px-2.5">
                      <span className="text-[10px] font-bold text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                        {d.co2Saved}kg
                      </span>
                      <div
                        className="w-full bg-gradient-to-t from-teal-600/40 to-teal-400 rounded-t-lg transition-all duration-300 hover:brightness-110 shadow-lg group-hover:shadow-teal-500/20"
                        style={{ height: `${percentHeight}%` }}
                      />
                      <span className="text-[10px] text-slate-400 mt-2 font-semibold">
                        {d.month}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-3.5 px-1 bg-[#0b101d]/10 py-2 rounded-lg">
              <span>Metric Standard factor: ESG carbon savings values verified by Drizzle Schema pool.</span>
              <span>100% cloud persistent data</span>
            </div>
          </div>

          {/* Historical detailed registered activities table list */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="font-display font-semibold text-white mb-4 text-sm">Carbon Action Ledger Stream</h3>
            {activities.length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-xl py-12 text-center text-xs text-slate-500">
                You haven't logged any sustainable historical actions.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono tracking-wider">
                      <th className="pb-3 font-semibold">Action Mode</th>
                      <th className="pb-3 font-semibold pl-4">Description</th>
                      <th className="pb-3 font-semibold text-right pr-4">XP Reward</th>
                      <th className="pb-3 font-semibold text-right">Offset co2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((act: any) => (
                      <tr key={act.id} className="border-b border-slate-850 hover:bg-slate-900/10 transition-colors">
                        <td className="py-3.5">
                          <span className="bg-slate-950 border border-slate-800 text-slate-400 text-[9px] font-bold font-mono px-2 py-0.5 rounded">
                            {act.activityType}
                          </span>
                        </td>
                        <td className="py-3.5 pl-4 text-slate-205 font-light max-w-xs truncate">{act.description}</td>
                        <td className="py-3.5 text-right font-bold pr-4 font-mono text-emerald-400">+{act.xpEarned} XP</td>
                        <td className="py-3.5 text-right font-black font-mono text-[#f8fafc]">-{act.co2SavedKg} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3): Collectible Earned Badges block */}
        <div>
          <div className="glass-panel p-6 rounded-2xl h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/30 pb-4 mb-4">
                <h3 className="font-display font-medium text-white text-sm flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span>My Collectible Badges</span>
                </h3>
                <span className="bg-[#1e293b] text-slate-400 font-mono text-[10px] px-2 py-0.5 rounded-md">
                  {badgesList.length} Earned
                </span>
              </div>

              {badgesList.length === 0 ? (
                <div className="border border-dashed border-slate-800 py-16 text-center text-xs text-slate-500 rounded-xl">
                  <Award className="w-6 h-6 text-slate-700 mx-auto mb-2" />
                  <span>No eco badges unlocked yet. Join sustainable challenges and complete streaks daily to unlock accolades!</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3.5">
                  {badgesList.map((badge: any) => (
                    <div
                      key={badge.id}
                      className="bg-[#0b101c]/80 border border-slate-850 p-3.5 rounded-xl text-center hover:border-yellow-550 hover:scale-[1.02] transition-all group flex flex-col justify-between relative overflow-hidden"
                    >
                      <div className="absolute top-1 right-1 text-[9px] text-slate-500 font-mono">id: #{badge.id}</div>
                      <div>
                        {/* Display badge icon */}
                        <div className="text-3xl mx-auto my-2.5 filter drop-shadow-[0_0_8px_rgba(234,179,8,0.2)] group-hover:scale-110 transition-transform">
                          {badge.icon || "🏆"}
                        </div>
                        <h4 className="font-bold text-xs text-white leading-tight mt-1">{badge.name}</h4>
                        <p className="text-[9px] text-slate-400 mt-1 line-clamp-2 leading-relaxed font-light">
                          {badge.description}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold text-yellow-500 bg-yellow-950/20 px-2 py-0.5 rounded-md mt-2.5 block w-max mx-auto border border-yellow-900/30 font-mono">
                        +{badge.xpReward} XP Gift
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-900 pt-5 mt-6 text-center text-[10px] text-slate-500 font-light font-mono">
              GreenStep Badges program is deployed securely.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
