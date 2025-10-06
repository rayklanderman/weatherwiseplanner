/**
 * Geocoding service using OpenStreetMap Nominatim API
 * Free, no API key required
 * 
 * SUPPORTS WORLDWIDE LOCATIONS:
 * - Cities: "London", "Tokyo", "Paris", "Mumbai", "Sydney"
 * - Countries: "Germany", "Brazil", "Kenya", "Australia"
 * - Regions: "Sahara Desert", "Amazon Rainforest", "Himalayas"
 * - Addresses: "1600 Pennsylvania Avenue, Washington DC"
 * - Natural language: "Eiffel Tower", "Great Barrier Reef"
 * 
 * Coverage: 220+ countries, millions of cities/landmarks
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
 * Common locations cache for instant results (performance optimization)
 * These return immediately without API call
 * All other locations use OpenStreetMap Nominatim (worldwide coverage)
 */
const COMMON_LOCATIONS: Record<string, { lat: number; lon: number; name: string }> = {
  // US States & Cities
  delaware: { lat: 39.0, lon: -75.5, name: "Delaware, USA" },
  boston: { lat: 42.3601, lon: -71.0589, name: "Boston, MA, USA" },
  "new york": { lat: 40.7128, lon: -74.006, name: "New York, NY, USA" },
  california: { lat: 36.7783, lon: -119.4179, name: "California, USA" },
  texas: { lat: 31.9686, lon: -99.9018, name: "Texas, USA" },
  florida: { lat: 27.9944, lon: -81.7603, name: "Florida, USA" },
  arizona: { lat: 34.0489, lon: -111.0937, name: "Arizona, USA" },
  colorado: { lat: 39.5501, lon: -105.7821, name: "Colorado, USA" },
  denver: { lat: 39.7392, lon: -104.9903, name: "Denver, CO, USA" },
  
  // Major World Cities
  london: { lat: 51.5074, lon: -0.1278, name: "London, UK" },
  paris: { lat: 48.8566, lon: 2.3522, name: "Paris, France" },
  tokyo: { lat: 35.6762, lon: 139.6503, name: "Tokyo, Japan" },
  dubai: { lat: 25.2048, lon: 55.2708, name: "Dubai, UAE" },
  sydney: { lat: -33.8688, lon: 151.2093, name: "Sydney, Australia" },
  mumbai: { lat: 19.0760, lon: 72.8777, name: "Mumbai, India" },
  "sao paulo": { lat: -23.5505, lon: -46.6333, name: "São Paulo, Brazil" },
  nairobi: { lat: -1.2921, lon: 36.8219, name: "Nairobi, Kenya" },
  moscow: { lat: 55.7558, lon: 37.6173, name: "Moscow, Russia" },
  beijing: { lat: 39.9042, lon: 116.4074, name: "Beijing, China" },
};

/**
 * Get coordinates for ANY location worldwide
 * 
 * Examples that work:
 * - "London" → London, UK
 * - "Sahara" → Sahara Desert, Africa
 * - "Amazon Rainforest" → Amazon, South America
 * - "Great Barrier Reef" → Queensland, Australia
 * - "Mount Everest" → Nepal/Tibet border
 * - "Antarctica" → South Pole region
 * 
 * @param placeName - Any location name (city, country, landmark, address)
 * @returns Coordinates and formatted name, or null if not found
 */
export async function getCoordinates(
  placeName: string
): Promise<{ lat: number; lon: number; name: string } | null> {
  // Try common locations cache first (instant, no API call)
  const normalized = placeName.toLowerCase().trim();
  if (COMMON_LOCATIONS[normalized]) {
    console.log(`📍 Found ${placeName} in cache (instant)`);
    return COMMON_LOCATIONS[normalized];
  }

  // Use OpenStreetMap Nominatim for worldwide coverage
  console.log(`🌍 Geocoding ${placeName} via Nominatim API...`);
  const result = await geocodeLocation(placeName);
  if (result) {
    console.log(`✅ Found: ${result.display_name}`);
    return {
      lat: result.lat,
      lon: result.lon,
      name: result.display_name,
    };
  }

  console.warn(`❌ Could not find location: ${placeName}`);
  return null;
}

/**
 * Reverse geocoding: Convert coordinates to city/location name
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 * 
 * @param lat - Latitude (-90 to 90)
 * @param lon - Longitude (-180 to 180)
 * @returns Location name (city, town, or region) or null if not found
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
        new URLSearchParams({
          lat: lat.toString(),
          lon: lon.toString(),
          format: "json",
          zoom: "10", // City level detail
        }),
      {
        headers: {
          "User-Agent": "WeatherWise-Planner/1.0", // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      console.warn(`Reverse geocoding failed: ${response.statusText}`);
      return null;
    }

    const result = await response.json();
    
    if (!result || result.error) {
      console.warn(`No location found for coordinates: ${lat}, ${lon}`);
      return null;
    }

    // Extract city name from address
    const address = result.address || {};
    const locationName = 
      address.city || 
      address.town || 
      address.village || 
      address.county || 
      address.state || 
      address.country ||
      result.display_name?.split(",")[0] || // Fallback to first part of display name
      null;

    console.log(`📍 Reverse geocoded (${lat}, ${lon}) → ${locationName}`);
    return locationName;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}
