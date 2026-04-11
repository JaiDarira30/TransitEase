export default function Navbar() {
  return (
    <nav className="bg-black border-b border-cyan-500/30 px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-cyan-400 tracking-wide">
        Public Transport Comfort Predictor
      </h1>

      <div className="flex gap-4">
        <button className="px-4 py-2 rounded bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition">
          Login
        </button>
        <button className="px-4 py-2 rounded border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition">
          Register
        </button>
      </div>
    </nav>
  );
}
