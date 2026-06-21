import React, { useState, useEffect, FormEvent } from 'react';
import { MapPin, Compass, AlertCircle, Loader2, Sparkles, Navigation, Globe, Phone, ExternalLink, Plus, Search, CheckCircle2, Map, Crosshair } from 'lucide-react';
import { NearbyLocation } from '../types.ts';

// Dynamic city bounds for scaling calculations
const GLOBAL_CITIES = [
  { id: 'all', name: '🌍 All Global Cities', lat: 0, lng: 0, zoomMsg: "MULTIPLE REGIONS ACTIVE" },
  { id: 'singapore', name: '🇸🇬 Singapore', lat: 1.3521, lng: 103.8198, zoomMsg: "SINGAPORE METRO ZONE" },
  { id: 'london', name: '🇬🇧 London, UK', lat: 51.5074, lng: -0.1278, zoomMsg: "GREATER LONDON REGION" },
  { id: 'new_york', name: '🇺🇸 New York City, US', lat: 40.7128, lng: -74.0060, zoomMsg: "NYC METROPOLITAN AREA" },
  { id: 'san_francisco', name: '🇺🇸 San Francisco, US', lat: 37.7749, lng: -122.4194, zoomMsg: "SF BAY AREA GRID" },
  { id: 'mumbai', name: '🇮🇳 Mumbai, India', lat: 19.0760, lng: 72.8777, zoomMsg: "MUMBAI SUBURBAN DIST" },
  { id: 'sydney', name: '🇦🇺 Sydney, Australia', lat: -33.8688, lng: 151.2093, zoomMsg: "SYDNEY HARBOUR DIVISION" },
  { id: 'custom', name: '📍 Custom / Other Regions', lat: 0, lng: 0, zoomMsg: "CUSTOM COMMUNITY COORDS" },
];

interface NearbyViewProps {
  token: string;
  onLocationAdded?: () => void;
}

export default function NearbyView({ token, onLocationAdded }: NearbyViewProps) {
  const [locations, setLocations] = useState<NearbyLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtering & search states
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selection states
  const [focusedLoc, setFocusedLoc] = useState<NearbyLocation | null>(null);

  // Form registration states
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('recycling');
  const [formCity, setFormCity] = useState('singapore');
  const [formAddress, setFormAddress] = useState('');
  const [formLat, setFormLat] = useState('1.3521');
  const [formLng, setFormLng] = useState('103.8198');
  const [formDesc, setFormDesc] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Categorize coordinate city tags
  const getCityId = (lat: number, lng: number) => {
    if (lat > 1.1 && lat < 1.5 && lng > 103.5 && lng < 104.1) return 'singapore';
    if (lat > 51.3 && lat < 51.7 && lng > -0.3 && lng < 0.1) return 'london';
    if (lat > 40.5 && lat < 40.9 && lng > -74.1 && lng < -73.8) return 'new_york';
    if (lat > 37.6 && lat < 37.9 && lng > -122.6 && lng < -122.3) return 'san_francisco';
    if (lat > 18.8 && lat < 19.3 && lng > 72.7 && lng < 73.0) return 'mumbai';
    if (lat > -34.0 && lat < -33.7 && lng > 151.1 && lng < 151.4) return 'sydney';
    return 'custom';
  };

  const fetchNearby = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = "/api/nearby";
      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Could not load green community map locations.");
      const data = await response.json();
      setLocations(data);

      // Auto focus on the first matching item optionally
      if (data.length > 0) {
        setFocusedLoc(data[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load green map points.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearby();
  }, [token]);

  // Handle city default coordinates fill when user submits a location
  useEffect(() => {
    const matched = GLOBAL_CITIES.find(c => c.id === formCity);
    if (matched && formCity !== 'all' && formCity !== 'custom') {
      setFormLat(matched.lat.toString());
      setFormLng(matched.lng.toString());
    }
  }, [formCity]);

  // Filter our list in memory
  const filteredLocations = locations.filter(loc => {
    // 1. Filter by category
    if (selectedType !== 'all' && loc.type !== selectedType) return false;
    
    // 2. Filter by city grouping
    const cityId = getCityId(loc.latitude, loc.longitude);
    if (selectedCity !== 'all' && cityId !== selectedCity) return false;

    // 3. Search query match
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = loc.name?.toLowerCase().includes(q);
      const matchAddr = loc.address?.toLowerCase().includes(q);
      const matchDesc = loc.description?.toLowerCase().includes(q);
      const matchType = loc.type?.toLowerCase().includes(q);
      return matchName || matchAddr || matchDesc || matchType;
    }

    return true;
  });

  // Calculate high-fidelity map bounds based on visible active markers
  let minLat = 1.25, maxLat = 1.40, minLng = 103.7, maxLng = 103.95;
  const mapPoints = filteredLocations;

  if (mapPoints.length > 0) {
    const lats = mapPoints.map(p => p.latitude);
    const lngs = mapPoints.map(p => p.longitude);
    
    const rawMinLat = Math.min(...lats);
    const rawMaxLat = Math.max(...lats);
    const rawMinLng = Math.min(...lngs);
    const rawMaxLng = Math.max(...lngs);

    const latSpan = Math.abs(rawMaxLat - rawMinLat) || 0.01;
    const lngSpan = Math.abs(rawMaxLng - rawMinLng) || 0.01;

    // Generous buffer so markers don't hit the border edges
    minLat = rawMinLat - latSpan * 0.15;
    maxLat = rawMaxLat + latSpan * 0.15;
    minLng = rawMinLng - lngSpan * 0.15;
    maxLng = rawMaxLng + lngSpan * 0.15;
  } else {
    // Fallbacks corresponding to selected city centers
    const currentCityProfile = GLOBAL_CITIES.find(c => c.id === selectedCity);
    if (currentCityProfile && currentCityProfile.lat !== 0) {
      minLat = currentCityProfile.lat - 0.05;
      maxLat = currentCityProfile.lat + 0.05;
      minLng = currentCityProfile.lng - 0.05;
      maxLng = currentCityProfile.lng + 0.05;
    }
  }

  // Submit custom location point handler
  const handleAddLocation = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formAddress.trim()) {
      setError("Please fill out the Location Name and Address.");
      return;
    }

    const latitude = parseFloat(formLat);
    const longitude = parseFloat(formLng);
    if (isNaN(latitude) || isNaN(longitude)) {
      setError("Latitude and Longitude must be valid numbers.");
      return;
    }

    setFormSubmitting(true);
    setFormSuccess(null);
    setError(null);

    try {
      const response = await fetch("/api/nearby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formName.trim(),
          type: formType,
          address: formAddress.trim(),
          latitude,
          longitude,
          description: formDesc.trim() || `Community registered ${formType} facility`
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create location point.");
      }

      setFormSuccess(`🎉 Landmark "${formName}" added! You have earned +50 XP!`);
      
      // Clear forms
      setFormName('');
      setFormAddress('');
      setFormDesc('');

      // Refresh listings
      await fetchNearby();

      // Trigger XP refresh on top level profile metrics
      if (onLocationAdded) {
        onLocationAdded();
      }

      // Hide form on delay
      setTimeout(() => {
        setShowAddForm(false);
        setFormSuccess(null);
      }, 3500);

    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Locations' },
    { value: 'ev_charging', label: 'EV Charging Stations' },
    { value: 'recycling', label: 'Recycling Outlets' },
    { value: 'meetup', label: 'Ecological Meetups' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-mono font-bold tracking-wider">
              <Globe className="w-3.5 h-3.5 animate-spin-slow mr-1" />
              <span>MULTINATIONAL ECO DIRECTORY</span>
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <MapPin className="w-8 h-8 text-emerald-400 fill-emerald-400/20" />
              <span>Green Community Map</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl">
              Locate, submit, and browse ecological chargers, zero-waste donation boxes, and flora preservation gardens across global metropolises.
            </p>
          </div>

          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setFormSuccess(null);
            }}
            className="flex-shrink-0 inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-505 to-teal-500 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/10 hover:shadow-emerald-555/20 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3px]" />
            <span>Submit Green Location (+50 XP)</span>
          </button>
        </div>

        {/* Action alerts / messages */}
        {formSuccess && (
          <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-5 py-3.5 rounded-2xl text-xs flex items-center space-x-3.5 font-mono animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-bold">{formSuccess}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-300 px-5 py-3.5 rounded-2xl text-xs flex items-center space-x-3.5 font-mono">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}
      </div>

      {/* Slide-open submission drawer form */}
      {showAddForm && (
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl relative animate-fadeIn">
          <div className="absolute top-4 right-4">
            <button 
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-white text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-850 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="mb-5">
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">COMMUNITY HUB LOGGING</span>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2 mt-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Register New Green Spot & Earn Rewards</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Submit authentic eco-friendly infrastructure coordinates. Every approved point rewards you with XP!</p>
          </div>

          <form onSubmit={handleAddLocation} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-4 md:col-span-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 font-mono mb-1.5">NAME OF LANDMARK</label>
                <input
                  type="text"
                  placeholder="e.g. Greenwich Village Solar EV Supercharging Station"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:outline-none text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 font-mono mb-1.5">PHYSICAL ADDRESS</label>
                <input
                  type="text"
                  placeholder="Street name, City, Postcode"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:outline-none text-white font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 font-mono mb-1.5 font-light">DESCRIPTION & UTILITIES</label>
                <textarea
                  placeholder="What is available here? e.g. 'Powered by solar panels. Accepts microplastics and printer cartridges.'"
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full text-xs p-3.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:outline-none text-white font-medium resize-none"
                />
              </div>
            </div>

            <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
              <div>
                <label className="block text-xs font-bold text-slate-300 font-mono mb-1.5">SPOT TYPE</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500/60 focus:outline-none text-white font-bold"
                >
                  <option value="recycling">Recycling Center / Bin</option>
                  <option value="ev_charging">EV Charging Hub</option>
                  <option value="meetup">Community Meetup / Green Space</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 font-mono mb-1.5">LOCAL REGION TARGET</label>
                <select
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-900 border border-slate-800 focus:border-emerald-500/60 focus:outline-none text-white"
                >
                  {GLOBAL_CITIES.filter(c => c.id !== 'all').map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 font-mono mb-1">LATITUDE</label>
                  <input
                    type="text"
                    placeholder="e.g. 51.5074"
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 font-mono mb-1">LONGITUDE</label>
                  <input
                    type="text"
                    placeholder="e.g. -0.1278"
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="w-full mt-2 inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs cursor-pointer transition-all hover:bg-emerald-400 disabled:opacity-50"
              >
                {formSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Register Location +50 XP</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filters Hub Panel */}
      <div className="bg-slate-900/40 border border-slate-850 p-4 sm:p-5 rounded-3xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Left Side: Search inputs / queries */}
        <div className="flex-1 max-w-sm relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search recycling centers, clean EV charger grids..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800/80 rounded-2xl text-xs text-white placeholder-slate-550 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Right Side: Select Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* City Selection */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-850/80">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setFocusedLoc(null);
              }}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none border-none py-1 pr-6 cursor-pointer"
            >
              {GLOBAL_CITIES.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-950 text-white font-sans text-xs">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-850/80">
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setFocusedLoc(null);
              }}
              className="bg-transparent text-xs text-white font-semibold focus:outline-none border-none py-1 pr-6 cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value} className="bg-slate-950 text-white font-sans text-xs">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (1/3): Location side panel */}
        <div className="space-y-3 max-h-[520px] overflow-y-auto custom-scrollbar pr-1.5">
          {loading && locations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mb-2" />
              <span className="text-xs text-slate-400">Locating green stations...</span>
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="bg-slate-900/20 border border-dashed border-slate-850 rounded-2xl text-center py-16 px-4">
              <Compass className="w-8 h-8 text-slate-650 mx-auto mb-2 text-slate-600" />
              <p className="text-xs text-slate-400 font-medium">No ecological points fit your criteria.</p>
              <button 
                onClick={() => { setSelectedCity('all'); setSelectedType('all'); setSearchQuery(''); }}
                className="mt-3 text-[10px] bg-slate-900 border border-slate-800 text-emerald-400 px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider"
              >
Clear Filters
              </button>
            </div>
          ) : (
            filteredLocations.map((loc) => {
              const cityId = getCityId(loc.latitude, loc.longitude);
              const cityDetails = GLOBAL_CITIES.find(c => c.id === cityId);
              
              return (
                <button
                  key={loc.id}
                  onClick={() => setFocusedLoc(loc)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start space-x-3.5 group cursor-pointer ${
                    focusedLoc?.id === loc.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-white'
                      : 'bg-slate-900/40 border-slate-850 hover:border-slate-700 text-slate-350 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="p-2.5 bg-slate-950/60 border border-slate-850 rounded-xl group-hover:border-slate-750 flex-shrink-0 text-emerald-450 text-emerald-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="flex items-center space-x-1 mb-1">
                      <span className="text-[8px] font-mono text-emerald-400 tracking-wider font-bold uppercase">
                        {loc.type === 'ev_charging' ? '⚡ EV GRID' : loc.type === 'meetup' ? '🌱 COMMUNITY' : '♻️ RECYCLE'}
                      </span>
                      {cityDetails && (
                        <span className="text-[8px] bg-slate-950/90 text-slate-400 px-1.5 py-0.2 rounded font-mono">
                          {cityDetails.name.split(' ')[0]}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm leading-snug text-white group-hover:text-emerald-400 transition-colors truncate">{loc.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 truncate">{loc.address}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Column (2/3): Scaled Vector Map & Focused detail specifications card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/60 p-2.5 rounded-3xl border border-slate-850 shadow-xl overflow-hidden relative">
            
            {/* Dynamic Scaled Interactive Vector Grid representing any chosen coordinates on the map */}
            <div className="bg-[#090e1a] h-[350px] rounded-2xl relative overflow-hidden border border-slate-950">
              
              {/* Futuristic Vector Dot Grid Layout */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-70" />
              
              {/* Dynamic Coordinate Radar / Crosshairs Visual elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-slate-900/30 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-slate-900/20 pointer-events-none animate-ping-slow" />
              
              {/* Radar Sweeper simulated vector bar */}
              <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-emerald-500/10 pointer-events-none animate-shimmer" style={{ animationDuration: '4s' }} />

              {/* Render Visible Map Points with exact computed scaling alignment inside viewport */}
              {filteredLocations.map((loc) => {
                // Apply our computed worldwide coordinates math to represent points dynamically
                const dLng = maxLng - minLng;
                const dLat = maxLat - minLat;

                const xPercent = dLng === 0 ? 50 : Math.max(8, Math.min(92, ((loc.longitude - minLng) / dLng) * 100));
                const yPercent = dLat === 0 ? 50 : Math.max(8, Math.min(92, 100 - ((loc.latitude - minLat) / dLat) * 100));

                return (
                  <button
                    key={loc.id}
                    onClick={() => setFocusedLoc(loc)}
                    className="absolute group z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-200"
                    style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
                  >
                    <div className={`p-2.5 rounded-full border transition-all ${
                      focusedLoc?.id === loc.id
                        ? 'bg-emerald-500 border-white text-slate-950 scale-125 shadow-xl shadow-emerald-500/30'
                        : 'bg-slate-950/90 border-emerald-500/40 text-emerald-400 hover:scale-110 hover:border-emerald-500 hover:bg-slate-900'
                    }`}>
                      <MapPin className="w-4 h-4 fill-current text-xs" />
                    </div>
                    {/* Floating mini tooltips */}
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-10 bg-slate-950 text-[10px] text-white px-2.5 py-1 rounded-md border border-slate-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30 font-medium">
                      {loc.name}
                    </span>
                  </button>
                );
              })}

              {/* Grid HUD specs labeling */}
              <div className="absolute bottom-4 left-4 bg-slate-950/95 border border-slate-800 px-3.5 py-2 rounded-xl text-slate-400 text-[10px] font-mono z-20 flex items-center space-x-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>HUD: {selectedCity === 'all' ? "GLOBAL VIEWPORT" : GLOBAL_CITIES.find(c => c.id === selectedCity)?.zoomMsg || "COMMUNITY COORDS"}</span>
              </div>

              <div className="absolute top-4 right-4 bg-slate-950/85 border border-slate-800/80 px-2.5 py-1 rounded-lg text-slate-500 text-[9px] font-mono z-20">
                SCALE RESOLUTION: {filteredLocations.length} PIN(S)
              </div>
            </div>

            {/* Focused highlight detailed card specifications */}
            {focusedLoc ? (
              <div className="p-4 sm:p-5 mt-3 bg-[#0a0f1d] rounded-2xl border border-slate-950 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-4 relative animate-fadeIn">
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-emerald-400 mb-1">
                    <Navigation className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono">
                      GPS coordinates: Lat {focusedLoc.latitude.toFixed(5)}, Lng {focusedLoc.longitude.toFixed(5)}
                    </span>
                    <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-mono uppercase">
                      {focusedLoc.type?.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-white font-extrabold text-sm sm:text-base leading-tight">{focusedLoc.name}</h3>
                  <p className="text-slate-400 leading-relaxed font-light">{focusedLoc.address}</p>
                  
                  {focusedLoc.description && (
                    <div className="mt-3 bg-slate-950/40 p-3 rounded-xl border border-slate-900 text-slate-300 italic text-[11px] leading-relaxed relative">
                      {focusedLoc.description}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 text-left sm:text-right pt-2 border-t sm:border-t-0 border-slate-950">
                  <a
                    href={`https://maps.google.com/?q=${focusedLoc.latitude},${focusedLoc.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl text-slate-350 bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    <span>View Google Map</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-[#0a0f1d] rounded-2xl border border-slate-950 text-slate-400 text-xs">
                Select any location marker on the dynamic map or list to reveal directions and feature details.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
