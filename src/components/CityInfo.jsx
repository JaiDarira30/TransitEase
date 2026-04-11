export default function CityInfo({ city }) {
  return (
    <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-[0_0_30px_rgba(34,211,238,0.2)] mb-10">
      <h2 className="text-4xl font-bold text-cyan-400 mb-3">
        {city.name}
      </h2>
      <p className="text-gray-300 text-lg leading-relaxed">
        {city.description}
      </p>
    </section>
  );
}
