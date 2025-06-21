import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Layers } from 'lucide-react';

interface MapViewProps {
  disasters: any[];
  resources: any[];
  selectedDisaster: any;
  onLocationSelect?: (lat: number, lng: number) => void;
}

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'disaster' | 'resource';
  title: string;
  description?: string;
}

export const MapView: React.FC<MapViewProps> = ({ 
  disasters, 
  resources, 
  selectedDisaster, 
  onLocationSelect 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [mapStyle, setMapStyle] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create a simple map using OpenStreetMap tiles
    const mapContainer = mapRef.current;
    mapContainer.innerHTML = '';

    // Create map container
    const mapDiv = document.createElement('div');
    mapDiv.style.width = '100%';
    mapDiv.style.height = '100%';
    mapDiv.style.position = 'relative';
    mapDiv.style.backgroundColor = '#e5e7eb';
    mapDiv.style.backgroundImage = `
      linear-gradient(45deg, #f3f4f6 25%, transparent 25%),
      linear-gradient(-45deg, #f3f4f6 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #f3f4f6 75%),
      linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)
    `;
    mapDiv.style.backgroundSize = '20px 20px';
    mapDiv.style.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';
    
    // Add map title
    const mapTitle = document.createElement('div');
    mapTitle.innerHTML = `
      <div style="position: absolute; top: 10px; left: 10px; background: white; padding: 8px 12px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); z-index: 1000;">
        <div style="font-weight: 600; color: #374151; font-size: 14px;">Interactive Map View</div>
        <div style="font-size: 12px; color: #6b7280;">Click to select locations</div>
      </div>
    `;
    mapDiv.appendChild(mapTitle);

    mapContainer.appendChild(mapDiv);
    setMap(mapDiv);

    // Add click handler for location selection
    mapDiv.addEventListener('click', (e) => {
      if (onLocationSelect) {
        const rect = mapDiv.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convert pixel coordinates to approximate lat/lng (NYC area)
        const lat = 40.7128 + (0.5 - y / rect.height) * 0.2;
        const lng = -74.0060 + (x / rect.width - 0.5) * 0.3;
        
        onLocationSelect(lat, lng);
      }
    });

  }, [onLocationSelect]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Default to NYC
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    } else {
      setUserLocation({ lat: 40.7128, lng: -74.0060 });
    }
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    const existingMarkers = map.querySelectorAll('.map-marker');
    existingMarkers.forEach((marker: Element) => marker.remove());

    const newMarkers: MapMarker[] = [];

    // Add disaster markers
    disasters.forEach((disaster, index) => {
      const marker: MapMarker = {
        id: disaster.id,
        lat: 40.7128 + (Math.random() - 0.5) * 0.1, // Random positions around NYC
        lng: -74.0060 + (Math.random() - 0.5) * 0.1,
        type: 'disaster',
        title: disaster.title,
        description: disaster.description
      };
      newMarkers.push(marker);

      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'map-marker';
      markerEl.style.cssText = `
        position: absolute;
        left: ${50 + index * 10}%;
        top: ${30 + index * 15}%;
        transform: translate(-50%, -50%);
        background: ${selectedDisaster?.id === disaster.id ? '#dc2626' : '#ef4444'};
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 100;
        max-width: 150px;
        text-align: center;
        border: 2px solid white;
      `;
      markerEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 4px;">
          <span style="font-size: 10px;">🚨</span>
          <span>${disaster.title}</span>
        </div>
      `;
      
      markerEl.addEventListener('click', (e) => {
        e.stopPropagation();
        // Trigger disaster selection
        const event = new CustomEvent('selectDisaster', { detail: disaster });
        window.dispatchEvent(event);
      });

      map.appendChild(markerEl);
    });

    // Add resource markers
    resources.forEach((resource, index) => {
      const marker: MapMarker = {
        id: resource.id,
        lat: 40.7128 + (Math.random() - 0.5) * 0.08,
        lng: -74.0060 + (Math.random() - 0.5) * 0.08,
        type: 'resource',
        title: resource.name,
        description: resource.type
      };
      newMarkers.push(marker);

      const markerEl = document.createElement('div');
      markerEl.className = 'map-marker';
      markerEl.style.cssText = `
        position: absolute;
        left: ${30 + index * 12}%;
        top: ${60 + index * 8}%;
        transform: translate(-50%, -50%);
        background: ${resource.availability_status === 'available' ? '#10b981' : '#f59e0b'};
        color: white;
        padding: 6px 10px;
        border-radius: 15px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        z-index: 90;
        max-width: 120px;
        text-align: center;
        border: 1px solid white;
      `;
      markerEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 3px;">
          <span style="font-size: 9px;">🏥</span>
          <span>${resource.name}</span>
        </div>
      `;

      map.appendChild(markerEl);
    });

    // Add user location marker if available
    if (userLocation) {
      const userMarker = document.createElement('div');
      userMarker.className = 'map-marker';
      userMarker.style.cssText = `
        position: absolute;
        left: 45%;
        top: 45%;
        transform: translate(-50%, -50%);
        background: #3b82f6;
        color: white;
        padding: 8px;
        border-radius: 50%;
        font-size: 12px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        z-index: 110;
        border: 3px solid white;
        animation: pulse 2s infinite;
      `;
      userMarker.innerHTML = '📍';
      
      // Add pulse animation
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      `;
      document.head.appendChild(style);

      map.appendChild(userMarker);
    }

    setMarkers(newMarkers);
  }, [map, disasters, resources, selectedDisaster, userLocation]);

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Interactive Map</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMapStyle('roadmap')}
              className={`px-3 py-1 text-xs rounded ${mapStyle === 'roadmap' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Road
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-3 py-1 text-xs rounded ${mapStyle === 'satellite' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Satellite
            </button>
            <Layers className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div ref={mapRef} className="w-full h-96" />
        
        {/* Map Legend */}
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border text-xs">
          <div className="font-semibold text-gray-900 mb-2">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Disasters</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Available Resources</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Limited Resources</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Your Location</span>
            </div>
          </div>
        </div>

        {/* Map Stats */}
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg border text-xs">
          <div className="font-semibold text-gray-900 mb-1">Map Stats</div>
          <div className="text-gray-600">
            <div>Disasters: {disasters.length}</div>
            <div>Resources: {resources.length}</div>
            <div>Markers: {markers.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};