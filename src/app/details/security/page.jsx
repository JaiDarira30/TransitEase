"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, updatePassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function SecuritySettings() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ipAddress, setIpAddress] = useState("Detecting...");
  
  // 🔹 AI Privacy & Security States
  const [aiTrainingAllowed, setAiTrainingAllowed] = useState(true);
  const [message, setMessage] = useState("");

  // 🔹 OTP Password Reset States
  const [step, setStep] = useState(1); // 1: Default, 2: OTP Entry, 3: New Password Input
  const [otp, setOtp] = useState("");
  const [serverOtp, setServerOtp] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const ref = doc(db, "users", currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setAiTrainingAllowed(snap.data().aiTrainingAllowed ?? true);
        }
        setIpAddress("106.208.162.142 (Vellore, TN)"); 
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsub();
  }, [router]);

  const toggleAiPrivacy = async () => {
    const newVal = !aiTrainingAllowed;
    setAiTrainingAllowed(newVal);
    try {
      const ref = doc(db, "users", user.uid);
      await setDoc(ref, { aiTrainingAllowed: newVal }, { merge: true });
      setMessage(newVal ? "AI Personalization Enabled" : "Data Privacy Restrictive Mode Active");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= OTP PASSWORD LOGIC ================= */
  
  // Step 1: Send the OTP via your API
  const handleRequestOtp = async () => {
    setActionLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (data.success) {
        setServerOtp(data.otp);
        setStep(2);
        setMessage("Verification code sent to your inbox.");
      } else {
        setMessage("Failed to send OTP. Try again.");
      }
    } catch (err) {
      setMessage("Network error.");
    }
    setActionLoading(false);
  };

  // Step 2: Verify the 6-digit code
  const handleVerifyOtp = () => {
    if (otp === serverOtp) {
      setStep(3);
      setMessage("Identity verified. Enter new password.");
    } else {
      setMessage("Invalid code. Please check your email.");
    }
  };

  // Step 3: Finalize Password Change in Firebase
  const handleFinalUpdate = async () => {
    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    setActionLoading(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      setMessage("PASSWORD UPDATED SUCCESSFULLY.");
      setTimeout(() => {
        setStep(1);
        setNewPassword("");
        setMessage("");
      }, 3000);
    } catch (err) {
      // Firebase requires a fresh login for sensitive changes
      setMessage("Error: Re-login required for security.");
    }
    setActionLoading(false);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500">Syncing Security Node...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto">
        
        <header className="mb-12 flex items-center justify-between">
          <Link href="/details" className="group flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors">
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
            <span className="text-xs font-black uppercase tracking-widest">Profile Details</span>
          </Link>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic opacity-50">Security Terminal</h1>
        </header>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* 🔹 DATA PRIVACY CONTROLS */}
          <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-xl">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-cyan-500 mb-6">AI & Data Privacy</h2>
            <div className="flex items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Deep Learning Feedback Loop</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Allow our Comfort Prediction AI to use your travel history to improve route accuracy in Vellore. 
                  Restrict this to keep your specific travel patterns private from model training.
                </p>
              </div>
              <button 
                onClick={toggleAiPrivacy}
                className={`w-16 h-8 rounded-full transition-colors relative ${aiTrainingAllowed ? 'bg-cyan-500' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${aiTrainingAllowed ? 'left-9' : 'left-1'}`} />
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 🔹 SESSION MANAGEMENT */}
            <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Current Session</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 font-bold text-xs">WEB</div>
                  <div>
                    <p className="text-sm font-bold">Terminal Interface (Active)</p>
                    <p className="text-[10px] text-gray-500">{ipAddress}</p>
                  </div>
                </div>
                <button className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline mt-2">Revoke All Sessions</button>
              </div>
            </section>

            {/* 🔹 PASSWORD SECURITY (UPDATED WITH OTP) */}
            <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Authentication</h2>
              
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="text-xs text-gray-500 mb-6 leading-relaxed">Request a secure 6-digit code to your email to update your account password.</p>
                    <button 
                      onClick={handleRequestOtp}
                      disabled={actionLoading}
                      className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition"
                    >
                      {actionLoading ? "Processing..." : "Update Password via OTP"}
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <input 
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-center text-xl font-black tracking-[0.3em] outline-none focus:border-cyan-500"
                      placeholder="000000"
                      maxLength={6}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <button onClick={handleVerifyOtp} className="w-full py-3 bg-cyan-500 text-black font-black rounded-xl text-[10px] uppercase tracking-widest">Verify Code</button>
                    <button onClick={() => setStep(1)} className="w-full text-[8px] text-gray-500 uppercase font-black">Cancel</button>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <input 
                      type="password"
                      className="w-full p-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-cyan-500 text-xs"
                      placeholder="New Security Password"
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button 
                      onClick={handleFinalUpdate}
                      disabled={actionLoading}
                      className="w-full py-3 bg-green-500 text-black font-black rounded-xl text-[10px] uppercase tracking-widest"
                    >
                      {actionLoading ? "Syncing..." : "Confirm New Password"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>

          {message && (
            <p className="text-center text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em] animate-pulse">
              {message}
            </p>
          )}

        </motion.div>
      </div>
    </div>
  );
}