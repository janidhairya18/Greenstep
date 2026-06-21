import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Award, Clock, Leaf, AlertCircle, CheckCircle2, ChevronRight, Play, Loader2, ArrowLeft, Upload, FileText } from 'lucide-react';
import { Challenge } from '../types.ts';

interface ChallengesViewProps {
  token: string;
  onChallengeDone: () => void;
  onBadgeEarned?: (badge: any) => void;
}

export default function ChallengesView({ token, onChallengeDone, onBadgeEarned }: ChallengesViewProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected Detail View
  const [selectedChallenge, setSelectedChallenge] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchChallenges = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/challenges", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to load challenges from database.");
      const list = await response.json();
      setChallenges(list);
    } catch (err: any) {
      setError(err.message || "Unable to retrieve environmental challenges.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [token]);

  const selectChallengeDetails = async (id: number) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const response = await fetch(`/api/challenges/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Could not grab challenge details.");
      const details = await response.json();
      setSelectedChallenge(details);
    } catch (err: any) {
      setError(err.message || "Failed to query challenge.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/challenges/${id}/join`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Join request failed.");
      
      // Reload details and parent lists
      await selectChallengeDetails(id);
      await fetchChallenges();
    } catch (err: any) {
      setError(err.message || "Failed to commit challenge join.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionNotes.trim() || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const challengeId = selectedChallenge.challenge.id;
      const response = await fetch(`/api/challenges/${challengeId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ actionNotes, proofUrl })
      });

      const body = await response.json();
      if (!response.ok || body.error) throw new Error(body.error || "Submission error.");

      setSuccessMsg(
        body.completed
          ? `Incredible! Challenge Completed! You claimed +${body.rewards?.xpEarned} XP and unlocked ${body.rewards?.newBadge ? body.rewards.newBadge.name : 'new accolade level'}!`
          : "Progress submitted successfully! Staggered challenge completion grew by 25%."
      );
      setActionNotes('');
      setProofUrl('');

      // Invoke badge callback if a new badge was earned
      if (body.rewards?.newBadge && onBadgeEarned) {
        onBadgeEarned(body.rewards.newBadge);
      }

      // Reload
      await selectChallengeDetails(challengeId);
      await fetchChallenges();
      onChallengeDone(); // Propagate up
    } catch (err: any) {
      setError(err.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && challenges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-32 text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="font-mono text-xs uppercase tracking-widest">Loading community challenges...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Detail overlay / panel toggle */}
      <AnimatePresence mode="wait">
        {selectedChallenge ? (
          <motion.div
            key="details-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Header back button */}
            <button
              onClick={() => setSelectedChallenge(null)}
              className="text-slate-400 hover:text-white flex items-center space-x-1.5 text-xs font-bold hover:bg-white/5 py-1.5 px-3 rounded-xl transition-all border border-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Challenges Grid</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left detail card content */}
              <div className="lg:col-span-2 space-y-4">
                <div className="glass-panel p-6 sm:p-8 rounded-2xl relative border-emerald-500/10">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="text-3xl">{selectedChallenge.challenge.icon || "🌱"}</span>
                    <div>
                      <h2 className="font-display font-black text-white text-xl sm:text-2xl leading-tight">
                        {selectedChallenge.challenge.title}
                      </h2>
                      <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1 font-mono">
                        <span className="flex items-center space-x-1"><Award className="w-3.5 h-3.5 text-yellow-500" /> <span>+{selectedChallenge.challenge.rewardXp} XP</span></span>
                        <span className="flex items-center space-x-1"><Clock className="w-3.5 h-3.5 text-slate-500" /> <span>{selectedChallenge.challenge.durationDays} Days</span></span>
                        <span className="flex items-center space-x-1"><Leaf className="w-3.5 h-3.5 text-emerald-400" /> <span>-{selectedChallenge.challenge.rewardCo2Saved} kg Saved</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-slate-350 text-sm leading-relaxed border-t border-slate-800/40 pt-4 font-light">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-400 mb-1 font-mono">Overview</h4>
                      <p>{selectedChallenge.challenge.description}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-400 mb-1 font-mono">My Specific Action Objectives</h4>
                      <p className="bg-slate-950/40 p-4 rounded-xl text-slate-300 font-medium font-sans border border-slate-900 leading-relaxed">
                        {selectedChallenge.challenge.objectives}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-400 mb-1 font-mono">Requirements & Verification criteria</h4>
                      <p className="italic text-xs text-slate-400">
                        {selectedChallenge.challenge.requirements}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submissions History list */}
                {selectedChallenge.progress && (
                  <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 font-mono">My Proof Submissions Log ({selectedChallenge.submissions?.length || 0})</h3>
                    {selectedChallenge.submissions?.length === 0 ? (
                      <div className="text-center p-6 border border-dashed border-slate-800/80 rounded-xl text-slate-500 text-xs font-light">
                        No submissions logged yet. Use the right form to log active evidence.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedChallenge.submissions.map((sub: any) => (
                          <div key={sub.id} className="bg-[#0b101d] border border-slate-900 rounded-xl p-4 text-xs space-y-2">
                            <div className="flex items-center justify-between font-mono text-slate-500 pb-1.5 border-b border-slate-900">
                              <span>Submission ID: #{sub.id}</span>
                              <span>{new Date(sub.submittedAt).toLocaleString()}</span>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{sub.actionNotes}</p>
                            {sub.proofUrl && (
                              <div className="pt-1 flex items-center space-x-1.5 text-emerald-400 hover:underline">
                                <FileText className="w-3.5 h-3.5" />
                                <a href={sub.proofUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] truncate">
                                  {sub.proofUrl}
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right panel: Active progress & Submit section */}
              <div>
                <div className="glass-panel p-6 rounded-2xl h-full flex flex-col justify-between border-slate-800">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 font-mono">My Status</h3>

                    {!selectedChallenge.progress ? (
                      <div className="space-y-4 text-center py-6">
                        <div className="text-xs text-slate-400">You haven't joined this green challenge yet. Join now to gain XP points.</div>
                        <button
                          onClick={() => handleJoinChallenge(selectedChallenge.challenge.id)}
                          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-5 rounded-xl text-xs transition-transform transform active:scale-95 flex items-center justify-center space-x-2"
                        >
                          <Play className="w-4 h-4" />
                          <span>Join Challenge</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        
                        {/* Progress meter */}
                        <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-400">Completion</span>
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              {selectedChallenge.progress.progressPercent}%
                            </span>
                          </div>
                          <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-300" style={{ width: `${selectedChallenge.progress.progressPercent}%` }} />
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2.5 font-mono">
                            <span>Status: <strong className="text-emerald-400 uppercase">{selectedChallenge.progress.status}</strong></span>
                            <span>{selectedChallenge.progress.remainingDays} Days remaining</span>
                          </div>
                        </div>

                        {/* Submit Box (Only visible if active) */}
                        {selectedChallenge.progress.status === 'active' && (
                          <form onSubmit={handleSubmitProgress} className="space-y-4 border-t border-slate-900 pt-5">
                            <h4 className="text-xs font-bold uppercase text-slate-400 mb-2 font-mono">Log Challenge Evidence</h4>
                            
                            {successMsg && (
                              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 p-3.5 rounded-xl text-xs mb-3 flex items-start space-x-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{successMsg}</span>
                              </div>
                            )}

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 font-mono">Action details notes</label>
                              <textarea
                                value={actionNotes}
                                onChange={(e) => setActionNotes(e.target.value)}
                                placeholder="e.g. Cleared 5kg recyclable paper today, sorted for city-collection box."
                                rows={3}
                                className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1 font-mono">
                                {selectedChallenge.challenge.title.toLowerCase() === 'train' ? 'Please give your train ticket image url' :
                                 selectedChallenge.challenge.title.toLowerCase() === 'bike' ? 'Please give your cycle image url' :
                                 selectedChallenge.challenge.title.toLowerCase() === 'leaf' ? 'Please give your meal plate image url' :
                                 selectedChallenge.challenge.title.toLowerCase() === 'zap' ? 'Please give your energy-saving evidence image url' :
                                 'Proof Image / Doc URL (Optional)'}
                              </label>
                              <input
                                type="url"
                                value={proofUrl}
                                onChange={(e) => setProofUrl(e.target.value)}
                                placeholder={selectedChallenge.challenge.title.toLowerCase() === 'train' ? 'http://example.com/my-train-ticket.jpg' :
                                             selectedChallenge.challenge.title.toLowerCase() === 'bike' ? 'http://example.com/my-cycle-trip.jpg' :
                                             selectedChallenge.challenge.title.toLowerCase() === 'leaf' ? 'http://example.com/my-vegan-meal.jpg' :
                                             selectedChallenge.challenge.title.toLowerCase() === 'zap' ? 'http://example.com/lights-off.jpg' :
                                             'http://example.com/my-proof-evidence.jpg'}
                                className="w-full text-xs bg-slate-950 border border-slate-850 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-400 transition-colors"
                              />
                            </div>

                            <button
                              id="challenge-submit-button"
                              type="submit"
                              disabled={!actionNotes.trim() || submitting}
                              className={`w-full font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                                actionNotes.trim() && !submitting
                                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-705/50'
                              }`}
                            >
                              {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  <span>Submit verified Progress (Gain 25%)</span>
                                </>
                              )}
                            </button>
                          </form>
                        )}

                        {selectedChallenge.progress.status === 'completed' && (
                          <div className="bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 p-4 rounded-xl text-xs text-center border-dashed font-sans">
                            <CheckCircle2 className="w-6 h-6 text-emerald-450 text-emerald-400 mx-auto mb-2" />
                            <span>This challenge is fully completed. Congratulations on building sustainable habits!</span>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Header branding info */}
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-white flex items-center space-x-2.5">
                <Compass className="w-6 h-6 text-emerald-400 animate-spin-slow" />
                <span>Eco Challenges Hub</span>
              </h1>
              <p className="text-sm text-slate-400">Join actionable community challenges, log your milestones, and claim massive XP achievements.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl text-xs flex items-center space-x-2 font-mono">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Challenges grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {challenges.map((c) => (
                <div
                  key={c.id}
                  onClick={() => selectChallengeDetails(c.id)}
                  className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-emerald-500/30 hover:scale-[1.01] transition-all cursor-pointer relative border-slate-850 group active:scale-95"
                >
                  <div>
                    {/* Icon & title */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl bg-slate-900/40 p-2 rounded-xl group-hover:scale-115 transition-transform">{c.icon || "🌱"}</span>
                      <span className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        c.status === 'completed'
                          ? 'bg-emerald-950/40 border border-emerald-900/45 text-emerald-400'
                          : c.status === 'active'
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-white'
                          : 'bg-slate-950 border border-slate-850 text-slate-500'
                      }`}>
                        {c.status === 'not_joined' ? 'Not Joined' : c.status}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-white text-base group-hover:text-emerald-400 transition-colors mb-2 leading-snug">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-light line-clamp-3 mb-4">
                      {c.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-800/40 pt-4 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center space-x-1"><Award className="w-3.5 h-3.5 text-yellow-500" /> <span className="font-bold text-slate-400">+{c.rewardXp} XP</span></span>
                    
                    {c.status === 'active' && (
                      <div className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs text-emerald-400">{c.progressPercent}% Done</span>
                      </div>
                    )}

                    <div className="flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                      <span>View</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
