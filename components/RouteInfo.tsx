"use client";

import { Clock, Route, Loader2, Navigation } from "lucide-react";
import { RouteData } from "@/app/page";

interface RouteInfoProps {
  route: RouteData;
  isLoading: boolean;
}

export function RouteInfo({ route, isLoading }: RouteInfoProps) {
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Calculating route...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Route className="h-5 w-5 text-blue-600" />
          <div>
            <div className="text-sm text-gray-600">Distance</div>
            <div className="font-semibold text-gray-900">
              {formatDistance(route.distance)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
          <Clock className="h-5 w-5 text-green-600" />
          <div>
            <div className="text-sm text-gray-600">Walking Time</div>
            <div className="font-semibold text-gray-900">
              {formatDuration(route.duration)}
            </div>
          </div>
        </div>
      </div>

      {/* Turn-by-turn directions */}
      {route.steps && route.steps.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Navigation className="h-4 w-4 text-gray-600" />
            <h4 className="text-sm font-medium text-gray-900">Directions</h4>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {route.steps.slice(0, -1).map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-2 bg-gray-50 rounded text-xs"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mt-0.5">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">
                    {step.instruction}
                    {step.name && ` onto ${step.name}`}
                  </div>
                  <div className="text-gray-500 mt-1">
                    {formatDistance(step.distance)} •{" "}
                    {formatDuration(step.duration)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Route calculated for walking pace. Times are estimates.
      </div>
    </div>
  );
}
