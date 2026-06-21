import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage.tsx';
import Onboarding from './components/Onboarding.tsx';
import AuthPage from './components/AuthPage.tsx';
import Sidebar from './components/Sidebar.tsx';
import DashboardView from './components/DashboardView.tsx';
import AiInsightsView from './components/AiInsightsView.tsx';
import ChallengesView from './components/ChallengesView.tsx';
import EcoGuideView from './components/EcoGuideView.tsx';
import NearbyView from './components/NearbyView.tsx';
import ProfileView from './components/ProfileView.tsx';
import LeaderboardView from './components/LeaderboardView.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import { Leaf, Bell, Loader2, Sparkles, Sun, Moon, LogOut, User, Trophy, ShieldAlert, Award, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [appState, setAppState] = useState<'landing' | 'onboarding' | 'auth' | 'portal'>('landing');
  const [tempUid, setTempUid] = useState<string | null>(null);

  // Authentication states
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("greenstep_token"));
  const [user, setUser] = useState<any>(() => {
    const savedUser = localStorage.getItem("greenstep_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [portalSyncKey, setPortalSyncKey] = useState(0);

  // Core profile/badge states managed live
  const [profileStats, setProfileStats] = useState<any>(null);
  const [unlockedBadge, setUnlockedBadge] = useState<any>(null);

  // Dynamic theme support (black and white backgrounds)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem("greenstep_theme") as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem("greenstep_theme", theme);
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
  }, [theme]);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/notifications", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (err) {
      console.warn("Notifications check failed:", err);
    }
  };

  const fetchCoreStats = async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/dashboard/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfileStats(data);
      }
    } catch (err) {
      console.warn("Core stats fetch failed:", err);
    }
  };

  // Auto-detect restored session
  useEffect(() => {
    if (token && user) {
      setAppState('portal');
      fetchNotifications();
      fetchCoreStats();
    }
  }, [token, user]);

  // Poll for notifications occasionally to feel incredibly responsive in a hackathon demo!
  useEffect(() => {
    if (appState === 'portal') {
      const interval = setInterval(() => {
        fetchNotifications();
        fetchCoreStats();
      }, 20000);
      return () => clearInterval(interval);
    }
  }, [appState, token]);

  const handleStartOnboarding = () => {
    setAppState('onboarding');
  };

  const handleOnboardingComplete = (tempId: string) => {
    setTempUid(tempId);
    setAppState('auth');
  };

  const handleGoToLogin = () => {
    setAppState('auth');
  };

  const handleAuthSuccess = (authToken: string, authedUser: any) => {
    localStorage.setItem("greenstep_token", authToken);
    localStorage.setItem("greenstep_user", JSON.stringify(authedUser));
    
    // Clear temporary ID once synced/linked successfully
    sessionStorage.removeItem("greenstep_temp_uid");
    setTempUid(null);
    
    setToken(authToken);
    setUser(authedUser);
    setAppState('portal');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setProfileStats(null);
    setUnlockedBadge(null);
    localStorage.removeItem("greenstep_token");
    localStorage.removeItem("greenstep_user");
    setAppState('landing');
    setActiveTab('dashboard');
  };

  const handleRefreshCoreMetrics = () => {
    // Increment portalsynckey to force dashboard, profiles, or leaderboards updates
    setPortalSyncKey(prev => prev + 1);
    fetchNotifications();
    fetchCoreStats(); // Ensure core metrics stay perfectly synced
  };

  const handleBadgeEarned = (badge: any) => {
    setUnlockedBadge(badge);
    handleRefreshCoreMetrics(); // Propagate update up immediately
  };

  // Determine if the user has Administrator authorization privileges
  const isAdminUser = user?.email === "janid2085@gmail.com" || user?.email === "admin@greenstep.org" || user?.email === "admin@gmail.com" || user?.username === "admin" || user?.displayName === "System Admin";

  if (appState === 'landing') {
    return <LandingPage onStartOnboarding={handleStartOnboarding} onGoToLogin={handleGoToLogin} />;
  }

  if (appState === 'onboarding') {
    return <Onboarding onCompleted={handleOnboardingComplete} onGoBack={() => setAppState('landing')} />;
  }

  if (appState === 'auth') {
    return <AuthPage tempUid={tempUid} onAuthSuccess={handleAuthSuccess} onGoBack={() => setAppState('landing')} theme={theme} setTheme={setTheme} />;
  }

  const unreadAlerts = notifications.length;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#05110e] text-[#ffffff]' : 'bg-[#f4f7f6] text-[#111827]'} flex font-sans transition-colors duration-300 relative overflow-hidden`}>
      
      {/* Side Column menu */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdminUser}
        userName={user?.displayName || "Eco Stepper"}
        userEmail={user?.email || "user@greenstep.org"}
        theme={theme}
      />

      {/* Main interior container view */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top bar header */}
        <header className={`h-16 border-b ${theme === 'dark' ? 'border-white/5 bg-black/20' : 'border-black/5 bg-white/40'} flex-shrink-0 flex items-center justify-between px-6 sm:px-8 relative z-20`}>
          <div className="flex items-center space-x-3 text-emerald-400 font-display font-bold select-none text-sm">
            <Leaf className="w-4.5 h-4.5 animate-pulse text-emerald-500 fill-emerald-500/10" />
            <span className={`${theme === 'dark' ? 'text-emerald-450' : 'text-emerald-700'} font-black text-xs uppercase tracking-wide`}>
              GreenStep Core Active
            </span>
          </div>

          <div className="flex items-center space-x-4">
            
            {/* Color mode theme switcher */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
                theme === 'dark' 
                  ? 'bg-slate-950 border-white/5 hover:bg-slate-900 text-yellow-400' 
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800 shadow-sm'
              }`}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Live Notifications dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) fetchNotifications();
                }}
                className={`relative p-2 rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-white/5 hover:bg-slate-900 text-slate-350 hover:text-white'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-950 shadow-sm'
                }`}
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadAlerts > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </button>

              {showNotifications && (
                <div className={`absolute right-0 mt-3 w-80 border rounded-2xl shadow-2xl p-4.5 space-y-3 z-50 animate-fadeIn text-xs ${
                  theme === 'dark' ? 'bg-[#0a1512] border-emerald-950' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <div className={`flex items-center justify-between border-b pb-2 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                    <span className="font-bold uppercase tracking-wider text-[10px]">Recent Alerts Feed</span>
                    <button
                      onClick={() => setNotifications([])}
                      className="text-[10px] text-slate-500 hover:text-emerald-500 underline"
                    >
                      Clear All
                    </button>
                  </div>

                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs font-light">
                      No new eco logs or badge notifications.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                      {notifications.map((alert) => (
                        <div key={alert.id} className={`p-3 rounded-xl border ${theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="font-bold text-[11px] mb-0.5 leading-snug">{alert.title}</div>
                          <p className="text-slate-500 text-[10px] leading-relaxed">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setActiveTab('profile'); // Switch to profile page on avatar/name click
                }}
                className={`flex items-center space-x-2.5 p-1 rounded-xl border transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-950 border-white/5 hover:bg-slate-900 text-slate-350 hover:text-white'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-950 shadow-sm'
                }`}
                title="View Eco Profile"
              >
                {/* Profile avatar with initials */}
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 flex items-center justify-center font-bold text-xs relative shadow-inner">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'E'}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse border border-[#0d2a24]" />
                </div>
                
                <div className="hidden sm:flex flex-col text-left pr-1.5">
                  <span className={`text-[11px] font-bold leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    {user?.displayName || "Member"}
                  </span>
                  <span className="text-[9px] text-[#10b981] font-mono tracking-wider font-semibold uppercase mt-0.5">
                    {profileStats?.xpLevel || "Eco Adventurer"}
                  </span>
                </div>
              </button>

              {showProfileMenu && (
                <div className={`absolute right-0 mt-3 w-64 border rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn text-xs ${
                  theme === 'dark'
                    ? 'bg-[#091512] border-emerald-950 text-white'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <div className={`pb-3 border-b flex flex-col space-y-1 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                    <div className="font-bold text-xs leading-tight flex items-center space-x-1.5">
                      <span>{user?.displayName || "Eco Stepper"}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
                  </div>

                  {/* High fidelity stats peek */}
                  <div className={`grid grid-cols-2 gap-2 text-center p-2 rounded-xl ${
                    theme === 'dark' ? 'bg-white/[0.03]' : 'bg-slate-50 border border-slate-100'
                  }`}>
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Score</span>
                      <span className="text-xs font-bold text-emerald-500">{profileStats?.score || 600}</span>
                    </div>
                    <div className="flex flex-col items-center border-l border-white/5">
                      <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Streak</span>
                      <span className="text-xs font-bold text-yellow-500">{profileStats?.streakDays || 0}D</span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-1 mt-2">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left py-2 px-3 rounded-lg flex items-center space-x-2.5 transition-colors ${
                        theme === 'dark' ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <User className="w-4 h-4 text-[#10b981]" />
                      <span className="font-bold">My Eco Profile</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className={`w-full text-left py-2 px-3 rounded-lg flex items-center space-x-2.5 transition-colors text-red-500 hover:text-red-400 ${
                        theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                      }`}
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span className="font-bold">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Tab Interior container page */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar flex flex-col justify-between">
          <div className="flex-1">
            {token ? (
              <>
                {activeTab === 'dashboard' && (
                  <div key={`dashboard_${portalSyncKey}`}>
                    <DashboardView
                      token={token}
                      onActivityLogged={handleRefreshCoreMetrics}
                      setActiveTab={setActiveTab}
                    />
                  </div>
                )}

                {activeTab === 'insights' && (
                  <div key={`insights_${portalSyncKey}`}>
                    <AiInsightsView
                      token={token}
                    />
                  </div>
                )}

                {activeTab === 'challenges' && (
                  <div key={`challenges_${portalSyncKey}`}>
                    <ChallengesView
                      token={token}
                      onChallengeDone={handleRefreshCoreMetrics}
                      onBadgeEarned={handleBadgeEarned}
                    />
                  </div>
                )}

                {activeTab === 'guide' && (
                  <div key={`guide_${portalSyncKey}`}>
                    <EcoGuideView
                      token={token}
                    />
                  </div>
                )}

                {activeTab === 'nearby' && (
                  <div key={`nearby_${portalSyncKey}`}>
                    <NearbyView
                      token={token}
                      onLocationAdded={handleRefreshCoreMetrics}
                    />
                  </div>
                )}

                {activeTab === 'leaderboard' && (
                  <div key={`leaderboard_${portalSyncKey}`}>
                    <LeaderboardView
                      token={token}
                    />
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div key={`profile_${portalSyncKey}`}>
                    <ProfileView
                      token={token}
                    />
                  </div>
                )}

                {activeTab === 'admin' && isAdminUser && (
                  <div key={`admin_${portalSyncKey}`}>
                    <AdminPanel
                      token={token}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-32 text-slate-405 font-mono text-xs uppercase tracking-widest space-y-2">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <span>Authenticating Session coordinates...</span>
              </div>
            )}
          </div>

          {/* Elegant matching dashboard footer */}
          <footer className={`mt-12 pt-6 border-t ${theme === 'dark' ? 'border-white/5 text-slate-500' : 'border-slate-200 text-slate-400'} flex flex-col sm:flex-row items-center justify-between text-xs gap-4`}>
            <div className="flex items-center space-x-2.5">
              <Leaf className="w-4 h-4 text-emerald-400 animate-pulse text-emerald-500" />
              <span className={`font-display font-semibold ${theme === 'dark' ? 'text-slate-350' : 'text-slate-700'}`}>GreenStep Net Zero Core</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-[10px] uppercase font-mono tracking-wider">Active node: region-global</span>
              <span>•</span>
              <span>© 2026 GreenStep. Every Step Counts.</span>
            </div>
          </footer>
        </main>

      </div>

      {/* Dynamic Congratulatory Animated Popup for earned badges */}
      <AnimatePresence>
        {unlockedBadge && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-hidden"
          >
            {/* Ambient Background blur glows */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-500/5 rounded-full blur-[140px] pointer-events-none animate-pulse" />

            <motion.div
              initial={{ scale: 0.85, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: -30, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 260 }}
              className={`relative max-w-sm w-full p-8 rounded-3xl border text-center shadow-2xl relative ${
                theme === 'dark'
                  ? 'bg-gradient-to-b from-[#0e221d] to-[#040e0b] border-emerald-500/30 text-white'
                  : 'bg-white border-emerald-500/20 text-slate-900'
              }`}
            >
              {/* Confetti decoration particles */}
              <div className="absolute top-8 left-8 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <div className="absolute top-16 right-10 w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
              <div className="absolute bottom-12 left-12 w-1.5 h-1.5 rounded-full bg-emerald-300" />

              {/* Animated Giant Award Icon container */}
              <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-4 border-dashed border-emerald-500/20"
                />
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.25, 1] }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/35 rounded-2xl flex items-center justify-center text-5xl shadow-inner relative"
                >
                  {unlockedBadge.icon || "🏆"}
                  {/* Miniature bouncing star */}
                  <div className="absolute -top-1 -right-1 bg-yellow-400 text-slate-950 p-1 rounded-full border border-[#0d2a24] animate-bounce">
                    <Star className="w-3 h-3 fill-slate-950 text-slate-950" />
                  </div>
                </motion.div>
              </div>

              {/* Animated text labels */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 px-3.5 py-1 rounded-full text-[9px] tracking-widest font-mono uppercase font-bold w-max mx-auto mb-3">
                  Achievement Unlocked!
                </div>
                
                <h3 className={`font-display font-black text-xl mb-1.5 ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>
                  Congratulations, {user?.displayName || "Member"}!
                </h3>
                
                <div className="font-extrabold text-emerald-550 text-base tracking-tight mb-2">
                  You earned the '{unlockedBadge.name}' Badge!
                </div>

                <p className={`text-xs leading-relaxed max-w-xs mx-auto mb-5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-550'}`}>
                  {unlockedBadge.description || "Thank you for taking meaningful action to protect and preserve our Earth!"}
                </p>

                {/* Micro Rewards parameters Grid */}
                <div className={`grid grid-cols-2 gap-3 p-3 rounded-2xl mb-6 text-center text-[11px] ${
                  theme === 'dark' ? 'bg-[#05110e] border border-emerald-550/10 text-white' : 'bg-slate-50 border border-slate-100 text-slate-800'
                }`}>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-mono block mb-0.5">Status Update</span>
                    <span className="font-bold">Eco Badge Logged</span>
                  </div>
                  <div className="border-l border-white/5">
                    <span className="text-[9px] text-slate-500 uppercase font-mono block mb-0.5">Profile Stats</span>
                    <span className="font-bold text-yellow-500">XP Synchronized</span>
                  </div>
                </div>

                <button
                  onClick={() => setUnlockedBadge(null)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/15 cursor-pointer text-xs uppercase tracking-wider"
                >
                  Awesome, Let's keep going!
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
