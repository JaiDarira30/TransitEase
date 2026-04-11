import { routeData } from "@/data/routeData";

export default function RouteCards({ city, routeType }) {
  const routes = routeData[city]?.[routeType] || [];

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-12">
      {routes.map(route => (
        <div
          key={route.id}
          className="bg-gray-900 rounded-xl p-6 border border-cyan-500/20 shadow-md hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition"
        >
          <h3 className="text-xl font-bold text-cyan-400 mb-2">
            {route.name}
          </h3>
          <p className="text-gray-400 mb-3">{route.route}</p>

          <div className="flex justify-between text-sm text-gray-300">
            <span>Crowd: {route.crowd}%</span>
            <span>Comfort: {route.comfort}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
