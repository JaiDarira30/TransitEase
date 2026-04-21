"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Accurate GPS Coordinates for Tirupati/Tirumala Landmarks
const TIRUPATI_LANDMARKS = [
  { name: "Srivari Temple", role: "Spiritual", lat: 13.683272, lng: 79.347092 },
  { name: "Alipiri Gateway", role: "Transit Hub", lat: 13.651500, lng: 79.401800 },
  { name: "Sri Padmavathi Ammavari", role: "Spiritual", lat: 13.601500, lng: 79.448100 },
  { name: "Kapila Theertham", role: "Saivite Shrine", lat: 13.649600, lng: 79.431200 },
  { name: "Sri Govindaraja Swamy", role: "Historic Temple", lat: 13.629300, lng: 79.418200 },
  { name: "Srikalahasti Temple", role: "Vayu Lingam", lat: 13.749700, lng: 79.698400 },
  { name: "Japali Hanuman Temple", role: "Forest Shrine", lat: 13.702000, lng: 79.336400 },
  { name: "ISKCON Temple", role: "Spiritual Center", lat: 13.650800, lng: 79.401000 }
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

  const mapUrl = `http://googleusercontent.com/maps.google.com/maps?q=${coords.lat},${coords.lng}&z=14&output=embed`;
  const externalMapUrl = `http://googleusercontent.com/maps.google.com/maps?q=${coords.lat},${coords.lng}`;

  if (!isMounted) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 sm:p-6 lg:p-12 font-sans selection:bg-orange-500/30">
      
      {/* HEADER */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 md:mb-12 gap-6 md:gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full xl:w-auto">
          <Link href="/" className="text-orange-500 text-[10px] md:text-xs font-black mb-2 md:mb-3 block hover:text-orange-400 transition tracking-widest uppercase">
            ← Back to Global Map
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter">Tirupati <span className="text-orange-400">Live</span></h1>
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
                  <p className="text-[9px] md:text-[10px] text-orange-400 uppercase font-black tracking-widest mt-0.5">{weather.weather[0].main}</p>
                </div>
                <img 
                  src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
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
              <span className="w-1.5 h-5 md:h-6 bg-orange-500 rounded-full" /> Transport Matrix
            </h3>
            <div className="space-y-4 md:space-y-5">
              {[
                { type: "APSRTC Bus Service", status: "High Load", icon: "🚌", desc: "Constant routes to Alipiri, Renigunta & Tirumala." },
                { type: "Ghat Jeeps", status: "Active", icon: "🚙", desc: "Ghat road verified jeeps navigating through the Seshachalam hill routes of Tirumala from Tirupati." },
                { type: "Railway (TPTY Main)", status: "High Priority", icon: "🚆", desc: "Major transit point for interstate pilgrims." }
              ].map((item, i) => (
                <div key={i} className="p-4 md:p-5 bg-white/[0.02] border border-white/5 rounded-xl md:rounded-2xl hover:border-orange-500/40 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xl md:text-2xl">{item.icon}</span>
                    <span className="text-[8px] md:text-[9px] font-black tracking-widest text-orange-400 border border-orange-400/30 px-2 py-0.5 rounded-md uppercase">{item.status}</span>
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
            {/* Added scrollable container for mobile friendliness since list is long */}
            <div className="space-y-5 md:space-y-6 overflow-y-auto max-h-[350px] md:max-h-[450px] pr-2">
              {TIRUPATI_LANDMARKS.map((spot, i) => {
                const liveDistance = gpsLoading 
                  ? "CALCULATING..." 
                  : `${calculateDistance(coords.lat, coords.lng, spot.lat, spot.lng)}KM`;

                return (
                  <div key={i} className="flex items-center gap-4 md:gap-5 group">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center font-black text-gray-600 group-hover:text-orange-400 transition-all text-xs md:text-base shrink-0">
                      0{i+1}
                    </div>
                    <div>
                      <h4 className="font-bold group-hover:text-white transition text-sm md:text-base">{spot.name}</h4>
                      <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5">
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
              <div className="bg-black/80 backdrop-blur-xl px-3 py-2 md:px-5 md:py-2.5 rounded-full border border-white/10 text-[8px] md:text-[10px] font-black tracking-[0.1em] md:tracking-[0.2em] uppercase w-fit">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full inline-block mr-1.5 md:mr-2 animate-ping" /> Live GPS Position
              </div>
              <a 
                href={externalMapUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-orange-500 text-black px-3 py-2 md:px-5 md:py-2.5 rounded-full text-[8px] md:text-[10px] font-black tracking-[0.05em] md:tracking-[0.1em] uppercase hover:bg-orange-400 transition shadow-lg shadow-orange-500/20 text-center w-fit"
              >
                Open in Google Maps ↗
              </a>
            </div>
          </div>

          <Link href="/city/tirupati/alipiri-checkpoint">
            <motion.div 
              whileHover={{ y: -5, scale: 1.01 }}
              className="bg-gradient-to-br from-orange-600 to-red-800 p-6 sm:p-8 md:p-12 rounded-2xl md:rounded-[3rem] relative overflow-hidden cursor-pointer group shadow-2xl shadow-orange-500/10"
            >
              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center sm:items-start md:items-center gap-6 md:gap-8 text-center sm:text-left">
                <div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-2 md:mb-3 italic uppercase tracking-tighter">Alipiri Gateway Hub</h3>
                  <p className="text-orange-100 font-medium text-xs sm:text-sm max-w-sm italic">Access Live AI Crowd Prediction & Pilgrim Boarding System →</p>
                </div>
                <div className="bg-white px-6 py-3 md:px-8 md:py-4 rounded-full group-hover:bg-orange-400 transition-colors w-full sm:w-auto">
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
