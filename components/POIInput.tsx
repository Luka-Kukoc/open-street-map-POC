"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, MapPin } from "lucide-react";
import { POI } from "@/app/page";

interface POIInputProps {
  onAddPOI: (poi: Omit<POI, "id">) => void;
}

export function POIInput({ onAddPOI }: POIInputProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [coordinateName, setCoordinateName] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      // Using Nominatim (OpenStreetMap's geocoding service) as it's free and doesn't require API key
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error("Geocoding failed");
      }

      const data = await response.json();

      if (data.length > 0) {
        const result = data[0];
        onAddPOI({
          name: result.display_name.split(",")[0] || searchQuery,
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        });
        setSearchQuery("");
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (error) {
      console.error("Error geocoding location:", error);
      alert("Error searching for location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoordinateSubmit = () => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng)) {
      alert("Please enter valid numeric coordinates.");
      return;
    }

    if (lat < -90 || lat > 90) {
      alert("Latitude must be between -90 and 90 degrees.");
      return;
    }

    if (lng < -180 || lng > 180) {
      alert("Longitude must be between -180 and 180 degrees.");
      return;
    }

    const name =
      coordinateName.trim() || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

    onAddPOI({
      name,
      lat,
      lng,
    });

    // Clear form
    setLatitude("");
    setLongitude("");
    setCoordinateName("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleCoordinateFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCoordinateSubmit();
  };

  return (
    <Tabs defaultValue="search" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="search" className="flex items-center gap-2">
          <Search className="h-3 w-3" />
          Search
        </TabsTrigger>
        <TabsTrigger value="coordinates" className="flex items-center gap-2">
          <MapPin className="h-3 w-3" />
          Coordinates
        </TabsTrigger>
      </TabsList>

      <TabsContent value="search" className="space-y-3 mt-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search for a place..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!searchQuery.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="coordinates" className="space-y-3 mt-4">
        <form onSubmit={handleCoordinateFormSubmit} className="space-y-3">
          <Input
            type="text"
            placeholder="Name (optional)"
            value={coordinateName}
            onChange={(e) => setCoordinateName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              step="any"
              placeholder="Latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="text-sm"
            />
            <Input
              type="number"
              step="any"
              placeholder="Longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="text-sm"
            />
          </div>
          <Button
            type="submit"
            disabled={!latitude.trim() || !longitude.trim()}
            className="w-full"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Add Point
          </Button>
        </form>
        <div className="text-xs text-gray-500">
          <p>Enter coordinates in decimal degrees format.</p>
          <p>Example: 40.7128, -74.0060 (NYC)</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
