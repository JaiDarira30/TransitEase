"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../lib/firebase"; // Using correct relative path
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProfileDetails() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch extended profile details from Firestore users collection
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          // Fallback if the user doc is missing
          setUserData({
            displayName: user.displayName || "Anonymous User",
            email: user.email,
            photoURL: user.photoURL || "/default-avatar.png",
          });
        }
      } else {
        router.push("/login"); // Redirect to login if not authenticated
      }
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-cyan-500/30">
      
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header Navigation */}
        <header className="mb-12 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors">
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
            <span className="text-xs font-black uppercase tracking-[0.2em]">Transit Terminal</span>
          </Link>
          <h2 className="text-xl font-black tracking-tighter uppercase italic text-white/20">Commuter ID: {userData?.email?.split('@')[0]}</h2>
        </header>

        {/* Profile Card matching your screenshot UI */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl"
        >
          {/* Visual Header Strip */}
          <div className="h-32 bg-gradient-to-r from-cyan-950 to-blue-950 border-b border-white/5" />
          
          <div className="px-8 md:px-16 pb-16 relative">
            
            {/* Avatar Section with automatic Gender Pic */}
            <div className="relative -mt-16 mb-12 inline-block">
              <div className="w-36 h-36 rounded-[2rem] bg-black border-4 border-black overflow-hidden shadow-2xl relative">
                {userData?.photoURL && (
                  <Image 
                    src={userData.photoURL} 
                    alt="User Avatar" 
                    fill 
                    className="object-cover"
                    priority
                  />
                )}
              </div>
              {/* Edit Indicator Badge */}
              <Link href="/details/edit" className="absolute -bottom-2 -right-2 bg-cyan-500 text-black p-2.5 rounded-xl shadow-xl hover:scale-110 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </Link>
            </div>

            {/* Data Grid matching image_a79798.png */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16">
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] block">Display Name</label>
                <p className="text-3xl font-bold tracking-tighter text-white">{userData?.displayName || "Anonymous User"}</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] block">Phone Number</label>
                <p className="text-xl font-bold text-gray-300">{userData?.phoneNumber || "Not Provided"}</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] block">Email Address</label>
                <p className="text-xl font-medium text-cyan-400">{userData?.email}</p>
              </div>

              <div className="flex gap-16">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] block">Gender</label>
                  <p className="text-xl font-bold capitalize text-gray-300">{userData?.gender || "Not Set"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] block">Member Since</label>
                  <p className="text-xl font-bold text-gray-300">
                    {userData?.createdAt?.seconds 
                      ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() 
                      : "2/11/2026"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-16 pt-12 border-t border-white/5 flex flex-wrap gap-4">
              <Link 
                href="/details/edit"
                className="px-10 py-4 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 transition-all text-xs uppercase tracking-widest shadow-lg shadow-cyan-500/20"
              >
                Edit Profile
              </Link>
              <Link href="/details/security">
  <button className="px-10 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all text-xs uppercase tracking-widest">
    Security Settings
  </button>
</Link>
            </div>

          </div>
        </motion.div>

        {/* System Footer info */}
        <p className="mt-12 text-center text-[10px] font-black text-gray-700 uppercase tracking-[0.4em]">
          TransitEase ID System · Verified Commuter Node
        </p>
      </div>
    </div>
  );
}