import { Leaf, Shield, Award, Compass, Heart, Share2, ArrowRight, CheckCircle2, ChevronDown, Zap, BarChart3, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface LandingPageProps {
  onStartOnboarding: () => void;
  onGoToLogin: () => void;
}

export default function LandingPage({ onStartOnboarding, onGoToLogin }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { value: "48,250", label: "kg CO₂ Saved", desc: "Combined community offset" },
    { value: "85%", label: "Average Waste Reduced", desc: "For fully recycled members" },
    { value: "12,400+", label: "Commutes Swapped", desc: "To green transit options" },
    { value: "4.9/5", label: "User Rating", desc: "Loved by eco-warriors globally" },
  ];

  const features = [
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-400" />,
      title: "AI-Powered Direct Analytics",
      description: "Calculates precise personal emissions from your transport, waste, and diet choices using localized metric factors.",
    },
    {
      icon: <Award className="w-6 h-6 text-emerald-400" />,
      title: "Daily Eco Streaks & Badges",
      description: "Build carbon-saving habits. Log your actions daily to grow your streak and unlock beautiful collectible accolades.",
    },
    {
      icon: <Compass className="w-6 h-6 text-emerald-400" />,
      title: "Community Action Challenges",
      description: "Engage in tailored carbon reduction challenges. Submit verified evidence to claim substantial XP and score boost.",
    },
    {
      icon: <Leaf className="w-6 h-6 text-emerald-400" />,
      title: "Interactive Green Map",
      description: "Instantly discover nearby electronic recycling depots, EV charging grids, public bike-share programs, and parks.",
    },
  ];

  const faqs = [
    {
      q: "How does GreenStep calculate my carbon footprint?",
      a: "GreenStep uses specialized emission coefficients (based on global guidelines like IPCC) correlated against your transportation habits, grid power usage, dietary style, and general lifestyle choices logged during onboarding."
    },
    {
      q: "What is the 'Eco Streak' and how does it work?",
      a: "Your Eco Streak grows by completing sustainable actions. Submitting proof for community challenges or logging actions on consecutive calendar days boosts your count. Missing days resets the streak according to standard rules."
    },
    {
      q: "Does GreenStep require any paid hardware?",
      a: "No! GreenStep is 100% free and mobile-friendly. You log daily actions manually and receive AI recommendations using advanced Gemini models."
    },
    {
      q: "How can I access the admin features?",
      a: "Role-based authorization secures our Admin panel. Only registered admin users (or specific test credentials) can configure global metrics, monitor database tables, and deploy community challenges."
    }
  ];

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051412] via-[#0d2a24] to-[#051412] text-[#ffffff] overflow-x-hidden font-sans">
      {/* Header */}
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/10 glass-panel-light sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600/20 p-2 rounded-xl border border-emerald-500/20 glow-green">
            <Leaf className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-white">
            Green<span className="text-emerald-400 font-medium">Step</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            id="nav-login-btn"
            onClick={onGoToLogin}
            className="text-slate-300 hover:text-white transition-all text-sm font-medium px-4 py-2 hover:bg-white/5 rounded-xl border border-transparent hover:border-slate-800"
          >
            Sign In
          </button>
          <button 
            id="nav-start-btn"
            onClick={onStartOnboarding}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg hover:shadow-emerald-500/10 active:scale-95"
          >
            Start Your Footprint
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 max-w-7xl mx-auto">
        {/* Background glow flares */}
        <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="text-center max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6">
              <Zap className="w-3.5 h-3.5" />
              <span>AI-Powered Personal Climate Analytics</span>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-tight"
          >
            Every Step Counts Toward a <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Greener Planet</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-slate-300 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto font-light"
          >
            Discover your environmental footprint in under 2 minutes. Get custom AI carbon reduction guidelines, earn badges, and join hands-on challenges to offset emissions dynamically.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-20"
          >
            <button 
              id="hero-start-btn"
              onClick={onStartOnboarding}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-xl transition-all shadow-xl hover:shadow-emerald-500/20 flex items-center justify-center space-x-2.5 text-base active:scale-95 group"
            >
              <span>Calculate Carbon Footprint</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              id="hero-login-btn"
              onClick={onGoToLogin}
              className="w-full sm:w-auto text-[#f8fafc] hover:bg-white/5 px-8 py-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all text-base font-semibold"
            >
              Go to Profile
            </button>
          </motion.div>
        </div>

        {/* Brand Mock panel / Dashboard glimpse */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="max-w-5xl mx-auto rounded-2xl glass-panel p-2 shadow-2xl relative border-slate-800"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 rounded-2xl blur-lg opacity-40 pointer-events-none" />
          <div className="bg-[#0b101c]/90 rounded-xl overflow-hidden border border-slate-800/60 p-4 sm:p-6">
            {/* Fake top bar */}
            <div className="flex items-center justify-between mb-6 border-b border-slate-800/30 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/40" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                <div className="w-3 h-3 rounded-full bg-green-500/40" />
                <span className="text-xs text-slate-500 ml-4 font-mono">dashboard_preview_v2.tsx</span>
              </div>
              <div className="bg-emerald-950/40 border border-emerald-900/40 px-3 py-1 rounded-lg text-emerald-400 text-xs flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Leaderboard Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-[#0d162a] p-5 rounded-xl border border-slate-800/40">
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Estimated Carbon Score</div>
                <div className="text-3xl font-display font-medium text-emerald-400">830 <span className="text-sm text-slate-500">/ 1000</span></div>
                <div className="mt-3 text-xs text-slate-400">High Sustainable Efficiency (Top 12% in Singapore region)</div>
              </div>
              
              <div className="bg-[#0d162a] p-5 rounded-xl border border-slate-800/40 col-span-2">
                <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">My Carbon Saving Trends</div>
                <div className="flex items-end space-x-1.5 h-16 pt-2">
                  <div className="w-full bg-slate-800 rounded-sm h-[30%]" />
                  <div className="w-full bg-slate-800 rounded-sm h-[40%]" />
                  <div className="w-full bg-emerald-600 rounded-sm h-[60%] hover:bg-emerald-500 transition-colors cursor-pointer" />
                  <div className="w-full bg-slate-800 rounded-sm h-[50%]" />
                  <div className="w-full bg-emerald-600 rounded-sm h-[75%] hover:bg-emerald-500 transition-colors cursor-pointer" />
                  <div className="w-full bg-emerald-500 rounded-sm h-[90%] hover:bg-emerald-400 transition-colors cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Sustainability Statistics */}
      <section className="bg-[#0b101d] border-y border-slate-800/30 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center sm:text-left p-4">
              <div className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white mb-2">{stat.value}</div>
              <div className="text-emerald-400 font-semibold text-sm mb-1">{stat.label}</div>
              <div className="text-slate-400 text-xs">{stat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">Engage in Seamless Green Accounting</h2>
          <p className="text-slate-400">Everything you need to turn simple daily steps into verifiable carbon footprint reductions and environmental health gains.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, i) => (
            <div key={i} className="glass-panel p-8 rounded-2xl hover:border-emerald-500/30 transition-all hover:scale-[1.01] flex items-start space-x-5">
              <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-900/60 h-12 w-12 flex items-center justify-center flex-shrink-0">
                {feat.icon}
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{feat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#070b13] border-t border-slate-800/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">Loved by Sustainable Leaders</h2>
            <p className="text-slate-400">What our community says about their climate reduction journeys on GreenStep.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                text: "GreenStep fundamentally reshaped my dynamic of daily commuting. Swapping my petrol vehicle for carbon-free trains is now easily tracked. The streak feels amazing!",
                name: "Clara Tan",
                role: "Sustainability Director, ESG Group"
              },
              {
                text: "The personalized Gemini recommendations were surprisingly specific! It analyzed my medium electricity bills and suggested simple outlet changes that chopped 15% off my billing.",
                name: "Marcus Aurelius",
                role: "Hackathon Organizer"
              },
              {
                text: "The UI design is elite. Highly responsive, minimal, and beautifully green-themed. It feels like Stripe but for climate tracking. Complete victory!",
                name: "Dr. Sarah Lin",
                role: "Environmental Researcher, NUS"
              }
            ].map((t, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex space-x-1 text-emerald-400 mb-4">
                    {[...Array(5)].map((_, idx) => <Star key={idx} className="w-4 h-4 fill-emerald-400" />)}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed italic mb-6">"{t.text}"</p>
                </div>
                <div>
                  <div className="font-display font-bold text-white mb-0.5">{t.name}</div>
                  <div className="text-emerald-400 text-xs">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-400">Clear up any confusion before embarking on your global emission savings path.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-panel rounded-xl overflow-hidden transition-all">
              <button 
                onClick={() => toggleFaq(i)}
                className="w-full text-left px-6 py-5 flex items-center justify-between font-display font-medium text-white hover:text-emerald-300 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${activeFaq === i ? 'rotate-180 text-emerald-400' : ''}`} />
              </button>
              {activeFaq === i && (
                <div className="px-6 pb-5 text-slate-300 text-sm leading-relaxed border-t border-slate-800/30 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="relative py-20 px-6 overflow-hidden max-w-5xl mx-auto mb-20">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur opacity-30 pointer-events-none" />
        <div className="glass-panel text-center p-10 sm:p-16 rounded-3xl relative border-emerald-500/20 glow-green">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white mb-4">Ready to Step Toward Net Zero?</h2>
          <p className="text-slate-300 text-base max-w-xl mx-auto mb-8 font-light">Join thousands of climate leaders and take your first step toward sustainability monitoring in under a minute.</p>
          <button 
            id="cta-onboard-btn"
            onClick={onStartOnboarding}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl transition-all shadow-xl hover:shadow-emerald-500/10 active:scale-95 text-base"
          >
            Start Your Footprint
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-850 bg-[#060910] text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <span className="font-display font-bold text-white">GreenStep</span>
          </div>
          <p className="text-xs">© 2026 GreenStep Platform. Every Step Counts Toward a Greener Planet.</p>
        </div>
      </footer>
    </div>
  );
}
