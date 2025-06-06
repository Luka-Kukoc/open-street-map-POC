"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { POIInput } from "@/components/POIInput";
import { POIList } from "@/components/POIList";
import { RouteInfo } from "@/components/RouteInfo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw, MapPin, AlertCircle } from "lucide-react";
import { decodePolyline } from "@/lib/polyline";

// Dynamically import the Map component to avoid SSR issues
const MapContainer = dynamic(() => import("@/components/MapContainer"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

export interface POI {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface RouteData {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  steps?: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  name: string;
  distance: number;
  duration: number;
}

export default function Home() {
  const [pois, setPois] = useState<POI[]>([]);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Calculate route when we have 2 or more POIs
  useEffect(() => {
    if (pois.length >= 2) {
      calculateRoute();
    } else {
      setRoute(null);
      setRouteError(null);
    }
  }, [pois]);

  const calculateRoute = async () => {
    if (pois.length < 2) return;

    setIsLoadingRoute(true);
    setRouteError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENROUTESERVICE_API_KEY;
      if (!apiKey) {
        throw new Error(
          "OpenRouteService API key not found. Please add it to your .env.local file."
        );
      }

      const coordinates = pois.map((poi) => [poi.lng, poi.lat]);

      console.log("Calculating route for coordinates:", coordinates);

      const response = await fetch(
        "https://api.openrouteservice.org/v2/directions/foot-walking",
        {
          method: "POST",
          headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coordinates: coordinates,
            format: "json",
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Route data received:", data);

      if (!data.routes || data.routes.length === 0) {
        throw new Error("No route found between the selected points");
      }

      const route = data.routes[0];

      // Decode the polyline geometry
      const routeCoordinates = decodePolyline(route.geometry);

      // Extract steps for turn-by-turn directions
      const steps: RouteStep[] =
        route.segments[0]?.steps?.map((step: any) => ({
          instruction: step.instruction,
          name: step.name === "-" ? "" : step.name,
          distance: step.distance,
          duration: step.duration,
        })) || [];

      const newRoute: RouteData = {
        coordinates: routeCoordinates,
        distance: route.summary.distance,
        duration: route.summary.duration,
        steps: steps,
      };

      console.log(
        "Setting route with",
        routeCoordinates.length,
        "coordinate points"
      );
      setRoute(newRoute);
    } catch (error) {
      console.error("Error calculating route:", error);
      setRouteError(
        error instanceof Error ? error.message : "Failed to calculate route"
      );
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const addPOI = (poi: Omit<POI, "id">) => {
    const newPOI: POI = {
      ...poi,
      id: Date.now().toString(),
    };
    console.log("Adding POI:", newPOI);
    setPois((prev) => [...prev, newPOI]);
  };

  const removePOI = (id: string) => {
    setPois((prev) => prev.filter((poi) => poi.id !== id));
  };

  const reorderPOIs = (startIndex: number, endIndex: number) => {
    const result = Array.from(pois);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    setPois(result);
  };

  const clearAll = () => {
    setPois([]);
    setRoute(null);
    setRouteError(null);
  };

  const handleMapClick = (lat: number, lng: number) => {
    addPOI({
      name: `Point ${pois.length + 1}`,
      lat,
      lng,
    });
  };

  const hasApiKey = !!process.env.NEXT_PUBLIC_OPENROUTESERVICE_API_KEY;

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Sidebar */}
      <div className="lg:w-96 w-full lg:h-full h-auto bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Walking Directions App
            </h1>
          </div>
          <p className="text-gray-600 text-sm">
            Plan your walking route by adding points of interest
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* API Key Warning */}
          {!hasApiKey && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      API Key Required
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Add your OpenRouteService API key to .env.local to enable
                      routing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* POI Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Location</CardTitle>
            </CardHeader>
            <CardContent>
              <POIInput onAddPOI={addPOI} />
              <p className="text-sm text-gray-500 mt-2">
                Or click on the map to add a point
              </p>
            </CardContent>
          </Card>

          {/* POI List */}
          {pois.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Your Route ({pois.length} points)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <POIList
                  pois={pois}
                  onRemovePOI={removePOI}
                  onReorderPOIs={reorderPOIs}
                />
              </CardContent>
            </Card>
          )}

          {/* Route Error */}
          {routeError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Route Error
                    </p>
                    <p className="text-xs text-red-700 mt-1">{routeError}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Route Info */}
          {route && !routeError && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Route Details</CardTitle>
              </CardHeader>
              <CardContent>
                <RouteInfo route={route} isLoading={isLoadingRoute} />
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoadingRoute && pois.length >= 2 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">
                    Calculating route...
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clear Button */}
          {(pois.length > 0 || route) && (
            <Button
              onClick={clearAll}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}

          {/* Debug Info */}
          {pois.length >= 2 && (
            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-2">Debug Info:</p>
                <p className="text-xs text-gray-500">Points: {pois.length}</p>
                <p className="text-xs text-gray-500">
                  Route: {route ? "Loaded" : "None"}
                </p>
                <p className="text-xs text-gray-500">
                  API Key: {hasApiKey ? "Present" : "Missing"}
                </p>
                {route && (
                  <p className="text-xs text-gray-500">
                    Route Points: {route.coordinates.length}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 lg:h-full h-96 lg:min-h-0 min-h-96">
        <MapContainer pois={pois} route={route} onMapClick={handleMapClick} />
      </div>
    </div>
  );
}
