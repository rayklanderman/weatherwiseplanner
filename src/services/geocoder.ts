/**
 * Geocoding service using OpenStreetMap Nominatim API
 * Free, no API key required
 */

interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
}

/**
 * Convert place name to coordinates
 * Uses OpenStreetMap Nominatim (free, no API key)
 */
export async function geocodeLocation(placeName: string): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
          q: placeName,
          format: "json",
          limit: "1",
          addressdetails: "1",
        }),
      {
        headers: {
          "User-Agent": "WeatherWise-Planner/1.0", // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const results = await response.json();
    
    if (!results || results.length === 0) {
      console.warn(`No results found for location: ${placeName}`);
      return null;
    }

    const [first] = results;
    return {
      lat: parseFloat(first.lat),
      lon: parseFloat(first.lon),
      display_name: first.display_name,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Get US state coordinates (fallback for common states)
 */
const US_STATES: Record<string, { lat: number; lon: number; name: string }> = {
  delaware: { lat: 39.0, lon: -75.5, name: "Delaware" },
  boston: { lat: 42.3601, lon: -71.0589, name: "Boston, MA" },
  "new york": { lat: 40.7128, lon: -74.006, name: "New York, NY" },
  california: { lat: 36.7783, lon: -119.4179, name: "California" },
  texas: { lat: 31.9686, lon: -99.9018, name: "Texas" },
  florida: { lat: 27.9944, lon: -81.7603, name: "Florida" },
  arizona: { lat: 34.0489, lon: -111.0937, name: "Arizona" },
  colorado: { lat: 39.5501, lon: -105.7821, name: "Colorado" },
  denver: { lat: 39.7392, lon: -104.9903, name: "Denver, CO" },
};

/**
 * Get coordinates for a location (with fallback to common US states)
 */
export async function getCoordinates(
  placeName: string
): Promise<{ lat: number; lon: number; name: string } | null> {
  // Try exact match in US states first (instant)
  const normalized = placeName.toLowerCase().trim();
  if (US_STATES[normalized]) {
    return US_STATES[normalized];
  }

  // Try Nominatim API
  const result = await geocodeLocation(placeName);
  if (result) {
    return {
      lat: result.lat,
      lon: result.lon,
      name: result.display_name,
    };
  }

  return null;
}
