"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function CompleteProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const ref = doc(db, "users", currentUser.uid);
      const snap = await getDoc(ref);

      // If profile is already marked as completed, send them home
      if (snap.exists() && snap.data().profileCompleted) {
        router.push("/");
        return;
      }

      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  const handleSaveProfile = async () => {
    if (!name || !mobile || !gender) {
      setError("Please fill all fields to secure your commuter ID.");
      return;
    }

    try {
      const ref = doc(db, "users", user.uid);

      // Automatic Gender Avatar Logic for high-quality profile display
      const defaultAvatar = gender === "Male" 
        ? "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
        : "https://cdn-icons-png.flaticon.com/512/3135/3135768.png";

      // 🔹 Using setDoc with merge:true to prevent "No document to update" error
      await setDoc(ref, {
        displayName: name, // Using displayName for consistency with your Navbar
        phoneNumber: mobile,
        gender,
        photoURL: defaultAvatar, // Sets the gender-specific icon automatically
        profileCompleted: true,
        updatedAt: new Date(),
      }, { merge: true });

      router.push("/");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mr-3" />
        Initializing Node...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative z-10">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tighter mb-2 italic">TransitEase</h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Complete Commuter Profile</p>
        </header>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-cyan-500 outline-none transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 text-gray-600 cursor-not-allowed italic"
          />

          <input
            type="tel"
            placeholder="Mobile Number"
            className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-cyan-500 outline-none transition"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />

          <select
            className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-cyan-500 outline-none transition text-gray-400"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Select Gender</option>
            <option value="Male" className="bg-black">Male</option>
            <option value="Female" className="bg-black">Female</option>
            <option value="Other" className="bg-black">Other</option>
          </select>
        </div>

        {error && (
          <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mt-6 text-center animate-pulse">
            {error}
          </p>
        )}

        <button
          onClick={handleSaveProfile}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black p-4 rounded-2xl mt-8 transition shadow-lg shadow-cyan-500/20 uppercase tracking-widest text-xs"
        >
          Initialize Account
        </button>
      </div>
    </div>
  );
}