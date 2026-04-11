"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// 1. Exact GPS coordinates for Hyderabad landmarks
const HYDERABAD_LANDMARKS = [
  { name: "Charminar", role: "Historic Node", lat: 17.3616, lng: 78.4747 },
  { name: "Golconda Fort", role: "Heritage Site", lat: 17.3833, lng: 78.4011 },
  { name: "Hussain Sagar", role: "City Central", lat: 17.4239, lng: 78.4738 }
];

// 2. The Haversine Formula (Calculates real-world distance between two GPS points)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance.toFixed(1); // Returns distance to 1 decimal place
};

export default function HyderabadDashboard() {
  const [weather, setWeather] = useState(null);
  const [time, setTime] = useState(new Date());
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // GPS States
  const [coords, setCoords] = useState({ lat: 17.3850, lng: 78.4867 }); // Default Hyderabad Coordinates
  const [gpsLoading, setGpsLoading] = useState(true);

  // GPS & Clock Lifecycle
  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsLoading(false);
        },
        () => {
          console.log("GPS access denied, using default Hyderabad coordinates.");
          setGpsLoading(false);
        }
      );
    } else {
      setGpsLoading(false);
    }
    return () => clearInterval(timer);
  }, []);

  // Weather API Sync
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
        console.error("Weather Node Offline"); 
      } finally { 
        setLoadingWeather(false); 
      }
    };
    if (isMounted) fetchWeather();
  }, [coords, isMounted]);

  // Google Maps URLs
 const mapEmbedUrl = `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=14&output=embed`;
const mapExternalUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
  if (!isMounted) return <div className="min-h-screen bg-[#020617]" />;

  // Simulated AI Logic Helper
  const isRaining = weather?.weather[0]?.main === "Rain";
  const currentHour = time.getHours();
  const isPeakHour = (currentHour >= 8 && currentHour <= 11) || (currentHour >= 17 && currentHour <= 20);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 sm:p-6 lg:p-12 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      
      {/* ================= HEADER ================= */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 md:mb-12 gap-6 md:gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link href="/" className="text-cyan-500 text-[10px] md:text-xs font-black mb-3 block hover:text-cyan-400 transition tracking-widest uppercase">
            ← Back to TransitEase Terminal
          </Link>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Hyderabad <span className="text-cyan-400">Live</span></h1>
          <p className="text-gray-500 mt-2 text-xs md:text-sm font-medium flex items-center gap-2 italic">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> 
            Active Node: {gpsLoading ? "Locating..." : "Cyberabad Intelligence Corridor"}
          </p>
        </motion.div>

        
        <div className="bg-[#0b101e] border border-white/5 p-4 md:px-8 md:py-5 rounded-2xl md:rounded-[2rem] shadow-2xl flex items-center justify-between md:justify-center gap-6 md:gap-8 w-full md:w-auto">
          
          {/* Time Block */}
          <div className="flex flex-col items-center md:items-end">
            <p className="text-3xl md:text-4xl font-black tabular-nums tracking-tight leading-none text-white">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-[9px] md:text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mt-2">
              Local Time
            </p>
          </div>

          {/* Thin Vertical Divider */}
          <div className="h-10 md:h-12 w-[1px] bg-white/10" />

          {/* Weather Block */}
          {!loadingWeather && weather?.main ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <p className="text-3xl md:text-4xl font-black leading-none text-white">
                  {Math.round(weather.main.temp)}°C
                </p>
                <p className="text-[9px] md:text-[10px] text-cyan-400 uppercase font-black tracking-[0.1em] mt-2">
                  {weather.weather[0].main}
                </p>
              </div>
              
              {/* Dynamic Weather Icon fetched from OpenWeather */}
              <div className="w-12 h-12 flex items-center justify-center">
                 <img 
                   src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
                   alt={weather.weather[0].main} 
                   className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                 />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full px-6">
               <p className="text-[10px] font-black text-gray-700 animate-pulse uppercase tracking-widest">Syncing...</p>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        
        {/* ================= LEFT: TRANSIT MATRIX (AI OCCUPANCY) ================= */}
        <div className="lg:col-span-1 space-y-8 md:space-y-10">
          <section className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem]">
            <h3 className="text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-cyan-500 rounded-full" /> Transport Matrix
            </h3>
            <div className="space-y-4 md:space-y-5">
              {[
                { type: "Hyderabad Metro (Red/Blue)", baseOcc: 40, icon: "🚆", desc: "Miyapur ↔ LB Nagar & Raidurg ↔ Nagole." },
                { type: "TSRTC City Express", baseOcc: 30, icon: "🚌", desc: "Pushpak Airport & Metro Deluxe Services." },
                { type: "MMTS Suburban", baseOcc: 25, icon: "🚊", desc: "Connecting Secunderabad & Lingampally." }
              ].map((item, i) => {
                
                // AI Occupancy ML Simulation Logic
                let liveOccupancy = item.baseOcc;
                if (isPeakHour) liveOccupancy += 35; // Rush hour penalty
                if (isRaining) liveOccupancy += 15;  // Bad weather penalty
                liveOccupancy = Math.min(liveOccupancy, 98); // Cap at 98%
                
                const comfortColor = liveOccupancy > 80 ? "bg-red-500" : liveOccupancy > 60 ? "bg-yellow-500" : "bg-green-500";
                const textColor = liveOccupancy > 80 ? "text-red-400" : liveOccupancy > 60 ? "text-yellow-400" : "text-green-400";

                return (
                  <div key={i} className="p-4 md:p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-cyan-500/40 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xl md:text-2xl">{item.icon}</span>
                      <span className={`text-[8px] md:text-[9px] font-black tracking-widest border px-2 py-0.5 rounded-md uppercase ${textColor} border-current/30`}>
                        {liveOccupancy}% CROWDED
                      </span>
                    </div>
                    <h4 className="text-sm md:text-base font-bold text-gray-200">{item.type}</h4>
                    <p className="text-[10px] md:text-xs text-gray-600 mt-1 mb-3 leading-relaxed italic">{item.desc}</p>
                    
                    {/* Live AI Progress Bar */}
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${comfortColor}`} style={{ width: `${liveOccupancy}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/*  DYNAMIC LANDMARKS SECTION (NEURAL ARRIVAL TIME) */}
          <section className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem]">
            <h3 className="text-lg md:text-xl font-black mb-6 md:mb-8 flex items-center gap-3 italic">
              <span className="w-1.5 h-6 bg-purple-500 rounded-full" /> Neural Routing
            </h3>
            <div className="space-y-4 md:space-y-6">
              {HYDERABAD_LANDMARKS.map((spot, i) => {
                const liveDistance = gpsLoading ? 0 : calculateDistance(coords.lat, coords.lng, spot.lat, spot.lng);
                
                // Simulated ML Routing Logic
                const speed = (isRaining || isPeakHour) ? 10 : 18;
                const travelTime = gpsLoading ? "..." : Math.round((liveDistance / speed) * 60);

                return (
                  <div key={i} className="flex items-center gap-4 md:gap-5 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center font-black text-gray-700 group-hover:text-cyan-400 transition-all text-sm md:text-base">0{i+1}</div>
                    <div className="flex-1">
                      <h4 className="text-sm md:text-base font-bold group-hover:text-white transition">{spot.name}</h4>
                      <p className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        {spot.role} · <span className={gpsLoading ? "animate-pulse text-cyan-500" : "text-cyan-400"}>{gpsLoading ? "CALCULATING" : `${liveDistance}KM`}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs md:text-sm font-black text-cyan-500">{travelTime} MINS</p>
                      <p className="text-[7px] text-gray-600 font-bold uppercase flex justify-end items-center gap-1">
                        <span className="w-1 h-1 bg-cyan-500 rounded-full animate-ping" /> AI EST
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ================= RIGHT: LIVE GPS & BOOKING ================= */}
        <div className="lg:col-span-2 space-y-8 md:space-y-10">
          
          {/* Live Map Display URL */}
          <div className="bg-white/5 border border-white/10 rounded-2xl md:rounded-[3rem] overflow-hidden h-[300px] md:h-[500px] relative shadow-2xl group">
             <iframe
              src={mapEmbedUrl}
              width="100%" height="100%" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(90%)' }}
              allowFullScreen="" loading="lazy"
            />
            <div className="absolute top-4 left-4 md:top-8 md:left-8 flex flex-col gap-4">
              <div className="bg-black/80 backdrop-blur-xl px-4 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10 text-[8px] md:text-[10px] font-black tracking-[0.2em] uppercase text-white">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full inline-block mr-2 animate-ping" /> Real-time GPS Sync
              </div>
              <a 
                href={mapExternalUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-cyan-500 text-black px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[8px] md:text-[10px] font-black tracking-[0.1em] uppercase hover:bg-cyan-400 transition shadow-lg shadow-cyan-500/20 text-center w-fit"
              >
                Open in Google Maps ↗
              </a>
            </div>
          </div>

          {/* Neural Unified Booking Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-cyan-600 to-blue-800 p-6 md:p-12 rounded-2xl md:rounded-[3rem] relative overflow-hidden shadow-2xl"
          >
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
              <div>
                <h3 className="text-2xl md:text-4xl font-black text-white mb-2 md:mb-3 italic uppercase tracking-tighter">Unified Neural Booking</h3>
                <p className="text-cyan-100 text-xs md:text-base font-medium max-w-sm italic">
                  Access live AI occupancy data for Hyderabad Metro and RTC bus loops.
                </p>
              </div>
              <div className="bg-white px-6 py-3 md:px-10 md:py-5 rounded-full shadow-2xl w-full md:w-auto text-center cursor-pointer hover:bg-cyan-400 transition-colors group">
                <span className="text-black font-black text-[10px] md:text-xs tracking-[0.3em] md:tracking-[0.4em] uppercase group-hover:animate-none animate-pulse">Comimg Soon...</span>
              </div>
            </div>
            {/* Decoration */}
            <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 pointer-events-none">
                <span className="text-6xl md:text-9xl font-black italic">HYD</span>
            </div>
          </motion.div>

        </div>
      </div>

    </div>
  );
}