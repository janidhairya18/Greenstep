import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Bike, Compass, Zap, Flame, Trash, ArrowRight, ArrowLeft, Loader2, Leaf, ShoppingBag, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onCompleted: (tempUid: string) => void;
  onGoBack: () => void;
}

export default function Onboarding({ onCompleted, onGoBack }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [transportation, setTransportation] = useState('');
  const [electricityUsage, setElectricityUsage] = useState('');
  const [foodHabits, setFoodHabits] = useState('');
  const [wasteManagement, setWasteManagement] = useState('');
  const [lifestyle, setLifestyle] = useState('');

  // Interactive calculation states
  const [calculationStage, setCalculationStage] = useState<'idle' | 'processing' | 'result'>('idle');
  const [calcProgress, setCalcProgress] = useState(0);
  const [calcStatusIndex, setCalcStatusIndex] = useState(0);
  const [calculatedResult, setCalculatedResult] = useState<{
    tempUid: string;
    carbonScore: number;
    co2Emissions: number;
  } | null>(null);

  const calcStatusMessages = [
    "Analyzing commute modes & vehicle emissions...",
    "Computing smart grid & household utility factors...",
    "Calculating food diet agricultural footprints...",
    "Measuring domestic recycling & compost variables...",
    "Engineering your bespoke sustainability score..."
  ];

  const stepsCount = 5;

  const transportOptions = [
    { value: 'walking', label: 'Walking / Active Feet', desc: 'No emissions, zero carbon waste', icon: <Bike className="w-5 h-5 text-emerald-400" /> },
    { value: 'cycling', label: 'Bicycling', desc: 'Pedal-powered carbon-free transport', icon: <Bike className="w-5 h-5 text-emerald-400" /> },
    { value: 'bike', label: 'Motorbike / Scooter', desc: 'Moderate emissions, high efficiency', icon: <Car className="w-5 h-5 text-emerald-400" /> },
    { value: 'public transport', label: 'Public Metro & Buses', desc: 'Shared grid travel, low footprint', icon: <Compass className="w-5 h-5 text-emerald-400 text-teal-450" /> },
    { value: 'ev', label: 'Electric Vehicle (EV)', desc: 'Grid-powered zero-tailpipe motor', icon: <Zap className="w-5 h-5 text-emerald-400" /> },
    { value: 'petrol car', label: 'Petrol/Diesel Car', desc: 'Fossil-fueled sole passenger trip', icon: <Car className="w-5 h-5 text-rose-400" /> },
  ];

  const electricityOptions = [
    { value: 'Low', label: 'Low (<200 kWh/month)', desc: 'Small flat, natural lighting, passive cooling', icon: <Zap className="w-5 h-5 text-emerald-400" /> },
    { value: 'Medium', label: 'Medium (200-500 kWh/month)', desc: 'Standard home, moderate appliances', icon: <Zap className="w-5 h-5 text-teal-400" /> },
    { value: 'High', label: 'High (>500 kWh/month)', desc: 'Large household, frequent heavy aircon / appliances', icon: <Zap className="w-5 h-5 text-rose-450 text-amber-500" /> },
  ];

  const foodOptions = [
    { value: 'Vegan', label: 'Vegans (100% Plant-Based)', desc: 'Lowest industrial agricultural footprint', icon: <Leaf className="w-5 h-5 text-emerald-400" /> },
    { value: 'Vegetarian', label: 'Vegetarians', desc: 'Dairy / eggs included, meat-free lifestyle', icon: <Leaf className="w-5 h-5 text-teal-400" /> },
    { value: 'Flexitarian', label: 'Flexitarian (Occasional Meat)', desc: 'Conscious reduction of red meat habits', icon: <Flame className="w-5 h-5 text-yellow-500" /> },
    { value: 'Heavy Meat Eater', label: 'Heavy Meat Eater', desc: 'Daily beef, pork, or poultry dishes', icon: <Flame className="w-5 h-5 text-rose-500" /> },
  ];

  const wasteOptions = [
    { value: 'Recycle fully', label: 'Carefully Sort & Recycle Fully', desc: 'Zero organic waste, clean plastic/metal recycling', icon: <Trash className="w-5 h-5 text-emerald-400" /> },
    { value: 'Sometimes recycle', label: 'Sometimes recycle', desc: 'Recycle plastics, but toss cardboard / food', icon: <Trash className="w-5 h-5 text-teal-400" /> },
    { value: 'No recycling', label: 'No recycling bins used', desc: 'All materials end in public landfill garbage', icon: <Trash className="w-5 h-5 text-rose-450 text-slate-500" /> },
  ];

  const lifestyleOptions = [
    { value: 'Eco-conscious', label: 'Eco-conscious Minimalist', desc: 'Organic sourcing, reusable fashion, secondhand buys', icon: <ShoppingBag className="w-5 h-5 text-emerald-400" /> },
    { value: 'Average consumer', label: 'Average Consumer', desc: 'Standard shopping habits, typical replacement cycles', icon: <ShoppingBag className="w-5 h-5 text-teal-400" /> },
    { value: 'Luxury/frequent buying', label: 'Frequent buying / High Luxury', desc: 'Fast fashion trends, major retail deliveries', icon: <ShoppingBag className="w-5 h-5 text-rose-450 text-amber-500" /> },
  ];

  const handleNext = () => {
    if (step < stepsCount) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onGoBack();
    }
  };

  const handleSubmit = async () => {
    // Validate
    if (!transportation || !electricityUsage || !foodHabits || !wasteManagement || !lifestyle) {
      setError("Please answer all questions before submitting.");
      return;
    }

    // Generate guest ID instantly on client side
    const tempUid = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // Store in session storage instantly
    sessionStorage.setItem("greenstep_temp_uid", tempUid);
    sessionStorage.setItem("greenstep_onboarding_answers", JSON.stringify({
      transportation,
      electricityUsage,
      foodHabits,
      wasteManagement,
      lifestyle,
    }));

    // Fire off API in background so we do not block UI transitions at all
    fetch("/api/onboarding-temp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transportation,
        electricityUsage,
        foodHabits,
        wasteManagement,
        lifestyle,
      }),
    }).catch((err) => console.warn("Background temporary answers logging:", err));

    // Instantly go to login page without any loading delay!
    onCompleted(tempUid);
  };

  const isCurrentStepAnswered = () => {
    if (step === 1) return transportation !== '';
    if (step === 2) return electricityUsage !== '';
    if (step === 3) return foodHabits !== '';
    if (step === 4) return wasteManagement !== '';
    if (step === 5) return lifestyle !== '';
    return false;
  };

  if (calculationStage === 'processing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#051412] via-[#0d2a24] to-[#051412] text-[#ffffff] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl text-center space-y-8">
          <div className="flex justify-center">
            <div className="relative w-24 h-24">
              {/* Outer glowing pulsing circle */}
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-pulse" />
              {/* Spinning top arc */}
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 border-r-emerald-400 animate-spin" style={{ animationDuration: '0.8s' }} />
              {/* Centered static icon */}
              <div className="absolute inset-3 bg-slate-950 rounded-full border border-slate-800/80 flex items-center justify-center shadow-inner">
                <Leaf className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="font-display text-xl font-bold text-white tracking-tight">Eco Calculation Engine</h2>
              <p className="text-xs text-slate-400">Processing carbon-coefficient databases...</p>
            </div>
            
            {/* Custom progress bar */}
            <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden w-full max-w-[240px] mx-auto border border-slate-800/60">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150 ease-out rounded-full"
                style={{ width: `${calcProgress}%` }}
              />
            </div>

            {/* Dynamic Status messages with nice height constraint to prevent shifting */}
            <div className="h-10 flex items-center justify-center">
              <p className="text-xs text-slate-300 font-mono text-emerald-300 bg-emerald-950/20 border border-emerald-900/30 px-3 py-1.5 rounded-lg animate-pulse">
                {calcStatusMessages[calcStatusIndex]}
              </p>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest pt-4 border-t border-slate-800/40">
            Evaluating {stepsCount} onboarding variables
          </div>
        </div>
      </div>
    );
  }

  if (calculationStage === 'result' && calculatedResult) {
    const { carbonScore, co2Emissions, tempUid } = calculatedResult;
    
    // Dynamic message based on score
    let scoreTier = "Good Starter";
    let scoreColor = "text-yellow-400";
    let scoreBg = "bg-yellow-500/10 border-yellow-500/20";
    let scoreFeedback = "Good job! You have solid eco-habits but have clear areas for easy gains. Join GreenStep to start tracking and improving!";

    if (carbonScore >= 750) {
      scoreTier = "Eco Champion";
      scoreColor = "text-emerald-400";
      scoreBg = "bg-emerald-500/10 border-emerald-500/20";
      scoreFeedback = "Outstanding! Your lifestyle is exceptionally planet-conscious. You're already a Sustainability Warrior. Saving your score is your next step!";
    } else if (carbonScore < 500) {
      scoreTier = "Energy Intensive";
      scoreColor = "text-rose-400";
      scoreBg = "bg-rose-500/10 border-rose-500/20";
      scoreFeedback = "An eye-opening start. Your carbon footprints are currently higher than average. Don't worry—our daily mini-challenges will help you fast-track your reduction!";
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#051412] via-[#0d2a24] to-[#051412] text-[#ffffff] flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full">
          {/* Logo Header */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="bg-emerald-600/20 p-1.5 rounded-xl border border-emerald-500/20 glow-green">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-display font-bold text-xl text-white">GreenStep</span>
          </div>

          <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl relative space-y-8">
            <div className="text-center space-y-3">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-full uppercase tracking-widest font-mono">
                Calculation Completed
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">Your Carbon Score is Ready!</h2>
              <p className="text-sm text-slate-400">We ran standard greenhouse gas equations against your selections to construct your custom footprint.</p>
            </div>

            {/* Score Grid Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Carbon Score Card */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl text-center space-y-2 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">SUSTAINABILITY SCORE</span>
                <div className="text-5xl font-black text-white flex items-baseline justify-center">
                  <span className={scoreColor}>{carbonScore}</span>
                  <span className="text-slate-500 text-sm font-normal font-mono ml-1">/ 1000</span>
                </div>
                <div className={`mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono uppercase ${scoreBg} ${scoreColor}`}>
                  <span>{scoreTier}</span>
                </div>
              </div>

              {/* CO2 Emissions Card */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl text-center space-y-2 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-teal-500/5 rounded-full blur-xl group-hover:scale-150 transition-all duration-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">ANNUAL CO₂ EMISSIONS</span>
                <div className="text-5xl font-black text-teal-400 flex items-baseline justify-center">
                  <span>{(co2Emissions / 1000).toFixed(2)}</span>
                  <span className="text-xs text-slate-400 font-normal font-mono ml-1.5">tonnes</span>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 font-medium font-mono uppercase">
                  ~{co2Emissions.toLocaleString()} kg CO₂ / yr
                </div>
              </div>
            </div>

            {/* Custom Advice */}
            <div className="bg-slate-950/40 border border-slate-800/80 p-5 rounded-2xl">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-2 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>GreenStep Diagnosis</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {scoreFeedback}
              </p>
            </div>

            {/* CTA action */}
            <div className="space-y-3">
              <button
                onClick={() => onCompleted(tempUid)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm py-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 group"
              >
                <span>Save My Score & Continue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  setCalculationStage('idle');
                  setStep(5);
                }}
                className="w-full bg-transparent hover:bg-white/5 text-slate-400 text-xs py-2.5 rounded-xl transition-all cursor-pointer block text-center"
              >
                Go back to questions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#051412] via-[#0d2a24] to-[#051412] text-[#ffffff] flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        {/* Logo Header */}
        <div className="flex items-center justify-center space-x-3 mb-10 cursor-pointer" onClick={onGoBack}>
          <div className="bg-emerald-600/20 p-1.5 rounded-xl border border-emerald-500/20 glow-green">
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-display font-bold text-xl text-white">GreenStep</span>
        </div>

        {/* Form Panel container */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border-slate-800 shadow-2xl relative">
          <div className="absolute top-0 left-0 h-1.5 bg-slate-800 w-full rounded-t-3xl overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / stepsCount) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Step {step} of {stepsCount}</span>
            <span className="text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/40 px-2.5 py-1 rounded-md">
              {Math.round((step / stepsCount) * 100)}% Complete
            </span>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-4 rounded-xl text-xs mb-6 font-mono">
              {error}
            </div>
          )}

          {/* Stepper Content */}
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="font-display text-2xl font-bold text-white mb-2">How do you primarily commute?</h2>
                  <p className="text-sm text-slate-400 mb-6">Transportation typically accounts for the largest fraction of an individual's carbon footprints.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {transportOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setTransportation(opt.value)}
                        className={`text-left p-4 rounded-xl border transition-all duration-200 flex items-start space-x-3.5 group relative ${
                          transportation === opt.value
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/20 text-slate-300'
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 group-hover:border-slate-700">
                          {opt.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{opt.label}</div>
                          <div className="text-xs text-slate-400 mt-1">{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="font-display text-2xl font-bold text-white mb-2">What is your home electricity usage?</h2>
                  <p className="text-sm text-slate-400 mb-6">This correlates against electricity generation fuels (coal, gas, solar) powering your residential grid.</p>
                  <div className="space-y-3">
                    {electricityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setElectricityUsage(opt.value)}
                        className={`text-left w-full p-4 rounded-xl border transition-all duration-200 flex items-center space-x-4 group ${
                          electricityUsage === opt.value
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/20 text-slate-300'
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                          {opt.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{opt.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="font-display text-2xl font-bold text-white mb-2">How would you describe your food habits?</h2>
                  <p className="text-sm text-slate-400 mb-6">Red meats contribute highly to deforestation, soil depletion, and major warming industrial gases.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {foodOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setFoodHabits(opt.value)}
                        className={`text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between group ${
                          foodHabits === opt.value
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/20 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 mb-3">
                          <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                            {opt.icon}
                          </div>
                          <span className="font-semibold text-sm">{opt.label}</span>
                        </div>
                        <span className="text-xs text-slate-400 leading-relaxed">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="font-display text-2xl font-bold text-white mb-2">How conscious are your recycling and waste?</h2>
                  <p className="text-sm text-slate-400 mb-6">Methane leakage from un-sorted organic landfill dumps contributes heavily to green house targets.</p>
                  <div className="space-y-3">
                    {wasteOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setWasteManagement(opt.value)}
                        className={`text-left w-full p-4 rounded-xl border transition-all duration-200 flex items-center space-x-4 group ${
                          wasteManagement === opt.value
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/20 text-slate-300'
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                          {opt.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{opt.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <h2 className="font-display text-2xl font-bold text-white mb-2">What are your lifestyle shopping habits?</h2>
                  <p className="text-sm text-slate-400 mb-6">Industrial shipping, garment processing, and plastic wrapping consume immense fuel energy.</p>
                  <div className="space-y-3">
                    {lifestyleOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setLifestyle(opt.value)}
                        className={`text-left w-full p-4 rounded-xl border transition-all duration-200 flex items-center space-x-4 group ${
                          lifestyle === opt.value
                            ? 'bg-emerald-500/10 border-emerald-500 text-white'
                            : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/20 text-slate-300'
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                          {opt.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{opt.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-800/40">
            <button
              onClick={handleBack}
              className="text-slate-400 hover:text-white flex items-center space-x-2 text-sm font-semibold hover:bg-white/5 px-4 py-2.5 rounded-xl transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{step === 1 ? 'Back to Intro' : 'Go Back'}</span>
            </button>

            <button
              id="onboarding-next-btn"
              disabled={!isCurrentStepAnswered() || loading}
              onClick={handleNext}
              className={`font-bold text-sm px-6 py-3 rounded-xl flex items-center space-x-2 transition-all cursor-pointer ${
                isCurrentStepAnswered() && !loading
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculating Carbon Score...</span>
                </>
              ) : (
                <>
                  <span>{step === stepsCount ? 'Complete Scoring' : 'Next Question'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
