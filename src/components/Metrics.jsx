export default function Metrics({ metrics }) {
  const cards = [
    { label: "Comfort", value: `${metrics.overallComfort.value}%`, color: "cyan" },
    { label: "Temperature", value: `${metrics.temperature.value}°C`, color: "orange" },
    { label: "Air Quality", value: metrics.airQuality.value, color: "blue" },
    { label: "Avg Delay", value: `${metrics.avgDelay.value} min`, color: "yellow" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {cards.map(card => (
        <div
          key={card.label}
          className={`bg-gray-900 rounded-xl p-6 text-center shadow-lg border border-${card.color}-500/30`}
        >
          <p className="text-gray-400 text-sm mb-1">{card.label}</p>
          <p className={`text-3xl font-bold text-${card.color}-400`}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
