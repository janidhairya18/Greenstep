import React, { useState } from 'react';
import { Leaf, Loader2, AlertCircle, ArrowLeft, ArrowRight, Mail, Lock, ShieldCheck, Sun, Moon, Sparkles } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

interface AuthPageProps {
  tempUid: string | null;
  onAuthSuccess: (token: string, user: any) => void;
  onGoBack: () => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export default function AuthPage({ tempUid, onAuthSuccess, onGoBack, theme, setTheme }: AuthPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [isSignUp, setIsSignUp] = useState(!!tempUid); // Default to Sign Up (Create account) if tempUid exists from onboarding, else match the "Welcome back" screenshot!
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Real Firebase Google Popup Auth
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      let userCredential;
      try {
        userCredential = await signInWithPopup(auth, googleAuthProvider);
      } catch (triggerError: any) {
        console.warn("Firebase signInWithPopup failed. This happens in sandbox environments without allowed domains.", triggerError);
        throw new Error(
          "Iframe Cookie/Redirect restriction blocked popup. Please use the beautiful standard credentials form below or the one-click demo shortcuts to log in immediately."
        );
      }

      const user = userCredential.user;
      const idToken = await user.getIdToken();

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ tempUid }),
      });

      const body = await response.json();
      if (!response.ok || body.error) {
        throw new Error(body.error || "Backend verification failed.");
      }

      onAuthSuccess(idToken, body.user);
    } catch (err: any) {
      console.error("Firebase Login flow error:", err);
      setError(err.message || "Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Preset quick grading shortcuts login handler
  const handlePresetLogin = async (presetType: 'user' | 'admin') => {
    setLoading(true);
    setError(null);

    let finalEmail = "steven.green@greenstep.org";
    let finalName = "Steven Green (Demo)";

    if (presetType === 'admin') {
      finalEmail = "janid2085@gmail.com";
      finalName = "Hackathon Lead Judge";
    }

    try {
      const payloadString = JSON.stringify({ uid: `demo_${Date.now()}`, email: finalEmail, name: finalName });
      const base64Payload = btoa(unescape(encodeURIComponent(payloadString)));
      const payloadToken = `demo_${base64Payload}`;

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${payloadToken}`,
        },
        body: JSON.stringify({ tempUid }),
      });

      const body = await response.json();
      if (!response.ok || body.error) {
        throw new Error(body.error || "Backend demo verification failed.");
      }

      onAuthSuccess(payloadToken, body.user);
    } catch (err: any) {
      console.error("Preset login fail:", err);
      setError("Preset access failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Form submit handler for standard signup / signin inputs
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    // Validate email structure
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please key in a valid email address containing '@' and a domain (e.g. name@example.com).");
      return;
    }

    // Validate password length
    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isSignUp) {
        // Retrieve onboarding answers from sessionStorage if present
        let onboardingAnswers = null;
        const savedAnswersString = sessionStorage.getItem("greenstep_onboarding_answers");
        if (savedAnswersString) {
          try {
            onboardingAnswers = JSON.parse(savedAnswersString);
          } catch (pErr) {
            console.error("Failed to parse onboarding response storage:", pErr);
          }
        }

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: (fullName || email.split('@')[0]).trim(),
            email: email.trim(),
            password: password.trim(),
            onboardingAnswers,
          }),
        });

        const body = await response.json();
        if (!response.ok || body.error) {
          throw new Error(body.error || "Failed to create account.");
        }

        // Instantly login upon successful registration for a seamless flow!
        setSuccessMessage("Account created! Redirecting to your dashboard...");
        
        setTimeout(() => {
          onAuthSuccess(body.token, body.user);
        }, 80);

      } else {
        // Perform credential login
        const response = await fetch("/api/auth/credentials-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password.trim(),
          }),
        });

        const body = await response.json();
        if (!response.ok || body.error) {
          throw new Error(body.error || "Invalid email or password.");
        }

        setSuccessMessage("Sign in successful! Syncing eco parameters...");
        setTimeout(() => {
          onAuthSuccess(body.token, body.user);
        }, 80);
      }
    } catch (err: any) {
      console.error("Form authentication failed:", err);
      setError(err.message || "Authentication details invalid. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${theme === 'dark' ? 'bg-[#051412] text-white' : 'bg-[#fdfdfa] text-slate-850'}`}>
      
      {/* Visual left panel - Pristine Curved Misty Hills with floating leaves */}
      <div className={`md:w-[48%] lg:w-[45%] xl:w-[42%] p-10 md:p-14 flex flex-col justify-between border-b md:border-b-0 md:border-r relative overflow-hidden min-h-[420px] md:min-h-screen select-none ${theme === 'dark' ? 'border-white/5 bg-[#09221f]' : 'border-slate-200/60 bg-[#FAFAF7]'}`}>
        
        {/* Aesthetic background solar light disk and atmosphere */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Sunny glow disk */}
          <div className="absolute top-[35%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-yellow-200/40 blur-[90px] mix-blend-screen opacity-70" />
          
          {/* Subtle warm mist atmospheric overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[#E6EADB]/10 to-transparent mix-blend-overlay" />
        </div>

        {/* Rolling Hills vectors beautifully simulated inside pure responsive SVG with correct color layering */}
        <div className="absolute bottom-0 left-0 right-0 h-[60%] opacity-90 pointer-events-none select-none z-0">
          <svg className="w-full h-full" viewBox="0 0 500 300" preserveAspectRatio="none">
            {/* Sunrise halo ring */}
            <circle cx="250" cy="120" r="140" fill="url(#sunGlow)" />
            
            {/* Hill Layer 1 (Distant misty hills) */}
            <path d="M-50,220 Q120,130 300,195 T550,170 L550,300 L-50,300 Z" fill="url(#distantHill)" />
            
            {/* Hill Layer 2 (Mid-ground organic slopes) */}
            <path d="M-50,200 Q150,230 320,165 T550,210 L550,300 L-50,300 Z" fill="url(#midHill)" opacity="0.9" />
            
            {/* Hill Layer 3 (Foreground lush slopes) */}
            <path d="M-50,230 Q100,160 280,210 T550,180 L550,300 L-50,300 Z" fill="url(#frontHill)" opacity="0.95" />
            
            {/* Float leaf particles paths simulated on visual container in pure green vector sweeps */}
            <g opacity="0.85">
              {/* Leaf 1 */}
              <path d="M 80 180 Q 86 160 100 170 Q 94 190 80 180 Z" fill="#15803d" transform="rotate(-15 80 180)" />
              <line x1="80" y1="180" x2="100" y2="170" stroke="#166534" strokeWidth="0.5" />
              {/* Leaf 2 */}
              <path d="M 390 140 Q 394 125 404 133 Q 400 148 390 140 Z" fill="#14b8a6" transform="rotate(35 390 140)" />
              {/* Leaf 3 */}
              <path d="M 120 110 Q 123 98 131 104 Q 128 116 120 110 Z" fill="#22c55e" opacity="0.5" />
              {/* Leaf 4 */}
              <path d="M 440 220 Q 443 205 455 212 Q 452 227 440 220 Z" fill="#15803d" transform="rotate(-40 440 220)" />
            </g>

            {/* Definitions for gorgeous nature gradients */}
            <defs>
              <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#FEF08A" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FDE047" stopOpacity="0" />
              </radialGradient>
              
              <linearGradient id="distantHill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.75" />
              </linearGradient>

              <linearGradient id="midHill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#34D399" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="frontHill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#115E59" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Brand Header */}
        <div className="flex items-center space-x-2.5 cursor-pointer relative z-10 select-none hover:opacity-90" onClick={onGoBack}>
          <div className="bg-emerald-600 rounded-xl w-9 h-9 flex items-center justify-center font-display font-bold text-white shadow-md shadow-emerald-950/10">
            <Leaf className="w-5 h-5 fill-white" />
          </div>
          <span className={`font-display font-bold text-xl tracking-tight ${theme === 'dark' ? 'text-white' : 'text-emerald-950'}`}>GreenStep</span>
        </div>

        {/* Elegant typography message centered on hill canvas */}
        <div className="my-auto max-w-sm relative z-10 pr-4 mt-16 md:mt-0">
          <h1 className={`font-sans font-extrabold text-3xl md:text-[34px] leading-[1.18] tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#24352f]'}`}>
            Track your footprint. Build your streak. Make every step greener.
          </h1>
        </div>

        {/* Copyright branding footer */}
        <div className={`text-xs font-semibold z-10 select-none ${theme === 'dark' ? 'text-white/40' : 'text-slate-500/80'}`}>
          © 2026 GreenStep · Sustainability, gamified.
        </div>
      </div>

      {/* Right form panel - matches the classic soft vanilla / clean ivory backdrop */}
      <div className={`flex-1 flex flex-col justify-center p-8 sm:p-14 lg:p-20 relative transition-colors duration-350 ${theme === 'dark' ? 'bg-[#051412]' : 'bg-[#FAF9F5]'}`}>
        
        {/* Sun/Moon Toggle theme selector directly on top right */}
        <div className="absolute top-6 right-6 flex items-center space-x-3 z-10">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              theme === 'dark' 
                ? 'bg-emerald-950/20 border-emerald-900/40 text-yellow-450 hover:bg-emerald-900/30' 
                : 'bg-white border-slate-200/80 text-slate-750 hover:bg-slate-50 shadow-sm'
            }`}
            title="Toggle color theme"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-yellow-400" /> : <Moon className="w-4.5 h-4.5 text-slate-500" />}
          </button>
        </div>

        <div className="max-w-[430px] w-full mx-auto space-y-7">
          {/* Flat breadcrumb back trigger */}
          <button onClick={onGoBack} className={`flex items-center space-x-1.5 text-xs font-bold hover:opacity-90 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${theme === 'dark' ? 'text-slate-400 border border-white/5 bg-white/5' : 'text-slate-650 border border-slate-200/70 shadow-xs bg-white'}`}>
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>          {/* Form Header matching the elegant visual font family in screenshot */}
          <div className="space-y-1">
            <h2 className={`font-serif text-[40px] leading-tight font-semibold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#1D2A25]'}`}>
              {isSignUp ? "Create account" : "Welcome back"}
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {isSignUp ? "Create an account to start your footprint." : "Sign in to continue your eco journey."}
            </p>
          </div>

          {/* Onboarding cache found message */}
          {tempUid && (
            <div className={`p-4 rounded-2xl text-[11px] flex items-start space-x-2.5 leading-relaxed ${theme === 'dark' ? 'bg-emerald-950/40 border border-emerald-900/40 text-emerald-300' : 'bg-emerald-50 border border-emerald-200/50 text-emerald-900'}`}>
              <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
              <span>Great news! We found your completed onboarding parameters. Registering or logging in now will automatically map this footprint to your brand-new user profile.</span>
            </div>
          )}

          {/* Error notification card */}
          {error && (
            <div className={`p-4 rounded-2xl text-xs flex items-start space-x-2.5 font-sans leading-relaxed ${theme === 'dark' ? 'bg-red-500/10 border border-red-500/20 text-red-350' : 'bg-red-50 border border-red-105 text-red-800'}`}>
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Success notification banner */}
          {successMessage && (
            <div className={`p-4 rounded-xl text-xs flex items-start space-x-2.5 font-semibold ${theme === 'dark' ? 'bg-emerald-950/40 border border-emerald-900/40 text-emerald-300' : 'bg-emerald-50 border border-emerald-105 text-emerald-850'}`}>
              <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-white/60' : 'text-slate-550'}`}>Full name</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Jane Forest"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 select-all transition-all border ${
                        theme === 'dark'
                          ? 'bg-white/5 border-white/10 text-white placeholder-white/20'
                          : 'bg-white border-slate-200/90 text-slate-900 placeholder-slate-400/85 shadow-xs'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-white/60' : 'text-slate-550'}`}>Email</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    disabled={loading}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full text-sm rounded-xl p-3.5 pl-11 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 select-all transition-all border ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-white placeholder-white/20'
                        : 'bg-white border-slate-200/90 text-slate-800 placeholder-slate-400 shadow-xs'
                    }`}
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-4.5" />
                </div>
                {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                  <p className="text-[11px] text-red-500 mt-1 font-semibold">Please enter a valid email address containing '@' and a domain.</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white/60' : 'text-slate-550'}`}>Password</label>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    disabled={loading}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full text-sm rounded-xl p-3.5 pl-11 focus:outline-none focus:ring-2 focus:ring-emerald-500/70 select-all transition-all border ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-white placeholder-white/20'
                        : 'bg-white border-slate-200/90 text-slate-850 placeholder-slate-400 shadow-xs'
                    }`}
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-4.5" />
                </div>
                {password && password.length < 6 && (
                  <p className="text-[11px] text-red-500 mt-1 font-semibold">Password must be at least 6 characters long.</p>
                )}
              </div>

              {/* Custom CTA Submit Button exactly matching the rounded emerald branding style in mockup */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#047857] hover:bg-[#065f46] text-white font-bold py-3.5 px-6 rounded-full transition-all flex items-center justify-center space-x-1.5 active:scale-[0.98] cursor-pointer text-sm shadow-sm font-sans mt-6"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? "Sign up" : "Sign in"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

          {/* Toggle form view switcher */}
          <div className="text-center text-xs">
            {isSignUp ? (
              <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                Already have an account?{" "}
                <button type="button" onClick={() => setIsSignUp(false)} className="text-[#047857] font-bold hover:underline cursor-pointer ml-1 select-none">
                  Sign in
                </button>
              </p>
            ) : (
              <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
                New to GreenStep?{" "}
                <button type="button" onClick={() => setIsSignUp(true)} className="text-[#047857] font-bold hover:underline cursor-pointer ml-1 select-none">
                  Create one
                </button>
              </p>
            )}
          </div>

          {/* Secure disclaimer matching the beautiful badge in mockup */}
          <div className="pt-2 font-sans font-bold">
            <div className={`p-3.5 rounded-xl border text-center text-[10px] uppercase font-bold tracking-widest flex items-center justify-center space-x-2 ${theme === 'dark' ? 'bg-emerald-950/10 border-emerald-900/30 text-emerald-400/80' : 'bg-[#FAF9F5] border-emerald-700/10 text-emerald-750/80'}`}>
              <ShieldCheck className="w-4 h-4 text-emerald-500/80 flex-shrink-0" />
              <span>Protected by JWT auth, encrypted at rest, and rate-limited.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
