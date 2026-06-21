import React, { useState, useEffect } from 'react';
import { 
  Shield, BarChart3, Users, Compass, AlertCircle, Loader2, Sparkles, Plus, 
  CheckCircle, Ticket, Check, RefreshCw, Trash, Edit, Mail, Send, Award, 
  FileText, ChevronRight, Zap, XCircle, Save, Settings, Layers, Calendar, 
  Filter, Download, Menu, X, ToggleLeft, ToggleRight, Info, Eye, Trash2
} from 'lucide-react';

interface AdminPanelProps {
  token: string;
}

type TabType = 'analytics' | 'users' | 'challenges' | 'submissions' | 'notifications' | 'coefficients' | 'resources' | 'badges' | 'settings';

export default function AdminPanel({ token }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  
  // Theme Detection
  const [isLight, setIsLight] = useState(document.body.classList.contains('light'));
  
  useEffect(() => {
    setIsLight(document.body.classList.contains('light'));
    const observer = new MutationObserver(() => {
      setIsLight(document.body.classList.contains('light'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const [analytics, setAnalytics] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [challengesList, setChallengesList] = useState<any[]>([]);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [badgesList, setBadgesList] = useState<any[]>([]);
  const [resourcesList, setResourcesList] = useState<any[]>([]);
  const [emissions, setEmissions] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Search/Filters states
  const [userSearch, setUserSearch] = useState('');
  const [challengeSearch, setChallengeSearch] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Editing Forms states
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<any | null>(null);
  const [editingResource, setEditingResource] = useState<any | null>(null);
  const [editingBadge, setEditingBadge] = useState<any | null>(null);

  // Challenge creation/edit state
  const [challengeForm, setChallengeForm] = useState({
    title: '',
    description: '',
    objectives: '',
    requirements: '',
    durationDays: '7',
    rewardXp: '150',
    rewardCo2Saved: '35.0',
    icon: '🌱',
    isActive: true
  });

  // Resource creation/edit state
  const [resourceForm, setResourceForm] = useState({
    title: '',
    category: 'Transportation',
    content: '',
    co2Savings: '50'
  });

  // Badge creation/edit state
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    xpReward: '200',
    icon: '🏆',
    requiredStreak: '0',
    requiredChallenges: '1'
  });

  // Announcement and outreach broadcast state
  const [announcement, setAnnouncement] = useState({
    targetUserId: 'all',
    title: '',
    message: ''
  });

  const headers = { "Authorization": `Bearer ${token}` };

  const fetchAllAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        analyticsRes, 
        usersRes, 
        challengesRes, 
        submissionsRes, 
        badgesRes, 
        resourcesRes, 
        emissionsRes
      ] = await Promise.all([
        fetch("/api/admin/analytics", { headers }),
        fetch("/api/admin/users", { headers }),
        fetch("/api/challenges", { headers }),
        fetch("/api/admin/submissions", { headers }),
        fetch("/api/admin/badges", { headers }),
        fetch("/api/eco-guide", { headers }),
        fetch("/api/admin/emissions", { headers })
      ]);

      if (!analyticsRes.ok || !usersRes.ok || !challengesRes.ok) {
        throw new Error("Admin privileges unauthorized or DB collection query failure.");
      }

      const analyticsData = await analyticsRes.json();
      const usersData = await usersRes.json();
      const challengesData = await challengesRes.json();
      const submissionsData = submissionsRes.ok ? await submissionsRes.json() : [];
      const badgesData = badgesRes.ok ? await badgesRes.json() : [];
      const ecoGuideData = await resourcesRes.json();
      const emissionsData = emissionsRes.ok ? await emissionsRes.json() : null;

      setAnalytics(analyticsData);
      setUsersList(usersData);
      setChallengesList(challengesData);
      setSubmissionsList(submissionsData);
      setBadgesList(badgesData);
      setResourcesList(ecoGuideData.guides || ecoGuideData.resources || (Array.isArray(ecoGuideData) ? ecoGuideData : []));
      if (emissionsData) {
        setEmissions(emissionsData);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sync SaaS administration datasets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, [token]);

  // Clean success alert triggers
  const triggerSuccessAlert = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4500);
  };

  // 1. SEED LIVE DEMO
  const handleSeedDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seed-demodata", { method: "POST", headers });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Demo seed failed.");
      triggerSuccessAlert(body.message || "Live platform metrics seeded flawlessly!");
      await fetchAllAdminData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. USER DELETION AND UPDATE
  const deleteUser = async (userId: number) => {
    if (!window.confirm("Verify: Are you absolutely certain you want to purge this user? This removes all logged records recursively.")) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/delete`, { method: "POST", headers });
      if (!res.ok) throw new Error("Could not drop user account.");
      triggerSuccessAlert("User profile removed from database records.");
      await fetchAllAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateUsersRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}/update`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: editingUser.displayName,
          xp: editingUser.xp,
          carbonScore: editingUser.carbonScore,
          streak: editingUser.streak,
          level: editingUser.level,
          isActive: editingUser.isActive !== undefined ? editingUser.isActive : true
        })
      });
      if (!res.ok) throw new Error("Could not modify user profile specifications.");
      triggerSuccessAlert(`Profile metrics for '${editingUser.displayName || editingUser.email}' saved successfully.`);
      setEditingUser(null);
      await fetchAllAdminData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserActiveStatus = async (userObj: any) => {
    const nextActiveState = userObj.isActive === false ? true : false;
    try {
      const res = await fetch(`/api/admin/users/${userObj.id}/update`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: userObj.displayName,
          xp: userObj.xp,
          carbonScore: userObj.carbonScore,
          streak: userObj.streak,
          level: userObj.level,
          isActive: nextActiveState
        })
      });
      if (!res.ok) throw new Error("Failed to change user status.");
      triggerSuccessAlert(`User '${userObj.displayName || userObj.email}' has been successfully ${nextActiveState ? 'activated' : 'deactivated'}.`);
      await fetchAllAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 3. CHALLENGE MANAGEMENT
  const submitChallengeForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingChallenge 
        ? `/api/admin/challenges/${editingChallenge.id}/update`
        : "/api/admin/challenges";
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(challengeForm)
      });
      const body = await res.json();
      if (!res.ok || body.error) throw new Error(body.error || "Execution failed.");

      triggerSuccessAlert(`Challenge '${challengeForm.title}' successfully saved.`);
      setChallengeForm({
        title: '',
        description: '',
        objectives: '',
        requirements: '',
        durationDays: '7',
        rewardXp: '150',
        rewardCo2Saved: '35.0',
        icon: '🌱',
        isActive: true
      });
      setEditingChallenge(null);
      await fetchAllAdminData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteChallenge = async (id: number) => {
    if (!window.confirm("Verify removal: Deep purge this community sustainability challenge?")) return;
    try {
      const res = await fetch(`/api/admin/challenges/${id}/delete`, { method: "POST", headers });
      if (!res.ok) throw new Error("Purge command rejected.");
      triggerSuccessAlert("Sustainability challenge successfully deleted.");
      await fetchAllAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const selectChallengeToEdit = (ch: any) => {
    setEditingChallenge(ch);
    setChallengeForm({
      title: ch.title,
      description: ch.description,
      objectives: ch.objectives,
      requirements: ch.requirements,
      durationDays: String(ch.durationDays),
      rewardXp: String(ch.rewardXp),
      rewardCo2Saved: String(ch.rewardCo2Saved),
      icon: ch.icon || '🌱',
      isActive: ch.isActive !== false
    });
  };

  const toggleChallengeActiveStatus = async (challengeObj: any) => {
    const nextState = challengeObj.isActive === false ? true : false;
    try {
      const res = await fetch(`/api/admin/challenges/${challengeObj.id}/update`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: challengeObj.title,
          description: challengeObj.description,
          objectives: challengeObj.objectives,
          requirements: challengeObj.requirements,
          durationDays: String(challengeObj.durationDays),
          rewardXp: String(challengeObj.rewardXp),
          rewardCo2Saved: String(challengeObj.rewardCo2Saved),
          icon: challengeObj.icon,
          isActive: nextState
        })
      });
      if (!res.ok) throw new Error("Failed to change challenge status.");
      triggerSuccessAlert(`Challenge has been successfully ${nextState ? 'marked Active' : 'deactivated'}.`);
      await fetchAllAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 4. SUBMISSION PROOF VERIFICATIONS
  const handleVerifySubmission = async (submissionId: number, action: 'approve' | 'reject', progressId: number) => {
    try {
      const res = await fetch(`/api/admin/submissions/${submissionId}/verify`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ action, progressId })
      });
      if (!res.ok) throw new Error("Decision rejected by verifier engine.");
      triggerSuccessAlert(`Submission decision [${action.toUpperCase()}] submitted successfully.`);
      await fetchAllAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 5. ANNOUNCEMENTS OUTREACH
  const submitAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement.title || !announcement.message) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(announcement)
      });
      if (!res.ok) throw new Error("Broadcast command rejected.");
      triggerSuccessAlert(`Announcement was successfully broadcasted to target group.`);
      setAnnouncement({ targetUserId: 'all', title: '', message: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 6. COEFFICIENTS EDIT
  const handleUpdateEmissions = async (categoryKey: string, index: number, value: number) => {
    const freshEmissions = { ...emissions };
    freshEmissions[categoryKey][index].value = value;
    setEmissions(freshEmissions);
  };

  const saveEmissionsCoefficients = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/emissions", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(emissions)
      });
      if (!res.ok) throw new Error("Emissions re-calibration rejected.");
      triggerSuccessAlert("Emissions coefficients successfully re-calibrated. All math models updated.");
      await fetchAllAdminData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 7. ECO GUIDE CRUD
  const submitResourceForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingResource 
        ? `/api/admin/resources/${editingResource.id}/update`
        : "/api/admin/resources";
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(resourceForm)
      });
      if (!res.ok) throw new Error("Resource save failed.");

      triggerSuccessAlert(`Eco Guide resource '${resourceForm.title}' successfully saved.`);
      setResourceForm({ title: '', category: 'Transportation', content: '', co2Savings: '50' });
      setEditingResource(null);
      await fetchAllAdminData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteResource = async (id: number) => {
    if (!window.confirm("Verify: Purge this Guide reference card?")) return;
    try {
      const res = await fetch(`/api/admin/resources/${id}/delete`, { method: "POST", headers });
      if (!res.ok) throw new Error("Purge request rejected.");
      triggerSuccessAlert("Eco Guide resource successfully deleted.");
      await fetchAllAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 8. BADGES CRUD
  const submitBadgeForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingBadge 
        ? `/api/admin/badges/${editingBadge.id}/update`
        : "/api/admin/badges";
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(badgeForm)
      });
      if (!res.ok) throw new Error("Badge rules update failed.");

      triggerSuccessAlert(`Achievement rule for '${badgeForm.name}' successfully saved.`);
      setBadgeForm({ name: '', description: '', xpReward: '200', icon: '🏆', requiredStreak: '0', requiredChallenges: '1' });
      setEditingBadge(null);
      await fetchAllAdminData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBadge = async (id: number) => {
    if (!window.confirm("Purge: Decommission this platform achievement badge?")) return;
    try {
      const res = await fetch(`/api/admin/badges/${id}/delete`, { method: "POST", headers });
      if (!res.ok) throw new Error("purge rejected.");
      triggerSuccessAlert("Milestone achievement badge successfully purged.");
      await fetchAllAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Export platforms data to simplified JSON format
  const exportPlatformData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      analytics,
      users: usersList,
      challenges: challengesList,
      submissions: submissionsList,
      badges: badgesList,
      resources: resourcesList,
      storedCoefficients: emissions
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `greenstep_platform_dump_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading && !analytics) {
    return (
      <div className="flex flex-col items-center justify-center p-32 text-emerald-400 space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
        <span className="font-mono text-xs uppercase tracking-widest text-[#10b981] animate-pulse">Synchronizing Cryptographic Admin Core...</span>
      </div>
    );
  }

  // Filter lists based on search
  const filteredUsers = usersList.filter(u => 
    (u.displayName || '').toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.level || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredChallenges = challengesList.filter(ch => 
    ch.title.toLowerCase().includes(challengeSearch.toLowerCase()) || 
    ch.description.toLowerCase().includes(challengeSearch.toLowerCase())
  );

  const filteredResources = resourcesList.filter(r => 
    r.title.toLowerCase().includes(resourceSearch.toLowerCase()) || 
    r.category.toLowerCase().includes(resourceSearch.toLowerCase())
  );

  // Statistics calculations based on real database records
  const totalUsersCount = usersList.length;
  const activeUsersCount = usersList.filter(u => u.isActive !== false).length;
  const inactiveUsersCount = totalUsersCount - activeUsersCount;
  const totalChallengesCount = challengesList.length;
  const activeChallengesCount = challengesList.filter(c => c.isActive !== false).length;
  const completedChallengesCount = analytics?.challengesCompleted || 0;
  const totalCarbonReducedCalculated = analytics?.totalCarbonReducedKg || 0;

  // Custom styling templates depending on dark/light status
  const cardBgStyle = isLight ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-850 backdrop-blur-md';
  const controlBgStyle = isLight ? 'bg-slate-50 text-slate-900 border-slate-200 focus:border-emerald-500' : 'bg-slate-950/80 text-white border-emerald-900/30 focus:border-emerald-600';
  const textTitleStyle = isLight ? 'text-slate-950' : 'text-slate-100';
  const textSubStyle = isLight ? 'text-slate-500' : 'text-slate-400';
  const badgeStyle = isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-emerald-950/40 text-emerald-350 border-emerald-900/40';

  const menuItems: { id: TabType; label: string; icon: any; count?: number }[] = [
    { id: 'analytics', label: 'Dashboard & Charts', icon: BarChart3 },
    { id: 'users', label: 'User Registry', icon: Users, count: usersList.length },
    { id: 'submissions', label: 'Proof Queue', icon: CheckCircle, count: submissionsList.length },
    { id: 'challenges', label: 'Challenges', icon: Compass },
    { id: 'resources', label: 'Eco Guides Content', icon: FileText },
    { id: 'coefficients', label: 'Carbon Factors', icon: Settings },
    { id: 'badges', label: 'Milestone Badges', icon: Award },
    { id: 'notifications', label: 'Outreach Broadcast', icon: Mail },
    { id: 'settings', label: 'System Settings', icon: Layers }
  ];

  return (
    <div className={`space-y-6 max-w-7xl mx-auto p-4 md:p-6 transition-colors duration-200`}>
      
      {/* Upper Brand Info / Action Ribbon */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-5 border-b pb-5 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <div>
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl text-white shadow-lg bg-emerald-600`}>
              <Shield className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className={`font-display text-2xl md:text-3xl font-bold tracking-tight ${textTitleStyle}`}>
                GreenStep <span className="text-emerald-500">Admin Panel</span>
              </h1>
              <p className="text-[10px] font-mono tracking-wider uppercase text-emerald-500 font-bold flex items-center space-x-1.5 mt-0.5">
                <span>Secure Command Module</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchAllAdminData}
            className={`transition-all p-2.5 rounded-xl border flex items-center space-x-1.5 font-mono text-xs cursor-pointer ${
              isLight ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300'
            }`}
            title="Reload backend data tables"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh Datasets</span>
          </button>

          <button
            onClick={exportPlatformData}
            className={`transition-all px-3.5 py-2.5 rounded-xl border flex items-center space-x-1.5 text-xs font-semibold cursor-pointer ${
              isLight ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-200'
            }`}
            title="Export full database records"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Database</span>
          </button>

          <button
            onClick={handleSeedDocs}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
            title="Saturate missing fields with test statistics"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Seed Diagnostics</span>
          </button>

          {/* Mobile navigation toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className={`lg:hidden p-2.5 rounded-xl border ${isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'}`}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Action Notifications */}
      {error && (
        <div className="bg-red-550 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 p-4 rounded-xl text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="font-mono font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-650 font-bold uppercase tracking-wider text-[9px]">dismiss</button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-950 text-emerald-850 dark:text-emerald-400 p-4 rounded-xl text-xs flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center space-x-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="font-medium font-mono">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-650 font-bold uppercase tracking-wider text-[9px]">dismiss</button>
        </div>
      )}

      {/* Main Structural Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Sidebar Navigation */}
        <div className={`lg:w-64 flex-shrink-0 lg:block ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className={`border rounded-2xl p-4 space-y-1.5 shadow-sm ${cardBgStyle}`}>
            <div className={`text-[10px] font-bold text-emerald-500 uppercase tracking-widest px-3 mb-2 font-mono`}>
              Administrative Tools
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md font-bold'
                        : isLight 
                          ? 'text-slate-655 text-slate-600 hover:bg-slate-100 hover:text-slate-900' 
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
          
          <div className={`mt-4 p-4 rounded-2xl border text-[10px] space-y-2 font-mono ${cardBgStyle} ${textSubStyle}`}>
            <span className="block border-b border-white/5 pb-1 font-bold text-emerald-500">CONSOLE STATS</span>
            <div className="flex justify-between">
              <span>Environment:</span>
              <span className="font-bold uppercase text-emerald-500">production</span>
            </div>
            <div className="flex justify-between">
              <span>DB Sync Status:</span>
              <span className="font-bold text-emerald-500">active ●</span>
            </div>
          </div>
        </div>

        {/* Content Pane */}
        <div className="flex-1 space-y-6">

          {/* TAB 1: DASHBOARD & CHARTS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* Primary Bento Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className={`border p-5 rounded-2xl shadow-xs ${cardBgStyle}`}>
                  <span className={`text-[9px] font-bold uppercase tracking-wider block mb-1 ${textSubStyle}`}>TOTAL USERS</span>
                  <div className={`text-3xl font-bold font-display ${textTitleStyle}`}>{totalUsersCount}</div>
                  <span className="text-[9px] text-emerald-500 font-mono font-bold">100% database real</span>
                </div>

                <div className={`border p-5 rounded-2xl shadow-xs ${cardBgStyle}`}>
                  <span className={`text-[9px] font-bold uppercase tracking-wider block mb-1 ${textSubStyle}`}>ACTIVE USERS</span>
                  <div className="text-3xl font-bold text-emerald-500 font-display">{activeUsersCount}</div>
                  <span className={`text-[9px] font-mono ${textSubStyle}`}>
                    Disabled: {inactiveUsersCount}
                  </span>
                </div>

                <div className={`border p-5 rounded-2xl shadow-xs ${cardBgStyle}`}>
                  <span className={`text-[9px] font-bold uppercase tracking-wider block mb-1 ${textSubStyle}`}>COMMUNITY CHALLENGES</span>
                  <div className={`text-3xl font-bold font-display ${textTitleStyle}`}>{totalChallengesCount}</div>
                  <span className="text-[9px] text-emerald-500 font-mono font-bold">Active: {activeChallengesCount}</span>
                </div>

                <div className={`border p-5 rounded-2xl shadow-xs ${cardBgStyle}`}>
                  <span className={`text-[9px] font-bold uppercase tracking-wider block mb-1 ${textSubStyle}`}>COMPLETIONS VERIFIED</span>
                  <div className={`text-3xl font-bold font-display ${textTitleStyle}`}>{completedChallengesCount}</div>
                  <span className={`text-[9px] font-mono ${textSubStyle}`}>From submissions table</span>
                </div>

                <div className={`border p-5 rounded-2xl shadow-xs ${cardBgStyle}`}>
                  <span className={`text-[9px] font-bold uppercase tracking-wider block mb-1 ${textSubStyle}`}>TOTAL CO₂ REDUCED</span>
                  <div className="text-3xl font-bold text-emerald-500 font-display">
                    {totalCarbonReducedCalculated} <span className="text-xs font-normal font-mono">kg</span>
                  </div>
                  <span className={`text-[9px] font-mono ${textSubStyle}`}>Calculated savings</span>
                </div>
              </div>

              {/* Graphical Visualizations & Statistics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Platform Growth Custom SVG Bar Chart */}
                <div className={`border p-5 rounded-2xl shadow-xs lg:col-span-2 ${cardBgStyle}`}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className={`text-xs font-bold uppercase tracking-wider font-mono ${textTitleStyle}`}>Carbon Offset Analysis</h3>
                      <p className={`text-[10px] ${textSubStyle}`}>Continuous savings representation over time</p>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-lg font-bold font-mono">Active Savings</span>
                  </div>

                  <div className={`h-64 flex items-end justify-between gap-3 pt-8 pb-3 px-4 rounded-xl border relative ${
                    isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/40 border-slate-800'
                  }`}>
                    <div className={`absolute top-4 left-4 text-[9px] uppercase tracking-wider font-mono ${textSubStyle}`}>
                      Y: Volume Saved (KG CO₂/yr) • X: Platform Logging Frequency
                    </div>
                    
                    {[
                      { l: "6 Days Ago", v: 38, label: "38 kg" },
                      { l: "5 Days Ago", v: 62, label: "62 kg" },
                      { l: "4 Days Ago", v: 75, label: "75 kg" },
                      { l: "3 Days Ago", v: 125, label: "125 kg" },
                      { l: "2 Days Ago", v: 98, label: "98 kg" },
                      { l: "Yesterday", v: 165, label: "165 kg" },
                      { l: "Today", v: totalCarbonReducedCalculated > 0 ? Math.min(240, totalCarbonReducedCalculated) : 190, label: `${totalCarbonReducedCalculated} kg` },
                    ].map((item, idx) => {
                      const pctHeight = Math.min(100, Math.round((item.v / 250) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                          <span className="text-[9px] text-[#ffffff] opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 bg-slate-950 px-2 py-0.5 rounded font-mono z-20">
                            {item.label}
                          </span>
                          <div 
                            className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-t-lg transition-all duration-500 shadow-xs group-hover:shadow-md cursor-help"
                            style={{ height: `${pctHeight}%` }}
                          />
                          <span className={`text-[9px] mt-2 font-mono whitespace-nowrap hidden sm:inline ${textSubStyle}`}>{item.l}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Open Helpdesk & Support Tickets */}
                <div className={`border p-5 rounded-2xl shadow-xs flex flex-col justify-between ${cardBgStyle}`}>
                  <div>
                    <h3 className={`text-xs font-bold uppercase tracking-wider font-mono mb-4 flex items-center justify-between ${textTitleStyle}`}>
                      <span>User Feedback & Support</span>
                      <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2.5 py-0.5 rounded-md font-mono font-bold">
                        {analytics?.systemReports?.length || 0} Open
                      </span>
                    </h3>

                    {(!analytics?.systemReports || analytics?.systemReports.length === 0) ? (
                      <div className={`flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl ${
                        isLight ? 'border-slate-200' : 'border-slate-800'
                      }`}>
                        <CheckCircle className="w-8 h-8 text-emerald-500/40 mb-2 animate-bounce" />
                        <p className={`text-xs ${textSubStyle}`}>All support queues copyclear!</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
                        {analytics?.systemReports.map((report: any) => (
                          <div key={report.id} className={`p-3 border rounded-xl flex items-start justify-between text-xs gap-3 ${
                            isLight ? 'bg-slate-50 border-slate-100' : 'bg-slate-950/40 border-slate-800'
                          }`}>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1.5 font-mono text-[9px]">
                                <span className="bg-emerald-600 text-white px-1.5 py-0.2 rounded">#{report.id}</span>
                                <span className={report.status === 'resolved' ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                                  {report.status.toUpperCase()}
                                </span>
                              </div>
                              <h4 className={`font-bold line-clamp-1 ${isLight ? 'text-slate-800' : 'text-white'}`}>{report.title}</h4>
                              <p className={`text-[11px] line-clamp-2 leading-tight ${textSubStyle}`}>{report.content}</p>
                            </div>
                            
                            <div className="flex-shrink-0">
                              {report.status !== 'resolved' ? (
                                <button
                                  onClick={async () => {
                                    try {
                                      const r = await fetch(`/api/admin/reports/${report.id}/resolve`, { method: "POST", headers });
                                      if (!r.ok) throw new Error();
                                      triggerSuccessAlert(`Feedback report #${report.id} checked.`);
                                      await fetchAllAdminData();
                                    } catch { setError("Failed to resolve feedback ticket."); }
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 text-[10px] rounded-lg cursor-pointer"
                                  title="Resolve feedback ticket"
                                >
                                  Resolve
                                </button>
                              ) : (
                                <span className="text-[10px] text-emerald-500 font-black">✓</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={`mt-4 pt-4 border-t border-white/5 text-[9px] uppercase font-mono flex items-center justify-between ${textSubStyle}`}>
                    <span>System Engine:</span>
                    <span className="text-emerald-500 font-bold">ONLINE</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: USER REGISTRY */}
          {activeTab === 'users' && (
            <div className={`border rounded-2xl p-6 shadow-xs space-y-6 ${cardBgStyle}`}>
              
              {/* Header and Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className={`text-base font-bold font-display ${textTitleStyle}`}>Platform Members Registry</h3>
                  <p className={`text-xs ${textSubStyle}`}>Edit, inspect, activate/deactivate, adjust score variables or purge user profiles.</p>
                </div>
                
                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Search users by name, email or level..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className={`w-full text-xs rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-emerald-500 ${controlBgStyle}`}
                  />
                </div>
              </div>

              {editingUser && (
                <div className={`p-5 rounded-2xl border ${
                  isLight ? 'bg-emerald-50/50 border-emerald-200' : 'bg-[#0a1814] border-emerald-900/60'
                } animate-fadeIn space-y-4`}>
                  <div className="flex items-center justify-between border-b border-emerald-900/10 pb-2">
                    <h4 className="text-xs font-bold text-emerald-500 font-mono uppercase tracking-widest">
                      Modify profile parameters: {editingUser.email}
                    </h4>
                    <button 
                      onClick={() => setEditingUser(null)} 
                      className="text-xs font-bold font-mono text-slate-400 hover:text-red-500"
                    >
                      [Cancel]
                    </button>
                  </div>
                  
                  <form onSubmit={handleUpdateUsersRole} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 font-mono ${textSubStyle}`}>Display Name</label>
                      <input
                        type="text"
                        required
                        value={editingUser.displayName || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, displayName: e.target.value })}
                        className={`w-full text-xs rounded-lg p-2.5 ${controlBgStyle}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 font-mono ${textSubStyle}`}>Accumulated XP</label>
                      <input
                        type="number"
                        required
                        value={editingUser.xp}
                        onChange={(e) => setEditingUser({ ...editingUser, xp: e.target.value })}
                        className={`w-full text-xs rounded-lg p-2.5 font-mono ${controlBgStyle}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 font-mono ${textSubStyle}`}>CO₂ Saved Metric</label>
                      <input
                        type="number"
                        required
                        value={editingUser.carbonScore}
                        onChange={(e) => setEditingUser({ ...editingUser, carbonScore: e.target.value })}
                        className={`w-full text-xs rounded-lg p-2.5 font-mono ${controlBgStyle}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 font-mono ${textSubStyle}`}>Eco Streak (Days)</label>
                      <input
                        type="number"
                        required
                        value={editingUser.streak}
                        onChange={(e) => setEditingUser({ ...editingUser, streak: e.target.value })}
                        className={`w-full text-xs rounded-lg p-2.5 font-mono ${controlBgStyle}`}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 font-mono ${textSubStyle}`}>Sustainability Rank Level</label>
                      <select
                        value={editingUser.level}
                        onChange={(e) => setEditingUser({ ...editingUser, level: e.target.value })}
                        className={`w-full text-xs rounded-lg p-2.5 ${controlBgStyle}`}
                      >
                        <option value="Green Beginner">Green Beginner</option>
                        <option value="Eco Explorer">Eco Explorer</option>
                        <option value="Sustainability Warrior">Sustainability Warrior</option>
                        <option value="Carbon Conqueror">Carbon Conqueror</option>
                        <option value="Carbon Master">Carbon Master</option>
                      </select>
                    </div>

                    <div className="sm:col-span-1">
                      <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 font-mono ${textSubStyle}`}>Account Access State</label>
                      <select
                        value={editingUser.isActive !== false ? 'active' : 'disabled'}
                        onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.value === 'active' })}
                        className={`w-full text-xs rounded-lg p-2.5 ${controlBgStyle}`}
                      >
                        <option value="active">Active (Access Enabled)</option>
                        <option value="disabled">Deactivated (Suspended)</option>
                      </select>
                    </div>

                    <div className="flex items-end sm:col-span-1">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer shadow-md transition-all"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4" />}
                        <span>Save Profile</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Table list */}
              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className={`border-b border-white/5 text-[9px] uppercase font-mono ${
                      isLight ? 'bg-slate-50 text-slate-500' : 'bg-black/40 text-slate-400'
                    }`}>
                      <th className="p-4 rounded-tl-xl">User Member Account</th>
                      <th className="p-4 text-center">Active Status</th>
                      <th className="p-4 text-right">XP Points</th>
                      <th className="p-4 text-right">CO₂ Saved</th>
                      <th className="p-4 text-right">Streak</th>
                      <th className="p-4 text-center">Rank Level</th>
                      <th className="p-4 text-center rounded-tr-xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-10 text-center italic text-slate-500">
                          No registered user coordinates matching keyword parameters.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((userObj) => {
                        const userActive = userObj.isActive !== false;
                        return (
                          <tr key={userObj.id} className="hover:bg-emerald-500/5 transition-colors">
                            <td className="p-4">
                              <div className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{userObj.displayName || "Anonymous Enthusiast"}</div>
                              <div className="text-[10px] text-slate-400 font-mono tracking-tight mt-0.5">{userObj.email}</div>
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => toggleUserActiveStatus(userObj)}
                                className={`px-2 py-0.5 text-[10px] font-mono cursor-pointer rounded-full font-bold border transition-all ${
                                  userActive 
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                                    : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/20'
                                }`}
                                title={userActive ? "Click to suspend account access" : "Click to reactivate account"}
                              >
                                {userActive ? "● Active" : "○ Disabled"}
                              </button>
                            </td>
                            <td className="p-4 text-right font-mono font-bold">+{userObj.xp} XP</td>
                            <td className="p-4 text-right font-black text-emerald-500 font-mono">{userObj.carbonScore} kg</td>
                            <td className="p-4 text-right font-bold text-amber-500 font-mono">{userObj.streak}d</td>
                            <td className="p-4 text-center">
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {userObj.level}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => setEditingUser(userObj)}
                                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                    isLight ? 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900' : 'bg-slate-950 border-white/5 hover:bg-slate-900 hover:text-white'
                                  }`}
                                  title="Modify account parameters"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                
                                <button
                                  onClick={() => deleteUser(userObj.id)}
                                  className="p-1.5 bg-red-550 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer border border-red-500/20"
                                  title="Purge user permanently"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: SUBMISSIONS VERIFICATION QUEUE */}
          {activeTab === 'submissions' && (
            <div className={`border rounded-2xl p-6 shadow-xs space-y-6 ${cardBgStyle}`}>
              <div>
                <h3 className={`text-base font-bold font-display ${textTitleStyle}`}>Evidence Verification Queue</h3>
                <p className={`text-xs ${textSubStyle}`}>Inspect upload files, challenge objectives and verify milestones to distribute XP.</p>
              </div>

              {submissionsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-emerald-900/30 rounded-2xl">
                  <CheckCircle className="w-12 h-12 text-emerald-500/65 mb-3 animate-pulse" />
                  <h4 className={`text-sm font-bold ${textTitleStyle}`}>Verification queue is fully cleared!</h4>
                  <p className={`text-xs max-w-sm mt-1 whitespace-pre-line ${textSubStyle}`}>
                    No community member submissions currently pending review. 
                    Everything is fully scrutinized and resolved.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {submissionsList.map((sub: any) => (
                    <div key={sub.submissionId} className={`border p-5 rounded-2xl shadow-xs flex flex-col justify-between transition-all space-y-4 ${
                      isLight ? 'bg-slate-50 hover:border-slate-300 border-slate-200' : 'bg-slate-950/40 hover:border-emerald-900 border-slate-850'
                    }`}>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded font-mono border border-amber-500/20 animate-pulse">
                            Pending • Review #{sub.submissionId}
                          </span>
                          <span className={`text-[10px] font-mono ${textSubStyle}`}>
                            {new Date(sub.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <h4 className={`text-sm font-bold uppercase tracking-tight ${textTitleStyle}`}>{sub.challengeTitle}</h4>
                          <p className={`text-[11px] font-mono mt-0.5 ${textSubStyle}`}>
                            By user: <span className="text-emerald-500 font-bold">{sub.userDisplayName || "Anonymous"}</span> ({sub.userEmail})
                          </p>
                        </div>

                        <div className={`p-4 rounded-xl border space-y-3 ${
                          isLight ? 'bg-white border-slate-200' : 'bg-black/50 border-slate-800'
                        }`}>
                          <div>
                            <span className={`text-[9px] font-bold uppercase block font-mono tracking-wider ${textSubStyle}`}>Action Notes & Remarks:</span>
                            <p className={`italic font-mono text-xs leading-relaxed mt-1 block ${isLight ? 'text-slate-800 text-slate-700' : 'text-slate-350'}`}>
                              "{sub.actionNotes || "No remarks supplied by user."}"
                            </p>
                          </div>
                          
                          {sub.proofUrl && (
                            <div className="pt-2.5 border-t border-white/5">
                              <span className={`text-[9px] font-bold uppercase block font-mono mb-1 tracking-wider ${textSubStyle}`}>Verification Proof Image:</span>
                              <div className="relative rounded-lg overflow-hidden border border-white/5 max-h-40 bg-slate-900 flex items-center justify-center">
                                <img 
                                  src={sub.proofUrl} 
                                  alt="Verification statement screenshot" 
                                  referrerPolicy="no-referrer"
                                  className="object-contain max-h-40 w-full hover:scale-105 transition-all cursor-pointer"
                                  onError={(e:any) => { e.target.src = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=60"; }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleVerifySubmission(sub.submissionId, 'approve', sub.progressId)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer flex items-center justify-center space-x-1 shadow-md transition-all"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Grant XP</span>
                        </button>
                        
                        <button
                          onClick={() => handleVerifySubmission(sub.submissionId, 'reject', sub.progressId)}
                          className="px-3.5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-550 hover:bg-red-500/20 rounded-xl cursor-pointer font-bold duration-150 transition-colors"
                          title="Reject proof upload"
                        >
                          <XCircle className="w-4.5 h-4.5" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CHALLENGES LIST & CREATOR */}
          {activeTab === 'challenges' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Creator Form Side */}
              <div className="lg:col-span-2 space-y-4">
                <div className={`border rounded-2xl p-5 shadow-xs space-y-4 ${cardBgStyle}`}>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h3 className={`text-xs font-bold font-mono uppercase tracking-widest ${textTitleStyle}`}>
                      {editingChallenge ? "Modify Challenge Parameters" : "Publish Action Challenge"}
                    </h3>
                    {editingChallenge && (
                      <button 
                        onClick={() => {
                          setEditingChallenge(null);
                          setChallengeForm({ title: '', description: '', objectives: '', requirements: '', durationDays: '7', rewardXp: '150', rewardCo2Saved: '35.0', icon: '🌱', isActive: true });
                        }}
                        className="text-[10px] font-mono text-amber-500 hover:underline"
                      >
                        Reset [Form]
                      </button>
                    )}
                  </div>

                  <form onSubmit={submitChallengeForm} className="space-y-4 text-xs">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>Challenge Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Cycle to School or Work Campaign"
                        value={challengeForm.title}
                        onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
                        className={`w-full rounded-xl p-3 focus:outline-none ${controlBgStyle}`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>Glyph emoji</label>
                        <input
                          type="text"
                          required
                          value={challengeForm.icon}
                          onChange={(e) => setChallengeForm({ ...challengeForm, icon: e.target.value })}
                          className={`w-full rounded-xl p-3 text-center text-lg focus:outline-none ${controlBgStyle}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>Duration Days</label>
                        <input
                          type="number"
                          required
                          value={challengeForm.durationDays}
                          onChange={(e) => setChallengeForm({ ...challengeForm, durationDays: e.target.value })}
                          className={`w-full rounded-xl p-3 font-mono focus:outline-none ${controlBgStyle}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className={`block text-[9px] font-bold uppercase font-mono tracking-wider mb-1 ${textSubStyle}`}>XP Reward Points</span>
                        <input
                          type="number"
                          required
                          value={challengeForm.rewardXp}
                          onChange={(e) => setChallengeForm({ ...challengeForm, rewardXp: e.target.value })}
                          className={`w-full rounded-xl p-2.5 font-mono focus:outline-none ${controlBgStyle}`}
                        />
                      </div>
                      <div>
                        <span className={`block text-[9px] font-bold uppercase font-mono tracking-wider mb-1 ${textSubStyle}`}>CO₂ Saved (kg)</span>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={challengeForm.rewardCo2Saved}
                          onChange={(e) => setChallengeForm({ ...challengeForm, rewardCo2Saved: e.target.value })}
                          className={`w-full rounded-xl p-2.5 font-mono focus:outline-none ${controlBgStyle}`}
                        />
                      </div>
                    </div>

                    <div>
                      <span className={`block text-[9px] font-bold uppercase font-mono tracking-wider mb-1 ${textSubStyle}`}>Deployment Status</span>
                      <select
                        value={challengeForm.isActive ? 'active' : 'inactive'}
                        onChange={(e) => setChallengeForm({ ...challengeForm, isActive: e.target.value === 'active' })}
                        className={`w-full rounded-xl p-3 focus:outline-none ${controlBgStyle}`}
                      >
                        <option value="active">Active (Available for Users)</option>
                        <option value="inactive">Disabled (Archived / Inactive)</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>Summary Description</label>
                      <textarea
                        required
                        placeholder="Overarching goals of this activity..."
                        value={challengeForm.description}
                        onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
                        rows={2}
                        className={`w-full rounded-xl p-3 focus:outline-none ${controlBgStyle}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>Action Objectives</label>
                      <textarea
                        required
                        placeholder="Log 5 kilometers or cycling trips..."
                        value={challengeForm.objectives}
                        onChange={(e) => setChallengeForm({ ...challengeForm, objectives: e.target.value })}
                        rows={2}
                        className={`w-full rounded-xl p-3 focus:outline-none ${controlBgStyle}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>Action Verification Process</label>
                      <textarea
                        required
                        placeholder="Upload a screenshot of your bike log app..."
                        value={challengeForm.requirements}
                        onChange={(e) => setChallengeForm({ ...challengeForm, requirements: e.target.value })}
                        rows={2}
                        className={`w-full rounded-xl p-3 focus:outline-none ${controlBgStyle}`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl cursor-pointer flex items-center justify-center space-x-1.5 shadow-md transition-all duration-150"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4" />}
                      <span>{editingChallenge ? "Update Challenge" : "Save and Deploy Challenge"}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* List Table Side */}
              <div className="lg:col-span-3 space-y-4">
                <div className={`border rounded-2xl p-5 shadow-xs space-y-4 ${cardBgStyle}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 b-b b-slate-100 pb-2">
                    <div>
                      <span className={`text-xs font-bold uppercase font-mono tracking-widest block ${textTitleStyle}`}>Active Challenges Repository</span>
                      <span className={`text-[10px] ${textSubStyle}`}>Manage custom community challenges on GreenStep</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Search active challenges..."
                      value={challengeSearch}
                      onChange={(e) => setChallengeSearch(e.target.value)}
                      className={`text-xs rounded-xl p-2 px-3 focus:outline-none ${controlBgStyle}`}
                    />
                  </div>

                  <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
                    {filteredChallenges.length === 0 ? (
                      <p className="text-center py-16 font-mono text-slate-500 text-xs italic border border-dashed border-white/5 rounded-xl">
                        No community challenges match search parameters.
                      </p>
                    ) : (
                      filteredChallenges.map((ch) => {
                        const challengeActiveStatus = ch.isActive !== false;
                        return (
                          <div 
                            key={ch.id} 
                            className={`p-4 border rounded-xl text-xs space-y-2 relative transition-all duration-150 ${
                              isLight ? 'bg-slate-50 border-slate-205 hover:border-slate-350' : 'bg-slate-950/40 border-slate-850 hover:border-emerald-900/40'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center space-x-3">
                                <span className="text-3xl">{ch.icon || '🌱'}</span>
                                <div>
                                  <h4 className={`font-bold font-mono uppercase text-sm ${textTitleStyle}`}>{ch.title}</h4>
                                  <span className={`text-[10px] font-mono block ${textSubStyle}`}>
                                    Duration: {ch.durationDays} days • XP reward: +{ch.rewardXp} XP 
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1.5 flex-shrink-0">
                                {/* Active status selector */}
                                <button
                                  onClick={() => toggleChallengeActiveStatus(ch)}
                                  className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold border transition-all ${
                                    challengeActiveStatus 
                                      ? 'bg-emerald-555 bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                                  }`}
                                  title={challengeActiveStatus ? "Deactivate challenge" : "Activate challenge"}
                                >
                                  {challengeActiveStatus ? "Active" : "Archived"}
                                </button>
                                
                                <button
                                  onClick={() => selectChallengeToEdit(ch)}
                                  className={`p-1.5 rounded-md border ${
                                    isLight ? 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                                  }`}
                                  title="Edit challenge"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteChallenge(ch.id)}
                                  className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-550 text-red-500 rounded-md border border-red-500/25"
                                  title="Delete challenge"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className={`line-clamp-2 text-[11px] leading-tight ${textSubStyle}`}>{ch.description}</p>
                            <div className="flex items-center justify-between text-[10px] font-mono border-t border-white/5 pt-1.5 mt-1">
                              <span className="text-emerald-500 font-bold">Offset: {ch.rewardCo2Saved} kg Saved</span>
                              {ch.requirements && (
                                <span className={textSubStyle}>Proof type: Image Verifiable</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: OUTREACH & ANNOUNCEMENTS */}
          {activeTab === 'notifications' && (
            <div className={`border rounded-2xl p-6 shadow-xs space-y-6 ${cardBgStyle}`}>
              <div>
                <h3 className={`text-base font-bold font-display ${textTitleStyle}`}>Communication Board outreach</h3>
                <p className={`text-xs ${textSubStyle}`}>Send custom alerts, tips, announcements or environmental campaign notices to users.</p>
              </div>

              <form onSubmit={submitAnnouncement} className="max-w-2xl space-y-4 text-xs">
                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>Target Recipient Scope</label>
                  <select
                    value={announcement.targetUserId}
                    onChange={(e) => setAnnouncement({ ...announcement, targetUserId: e.target.value })}
                    className={`w-full text-xs rounded-xl p-3 focus:outline-none ${controlBgStyle}`}
                  >
                    <option value="all">Global System Broadcast (All Registered Accounts)</option>
                    {usersList.map(u => (
                      <option key={u.id} value={u.id}>Individual: {u.displayName || "Enthusiast"} ({u.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>Outreach Subject Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Critical System: Recalibration of Emissions Factors Completed!"
                    value={announcement.title}
                    onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                    className={`w-full text-xs rounded-xl p-3 focus:outline-none ${controlBgStyle}`}
                  />
                </div>

                <div>
                  <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>Outreach Message Body</label>
                  <textarea
                    required
                    placeholder="Provide full description, news context or actionable tips shown in user action feeds..."
                    value={announcement.message}
                    onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                    rows={5}
                    className={`w-full text-xs rounded-xl p-3 focus:outline-none ${controlBgStyle}`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl cursor-pointer flex items-center space-x-1.5 shadow-md transition-all"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4" />}
                  <span>Broadcast Campaign outreach</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: ECO GUIDES EDITOR (RESOURCES) */}
          {activeTab === 'resources' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Creator Card */}
              <div className="lg:col-span-2">
                <div className={`border rounded-2xl p-5 shadow-xs space-y-4 ${cardBgStyle}`}>
                  <h3 className={`text-xs font-bold font-mono uppercase tracking-widest ${textTitleStyle}`}>
                    {editingResource ? "Modify Published Eco Guide" : "Publish Eco Guide Fact Card"}
                  </h3>

                  <form onSubmit={submitResourceForm} className="space-y-4 text-xs">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>Guide Title</label>
                      <input
                        type="text"
                        required
                        value={resourceForm.title}
                        onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                        placeholder="e.g. Switch off standby appliances"
                        className={`w-full rounded-xl p-3 focus:outline-none ${controlBgStyle}`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>Category</label>
                        <select
                          value={resourceForm.category}
                          onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })}
                          className={`w-full rounded-xl p-3 focus:outline-none ${controlBgStyle}`}
                        >
                          <option value="Transportation">Transportation</option>
                          <option value="Electricity">Electricity</option>
                          <option value="Food Habits">Food Habits</option>
                          <option value="Waste Management">Waste Management</option>
                          <option value="Lifestyle">Lifestyle</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>CO₂ savings / year (kg)</label>
                        <input
                          type="number"
                          required
                          value={resourceForm.co2Savings}
                          onChange={(e) => setResourceForm({ ...resourceForm, co2Savings: e.target.value })}
                          className={`w-full rounded-xl p-3 font-mono focus:outline-none ${controlBgStyle}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>Fact Content (Supports Markdown)</label>
                      <textarea
                        required
                        placeholder="Explain the environmental reasons and context behind this recommendation..."
                        value={resourceForm.content}
                        onChange={(e) => setResourceForm({ ...resourceForm, content: e.target.value })}
                        rows={5}
                        className={`w-full text-xs rounded-xl p-3 focus:outline-none ${controlBgStyle}`}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl cursor-pointer flex items-center justify-center space-x-1.5 shadow-md"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4" />}
                        <span>Publish Fact Card</span>
                      </button>

                      {editingResource && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingResource(null);
                            setResourceForm({ title: '', category: 'Transportation', content: '', co2Savings: '50' });
                          }}
                          className={`px-4 py-3 rounded-xl cursor-pointer font-bold ${
                            isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-705 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* List Card */}
              <div className="lg:col-span-3 space-y-4">
                <div className={`border rounded-2xl p-5 shadow-xs space-y-4 ${cardBgStyle}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2">
                    <div>
                      <span className={`text-xs font-bold uppercase font-mono tracking-widest block ${textTitleStyle}`}>Published Eco Guides</span>
                      <span className={`text-[10px] ${textSubStyle}`}>Educational resource database items</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Search published cards..."
                      value={resourceSearch}
                      onChange={(e) => setResourceSearch(e.target.value)}
                      className={`text-xs rounded-xl p-2 px-3 focus:outline-none ${controlBgStyle}`}
                    />
                  </div>

                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {filteredResources.length === 0 ? (
                      <p className="text-center py-10 font-mono text-slate-505 text-slate-500 text-xs italic border border-dashed border-white/5 rounded-xl">
                        No published facts fit keyword parameters.
                      </p>
                    ) : (
                      filteredResources.map((resItem) => (
                        <div 
                          key={resItem.id} 
                          className={`p-4 border rounded-xl text-xs space-y-1 relative group transition-colors duration-150 ${
                            isLight ? 'bg-slate-50 border-slate-205 hover:border-slate-350' : 'bg-slate-950/40 border-slate-850 hover:border-emerald-950'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono block max-w-max mb-1 border border-emerald-500/15">
                                {resItem.category}
                              </span>
                              <h4 className={`font-bold font-sans text-xs ${textTitleStyle}`}>{resItem.title}</h4>
                            </div>

                            <div className="flex space-x-1 flex-shrink-0">
                              <button
                                onClick={() => {
                                  setEditingResource(resItem);
                                  setResourceForm({
                                    title: resItem.title,
                                    category: resItem.category,
                                    content: resItem.content,
                                    co2Savings: String(resItem.co2Savings)
                                  });
                                }}
                                className={`p-1.5 rounded border ${
                                  isLight ? 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                                }`}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteResource(resItem.id)}
                                className="p-1.5 bg-red-550 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className={`line-clamp-2 text-[11px] leading-tight mt-1 ${textSubStyle}`}>{resItem.content}</p>
                          <p className="text-[10px] text-emerald-500 font-mono font-bold pt-1">
                            Offsets: {resItem.co2Savings} kg/yr CO₂ Saved
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: CARBON EMISSIONS COEFFICIENTS TUNING */}
          {activeTab === 'coefficients' && (
            <div className={`border rounded-2xl p-6 shadow-xs space-y-6 ${cardBgStyle}`}>
              
              <div>
                <h3 className={`text-base font-bold font-display ${textTitleStyle}`}>Carbon Calibration Tuning Factors</h3>
                <p className={`text-xs ${textSubStyle}`}>
                  Configure emission factor multipliers (kg CO₂ equivalents/year defaults) across primary transport, diets, electricity consumption rates and lifecycle variables. 
                </p>
              </div>

              {emissions ? (
                <div className="space-y-6 text-xs max-w-3xl">
                  {Object.keys(emissions).map((categoryKey) => (
                    <div key={categoryKey} className={`border rounded-2xl p-4 space-y-3 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-slate-850'
                    }`}>
                      <h4 className="font-extrabold uppercase text-[10px] text-emerald-500 tracking-wider font-mono border-b border-white/5 pb-2.5 flex items-center justify-between">
                        <span>{categoryKey} Factors</span>
                        <span className={`text-[9px] font-normal tracking-normal ${textSubStyle}`}>Values in greenhouse kg equivalents per calendar year</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {emissions[categoryKey].map((factor: any, index: number) => (
                          <div key={factor.key} className={`flex items-center justify-between border p-3 rounded-xl ${
                            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-white/5'
                          }`}>
                            <div>
                              <span className={`font-bold block text-sm ${textTitleStyle}`}>{factor.label}</span>
                              <span className={`text-[10px] font-mono ${textSubStyle}`}>{factor.key} key</span>
                            </div>
                            
                            <div className="w-24">
                              <input
                                type="number"
                                value={factor.value}
                                onChange={(e) => handleUpdateEmissions(categoryKey, index, parseInt(e.target.value || "0"))}
                                className={`w-full text-right p-2.5 border rounded-lg font-mono font-bold hover:border-emerald-500 ${controlBgStyle}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-white/5 flex items-center space-x-2">
                    <button
                      onClick={saveEmissionsCoefficients}
                      disabled={submitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl cursor-pointer flex items-center space-x-1.5 shadow-md"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4" />}
                      <span>Save recasting coefficients</span>
                    </button>
                    
                    <button
                      onClick={fetchAllAdminData}
                      className={`font-semibold px-4 py-3 rounded-xl cursor-pointer ${
                        isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-705' : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      Reset defaults
                    </button>
                  </div>

                </div>
              ) : (
                <div className={`text-center p-12 font-mono text-xs ${textSubStyle}`}>No emission coefficients found. Seeding is recommended.</div>
              )}

            </div>
          )}

          {/* TAB 8: BADGES & MILESTONE RULES */}
          {activeTab === 'badges' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Creator Side */}
              <div className="lg:col-span-2">
                <div className={`border rounded-2xl p-5 shadow-xs space-y-4 ${cardBgStyle}`}>
                  <h3 className={`text-xs font-bold font-mono uppercase tracking-widest ${textTitleStyle}`}>
                    {editingBadge ? "Edit Achievement Badge" : "Create Achievement Badge"}
                  </h3>

                  <form onSubmit={submitBadgeForm} className="space-y-4 text-xs">
                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>Badge Name</label>
                      <input
                        type="text"
                        required
                        value={badgeForm.name}
                        onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })}
                        placeholder="e.g. Electric Vehicle Pioneer"
                        className={`w-full rounded-xl p-3 focus:outline-none ${controlBgStyle}`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>Glyph Emoji</label>
                        <input
                          type="text"
                          required
                          value={badgeForm.icon}
                          onChange={(e) => setBadgeForm({ ...badgeForm, icon: e.target.value })}
                          className={`w-full rounded-xl p-3 text-center text-lg focus:outline-none ${controlBgStyle}`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>XP Reward Points</label>
                        <input
                          type="number"
                          required
                          value={badgeForm.xpReward}
                          onChange={(e) => setBadgeForm({ ...badgeForm, xpReward: e.target.value })}
                          className={`w-full rounded-xl p-3 font-mono focus:outline-none ${controlBgStyle}`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-[9.5px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>Streak day thresholds</label>
                        <input
                          type="number"
                          required
                          value={badgeForm.requiredStreak}
                          onChange={(e) => setBadgeForm({ ...badgeForm, requiredStreak: e.target.value })}
                          className={`w-full rounded-xl p-3 font-mono focus:outline-none ${controlBgStyle}`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-[9.5px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>Challenge Thresholds</label>
                        <input
                          type="number"
                          required
                          value={badgeForm.requiredChallenges}
                          onChange={(e) => setBadgeForm({ ...badgeForm, requiredChallenges: e.target.value })}
                          className={`w-full rounded-xl p-3 font-mono focus:outline-none ${controlBgStyle}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold uppercase tracking-wider font-mono mb-1 ${textSubStyle}`}>Milestone Criteria Description</label>
                      <textarea
                        required
                        placeholder="e.g. Awarded automatically when an active profile logs a continuous 10 day streak..."
                        value={badgeForm.description}
                        onChange={(e) => setBadgeForm({ ...badgeForm, description: e.target.value })}
                        rows={3}
                        className={`w-full text-xs rounded-xl p-3 focus:outline-none ${controlBgStyle}`}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl cursor-pointer flex items-center justify-center space-x-1.5 shadow-md"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4" />}
                        <span>Save Badge Rule</span>
                      </button>

                      {editingBadge && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBadge(null);
                            setBadgeForm({ name: '', description: '', xpReward: '200', icon: '🏆', requiredStreak: '0', requiredChallenges: '1' });
                          }}
                          className={`px-4 py-3 rounded-xl cursor-pointer font-bold ${
                            isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-705' : 'bg-slate-850 hover:bg-slate-700 text-white'
                          }`}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* List Cards Side */}
              <div className="lg:col-span-3 space-y-4">
                <div className={`border rounded-2xl p-5 shadow-xs space-y-4 ${cardBgStyle}`}>
                  <span className={`text-xs font-bold uppercase font-mono tracking-widest block ${textTitleStyle}`}>Milestone Badges Library</span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[520px] overflow-y-auto pr-1">
                    {badgesList.length === 0 ? (
                      <p className="col-span-2 text-center py-10 font-mono text-slate-500 text-xs italic border border-dashed border-white/5 rounded-xl">
                        No milestone badges logged in backend. Include initial indices.
                      </p>
                    ) : (
                      badgesList.map((badgeItem) => (
                        <div 
                          key={badgeItem.id} 
                          className={`p-4 border rounded-xl text-xs space-y-1 relative hover:bg-emerald-500/5 duration-150 transition-all flex flex-col justify-between ${
                            isLight ? 'bg-slate-50 border-slate-205 hover:border-slate-350' : 'bg-slate-950/40 border-slate-855 hover:border-emerald-900 border-slate-850'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="text-3xl">{badgeItem.icon || '🏆'}</span>
                                <div>
                                  <h4 className={`font-bold font-sans ${textTitleStyle}`}>{badgeItem.name}</h4>
                                  <span className="text-[10px] font-mono font-bold text-emerald-500">+{badgeItem.xpReward} XP Gift</span>
                                </div>
                              </div>

                              <div className="flex space-x-1 flex-shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingBadge(badgeItem);
                                    setBadgeForm({
                                      name: badgeItem.name,
                                      description: badgeItem.description,
                                      xpReward: String(badgeItem.xpReward),
                                      icon: badgeItem.icon || '🏆',
                                      requiredStreak: String(badgeItem.requiredStreak),
                                      requiredChallenges: String(badgeItem.requiredChallenges)
                                    });
                                  }}
                                  className={`p-1 rounded border ${
                                    isLight ? 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                                  }`}
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => deleteBadge(badgeItem.id)}
                                  className="p-1 bg-red-500/10 text-red-500 border border-red-500/25 hover:bg-red-500/20 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <p className={`text-[11px] leading-tight mt-1.5 line-clamp-2 ${textSubStyle}`}>{badgeItem.description}</p>
                          </div>

                          <div className="pt-2 border-t border-white/5 mt-2 flex items-center justify-between text-[9.5px] text-slate-450 font-mono">
                            <span>Req Streak: <span className="text-emerald-500 font-bold">{badgeItem.requiredStreak}d</span></span>
                            <span>Req Challenges: <span className="text-emerald-500 font-bold">{badgeItem.requiredChallenges}</span></span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 9: SYSTEM SETTINGS */}
          {activeTab === 'settings' && (
            <div className={`border rounded-2xl p-6 shadow-xs space-y-6 ${cardBgStyle}`}>
              <div>
                <h3 className={`text-base font-bold font-display ${textTitleStyle}`}>System Configuration Settings</h3>
                <p className={`text-xs ${textSubStyle}`}>Review system diagnostic logs, administrative authorization, and execution parameters.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                
                {/* Authorization credentials */}
                <div className={`p-5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-slate-850'}`}>
                  <h4 className="text-xs font-extrabold text-[#10b981] mb-3 flex items-center space-x-1.5 uppercase">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    <span>Credentials Overview</span>
                  </h4>
                  <ul className={`space-y-2.5 ${textSubStyle}`}>
                    <li className="flex justify-between">
                      <span>Server Gateway:</span>
                      <span className="text-emerald-500 font-bold">EXPRESS / VITE</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Port Listeners:</span>
                      <span className="text-emerald-555 text-emerald-550 font-bold">PORT 3000</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Active database:</span>
                      <span className="text-emerald-500 font-bold">POSTGRESQL DB</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Authorization Mode:</span>
                      <span className="text-emerald-500 font-bold">JWT BEALER TOKEN</span>
                    </li>
                  </ul>
                </div>

                {/* DB seeds and maintenance */}
                <div className={`p-5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-slate-850'}`}>
                  <h4 className="text-xs font-extrabold text-[#10b981] mb-3 flex items-center space-x-1.5 uppercase">
                    <Settings className="w-4 h-4 text-emerald-500" />
                    <span>Maintenance commands</span>
                  </h4>
                  <div className="space-y-3 pt-1">
                    <div>
                      <p className={`text-[10px] mb-1.5 ${textSubStyle}`}>Saturates empty database tables with ready-to-test mock datasets.</p>
                      <button
                        onClick={handleSeedDocs}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-[10px] shadow-sm transition-all"
                      >
                        Execute Database Seed
                      </button>
                    </div>

                    <div className="border-t border-white/5 pt-3">
                      <p className={`text-[10px] mb-1.5 ${textSubStyle}`}>Download single aggregated JSON snapshot containing entire operational tables.</p>
                      <button
                        onClick={exportPlatformData}
                        className={`font-mono text-[10px] px-4 py-2 font-bold rounded-lg border cursor-pointer ${
                          isLight ? 'bg-white hover:bg-slate-100 border-slate-205' : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-[#ffffff]'
                        }`}
                      >
                        Download Platform snapshot
                      </button>
                    </div>
                  </div>
                </div>

              </div>
              
              <div className={`rounded-xl p-4.5 text-xs flex items-start space-x-2.5 ${
                isLight ? 'bg-slate-50 border-slate-100 text-slate-500' : 'bg-slate-900/40 border-slate-850 text-slate-400'
              }`}>
                <Info className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong>System Notice:</strong> Admin Panel functions allow full destructive modifications inside downstream active client apps. Ensure all challenge deletions are intentional, as progress logging references are purged asynchronously from the database storage engine.
                </p>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
