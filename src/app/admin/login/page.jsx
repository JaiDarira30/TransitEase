"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [staffId, setStaffId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 🔹 1. Basic Staff ID Validation (Example: VIT-ADM-XXXX)
    if (!staffId.startsWith("VIT-ADM-")) {
      setError("INVALID STAFF CREDENTIALS");
      setLoading(false);
      return;
    }

    try {
      // 🔹 2. Firebase Auth Login
      const res = await signInWithEmailAndPassword(auth, email, password);
      
      // 🔹 3. Role Verification in Firestore
      const userRef = doc(db, "users", res.user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists() && snap.data().role === "admin") {
        router.push("/admin/dashboard");
      } else {
        await auth.signOut();
        setError("UNAUTHORIZED ACCESS: ADMIN ROLE NOT FOUND");
      }
    } catch (err) {
      setError("AUTHENTICATION FAILED: CHECK EMAIL/PASSWORD");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-red-500/30">
      {/* Red Warning Glow for Admin Area */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-red-500/20 shadow-2xl relative z-10"
      >
        <header className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tighter mb-2 italic text-red-500">Admin Terminal</h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Restricted Access Area</p>
        </header>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Staff ID (VIT-ADM-XXXX)"
            className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-red-500 outline-none transition placeholder:text-gray-700"
            value={staffId}
            onChange={(e) => setStaffId(e.target.value.toUpperCase())}
            required
          />

          <input
            type="email"
            placeholder="Admin Email"
            className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-red-500 outline-none transition placeholder:text-gray-700"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Security Password"
            className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-red-500 outline-none transition placeholder:text-gray-700"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-4 text-center animate-pulse">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-black p-4 rounded-2xl mt-6 transition shadow-lg shadow-red-500/20 disabled:opacity-50 uppercase tracking-widest text-xs"
          >
            {loading ? "Decrypting..." : "Access Dashboard"}
          </button>
        </form>

        <p className="mt-8 text-center">
          <button onClick={() => router.push("/")} className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition">
            ← Return to Public Site
          </button>
        </p>
      </motion.div>
    </div>
  );
}