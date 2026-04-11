"use client";

export default function CityTabs({ activeCity, setActiveCity }) {
  const cities = [
    "hyderabad",
    "vellore",
    "tirupati",
    "tiruvannamalai",
    "vijayawada",
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 my-8">
      {cities.map(city => (
        <button
          key={city}
          onClick={() => setActiveCity(city)}
          className={`px-6 py-2 rounded-full font-semibold tracking-wide transition
            ${
              activeCity === city
                ? "bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.8)]"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
        >
          {city.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
