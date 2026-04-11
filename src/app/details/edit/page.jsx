"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../../../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore"; 
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

// --- NEW: Major Country Codes ---
const COUNTRY_CODES = [
  { code: "+91", label: "India (+91)" },
  { code: "+1", label: "USA/Canada (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+61", label: "Australia (+61)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+94", label: "Sri Lanka (+94)" }
];

export default function EditProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  
  // --- UPDATED: Added phoneCode to state ---
  const [formData, setFormData] = useState({ 
    name: "", 
    phoneCode: "+91", 
    phone: "", 
    gender: "" 
  });
  
  // OTP & Timer States
  const [otp, setOtp] = useState("");
  const [serverOtp, setServerOtp] = useState(null);
  const [step, setStep] = useState(1); // 1: Edit Form, 2: OTP Entry
  const [timer, setTimer] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Resend Timer
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Load current user data
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        
        if (snap.exists()) {
          const dbData = snap.data();
          let dbPhone = dbData.phoneNumber || "";
          
          // --- NEW: Split existing DB phone into Code and 10-digit number ---
          let parsedCode = "+91";
          let parsedNumber = "";
          if (dbPhone.length >= 10) {
            parsedNumber = dbPhone.slice(-10); // Grab the last 10 digits
            parsedCode = dbPhone.slice(0, -10) || "+91"; // Grab everything before that
          } else {
            parsedNumber = dbPhone;
          }

          setFormData({
            name: dbData.displayName || "",
            phoneCode: parsedCode,
            phone: parsedNumber,
            gender: dbData.gender || ""
          });
        }
      } else {
        router.push("/login");
      }
    });
    return () => unsub();
  }, [router]);

  /* ================= REAL EMAIL OTP LOGIC ================= */
  const sendOtpRequest = async () => {
    if (!formData.name || !formData.phone || !formData.gender) {
      setError("Please fill all fields before verifying.");
      return;
    }

    // --- NEW: Strict 10-digit validation ---
    if (formData.phone.length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    setError("");
    setLoading(true);

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
        setTimer(30); // 30 second cooldown
      } else {
        setError("Failed to send OTP. Check server configuration.");
      }
    } catch (err) {
      setError("Network error. Could not reach OTP service.");
    }
    setLoading(false);
  };

  /* ================= SAVE & UPDATE LOGIC ================= */
  const handleUpdate = async () => {
    if (otp !== serverOtp) {
      setError("Invalid OTP code. Please check your email.");
      return;
    }

    setLoading(true);
    try {
      const updatedAvatar = formData.gender === "male" 
        ? "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
        : "https://cdn-icons-png.flaticon.com/512/3135/3135768.png";

      const userRef = doc(db, "users", user.uid);
      
      // --- NEW: Combine code and number before saving to DB ---
      const fullPhoneNumber = `${formData.phoneCode}${formData.phone}`;

      await setDoc(userRef, {
        displayName: formData.name,
        phoneNumber: fullPhoneNumber,
        gender: formData.gender,
        photoURL: updatedAvatar,
        updatedAt: new Date()
      }, { merge: true });

      router.push("/details");
    } catch (err) {
      setError("Failed to update profile: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex items-center justify-center font-sans">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/5 p-10 rounded-[3rem] border border-white/10 shadow-2xl backdrop-blur-xl relative z-10">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tighter mb-2 italic">Edit Profile</h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            {step === 1 ? "Update Terminal" : "Security Verification"}
          </p>
        </header>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4">Full Name</label>
              <input 
                className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 outline-none focus:border-cyan-500 transition"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* --- NEW: Upgraded Phone Input with Dropdown & Restrictions --- */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4">Phone Number</label>
              <div className="flex gap-2">
                <select 
                  className="w-1/3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 outline-none focus:border-cyan-500 transition text-gray-300 text-xs font-bold appearance-none text-center"
                  value={formData.phoneCode}
                  onChange={(e) => setFormData({...formData, phoneCode: e.target.value})}
                >
                  {COUNTRY_CODES.map((country) => (
                    <option key={country.code} value={country.code} className="bg-black text-white">
                      {country.code}
                    </option>
                  ))}
                </select>
                
                <input 
                  type="text"
                  maxLength={10}
                  placeholder="0000000000"
                  className="w-2/3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 outline-none focus:border-cyan-500 transition tracking-widest"
                  value={formData.phone}
                  onChange={(e) => {
                    // Strips out all letters and symbols, allowing ONLY numbers
                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                    setFormData({...formData, phone: onlyNumbers});
                  }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-4">Gender</label>
              <select 
                className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 outline-none focus:border-cyan-500 transition text-gray-400"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
              >
                <option value="" disabled className="bg-black">Select Gender</option>
                <option value="male" className="bg-black">Male</option>
                <option value="female" className="bg-black">Female</option>
              </select>
            </div>

            <button 
              onClick={sendOtpRequest}
              disabled={loading}
              className="w-full bg-cyan-500 text-black font-black p-4 rounded-2xl uppercase text-xs tracking-widest mt-6 shadow-lg shadow-cyan-500/20 disabled:opacity-50 hover:bg-cyan-400 transition-colors"
            >
              {loading ? "Requesting OTP..." : "Verify & Save Changes"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">Enter code sent to</p>
              <p className="text-cyan-400 font-bold">{user?.email}</p>
            </div>
            
            {/* --- NEW: OTP Input restricted to numbers only --- */}
            <input 
              className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center text-3xl font-black tracking-[0.5em] outline-none focus:border-cyan-400 transition-colors"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />

            <button 
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-green-500 text-black font-black p-4 rounded-2xl uppercase text-xs tracking-widest shadow-lg shadow-green-500/20 hover:bg-green-400 transition-colors disabled:opacity-50"
            >
              {loading ? "Syncing..." : "Confirm & Update"}
            </button>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Resend in {timer}s</p>
              ) : (
                <button onClick={sendOtpRequest} className="text-[10px] text-cyan-400 font-black uppercase tracking-widest hover:underline">Resend OTP</button>
              )}
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-6 text-center animate-pulse">{error}</p>}
      </div>
    </div>
  );
}