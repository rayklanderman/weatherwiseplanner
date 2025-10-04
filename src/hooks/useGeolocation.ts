import { useEffect, useState } from "react";

interface GeolocationState {
  lat: number | null;
  lon: number | null;
  isSupported: boolean;
  isLoading: boolean;
  error?: string;
}

export const useGeolocation = (): GeolocationState => {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lon: null,
    isSupported: typeof navigator !== "undefined" && "geolocation" in navigator,
    isLoading: true
  });

  useEffect(() => {
    if (!state.isSupported) {
      setState((prev: GeolocationState) => ({
        ...prev,
        isLoading: false,
        error: "Geolocation not supported"
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          isSupported: true,
          isLoading: false
        });
      },
      (err) => {
        setState((prev: GeolocationState) => ({
          ...prev,
          isLoading: false,
          error: err.message || "Unable to retrieve location"
        }));
      }
    );
  }, [state.isSupported]);

  return state;
};
