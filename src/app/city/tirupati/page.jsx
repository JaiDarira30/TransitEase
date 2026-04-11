"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// 1. We add exact GPS coordinates to our landmarks instead of hardcoded distances
const TIRUPATI_LANDMARKS = [
  { name: "Tirumala Temple", role: "Spiritual", lat: 13.683272, lng: 79.347092 },
  { name: "Alipiri Gateway", role: "Transit Hub", lat: 13.651500, lng: 79.401800 },
  { name: "Chandragiri Fort", role: "Historic", lat: 13.585500, lng: 79.322800 }
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
  return distance.toFixed(1); // Returns distance to 1 decimal place (e.g., "4.2")
};

export default function TirupatiDashboard() {
  const [weather, setWeather] = useState(null);
  const [time, setTime] = useState(new Date());
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  // GPS States
  const [coords, setCoords] = useState({ lat: 13.6288, lng: 79.4192 }); // Default to Tirupati Center
  const [gpsLoading, setGpsLoading] = useState(true);

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
          console.log("GPS access denied, using default Tirupati coordinates.");
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

  const mapUrl = `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=14&output=embed`;
  const externalMapUrl = `https://maps.google.com/maps?q=${coords.lat},${coords.lng}`;

  if (!isMounted) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 lg:p-12 font-sans selection:bg-orange-500/30">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link href="/" className="text-orange-500 text-xs font-black mb-3 block hover:text-orange-400 transition tracking-widest uppercase">
            ← Back to Global Map
          </Link>
          <h1 className="text-6xl font-black tracking-tighter">Tirupati <span className="text-orange-400">Live</span></h1>
          <p className="text-gray-500 mt-2 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> 
            Active Node: {gpsLoading ? "Locating..." : "GPS Sync Active"}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 p-6 rounded-[2rem] backdrop-blur-xl flex items-center gap-8 shadow-2xl"
        >
          <div className="text-right">
            <p className="text-3xl font-black tabular-nums">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Local Time</p>
          </div>
          <div className="h-10 w-[1px] bg-white/10" />
          
          <div className="flex items-center gap-4">
            {!loadingWeather && weather?.main ? (
              <>
                <div className="text-right">
                  <p className="text-3xl font-black">{Math.round(weather.main.temp)}°C</p>
                  <p className="text-[10px] text-orange-400 uppercase font-black tracking-widest">{weather.weather[0].main}</p>
                </div>
                <img 
                  src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
                  className="w-14 h-14 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                  alt="weather" 
                />
              </>
            ) : (
              <div className="text-right py-1">
                <p className="text-sm font-bold text-gray-600 animate-pulse uppercase">Syncing Weather...</p>
              </div>
            )}
          </div>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-10">
          <section className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-orange-500 rounded-full" /> Transport Matrix
            </h3>
            <div className="space-y-5">
              {[
                { type: "APSRTC Bus Service", status: "High Load", icon: "🚌", desc: "Constant routes to Alipiri, Renigunta & Tirumala." },
                { type: "Pilgrim Shuttles", status: "Active", icon: "🚙", desc: "Electric jeeps navigating the hill routes." },
                { type: "Railway (TPTY Main)", status: "High Priority", icon: "🚆", desc: "Major transit point for interstate pilgrims." }
              ].map((item, i) => (
                <div key={i} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-orange-500/40 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-[9px] font-black tracking-widest text-orange-400 border border-orange-400/30 px-2 py-0.5 rounded-md uppercase">{item.status}</span>
                  </div>
                  <h4 className="font-bold text-gray-200">{item.type}</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 🔹 UPDATED: DYNAMIC LANDMARK DISTANCES */}
          <section className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-purple-500 rounded-full" /> Landmark Points
            </h3>
            <div className="space-y-6">
              {TIRUPATI_LANDMARKS.map((spot, i) => {
                // Calculate dynamic distance!
                const liveDistance = gpsLoading 
                  ? "CALCULATING..." 
                  : `${calculateDistance(coords.lat, coords.lng, spot.lat, spot.lng)}KM`;

                return (
                  <div key={i} className="flex items-center gap-5 group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center font-black text-gray-600 group-hover:text-orange-400 transition-all">
                      0{i+1}
                    </div>
                    <div>
                      <h4 className="font-bold group-hover:text-white transition">{spot.name}</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                        {spot.role} · <span className={gpsLoading ? "animate-pulse text-cyan-500" : "text-orange-400"}>{liveDistance}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: MAP & GPS */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden h-[540px] relative shadow-2xl group">
             <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
            
            <div className="absolute top-8 left-8 flex flex-col gap-4">
              <div className="bg-black/80 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/10 text-[10px] font-black tracking-[0.2em] uppercase">
                <span className="w-2 h-2 bg-red-500 rounded-full inline-block mr-2 animate-ping" /> Live GPS Position
              </div>
              <a 
                href={externalMapUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-orange-500 text-black px-5 py-2.5 rounded-full text-[10px] font-black tracking-[0.1em] uppercase hover:bg-orange-400 transition shadow-lg shadow-orange-500/20 text-center"
              >
                Open in Google Maps ↗
              </a>
            </div>
          </div>

          <Link href="/city/tirupati/alipiri-checkpoint">
            <motion.div 
              whileHover={{ y: -5, scale: 1.01 }}
              className="bg-gradient-to-br from-orange-600 to-red-800 p-12 rounded-[3rem] relative overflow-hidden cursor-pointer group shadow-2xl shadow-orange-500/10"
            >
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                  <h3 className="text-4xl font-black text-white mb-3 italic uppercase tracking-tighter">Alipiri Gateway Hub</h3>
                  <p className="text-orange-100 font-medium max-w-sm italic">Access Live AI Crowd Prediction & Pilgrim Boarding System →</p>
                </div>
                <div className="bg-white px-8 py-4 rounded-full group-hover:bg-orange-400 transition-colors">
                  <span className="text-black font-black text-xs tracking-[0.3em] uppercase">
                    Enter Terminal
                  </span>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl font-black italic">AI</span>
              </div>
            </motion.div>
          </Link>

        </div>
      </div>
    </div>
  );
}