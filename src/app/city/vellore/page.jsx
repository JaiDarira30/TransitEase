"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Accurate GPS Coordinates for Vellore Landmarks
const VELLORE_LANDMARKS = [
  { name: "VIT University", role: "Educational Hub", lat: 12.9692, lng: 79.1559 },
  { name: "CMC Hospital", role: "Medical Hub", lat: 12.9246, lng: 79.1352 },
  { name: "Naruvi Hospital", role: "Medical Hub", lat: 12.9463, lng: 79.1438 },
  { name: "Vellore Fort", role: "Historic", lat: 12.9244, lng: 79.1353 },
  { name: "Sripuram Golden Temple", role: "Spiritual", lat: 12.8732, lng: 79.0882 },
  { name: "Ratnagiri Murugan Temple", role: "Spiritual", lat: 12.8741, lng: 79.2505 },
  { name: "CMC Ranipet Campus", role: "Medical Hub", lat: 12.8800, lng: 79.2600 }
];

// The Haversine Formula (Calculates real-world distance between two GPS points)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance.toFixed(1); 
};

export default function VelloreDashboard() {
  const [weather, setWeather] = useState(null);
  const [time, setTime] = useState(new Date());
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  // GPS States
  const [coords, setCoords] = useState({ lat: 12.9165, lng: 79.1325 }); // Default to Vellore Center
  const [gpsLoading, setGpsLoading] = useState(true);
  
  // State to track which landmark the user clicked to view on the map
  const [activeLandmark, setActiveLandmark] = useState(null);

  // Setup & Hydration Fix
  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);

    // Get User's Exact Live GPS Location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setGpsLoading(false);
        },
        () => {
          console.log("GPS access denied, using default Vellore coordinates.");
          setGpsLoading(false);
        }
      );
    }

    return () => clearInterval(timer);
  }, []);

  // Weather Fetch
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const API_KEY = "1a97b28eeceedd907771390eae582b39"; 
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lng}&units=metric&appid=${API_KEY}`
        );
        const data = await res.json();
        if (data.cod === 200) setWeather(data);
      } catch (err) {
        console.error("Weather service unavailable");
      } finally {
        setLoadingWeather(false);
      }
    };
    if (isMounted) fetchWeather();
  }, [coords, isMounted]);

  // THE FIX: Official Google Maps URLs dynamically switching between User GPS and Landmark GPS
  const mapQuery = activeLandmark 
    ? encodeURIComponent(`${activeLandmark.name}, Vellore, Tamil Nadu`) 
    : `${coords.lat},${coords.lng}`;

  const mapUrl = `https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`;
  const externalMapUrl = `https://maps.google.com/maps?q=${mapQuery}`;

  if (!isMounted) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 sm:p-6 lg:p-12 font-sans selection:bg-cyan-500/30">
      
      {/* HEADER */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 md:mb-12 gap-6 md:gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full xl:w-auto">
          <Link href="/" className="text-cyan-500 text-[10px] md:text-xs font-black mb-2 md:mb-3 block hover:text-cyan-400 transition tracking-widest uppercase">
            ← Back to Global Map
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter">Vellore <span className="text-cyan-400">Live</span></h1>
          <p className="text-gray-500 mt-2 text-xs md:text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> 
            Active Node: {gpsLoading ? "Locating..." : "GPS Sync Active"}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 p-4 sm:p-5 md:p-6 rounded-2xl md:rounded-[2rem] backdrop-blur-xl flex flex-wrap items-center gap-4 sm:gap-6 md:gap-8 shadow-2xl w-full xl:w-auto justify-between sm:justify-start"
        >
          <div className="text-left sm:text-right">
            <p className="text-2xl sm:text-3xl font-black tabular-nums">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black mt-0.5">Local Time</p>
          </div>
          
          <div className="hidden sm:block h-8 md:h-10 w-[1px] bg-white/10" />
          
          <div className="flex items-center gap-3 md:gap-4">
            {!loadingWeather && weather?.main ? (
              <>
                <div className="text-right">
                  <p className="text-2xl sm:text-3xl font-black">{Math.round(weather.main.temp)}°C</p>
                  <p className="text-[9px] md:text-[10px] text-cyan-400 uppercase font-black tracking-widest mt-0.5">{weather.weather[0].main}</p>
                </div>
                <img 
                  src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" 
                  alt="weather" 
                />
              </>
            ) : (
              <div className="text-right py-1">
                <p className="text-xs md:text-sm font-bold text-gray-600 animate-pulse uppercase">Syncing...</p>
              </div>
            )}
          </div>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-6 md:space-y-8 lg:space-y-10">
          <section className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] relative overflow-hidden">
            <h3 className="text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-3">
              <span className="w-1.5 h-5 md:h-6 bg-cyan-500 rounded-full" /> Transport Matrix
            </h3>
            <div className="space-y-4 md:space-y-5">
              {[
                { type: "City Bus Service", status: "Active", icon: "🚌", desc: "Routes to Katpadi, CMC, & Silk Mill." },
                { type: "Auto Hubs", status: "Available", icon: "🛺", desc: "Fixed tariffs from Station & Fort." },
                { type: "Railway (Katpadi)", status: "High Priority", icon: "🚆", desc: "Direct nodes to Chennai & Bangalore." }
              ].map((item, i) => (
                <div key={i} className="p-4 md:p-5 bg-white/[0.02] border border-white/5 rounded-xl md:rounded-2xl hover:border-cyan-500/40 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xl md:text-2xl">{item.icon}</span>
                    <span className="text-[8px] md:text-[9px] font-black tracking-widest text-cyan-400 border border-cyan-400/30 px-2 py-0.5 rounded-md uppercase">{item.status}</span>
                  </div>
                  <h4 className="font-bold text-gray-200 text-sm md:text-base">{item.type}</h4>
                  <p className="text-[11px] md:text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* DYNAMIC LANDMARK DISTANCES */}
          <section className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] flex flex-col">
            <h3 className="text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-3">
              <span className="w-1.5 h-5 md:h-6 bg-purple-500 rounded-full" /> Landmark Points
            </h3>
            
            <div className="space-y-5 md:space-y-6 overflow-y-auto max-h-[350px] md:max-h-[450px] pr-2">
              {VELLORE_LANDMARKS.map((spot, i) => {
                const liveDistance = gpsLoading 
                  ? "CALCULATING..." 
                  : `${calculateDistance(coords.lat, coords.lng, spot.lat, spot.lng)}KM`;

                const isActive = activeLandmark?.name === spot.name;

                return (
                  <div key={i} className="flex items-center justify-between gap-2 md:gap-4 group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl border flex items-center justify-center font-black transition-all text-xs md:text-base shrink-0 ${isActive ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-gradient-to-br from-gray-800 to-black text-gray-600 border-white/10 group-hover:text-cyan-400'}`}>
                        0{i+1}
                      </div>
                      <div>
                        <h4 className={`font-bold transition text-sm md:text-base ${isActive ? 'text-cyan-400' : 'group-hover:text-white'}`}>{spot.name}</h4>
                        <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5">
                          {spot.role} · <span className={gpsLoading ? "animate-pulse text-blue-400" : "text-gray-400"}>{liveDistance}</span>
                        </p>
                      </div>
                    </div>
                    
                    {/* LOCATE BUTTON */}
                    <button
                      onClick={() => setActiveLandmark(spot)}
                      className={`shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-colors ${
                        isActive
                          ? 'bg-cyan-500 text-black shadow-lg'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                      }`}
                    >
                      {isActive ? 'Active' : 'Locate'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: MAP & GPS */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8 lg:space-y-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl md:rounded-[3rem] overflow-hidden h-[350px] sm:h-[450px] lg:h-[540px] relative shadow-2xl group">
             <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
            
            <div className="absolute top-4 left-4 md:top-8 md:left-8 flex flex-col gap-2 md:gap-4">
              <div className="bg-black/80 backdrop-blur-xl px-3 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10 text-[8px] md:text-[10px] font-black tracking-[0.1em] md:tracking-[0.2em] uppercase w-fit text-white">
                {activeLandmark ? (
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-cyan-500 rounded-full inline-block" /> Viewing: {activeLandmark.name}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full inline-block animate-ping" /> Live GPS Position
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                {activeLandmark && (
                  <button 
                    onClick={() => setActiveLandmark(null)}
                    className="bg-white/10 backdrop-blur-md border border-white/10 text-white px-3 py-2 md:px-5 md:py-2.5 rounded-full text-[8px] md:text-[10px] font-black tracking-[0.05em] md:tracking-[0.1em] uppercase hover:bg-white/20 transition w-fit"
                  >
                    Reset map
                  </button>
                )}
                <a 
                  href={externalMapUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-cyan-500 text-black px-3 py-2 md:px-5 md:py-2.5 rounded-full text-[8px] md:text-[10px] font-black tracking-[0.05em] md:tracking-[0.1em] uppercase hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20 text-center w-fit"
                >
                  Open Maps ↗
                </a>
              </div>
            </div>
          </div>

          <Link href="/city/vellore/vit-hub">
            <motion.div 
              whileHover={{ y: -5, scale: 1.01 }}
              className="bg-gradient-to-br from-cyan-600 to-blue-800 p-6 sm:p-8 md:p-12 rounded-2xl md:rounded-[3rem] relative overflow-hidden cursor-pointer group shadow-2xl shadow-cyan-500/10"
            >
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center sm:items-start md:items-center gap-6 md:gap-8 text-center sm:text-left">
                <div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 md:mb-3 italic uppercase tracking-tighter">VIT University Hub</h3>
                  <p className="text-cyan-100 font-medium text-xs sm:text-sm max-w-sm italic">Access Live AI Crowd Prediction & Unified Booking System →</p>
                </div>
                <div className="bg-white px-6 py-3 md:px-8 md:py-4 rounded-full group-hover:bg-cyan-400 transition-colors w-full sm:w-auto">
                  <span className="text-black font-black text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] uppercase whitespace-nowrap block text-center">
                    Enter Terminal
                  </span>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-6xl md:text-8xl font-black italic">AI</span>
              </div>
            </motion.div>
          </Link>

        </div>
      </div>
    </div>
  );
}
