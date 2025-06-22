import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { Icon, LatLngTuple } from 'leaflet';
import { MapPin, Navigation, Layers, Zap, AlertTriangle, Users, Building } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  disasters: any[];
  resources: any[];
  selectedDisaster: any;
  onLocationSelect?: (lat: number, lng: number) => void;
}

// Unicode-safe base64 encoding function
function base64EncodeUnicode(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
    String.fromCharCode(parseInt(p1, 16))
  ));
}

// Custom marker icons
const createCustomIcon = (color: string, symbol: string) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${base64EncodeUnicode(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="3"/>
      <text x="16" y="20" text-anchor="middle" font-size="12" fill="white">${symbol}</text>
    </svg>
  `)}`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const disasterIcon = createCustomIcon('#dc2626', '🚨');
const selectedDisasterIcon = createCustomIcon('#991b1b', '🚨');
const resourceIcons = {
  shelter: createCustomIcon('#10b981', '🏠'),
  medical: createCustomIcon('#059669', '🏥'),
  food: createCustomIcon('#0891b2', '🍽️'),
  emergency_services: createCustomIcon('#dc2626', '🚑'),
  transportation: createCustomIcon('#7c3aed', '🚌'),
  default: createCustomIcon('#6b7280', '📍')
};

const userLocationIcon = createCustomIcon('#3b82f6', '📍');
const clickedLocationIcon = createCustomIcon('#8b5cf6', '📌');

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  const [clickedPosition, setClickedPosition] = useState<LatLngTuple | null>(null);

  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      setClickedPosition([lat, lng]);
      onLocationSelect?.(lat, lng);
    },
  });

  return clickedPosition ? (
    <Marker position={clickedPosition} icon={clickedLocationIcon}>
      <Popup>
        <div className="text-center">
          <strong>Selected Location</strong><br />
          Lat: {clickedPosition[0].toFixed(6)}<br />
          Lng: {clickedPosition[1].toFixed(6)}
        </div>
      </Popup>
    </Marker>
  ) : null;
}

// Component to handle map style changes
function MapStyleController({ mapStyle }: { mapStyle: string }) {
  const map = useMap();

  useEffect(() => {
    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Add new tile layer based on style
    let tileLayer;
    switch (mapStyle) {
      case 'satellite':
        tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });
        break;
      case 'terrain':
        tileLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
        });
        break;
      default: // roadmap
        tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        });
    }

    tileLayer.addTo(map);
  }, [mapStyle, map]);

  return null;
}

export const MapView: React.FC<MapViewProps> = ({ 
  disasters, 
  resources, 
  selectedDisaster, 
  onLocationSelect 
}) => {
  const [mapStyle, setMapStyle] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);

  const defaultCenter: LatLngTuple = [40.7128, -74.0060]; // NYC

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => setUserLocation(defaultCenter)
      );
    } else {
      setUserLocation(defaultCenter);
    }
  }, []);

  const getDisasterPosition = (index: number): LatLngTuple => {
    const positions: LatLngTuple[] = [
      [40.7589, -73.9851], [40.6892, -74.0445],
      [40.7505, -73.9934], [40.7282, -73.7949],
    ];
    return positions[index % positions.length] || defaultCenter;
  };

  const getResourcePosition = (index: number): LatLngTuple => {
    const positions: LatLngTuple[] = [
      [40.7614, -73.9776], [40.7061, -74.0087],
      [40.7831, -73.9712], [40.7282, -73.7949],
      [40.6782, -73.9442],
    ];
    return positions[index % positions.length] || defaultCenter;
  };

  if (!userLocation) {
    return (
      <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Loading Map...</h3>
              <p className="text-sm text-gray-600">Initializing interactive map</p>
            </div>
          </div>
        </div>
        <div className="h-96 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Interactive Map</h3>
              <p className="text-sm text-gray-600">Real-time disaster and resource tracking</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {['roadmap', 'satellite', 'terrain'].map(style => (
              <button
                key={style}
                onClick={() => setMapStyle(style as typeof mapStyle)}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  mapStyle === style
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
            <Layers className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>

      <div className="relative">
        <MapContainer center={userLocation} zoom={12} style={{ height: '400px', width: '100%' }} className="z-0">
          <MapStyleController mapStyle={mapStyle} />
          <MapClickHandler onLocationSelect={onLocationSelect} />

          {/* User Marker */}
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong><br />
                <Navigation className="h-4 w-4 text-blue-600 mt-2 inline-block" />
              </div>
            </Popup>
          </Marker>

          {/* Disasters */}
          {disasters.map((disaster, index) => (
            <Marker
              key={disaster.id}
              position={getDisasterPosition(index)}
              icon={selectedDisaster?.id === disaster.id ? selectedDisasterIcon : disasterIcon}
              eventHandlers={{
                click: () => window.dispatchEvent(new CustomEvent('selectDisaster', { detail: disaster })),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <strong className="text-red-800">{disaster.title}</strong>
                  </div>
                  <div className="text-sm text-gray-700">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      <span>{disaster.location_name || 'Unknown'}</span>
                    </div>
                    <p>{disaster.description}</p>
                    {disaster.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {disaster.tags.map((tag: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Resources */}
          {resources.map((resource, index) => {
            const icon = resourceIcons[resource.type as keyof typeof resourceIcons] || resourceIcons.default;
            return (
              <Marker key={resource.id} position={getResourcePosition(index)} icon={icon}>
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <strong className="text-green-800">{resource.name}</strong>
                    </div>
                    <div className="text-sm space-y-1 text-gray-700">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-500" />
                        <span>{resource.location_name}</span>
                      </div>
                      <div className="capitalize">
                        Type: {resource.type.replace('_', ' ')}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        resource.availability_status === 'available' ? 'bg-green-100 text-green-800' :
                        resource.availability_status === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {resource.availability_status}
                      </span>
                      {resource.distance_km && (
                        <div>Distance: {resource.distance_km.toFixed(1)} km</div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-xl border text-xs max-w-xs">
          <div className="font-bold text-gray-900 mb-3 flex items-center">
            <Zap className="h-4 w-4 mr-2 text-yellow-500" />
            Map Legend
          </div>
          <div className="space-y-2 text-gray-700">
            <div className="flex items-center space-x-3"><div className="w-4 h-4 bg-red-500 rounded-full"></div>Disasters</div>
            <div className="flex items-center space-x-3"><div className="w-4 h-4 bg-green-500 rounded-full"></div>Resources</div>
            <div className="flex items-center space-x-3"><div className="w-4 h-4 bg-blue-500 rounded-full"></div>Your Location</div>
            <div className="flex items-center space-x-3"><div className="w-4 h-4 bg-purple-500 rounded-full"></div>Selected Point</div>
          </div>
        </div>
      </div>
    </div>
  );
};
