"use client";

import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link"; 
import { motion, AnimatePresence } from "framer-motion";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

const VEHICLE_TYPES = ["Car / Jeep", "Two-Wheeler", "Bus / Minibus", "VIP Convoy"];
const TIME_SLOTS = [
  "06:00 AM - 09:00 AM", 
  "09:00 AM - 12:00 PM", 
  "12:00 PM - 03:00 PM", 
  "03:00 PM - 06:00 PM", 
  "06:00 PM - 09:00 PM",
  "Night Pass (09 PM - 06 AM)"
];

export default function AlipiriTerminal() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [model, setModel] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(true); 

  // AI & Analytics States
  const [liveVehicleCount, setLiveVehicleCount] = useState(0);
  const [activeBookings, setActiveBookings] = useState([]);
  const [congestionLevel, setCongestionLevel] = useState("OPTIMAL");

  // Booking States
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]);
  const [licensePlate, setLicensePlate] = useState("");
  const [numPilgrims, setNumPilgrims] = useState(1);
  const [pilgrimNames, setPilgrimNames] = useState([""]);
  const [contactInfo, setContactInfo] = useState({ mobile: "", email: "" });
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [isBooking, setIsBooking] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
  // Modal States
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); 

  useEffect(() => {
    let isMounted = true;
    
    // Initialize TensorFlow Object Detection Model
    const init = async () => {
      await tf.ready();
      const loadedModel = await cocoSsd.load();
      if (isMounted) setModel(loadedModel);
    };
    init();

    const unsubAuth = onAuthStateChanged(auth, (user) => { 
      if (isMounted) {
        setCurrentUser(user);
        setContactInfo(prev => ({ ...prev, email: user?.email || "" }));
      }
    });

    const unsubDb = onSnapshot(query(collection(db, "alipiri_bookings")), (snap) => {
      if (isMounted) setActiveBookings(snap.docs.map(d => d.data()));
    });

    return () => {
      isMounted = false;
      unsubDb();
      unsubAuth();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    const count = Math.max(1, parseInt(numPilgrims) || 1);
    setPilgrimNames(prev => {
      const newNames = [...prev];
      if (count > prev.length) return [...prev, ...Array(count - prev.length).fill("")];
      return prev.slice(0, count);
    });
  }, [numPilgrims]);

  useEffect(() => {
    let isCameraMounted = true;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (isCameraMounted && isCameraOn) {
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        } else {
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error("Camera denied", err);
        if (isCameraMounted) setIsCameraOn(false);
      }
    };

    if (isCameraOn) startCamera();
    else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }

    return () => {
      isCameraMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOn]);

  useEffect(() => {
    if (!model || !videoRef.current || !isCameraOn) return;
    let anim;
    const loop = async () => {
      if (videoRef.current?.readyState === 4) {
        const preds = await model.detect(videoRef.current);
        setLiveVehicleCount(preds.filter(p => ["car", "bus", "truck", "motorcycle"].includes(p.class)).length);
      }
      anim = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(anim);
  }, [model, isCameraOn]);

  const calculateFee = () => {
    if (vehicleType.includes("Two")) return 0;
    if (vehicleType.includes("Bus")) return 300;
    return 50;
  };

  // 5. MOCK Booking Logic (Bypasses Razorpay KYC)
  const handleRazorpay = async (bookingData) => {
    setPaymentLoading(true);
    
    // Simulate a 2.5-second secure payment processing delay for the review
    setTimeout(async () => {
      try {
        // Proceed directly to saving the database and sending the QR email
        await finalizeBooking(bookingData, "Paid (Online - Mock)");
      } catch (e) {
        setErrorMessage("Payment Gateway Simulation Failed.");
      } finally {
        setPaymentLoading(false);
      }
    }, 2500); 
  };

  const finalizeBooking = async (data, paymentStatus) => {
    setIsBooking(true);
    try {
      const finalData = { ...data, paymentStatus };
      await addDoc(collection(db, "alipiri_bookings"), finalData);
      
      // Call the API route to trigger the NodeMailer email
      await fetch("/api/send-alipiri-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });
      
      setLicensePlate("");
      setSuccessMessage("Permit Generated Successfully! The QR Code has been dispatched to your email.");
      
    } catch (e) { 
      setErrorMessage("Database Sync Failure."); 
    }
    setIsBooking(false);
  };

  const handleAction = (type) => {
    const formattedPlate = licensePlate.toUpperCase().trim();
    
    const isDuplicate = activeBookings.some(b => b.licensePlate === formattedPlate);
    if (isDuplicate) return setErrorMessage(`Vehicle ${formattedPlate} already registered.`);
    
    if (!formattedPlate || !contactInfo.mobile || pilgrimNames.some(n => !n)) {
      return setErrorMessage("Missing Fields: Complete all pilgrim data.");
    }

    const bookingData = {
      vehicleType, licensePlate: formattedPlate, pilgrimNames, contactInfo,
      timeSlot, fee: calculateFee(), verificationStatus: "PENDING_DARSHAN_UPLOAD", timestamp: new Date().toISOString()
    };

    if (type === "ONLINE") {
      if (calculateFee() === 0) finalizeBooking(bookingData, "Free Pass");
      else handleRazorpay(bookingData);
    } else {
      finalizeBooking(bookingData, "Pay at Checkpost");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-white p-4 font-sans flex flex-col selection:bg-orange-500/30">
      
      {/* ERROR MODAL */}
      <AnimatePresence>
        {errorMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#0f1730] border-2 border-red-500/50 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center">
              <div className="text-red-500 text-4xl mb-4">!</div>
              <h2 className="text-lg font-black uppercase mb-2 tracking-tighter text-white">Entry Denied</h2>
              <p className="text-gray-400 text-xs font-bold leading-relaxed mb-6">{errorMessage}</p>
              <button onClick={() => setErrorMessage(null)} className="w-full bg-red-500 text-white font-black py-3 rounded-xl uppercase text-[10px] tracking-widest hover:bg-red-600 transition-colors">Acknowledge</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {successMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-[#0f1730] border-2 border-green-500/50 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center">
              <div className="w-16 h-16 mx-auto bg-green-500/20 text-green-500 rounded-full flex items-center justify-center text-3xl font-black mb-4">✓</div>
              <h2 className="text-lg font-black uppercase mb-2 tracking-tighter text-white">Permit Secured</h2>
              <p className="text-gray-400 text-xs font-bold leading-relaxed mb-6">{successMessage}</p>
              <button onClick={() => setSuccessMessage(null)} className="w-full bg-green-500 text-black font-black py-3 rounded-xl uppercase text-[10px] tracking-widest hover:bg-green-400 transition-colors">Done</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="flex justify-between items-center bg-[#0f1730] p-4 rounded-xl mb-4 border border-orange-500/20 shadow-2xl">
        <Link href="/city/tirupati" className="text-[10px] font-black uppercase text-gray-500 hover:text-orange-400">← City Grid</Link>
        <h1 className="text-xl font-black italic text-orange-400 uppercase tracking-tighter">Alipiri Checkpoint Node</h1>
        <div className="text-[10px] px-3 py-1 rounded-full font-black bg-orange-500/20 text-orange-500 tracking-widest">AI SENSORS ACTIVE</div>
      </header>

      <div className="grid grid-cols-12 gap-6 flex-1 max-w-7xl mx-auto w-full overflow-hidden">
        {/* LEFT: LIVE PANEL */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
          <div className="bg-black rounded-3xl overflow-hidden border-2 border-orange-500/20 relative aspect-video shadow-2xl">
            {isCameraOn ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-black tracking-widest uppercase">Visual Node Disabled</div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <p className="text-[9px] font-black uppercase text-gray-500 mb-1 tracking-widest">AI Detection</p>
                <h3 className="text-3xl font-black text-white">{liveVehicleCount} Vehicles</h3>
             </div>
             <div className="bg-orange-500/10 p-6 rounded-2xl border border-orange-500/20">
                <p className="text-[9px] font-black uppercase text-orange-400 mb-1 tracking-widest">Toll Fee Due</p>
                <h3 className="text-3xl font-black text-orange-400">₹{calculateFee()}</h3>
             </div>
          </div>
        </div>

        {/* RIGHT: REGISTRATION PANEL */}
        <div className="col-span-12 lg:col-span-6">
          <section className="bg-[#0f1730] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-y-auto max-h-[85vh] scrollbar-hide">
            <h2 className="text-[12px] font-black text-orange-400 uppercase tracking-widest italic mb-6 text-center">Permit Registration</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-gray-500 ml-1">Registration Plate</label>
                  <input type="text" placeholder="AP 03 XX 1234" value={licensePlate} onChange={(e)=>setLicensePlate(e.target.value)} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-xs font-bold outline-none focus:border-orange-500 uppercase" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase text-gray-500 ml-1">Vehicle Type</label>
                  <select value={vehicleType} onChange={(e)=>setVehicleType(e.target.value)} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-xs font-bold outline-none">
                    {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-gray-500 ml-1">Planned Entry Window</label>
                <select value={timeSlot} onChange={(e)=>setTimeSlot(e.target.value)} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-xs font-bold outline-none focus:border-orange-500">
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input type="email" placeholder="Email ID" value={contactInfo.email} onChange={(e)=>setContactInfo({...contactInfo, email: e.target.value})} className="bg-black/40 border border-white/10 p-4 rounded-xl text-xs font-bold outline-none focus:border-orange-500" />
                <input type="text" placeholder="Mobile No" value={contactInfo.mobile} onChange={(e)=>setContactInfo({...contactInfo, mobile: e.target.value})} className="bg-black/40 border border-white/10 p-4 rounded-xl text-xs font-bold outline-none focus:border-orange-500" />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-gray-500 ml-1">Number of Pilgrims</label>
                <input type="number" min="1" max="15" value={numPilgrims} onChange={(e)=>setNumPilgrims(e.target.value)} className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-xs font-bold outline-none focus:border-orange-500" />
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block">Pilgrim List</label>
                {pilgrimNames.map((name, i) => (
                  <input key={i} type="text" placeholder={`Pilgrim ${i+1} Name`} value={name} onChange={(e) => {
                    const newNames = [...pilgrimNames];
                    newNames[i] = e.target.value;
                    setPilgrimNames(newNames);
                  }} className="w-full bg-black/5 border border-white/5 p-3 rounded-lg text-[10px] outline-none focus:border-orange-500/50" />
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                <button 
                  onClick={() => handleAction("ONLINE")} 
                  disabled={isBooking || paymentLoading} 
                  className="w-full bg-orange-500 text-black font-black py-5 rounded-2xl uppercase text-[10px] tracking-[0.2em] shadow-lg hover:shadow-orange-500/30 hover:bg-orange-400 transition-all"
                >
                  {paymentLoading ? "Processing Payment..." : calculateFee() === 0 ? "Generate Free Pass" : `Book & Pay Online (₹${calculateFee()})`}
                </button>
                {calculateFee() > 0 && (
                  <button onClick={() => handleAction("CHECKPOST")} disabled={isBooking || paymentLoading} className="w-full bg-white/5 border border-white/10 text-white font-black py-5 rounded-2xl uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all">
                    Book & Pay at Check Post
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
