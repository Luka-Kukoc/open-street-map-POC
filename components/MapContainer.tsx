"use client";

import { useEffect, useState } from "react";
import {
  MapContainer as LeafletMapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import { LatLngExpression, Icon } from "leaflet";
import { POI, RouteData } from "@/app/page";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapContainerProps {
  pois: POI[];
  route: RouteData | null;
  onMapClick: (lat: number, lng: number) => void;
}

// Custom component to handle map clicks
function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  const { useMapEvents } = require("react-leaflet");

  useMapEvents({
    click: (e: any) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

export default function MapContainer({
  pois,
  route,
  onMapClick,
}: MapContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("MapContainer - POIs:", pois);
    console.log("MapContainer - Route:", route);
  }, [pois, route]);

  if (!mounted) {
    return (
      <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  // Default center (can be changed to user's location)
  const defaultCenter: LatLngExpression = [40.7128, -74.006]; // New York City

  // Calculate bounds to fit all POIs
  const getBounds = () => {
    if (pois.length === 0) return undefined;

    const lats = pois.map((poi) => poi.lat);
    const lngs = pois.map((poi) => poi.lng);

    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ] as [[number, number], [number, number]];
  };

  const bounds = getBounds();

  return (
    <LeafletMapContainer
      center={defaultCenter}
      zoom={13}
      className="h-full w-full z-0"
      bounds={bounds}
      boundsOptions={{ padding: [20, 20] }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <MapClickHandler onMapClick={onMapClick} />

      {/* POI Markers */}
      {pois.map((poi, index) => (
        <Marker key={poi.id} position={[poi.lat, poi.lng]}>
          <Popup>
            <div className="text-center">
              <div className="font-semibold">Point {index + 1}</div>
              <div className="text-sm text-gray-600">{poi.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                {poi.lat.toFixed(6)}, {poi.lng.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Route Polyline */}
      {route && route.coordinates && route.coordinates.length > 0 && (
        <Polyline
          positions={route.coordinates}
          color="#3B82F6"
          weight={4}
          opacity={0.8}
        />
      )}

      {/* Debug info overlay */}
      {route && (
        <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-lg text-xs z-[1000]">
          <div>Route loaded: {route.coordinates.length} points</div>
          <div>Distance: {(route.distance / 1000).toFixed(2)} km</div>
        </div>
      )}
    </LeafletMapContainer>
  );
}
