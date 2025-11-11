import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const stages = [
  { name: "Collector", icon: "🌿", color: "bg-green-500" },
  { name: "Transport", icon: "🚚", color: "bg-blue-500" },
  { name: "Processing", icon: "🏭", color: "bg-purple-500" },
  { name: "Lab", icon: "🔬", color: "bg-red-500" }
];

const ChainDetails = () => {
  const { id } = useParams();
  const [chain, setChain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChain = async () => {
      try {
        const res = await fetch(`https://agastyatrace2.onrender.com/chains/${id}`, {
          credentials: "include",
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setChain(data);
      } catch (err) {
        console.error("Error fetching chain:", err);
        setError("Failed to load chain details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchChain();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-blue-600">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-lg font-medium">Loading chain details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Chain</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!chain) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-yellow-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center max-w-md mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chain Not Found</h2>
          <p className="text-gray-600 mb-6">The requested supply chain could not be found.</p>
          <a 
            href="/dashboard" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Extract locations for map polyline
  const getLocationsPath = () => {
    const path = [];
    if (chain.collector?.location)
      path.push([chain.collector.location.lat, chain.collector.location.lng]);

    if (chain.transport?.length > 0) {
      chain.transport.forEach((t) => {
        if (t.location) path.push([t.location.lat, t.location.lng]);
      });
    }

    if (chain.processing?.location)
      path.push([chain.processing.location.lat, chain.processing.location.lng]);

    if (chain.lab?.location) path.push([chain.lab.location.lat, chain.lab.location.lng]);

    return path;
  };

  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return value.map((item, index) => (
        <div
          key={index}
          className="p-4 mb-3 bg-gray-50 rounded-xl border border-gray-100"
        >
          {Object.entries(item).map(([k, v]) => (
            <div key={k} className="flex justify-between py-1">
              <span className="text-sm font-medium text-gray-600 capitalize">
                {k.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="text-sm text-gray-900 font-medium">
                {typeof v === "object" ? JSON.stringify(v) : v.toString()}
              </span>
            </div>
          ))}
        </div>
      ));
    } else if (typeof value === "object") {
      return Object.entries(value).map(([k, v]) => (
        <div key={k} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
          <span className="text-sm font-medium text-gray-600 capitalize">
            {k.replace(/([A-Z])/g, ' $1').trim()}:
          </span>
          <span className="text-sm text-gray-900 font-medium text-right max-w-xs break-words">
            {typeof v === "object" ? JSON.stringify(v) : v.toString()}
          </span>
        </div>
      ));
    } else {
      return <span className="text-sm text-gray-900 font-medium">{value.toString()}</span>;
    }
  };

  const locationsPath = getLocationsPath();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Supply Chain Details</h1>
                <p className="text-gray-600">Complete traceability for Chain ID: {id}</p>
              </div>
              <a 
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-200 font-medium transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </a>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supply Chain Progress</h3>
            <div className="flex items-center justify-between">
              {stages.map((stage, index) => {
                const isCompleted = !!chain[stage.name.toLowerCase()];
                const isActive = index === stages.findIndex(s => !chain[s.name.toLowerCase()]);
                
                return (
                  <div key={stage.name} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                        isCompleted ? stage.color : isActive ? 'bg-yellow-500' : 'bg-gray-300'
                      }`}>
                        {isCompleted ? (
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-lg">{stage.icon}</span>
                        )}
                      </div>
                      <span className={`text-xs font-medium mt-2 ${
                        isCompleted ? 'text-green-600' : isActive ? 'text-yellow-600' : 'text-gray-400'
                      }`}>
                        {stage.name}
                      </span>
                    </div>
                    {index < stages.length - 1 && (
                      <div className={`flex-1 h-1 mx-4 rounded-full ${
                        isCompleted ? 'bg-green-300' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map */}
          {locationsPath.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Geographic Journey</h3>
                <p className="text-sm text-gray-500 mt-1">Track the physical movement through the supply chain</p>
              </div>
              <div className="h-96">
                <MapContainer center={locationsPath[0]} zoom={6} style={{ height: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                  {/* Markers */}
                  {chain.collector?.location && (
                    <Marker
                      position={[chain.collector.location.lat, chain.collector.location.lng]}
                    >
                      <Popup>
                        <div className="text-center font-medium">
                          <div className="text-green-600">Collection Point</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {chain.collector.species} - {chain.collector.quantity}kg
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  {chain.transport?.map(
                    (t, i) =>
                      t.location && (
                        <Marker key={i} position={[t.location.lat, t.location.lng]}>
                          <Popup>
                            <div className="text-center font-medium">
                              <div className="text-blue-600">Transport Stop {i + 1}</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {t.quantityKg}kg to {t.destination}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      )
                  )}
                  {chain.processing?.location && (
                    <Marker
                      position={[chain.processing.location.lat, chain.processing.location.lng]}
                    >
                      <Popup>
                        <div className="text-center font-medium">
                          <div className="text-purple-600">Processing Facility</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {chain.processing.processingType}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  {chain.lab?.location && (
                    <Marker position={[chain.lab.location.lat, chain.lab.location.lng]}>
                      <Popup>
                        <div className="text-center font-medium">
                          <div className="text-red-600">Lab Testing</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {chain.lab.testType} - {chain.lab.result}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Enhanced polyline */}
                  <Polyline 
                    positions={locationsPath} 
                    pathOptions={{ 
                      color: "#3b82f6", 
                      dashArray: "10,10", 
                      weight: 4,
                      opacity: 0.8
                    }} 
                  />
                </MapContainer>
              </div>
            </div>
          )}

          {/* Stage Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stages.map((stage) => (
              <div
                key={stage.name}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${stage.color} rounded-lg flex items-center justify-center`}>
                      <span className="text-white text-lg">{stage.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{stage.name}</h3>
                      <p className="text-sm text-gray-500">
                        {chain[stage.name.toLowerCase()] ? 'Completed' : 'Not yet started'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {chain[stage.name.toLowerCase()] ? (
                    <div className="space-y-2">
                      {renderValue(chain[stage.name.toLowerCase()])}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 text-gray-500 py-8">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-medium">Stage not completed</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChainDetails
