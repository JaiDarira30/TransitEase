"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider, db } from "../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function RegisterPage() {
  const router = useRouter();

  // 🔹 Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  
  // 🔹 OTP States
  const [step, setStep] = useState(1); // 1: Registration Form, 2: OTP Verification
  const [userOtp, setUserOtp] = useState("");
  const [serverOtp, setServerOtp] = useState(null);
  const [timer, setTimer] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Handle Resend Timer
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  /* ================= OTP REQUEST LOGIC ================= */
  const handleRequestOtp = async () => {
    if (!name || !gender || !phone || !email || !password) {
      setError("Please fill in all details to create your profile.");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setServerOtp(data.otp);
        setStep(2);
        setTimer(30); // Start 30-second cooldown
      } else {
        setError("Failed to send verification code. Try again.");
      }
    } catch (err) {
      setError("Network error. Could not send OTP.");
    }
    setLoading(false);
  };

  /* ================= FINAL REGISTRATION LOGIC ================= */
  const handleFinalRegister = async () => {
    if (userOtp !== serverOtp) {
      setError("Invalid verification code.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create User in Firebase Auth
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Assign Default Avatar based on Gender
      const defaultAvatar = gender === "male" 
        ? "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
        : "https://cdn-icons-png.flaticon.com/512/3135/3135768.png";

      // 3. Save User Profile to Firestore
      await setDoc(doc(db, "users", res.user.uid), {
        displayName: name,
        email: email,
        gender: gender,
        phoneNumber: phone,
        photoURL: defaultAvatar,
        provider: "password",
        profileCompleted: true,
        createdAt: new Date(),
      });

      router.push("/");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  /* ================= GOOGLE REGISTER ================= */
  const handleGoogleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          provider: "google",
          profileCompleted: false,
          createdAt: new Date(),
        });
      }
      router.push("/");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6 selection:bg-cyan-500/30">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/10 shadow-2xl relative z-10">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter mb-2">TransitEase</h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
            {step === 1 ? "Registration Terminal" : "Identity Verification"}
          </p>
        </header>

        {step === 1 ? (
          <div className="space-y-4">
            <input type="text" placeholder="Full Name" className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-cyan-500 outline-none transition placeholder:text-gray-600" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="email" placeholder="Email Address" className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-cyan-500 outline-none transition placeholder:text-gray-600" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="tel" placeholder="Mobile Number" className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-cyan-500 outline-none transition placeholder:text-gray-600" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <select className={`w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-cyan-500 outline-none transition ${gender ? 'text-white' : 'text-gray-600'}`} value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="" disabled className="bg-black">Select Gender</option>
              <option value="male" className="bg-black text-white">Male</option>
              <option value="female" className="bg-black text-white">Female</option>
            </select>
            <input type="password" placeholder="Password" className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-cyan-500 outline-none transition placeholder:text-gray-600" value={password} onChange={(e) => setPassword(e.target.value)} />
            
            <button onClick={handleRequestOtp} disabled={loading} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black p-4 rounded-2xl mt-8 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 uppercase tracking-widest text-xs">
              {loading ? "Sending Code..." : "Verify Email"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-center text-sm text-gray-400">Enter the 6-digit code sent to <br/><span className="text-cyan-400 font-bold">{email}</span></p>
            <input type="text" maxLength={6} placeholder="000000" className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:border-cyan-400 outline-none transition text-center text-3xl font-black tracking-[0.5em]" value={userOtp} onChange={(e) => setUserOtp(e.target.value)} />
            
            <button onClick={handleFinalRegister} disabled={loading} className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black p-4 rounded-2xl transition shadow-lg shadow-cyan-500/20 disabled:opacity-50 uppercase tracking-widest text-xs">
              {loading ? "Initializing..." : "Complete Registration"}
            </button>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Resend code in {timer}s</p>
              ) : (
                <button onClick={handleRequestOtp} className="text-[10px] text-cyan-400 font-black uppercase tracking-widest hover:underline">Resend OTP</button>
              )}
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-6 text-center animate-pulse">{error}</p>}

        {step === 1 && (
          <>
            <div className="flex items-center gap-3 my-8">
              <div className="flex-1 h-px bg-white/5"></div>
              <span className="text-gray-700 text-[10px] font-black uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-white/5"></div>
            </div>

            <button onClick={handleGoogleRegister} disabled={loading} className="w-full flex items-center justify-center gap-3 border border-white/10 p-4 rounded-2xl hover:bg-white/5 transition disabled:opacity-50">
              <img src="/google.svg" alt="Google" width="18" height="18" />
              <span className="text-sm font-bold">Sign up with Google</span>
            </button>
          </>
        )}

        <p className="mt-10 text-sm text-center text-gray-500">
          {step === 1 ? "Existing member? " : "Entered wrong email? "}
          <span onClick={() => step === 1 ? router.push("/login") : setStep(1)} className="text-cyan-400 font-bold cursor-pointer hover:underline">
            {step === 1 ? "Login" : "Go Back"}
          </span>
        </p>
      </div>
    </div>
  );
}