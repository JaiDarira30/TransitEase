"use client";

export default function RouteTabs({ routeType, setRouteType }) {
  return (
    <div className="flex justify-center gap-6 mb-6">
      {["bus", "train"].map(type => (
        <button
          key={type}
          onClick={() => setRouteType(type)}
          className={`px-6 py-2 rounded-lg font-semibold transition
            ${
              routeType === type
                ? "bg-purple-500 text-black shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
        >
          {type.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
