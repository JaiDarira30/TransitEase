"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, getDocs, doc, getDoc, onSnapshot, orderBy, deleteDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  
  // Storage for both cities
  const [velloreBookings, setVelloreBookings] = useState([]);
  const [tirupatiBookings, setTirupatiBookings] = useState([]);
  
  // Dynamic IP State
  const [ipAddress, setIpAddress] = useState("Detecting Node...");

  // EDIT USER STATE
  const [editingUser, setEditingUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch the real IP and Location on mount
  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        if (data.ip) {
          setIpAddress(`${data.ip} (${data.city}, ${data.region_code})`);
        } else {
          setIpAddress("Encrypted Node");
        }
      } catch (error) {
        console.error("IP tracking blocked or offline:", error);
        setIpAddress("Local / Offline Node");
      }
    };

    fetchNetworkData();
  }, []);

  useEffect(() => {
    let unsubVellore;
    let unsubTirupati;

    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        router.push("/admin/login");
        return;
      }

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists() && snap.data().role === "admin") {
          setIsAdmin(true);
          fetchUsers();
          
          // 1. Sync Vellore VIT Data
          const qVellore = query(collection(db, "bookings"), orderBy("timestamp", "desc"));
          unsubVellore = onSnapshot(qVellore, (snapshot) => {
            setVelloreBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          });

          // 2. Sync Tirupati Alipiri Data
          const qTirupati = query(collection(db, "alipiri_bookings"), orderBy("timestamp", "desc"));
          unsubTirupati = onSnapshot(qTirupati, (snapshot) => {
            setTirupatiBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          });

        } else {
          await signOut(auth);
          router.push("/admin/login");
        }
      } catch (err) {
        console.error("Node Auth Error:", err);
      }
      setLoading(false);
    });

    return () => {
      unsubAuth();
      if (unsubVellore) unsubVellore(); 
      if (unsubTirupati) unsubTirupati();
    };
  }, [router]);

  const fetchUsers = async () => {
    const q = query(collection(db, "users"));
    const querySnapshot = await getDocs(q);
    setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleDeleteBooking = async (id, name, collectionName) => {
    const confirmCancel = window.confirm(`Permanently purge neural ticket for ${name}?`);
    if (!confirmCancel) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      alert("Ticket successfully purged from node archive.");
    } catch (err) {
      alert("Purge failed. Check Firestore security rules.");
    }
  };

  // HANDLE USER UPDATE (WITH UNDEFINED BUG FIX)
  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const userRef = doc(db, "users", editingUser.id);
      await updateDoc(userRef, {
        displayName: editingUser.displayName || "Anonymous",
        role: editingUser.role || "user",
        aiTrainingAllowed: editingUser.aiTrainingAllowed ?? false
      });
      setEditingUser(null);
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert("Failed to update user. Check console for errors.");
      console.error(err);
    }
    setIsUpdating(false);
  };

  // HANDLE USER DELETION
  const handleDeleteUser = async (userId, userEmail) => {
    const confirmDelete = window.confirm(`CRITICAL WARNING: Permanently purge database records for ${userEmail}? This will strip all access roles.`);
    if (!confirmDelete) return;
    
    try {
      await deleteDoc(doc(db, "users", userId));
      alert("Commuter profile successfully purged.");
      setEditingUser(null); // Close the modal
      fetchUsers(); // Refresh the user list
    } catch (err) {
      alert("Failed to delete user. Check Firestore security rules.");
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-black tracking-widest animate-pulse uppercase">Syncing Security Protocol...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10 font-sans selection:bg-cyan-500/30 relative">
      
      {/* EDIT USER MODAL */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-[#0f1730] border border-cyan-500/30 p-8 rounded-[2rem] shadow-[0_0_50px_rgba(6,182,212,0.15)] max-w-md w-full relative"
            >
              <button onClick={() => setEditingUser(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white font-bold">✕</button>
              
              <div className="mb-8">
                <h2 className="text-xl font-black uppercase tracking-tighter text-cyan-400">Edit Node Access</h2>
                <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase">{editingUser.email}</p>
              </div>

              <form onSubmit={handleSaveUserEdit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">Display Name</label>
                  <input 
                    type="text" 
                    value={editingUser.displayName || ""}
                    onChange={(e) => setEditingUser({...editingUser, displayName: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">System Role</label>
                  <select 
                    value={editingUser.role || "user"}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-cyan-500 transition-colors appearance-none text-white"
                  >
                    <option value="user" className="bg-black">Standard User</option>
                    <option value="admin" className="bg-black text-red-500">Administrator (Root)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest ml-2">AI Training Consent</label>
                  <select 
                    value={editingUser.aiTrainingAllowed ? "true" : "false"}
                    onChange={(e) => setEditingUser({...editingUser, aiTrainingAllowed: e.target.value === "true"})}
                    className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-cyan-500 transition-colors appearance-none text-white"
                  >
                    <option value="true" className="bg-black text-green-400">Opted In (Data Sync Active)</option>
                    <option value="false" className="bg-black text-red-400">Opted Out (Privacy Mode)</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="w-full bg-cyan-500 text-black font-black p-4 rounded-xl uppercase text-[10px] tracking-widest hover:bg-cyan-400 transition-colors mt-4 disabled:opacity-50"
                >
                  {isUpdating ? "Syncing Database..." : "Save Configuration"}
                </button>

                {/* DELETE USER BUTTON */}
                <button 
                  type="button" 
                  onClick={() => handleDeleteUser(editingUser.id, editingUser.email)}
                  className="w-full bg-red-500/10 border border-red-500/30 text-red-500 font-black p-4 rounded-xl uppercase text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-colors mt-2"
                >
                  Purge Commuter Node
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* BACK NAVIGATION */}
        <Link href="/" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-cyan-400 transition-colors mb-6">
          ← Back to Main Terminal
        </Link>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter italic text-cyan-500">TransitEase Admin</h1>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-[10px] font-black uppercase tracking-widest animate-pulse">System Online</div>
            <button onClick={handleLogout} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 hover:text-red-500 transition">Secure Logout</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Commuters" value={users.length} sub="Database Nodes" color="white" />
          <StatCard title="Vellore Active" value={velloreBookings.length} sub="Student Bookings" color="cyan" />
          <StatCard title="Tirupati Active" value={tirupatiBookings.length} sub="Vehicle Toll Passes" color="orange" />
          <StatCard title="Active Node IP" value={ipAddress.split(' ')[0]} sub={ipAddress.split(' ').slice(1).join(' ') || "Global"} color="gray" />
        </div>

        {/* TABLE 1: VELLORE BOOKINGS */}
        <section className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl mb-10">
          <div className="bg-cyan-500/10 p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-xs font-black text-cyan-400 uppercase tracking-widest italic">Vellore Sector: VIT Hub Archive</h2>
          </div>
          <div className="overflow-x-auto p-6">
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="text-gray-500 font-black border-b border-white/10 uppercase tracking-tighter italic">
                  <th className="pb-4">Timestamp</th>
                  <th className="pb-4">Student Info</th>
                  <th className="pb-4">Route Info</th>
                  <th className="pb-4 text-center">Seats / Genders</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {velloreBookings.map((ticket) => (
                  <tr key={ticket.id} className="group hover:bg-white/[0.02] transition">
                    <td className="py-4 text-gray-400">
                      {new Date(ticket.timestamp).toLocaleDateString()}<br/>{new Date(ticket.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-4">
                      <p className="text-cyan-400 font-black uppercase tracking-tighter">{ticket.userEmail}</p>
                      <p className="text-gray-600 text-[9px] italic">{ticket.passengerDetails?.[0]?.name || "N/A"}</p>
                    </td>
                    <td className="py-4">
                      <p className="font-black text-white italic">{ticket.route}</p>
                      <p className="text-[9px] text-gray-600 uppercase">{ticket.startStop} → {ticket.endStop}</p>
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex flex-wrap justify-center gap-1">
                        {ticket.passengerDetails?.map((p, i) => (
                          <span key={i} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${p.gender === 'Female' ? 'bg-pink-500/20 text-pink-400' : 'bg-blue-500/20 text-blue-400'}`}>S{p.seat}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <button onClick={() => handleDeleteBooking(ticket.id, ticket.passengerDetails?.[0]?.name, "bookings")} className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg text-[8px] font-black uppercase hover:bg-red-500 hover:text-white transition">Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {velloreBookings.length === 0 && <p className="py-10 text-center text-gray-700 text-xs font-black tracking-widest uppercase">Archive Empty</p>}
          </div>
        </section>

        {/* TABLE 2: TIRUPATI BOOKINGS */}
        <section className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl mb-10">
          <div className="bg-orange-500/10 p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-xs font-black text-orange-400 uppercase tracking-widest italic">Tirupati Sector: Alipiri Checkpoint Archive</h2>
          </div>
          <div className="overflow-x-auto p-6">
            <table className="w-full text-left text-[10px]">
              <thead>
                <tr className="text-gray-500 font-black border-b border-white/10 uppercase tracking-tighter italic">
                  <th className="pb-4">Timestamp</th>
                  <th className="pb-4">Email / License Plate</th>
                  <th className="pb-4">Vehicle Specs</th>
                  <th className="pb-4 text-center">Time Slot</th>
                  <th className="pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tirupatiBookings.map((ticket) => (
                  <tr key={ticket.id} className="group hover:bg-white/[0.02] transition">
                    <td className="py-4 text-gray-400">
                      {new Date(ticket.timestamp).toLocaleDateString()}<br/>{new Date(ticket.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-4">
                      <p className="text-orange-400 font-black uppercase tracking-tighter">{ticket.userEmail}</p>
                      <p className="text-white text-sm font-black italic">{ticket.licensePlate}</p>
                    </td>
                    <td className="py-4">
                      <p className="font-black text-gray-300 italic">{ticket.vehicleType}</p>
                      <p className="text-[9px] text-gray-600 uppercase">{ticket.passengers} Passengers</p>
                    </td>
                    <td className="py-4 text-center">
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full font-black text-gray-400">{ticket.timeSlot}</span>
                    </td>
                    <td className="py-4 text-right">
                      <button onClick={() => handleDeleteBooking(ticket.id, ticket.licensePlate, "alipiri_bookings")} className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-lg text-[8px] font-black uppercase hover:bg-red-500 hover:text-white transition">Revoke</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tirupatiBookings.length === 0 && <p className="py-10 text-center text-gray-700 text-xs font-black tracking-widest uppercase">Archive Empty</p>}
          </div>
        </section>

        {/* USER MANAGEMENT TABLE */}
        <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-8 italic">Global Commuter Database</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Commuter</th>
                  <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">AI Trainer</th>
                  <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Role</th>
                  <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 flex items-center gap-3">
                      <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'U'}&background=06b6d4&color=fff`} className="w-8 h-8 rounded-lg border border-white/10" alt="User avatar" />
                      <div>
                        <p className="text-sm font-bold">{user.displayName || "Anonymous"}</p>
                        <p className="text-[10px] text-gray-600 font-medium">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`text-[8px] font-black px-2 py-1 rounded uppercase ${user.aiTrainingAllowed ? 'bg-cyan-500/10 text-cyan-400' : 'bg-gray-800 text-gray-500'}`}>
                        {user.aiTrainingAllowed ? "Opted In" : "Privacy Mode"}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`text-[8px] font-black px-2 py-1 rounded uppercase border ${user.role === 'admin' ? 'border-red-500/50 text-red-400' : 'border-gray-700 text-gray-500'}`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {/* Trigger Modal */}
                      <button 
                        onClick={() => setEditingUser(user)}
                        className="text-[10px] font-black text-cyan-500 uppercase hover:underline opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20"
                      >
                        Edit Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, color }) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem]">
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{title}</p>
      <h3 className={`text-3xl font-black ${color === 'cyan' ? 'text-cyan-400' : color === 'orange' ? 'text-orange-400' : 'text-white'}`}>{value}</h3>
      <p className="text-[10px] text-gray-600 mt-1 font-bold">{sub}</p>
    </div>
  );
}