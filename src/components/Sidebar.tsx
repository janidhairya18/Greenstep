import { LayoutDashboard, Compass, BookOpen, MapPin, User, Leaf, ShieldAlert, Sparkles, Trophy } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  onLogout?: () => void;
  userName: string;
  userEmail: string;
  theme: 'dark' | 'light';
}

export default function Sidebar({ activeTab, setActiveTab, isAdmin, userName, theme }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'insights', label: 'AI Coach Insights', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'challenges', label: 'Eco Challenges', icon: <Compass className="w-4 h-4" /> },
    { id: 'guide', label: 'Eco Guide', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'nearby', label: 'Green Map Locations', icon: <MapPin className="w-4 h-4" /> },
    { id: 'leaderboard', label: 'Leaderboards', icon: <Trophy className="w-4 h-4" /> },
    { id: 'profile', label: 'Eco Profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <aside className={`w-64 flex flex-col h-fit sticky top-6 rounded-2xl ml-6 mt-6 border transition-all duration-300 flex-shrink-0 z-30 p-5 space-y-5 ${
      theme === 'dark' 
        ? 'bg-[#0b1c19]/50 border-white/5 shadow-2xl shadow-black/40 text-white' 
        : 'bg-white border-slate-200 shadow-lg text-slate-800'
    }`}>
      {/* Header Branding */}
      <div 
        onClick={() => setActiveTab('dashboard')}
        className="flex items-center space-x-2.5 px-1 cursor-pointer hover:opacity-90 select-none"
      >
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg w-8 h-8 flex items-center justify-center font-bold shadow-md">
          <Leaf className="w-4.5 h-4.5 text-emerald-400 fill-emerald-500/60" />
        </div>
        <span className={`font-display font-black text-lg tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          Green<span className="text-[#10b981] font-medium">Step</span>
        </span>
      </div>

      {/* User Glimpse card */}
      <div className="px-0">
        <div 
          onClick={() => setActiveTab('profile')}
          className={`p-3.5 flex items-center space-x-3 rounded-xl cursor-pointer transition-all ${
            theme === 'dark' 
              ? 'bg-white/5 hover:bg-white/10 border border-white/5' 
              : 'bg-slate-50 hover:bg-slate-100 border border-slate-250/30'
          }`}
          title="View profile settings"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center font-extrabold text-sm shadow-inner">
            {userName ? userName.charAt(0).toUpperCase() : 'E'}
          </div>
          <div className="overflow-hidden flex-1">
            <div className={`text-xs font-bold leading-none truncate ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              {userName || 'Eco Stepper'}
            </div>
            <div className="text-[10px] text-emerald-500 truncate mt-1 font-semibold tracking-wider uppercase">
              Sustain Warrior
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Nav */}
      <nav className="space-y-1.5 flex flex-col">
        {menuItems.map((item) => {
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                isSelected
                  ? theme === 'dark'
                    ? 'bg-white/10 text-white border-l-2 border-emerald-500 shadow-sm'
                    : 'bg-emerald-500/10 text-emerald-700 border-l-2 border-emerald-500 font-bold'
                  : theme === 'dark'
                    ? 'text-slate-400 hover:text-white hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
              }`}
            >
              <div className={`transition-transform group-hover:scale-110 ${
                isSelected
                  ? 'text-emerald-500'
                  : theme === 'dark' ? 'text-slate-500 group-hover:text-slate-200' : 'text-slate-400 group-hover:text-slate-700'
              }`}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* ADMIN ACTION ACCESS CONTROL */}
        {isAdmin && (
          <div className={`pt-3.5 border-t mt-3.5 ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
            <span className={`text-[9px] font-bold uppercase tracking-widest pl-2.5 block mb-1.5 font-mono ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
              Staff Access
            </span>
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full text-left flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'admin'
                  ? theme === 'dark'
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                    : 'bg-rose-50 text-rose-700 border-rose-100'
                  : theme === 'dark'
                    ? 'text-rose-400/85 hover:text-rose-200 hover:bg-rose-500/5 border-transparent'
                    : 'text-rose-600 hover:text-rose-800 hover:bg-rose-50 border-transparent'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Admin Console</span>
            </button>
          </div>
        )}
      </nav>
    </aside>
  );
}
