"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../lib/firebase"; 
import { doc, getDoc, collection, addDoc } from "firebase/firestore"; 

/* ================= DATA ================= */
const cities = [
  { name: "Hyderabad", slug: "hyderabad", icon: "/cities/hyderabad.png", subtitle: "Charminar City" },
  { name: "Vellore", slug: "vellore", icon: "/cities/vellore.png", subtitle: "Historic Fort City" },
  { name: "Tirupati", slug: "tirupati", icon: "/cities/tirupati.png", subtitle: "Pilgrimage Hub" },
  { name: "Bangalore", slug: "bangalore", icon: "/cities/bangalore.png", subtitle: "Silicon Valley of India" },
];

/* ================= ANIMATION VARIANTS ================= */
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* ================= CHATBOT STATES ================= */
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "ai", text: "SAARTHI Global Travel Node online. Tell me your destination, and I will calculate the optimal route and itinerary." }
  ]);
  const messagesEndRef = useRef(null);

  /* ================= GLOBAL ARCHITECTURE DEMO STATES ================= */
  const [agentState, setAgentState] = useState("IDLE");
  const [radarStatus, setRadarStatus] = useState("IDLE");
  const [flightNo, setFlightNo] = useState("");
  const [radarEmail, setRadarEmail] = useState("");
  const [radarCity, setRadarCity] = useState("chennai"); // NEW: City selection
  const [telemetryData, setTelemetryData] = useState(null); // NEW: Holds live API data

  /* ================= AUTH OBSERVER WITH PERMISSION GUARD ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const userRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(userRef);
          
          if (snap.exists()) {
            setUser({ ...currentUser, role: snap.data().role });
          } else {
            setUser(currentUser);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Firebase Permission Guard:", error.message);
        setUser(currentUser); 
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { sender: "user", text: chatInput };
    const currentHistory = [...chatMessages]; 

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text, history: currentHistory })
      });

      const data = await res.json();

      if (res.ok) {
        setChatMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
      } else {
        setChatMessages((prev) => [...prev, { sender: "ai", text: `[SYSTEM ERROR]: ${data.error}` }]);
      }
    } catch (error) {
      setChatMessages((prev) => [...prev, { sender: "ai", text: "[SYSTEM ERROR]: SAARTHI node disconnected." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  /* ================= GLOBAL ARCHITECTURE SIMULATORS ================= */
  const runAgentSimulation = () => {
    setAgentState("MONITORING");
    setTimeout(() => {
      setAgentState("ALERT");
      setTimeout(() => {
        setAgentState("RESOLVING");
        setTimeout(() => {
          setAgentState("RESOLVED");
          setTimeout(() => setAgentState("IDLE"), 6000); 
        }, 3000);
      }, 3000);
    }, 2500);
  };

  // --- UPGRADED: FULL-STACK API CALL WITH LIVE DATA ---
  const handleFlightSubmit = async (e) => {
    e.preventDefault();
    if (!flightNo || !radarEmail) return;

    setRadarStatus("SAVING");
    
    try {
      // 1. Save to Firebase
      await addDoc(collection(db, "tracked_flights"), {
        flightNumber: flightNo.toUpperCase(),
        userEmail: radarEmail,
        trackedCity: radarCity, 
        timestamp: new Date().toISOString(),
      });

      setRadarStatus("SCANNING");

      // 2. ACTUALLY HIT YOUR BACKEND API!
      const response = await fetch(`/api/cron/predict?city=${radarCity}&email=${encodeURIComponent(radarEmail)}`);
      const data = await response.json();

      // 3. Save the live telemetry data so we can show it on the screen
      if (data.telemetry) {
        setTelemetryData(data.telemetry);
      }

      setRadarStatus("RESULTS"); // Switch to the new Results view

      // Auto reset the UI after 10 seconds
      setTimeout(() => {
        setRadarStatus("IDLE");
        setFlightNo("");
        setTelemetryData(null);
      }, 10000); 

    } catch (err) {
      console.error("Prediction Error: ", err);
      setRadarStatus("IDLE");
    }
  };

  if (loading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 relative">
      
      {/* ================= NAVBAR ================= */}
      <header className={`fixed top-0 w-full z-40 transition-all duration-300 ${scrolled ? "bg-black/80 backdrop-blur-md py-3 border-b border-white/5" : "bg-transparent py-4 md:py-6"}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center">
          <Link href="/" className="hover:opacity-80 transition shrink-0">
            <Image src="/logo.png" alt="TransitEase" width={180} height={45} priority className="w-32 md:w-[180px] h-auto" />
          </Link>

          <nav className="flex items-center gap-4 md:gap-10">
            <Link href="#cities" className="hidden md:block text-sm font-medium text-gray-400 hover:text-white transition">Cities</Link>
            <Link href="#about" className="hidden md:block text-sm font-medium text-gray-400 hover:text-white transition">About</Link>
            <Link href="#architecture" className="hidden md:block text-sm font-medium text-cyan-500/80 hover:text-cyan-400 transition">Global Roadmap</Link>

            {!user ? (
              <div className="flex items-center gap-4 md:gap-6">
                <Link href="/login" className="hidden sm:block text-sm font-medium hover:text-cyan-400 transition">Login</Link>
                <Link href="/register" className="px-4 md:px-6 py-2 bg-cyan-500 text-black rounded-md font-bold hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20 text-xs md:text-sm">
                  Register
                </Link>
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 md:gap-3 bg-white/5 p-1 pr-3 md:pr-4 rounded-full border border-white/10 hover:border-cyan-500/50 transition-all"
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-cyan-900 overflow-hidden relative border border-cyan-500/20 shrink-0">
                    <Image src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'U'}&background=06b6d4&color=fff`} alt="Profile" fill className="object-cover" unoptimized />
                  </div>
                  <span className="text-xs md:text-sm font-semibold tracking-wide hidden sm:block">{user.displayName || "User"}</span>
                  <svg className={`w-3 h-3 md:w-4 md:h-4 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-2"
                    >
                      <div className="px-4 py-3 border-b border-white/5 mb-1">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Logged in as</p>
                        <p className="text-sm font-medium truncate text-cyan-400">{user.email}</p>
                      </div>

                      {user?.role === "admin" && (
                        <Link 
                          href="/admin/dashboard" 
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-cyan-400 hover:bg-cyan-400/10 transition border-b border-white/5 font-bold"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                          Admin Dashboard
                        </Link>
                      )}

                      <Link 
                        href="/details" 
                        className="block px-4 py-2.5 text-sm hover:bg-white/5 transition border-b border-white/5"
                      >
                        View Details
                      </Link>
                      
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition mt-1 border-t border-white/5">
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-cyan-500/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none animate-pulse" />
        
        <motion.div initial="initial" animate="animate" variants={staggerContainer} className="relative z-10">
          <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl md:text-8xl font-black mb-4 tracking-tighter leading-tight">
            Smarter Public Transport
          </motion.h1>
          <motion.h2 variants={fadeInUp} className="text-4xl sm:text-5xl md:text-7xl font-black mb-8 text-cyan-400 tracking-tighter">
            Powered by AI Intelligence
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-gray-400 text-base md:text-lg lg:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-light px-4">
            Real-time crowd prediction, delay estimation, and comfort analytics <br className="hidden md:block" />
            for smarter commuting decisions across Indian cities.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link href="#cities" className="inline-block px-8 py-3 md:px-10 md:py-4 bg-cyan-500 text-black font-extrabold rounded-md hover:bg-cyan-400 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/20">
              Explore Cities
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ================= CITIES SECTION ================= */}
      <section id="cities" className="py-24 md:py-32 bg-[#020617] relative">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="flex flex-col items-center mb-16 md:mb-20 text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Operational Cities</h2>
            <div className="h-1.5 w-24 bg-cyan-500 rounded-full" />
          </div>

          <motion.div 
            variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          >
            {cities.map((city) => (
              <motion.div
                key={city.slug}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="group relative bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 hover:border-cyan-500/50 transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex justify-center mb-6 md:mb-8 relative">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Image src={city.icon} alt={city.name} width={100} height={100} className="relative z-10 group-hover:scale-110 transition duration-500 md:w-[120px] md:h-[120px]" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-center mb-2">{city.name}</h3>
                <p className="text-gray-500 text-center mb-6 md:mb-8 text-xs md:text-sm font-medium">{city.subtitle}</p>
                <Link href={`/city/${city.slug}`} className="block text-center text-cyan-400 font-bold group-hover:text-white transition-colors text-sm md:text-base">
                  View Dashboard →
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section id="about" className="py-24 md:py-32 bg-black relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-cyan-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 md:mb-8 tracking-tight">
                Redefining the <br />
                <span className="text-cyan-400">Commuting Experience</span>
              </h2>
              <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-8 md:mb-10">
                TransitEase is more than just a tracking app. It is an intelligent mobility platform 
                designed to solve travel uncertainty. By merging real-time transit data with 
                advanced machine learning, we provide commuters with the insights they need 
                before they even step out of their homes.
              </p>

              <div className="space-y-6 md:space-y-8">
                {[
                  { title: "Predictive Analytics", desc: "Know crowd density levels 30 minutes in advance." },
                  { title: "Delay Estimation", desc: "AI-calculated arrival times based on historical traffic patterns." },
                  { title: "Comfort Metrics", desc: "Unique scores based on temperature and seating availability." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 md:gap-5">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-1">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base md:text-lg text-white">{item.title}</h4>
                      <p className="text-sm md:text-base text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-4 md:gap-6"
            >
              <div className="bg-white/5 border border-white/10 p-6 md:p-10 rounded-2xl md:rounded-3xl mt-0 lg:mt-12">
                <p className="text-4xl md:text-5xl font-black text-cyan-400 mb-2">95%</p>
                <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Prediction Accuracy</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 md:p-10 rounded-2xl md:rounded-3xl">
                <p className="text-4xl md:text-5xl font-black text-white mb-2">4</p>
                <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Major Cities</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 md:p-10 rounded-2xl md:rounded-3xl mt-0 lg:-mt-12">
                <p className="text-4xl md:text-5xl font-black text-white mb-2">24/7</p>
                <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Data Processing</p>
              </div>
              <div className="bg-cyan-500 p-6 md:p-10 rounded-2xl md:rounded-3xl shadow-xl shadow-cyan-500/20">
                <p className="text-4xl md:text-5xl font-black text-black mb-2">AI</p>
                <p className="text-[10px] md:text-xs font-bold text-black/60 uppercase tracking-widest">Intelligence</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ================= GLOBAL ARCHITECTURE ROADMAP ================= */}
      <section id="architecture" className="py-24 md:py-32 bg-[#050a15] border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-[10px] md:text-xs font-black text-cyan-500 uppercase tracking-[0.3em] mb-4">The Future of Mobility</h2>
            <h3 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Global Architecture <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Roadmap</span></h3>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">Scaling from local transit to an autonomous, cross-border mobility ecosystem powered by Open-Meteo telemetry and LLM Agents.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* CARD 1: PREDICTIVE RADAR (OPEN METEO SIMULATION) */}
            <div className="md:col-span-7 bg-[#0a1122] rounded-[2rem] p-8 border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-2xl">
              <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Phase 3: Flight Delay Radar</h3>
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 text-white">Live AI Prediction Engine</h2>
              <p className="text-xs text-gray-400 leading-relaxed font-medium mb-8">Select your departure hub and flight number. The engine pulls live Open-Meteo telemetry to calculate exact delay probability.</p>

              {radarStatus === "IDLE" && (
                <form onSubmit={handleFlightSubmit} className="space-y-4 relative z-10 max-w-sm">
                  
                  {/* NEW: City Dropdown */}
                  <select 
                    value={radarCity} 
                    onChange={(e) => setRadarCity(e.target.value)} 
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-xs text-white outline-none focus:border-blue-500 appearance-none"
                  >
                    <option value="chennai">Chennai (MAA)</option>
                    <option value="hyderabad">Hyderabad (HYD)</option>
                    <option value="bangalore">Bangalore (BLR)</option>
                    <option value="mumbai">Mumbai (BOM)</option>
                    <option value="delhi">Delhi (DEL)</option>
                  </select>

                  <input 
                    type="text" 
                    placeholder="Flight No (e.g., 6E-2193)" 
                    value={flightNo}
                    onChange={(e) => setFlightNo(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-xs text-white outline-none focus:border-blue-500 uppercase"
                  />
                  <input 
                    type="email" 
                    placeholder="Alert Email Address" 
                    value={radarEmail}
                    onChange={(e) => setRadarEmail(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-xs text-white outline-none focus:border-blue-500"
                  />
                  <button type="submit" className="w-full bg-blue-500 text-white font-black py-3 rounded-xl uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-colors">
                    Fetch Live Telemetry
                  </button>
                </form>
              )}

              {radarStatus === "SAVING" && (
                <div className="h-[200px] flex flex-col items-center justify-center text-blue-400 text-[10px] font-black uppercase tracking-widest">
                   <span className="animate-pulse">Registering Flight to CRON Database...</span>
                </div>
              )}

              {radarStatus === "SCANNING" && (
                <div className="h-[200px] flex flex-col items-center justify-center text-orange-400 text-[10px] font-black uppercase tracking-widest font-mono space-y-2 text-center">
                   <span className="animate-pulse">&gt; Fetching Live API Telemetry...</span>
                   <span className="animate-pulse delay-75">&gt; Analyzing Wind Patterns...</span>
                   <span className="animate-pulse delay-150">&gt; Running Risk Algorithm...</span>
                </div>
              )}

              {/* UPGRADED: LIVE DATA RESULTS DASHBOARD */}
              {radarStatus === "RESULTS" && telemetryData && (
                <div className="h-[200px] flex flex-col items-center justify-center text-center">
                   <div className="text-2xl mb-1">{telemetryData.api_status === "CRITICAL RISK" ? '⚠️' : '✅'}</div>
                   <h4 className="text-[14px] font-black uppercase tracking-widest text-white mb-3">
                     {telemetryData.flight} | {telemetryData.origin}
                   </h4>
                   
                   <div className="bg-black/60 border border-white/10 rounded-xl p-4 w-full max-w-sm text-[11px] font-mono text-left space-y-2 shadow-inner">
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-gray-400">Live Wind Speed:</span> 
                        <span className="text-blue-400 font-bold">{telemetryData.live_wind_speed} km/h</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span className="text-gray-400">Open-Meteo Code:</span> 
                        <span className="text-blue-400 font-bold">{telemetryData.live_weather_code} (WMO)</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-gray-400">AI Delay Risk:</span> 
                        <span className={`font-black ${telemetryData.calculated_delay_risk > 0.5 ? "text-red-500" : "text-green-500"}`}>
                          {Math.round(telemetryData.calculated_delay_risk * 100)}%
                        </span>
                      </div>
                   </div>

                   <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-4">
                     {telemetryData.api_status === "CRITICAL RISK" ? `Alert dispatched to ${radarEmail}` : "Conditions clear. No alert required."}
                   </div>
                </div>
              )}
            </div>

            {/* CARD 2: AGENTIC NODE */}
            <div className="md:col-span-5 bg-[#0a1122] rounded-[2rem] p-8 border border-white/5 relative overflow-hidden group hover:border-cyan-500/30 transition-all shadow-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">Phase 2: LLM Automation</h3>
                <h2 className="text-xl font-black uppercase tracking-tighter mb-4 text-white">Proactive Agents</h2>
                <p className="text-xs text-gray-400 leading-relaxed font-medium mb-6">SAARTHI intercepts global flight webhooks. If delayed, the Agent autonomously rebooks connecting local transit without user intervention.</p>
              </div>

              <div className="bg-black/60 rounded-2xl p-4 border border-white/5 min-h-[140px] flex flex-col justify-center items-center relative backdrop-blur-sm mb-4">
                {agentState === "IDLE" && (
                  <div className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] text-center">Agent Offline.<br/>Awaiting Flight Webhook.</div>
                )}
                {agentState === "MONITORING" && (
                  <div className="text-cyan-500 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Monitoring Aviation API...
                  </div>
                )}
                {agentState === "ALERT" && (
                  <div className="text-red-500 text-center">
                    <div className="text-xl mb-1">⚠️</div>
                    <div className="text-[9px] font-black uppercase tracking-widest">Flight Delay Detected.</div>
                  </div>
                )}
                {agentState === "RESOLVING" && (
                  <div className="text-orange-400 text-left w-full max-w-[180px] mx-auto space-y-2 font-mono text-[8px] uppercase tracking-widest">
                    <div className="flex justify-between items-center"><span className="animate-pulse">&gt; Canceling Train...</span> <span className="text-green-500">OK</span></div>
                    <div className="flex justify-between items-center"><span className="animate-pulse delay-75">&gt; Fetching Uber API...</span> <span className="text-green-500">OK</span></div>
                    <div className="flex justify-between items-center"><span className="animate-pulse delay-150">&gt; Rebooking Cab...</span> <span className="text-green-500">OK</span></div>
                  </div>
                )}
                {agentState === "RESOLVED" && (
                  <div className="text-green-500 text-center">
                    <div className="text-xl mb-1">✅</div>
                    <div className="text-[9px] font-black uppercase tracking-widest">Connecting Cab Rebooked.</div>
                  </div>
                )}
              </div>

              <button 
                onClick={runAgentSimulation} 
                disabled={agentState !== "IDLE"} 
                className="w-full bg-white/5 border border-white/10 text-white font-black py-3 rounded-xl uppercase text-[10px] tracking-widest hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {agentState === "IDLE" ? "Simulate Flight Delay" : "Agent Active..."}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ================= UPCOMING CITIES ================= */}
      <section className="py-20 md:py-24 bg-black relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-gray-300">Expanding Soon</h2>
            <p className="text-gray-500 text-xs md:text-sm italic">Bringing AI-driven comfort prediction to more hubs</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { name: "Chennai", state: "Tamil Nadu" },
              { name: "Mumbai", state: "Maharashtra" },
              { name: "Pune", state: "Maharashtra" },
              { name: "Vijayawada", state: "Andhra Pradesh" }
            ].map((city, i) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-4 md:p-6 rounded-xl md:rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center group hover:bg-white/[0.05] transition-all"
              >
                <span className="text-[10px] md:text-xs font-bold text-cyan-500/60 uppercase tracking-widest mb-1 md:mb-2">Coming Soon</span>
                <h4 className="text-lg md:text-xl font-bold text-gray-200 group-hover:text-cyan-400 transition-colors">{city.name}</h4>
                <p className="text-[9px] md:text-[10px] text-gray-600 font-medium uppercase mt-1">{city.state}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-12 md:py-16 border-t border-white/5 text-center bg-black px-4">
        <Image src="/logo.png" alt="TransitEase" width={140} height={35} className="mx-auto mb-6 md:mb-8 opacity-40 grayscale w-[120px] md:w-[140px]" />

        <div className="mb-6">
          <Link href="/admin/login" className="text-[8px] md:text-[9px] font-black text-gray-700 uppercase tracking-[0.5em] hover:text-red-500 transition-colors">
            Terminal Access (Staff Only)
          </Link>
        </div>

        <p className="text-[10px] md:text-xs text-gray-600 uppercase tracking-[0.2em] md:tracking-[0.3em]">© 2026 TransitEase All Rights Reserved · Comfort Before You Commute</p>
        <p className="text-[10px] md:text-xs text-gray-600 uppercase tracking-[0.2em] md:tracking-[0.3em]">Made with ❤️ By Jai Darira</p>
      </footer>

      {/* ================= SAARTHI CHATBOT (ASKDISHA STYLE) ================= */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        
        {/* Chat Window Modal */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mb-4 w-80 sm:w-96 bg-[#0f1730]/95 backdrop-blur-xl border border-cyan-500/30 rounded-[2rem] shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col h-[450px]"
            >
              <div className="bg-cyan-500/10 border-b border-cyan-500/20 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isChatLoading ? 'bg-orange-500 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                    {isChatLoading ? 'Processing...' : 'SAARTHI ChatBot'}
                  </h3>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white transition-colors text-lg font-bold">✕</button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                      msg.sender === 'user' ? 'bg-cyan-600 text-white rounded-br-sm' : 'bg-white/5 border border-white/10 text-gray-300 rounded-bl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 text-cyan-400 p-3 rounded-2xl rounded-bl-sm text-xs font-black italic tracking-widest animate-pulse">
                      SYNCING...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleChatSend} className="p-4 border-t border-white/5 bg-black/40">
                <div className="relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isChatLoading}
                    placeholder="Ask SAARTHI to plan a trip..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs text-white placeholder:text-gray-600 outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-50"
                  />
                  <button type="submit" disabled={isChatLoading} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-black transition-colors disabled:opacity-50 font-bold">
                    ↑
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AskDISHA Style Floating Trigger */}
        <div className="flex items-center gap-4 mt-2">
          {!isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white text-black px-5 py-2.5 rounded-full text-xs font-black shadow-2xl hidden sm:block animate-pulse border-2 border-cyan-500 shadow-cyan-500/20"
            >
              Plan Trip with SAARTHI
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 border-[3px] border-white shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center justify-center relative overflow-visible group"
          >
            <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white font-bold shadow-lg">
              {isChatOpen ? '-' : '1'}
            </div>
            
            <span className="text-3xl relative z-10 group-hover:rotate-12 transition-transform duration-300">
              {isChatOpen ? '✕' : '🤖'}
            </span>
            
            {!isChatOpen && (
               <div className="absolute inset-1 rounded-full border border-white/20 border-dashed animate-[spin_10s_linear_infinite]" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}