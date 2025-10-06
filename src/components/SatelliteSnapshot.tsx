import { useEffect, useMemo, useState } from "react";

const GIBS_WMS_ENDPOINT = "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi";
const GIBS_LAYER = "MODIS_Terra_CorrectedReflectance_TrueColor";

interface SatelliteSnapshotProps {
  lat: number | null;
  lon: number | null;
  dateOfYear: string;
}

type FetchState = "idle" | "loading" | "success" | "error";

const toIsoDate = (dateOfYear: string): string => {
  // dateOfYear is already in YYYY-MM-DD format from the date picker
  // Just return it directly - no need to manipulate
  if (!dateOfYear || dateOfYear.split('-').length !== 3) {
    return '2024-07-01'; // Fallback to a safe date
  }
  return dateOfYear;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const SatelliteSnapshot = ({ lat, lon, dateOfYear }: SatelliteSnapshotProps) => {
  const [imageUrl, setImageUrl] = useState<string>();
  const [status, setStatus] = useState<FetchState>("idle");
  const [error, setError] = useState<string>();
  const [isExpanded, setIsExpanded] = useState(true);

  const requestUrl = useMemo(() => {
    if (lat == null || lon == null) return undefined;

    const bboxPadding = 2.5;
    const minLat = clamp(lat - bboxPadding, -90, 90);
    const maxLat = clamp(lat + bboxPadding, -90, 90);
    const minLon = clamp(lon - bboxPadding, -180, 180);
    const maxLon = clamp(lon + bboxPadding, -180, 180);

    const query = new URLSearchParams({
      SERVICE: "WMS",
      VERSION: "1.1.1",
      REQUEST: "GetMap",
      LAYERS: GIBS_LAYER,
      SRS: "EPSG:4326",
      BBOX: `${minLon},${minLat},${maxLon},${maxLat}`,
      WIDTH: "640",
      HEIGHT: "640",
      FORMAT: "image/png",
      TRANSPARENT: "true",
      TIME: toIsoDate(dateOfYear)
    });

    return `${GIBS_WMS_ENDPOINT}?${query.toString()}`;
  }, [lat, lon, dateOfYear]);

  useEffect(() => {
    if (!requestUrl) {
      setImageUrl(undefined);
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    const load = async () => {
      setStatus("loading");
      setError(undefined);
      try {
        const response = await fetch(requestUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`GIBS WMS request failed (${response.status})`);
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return objectUrl;
        });
        setStatus("success");
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unable to load imagery");
        setStatus("error");
      }
    };

    void load();

    return () => {
      controller.abort();
    };
  }, [requestUrl]);

  if (!requestUrl) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border border-white/20 bg-white/5 p-6 text-center backdrop-blur">
        <div>
          <span className="mb-2 block text-3xl">🛰️</span>
          <p className="text-xs text-white/60">Select location on map</p>
          <p className="mt-1 text-[10px] text-white/40">NASA GIBS • Optional</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/20 bg-white/5 backdrop-blur">
          {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between border-b border-white/10 p-3 text-left transition hover:bg-white/5"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">🛰️</span>
          <span className="text-xs font-semibold text-white">Satellite View</span>
          <span className="text-[10px] text-white/40">(Optional)</span>
        </div>
        <span className="text-xs text-white/60">{isExpanded ? '▼' : '▶'}</span>
      </button>

      {isExpanded && (
        <div>
          {status === "loading" && (
            <div className="flex aspect-square items-center justify-center bg-slate-900/50">
              <div className="text-center">
                <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                <p className="text-xs text-white/60">Loading NASA imagery...</p>
                <p className="mt-1 text-[10px] text-white/40">MODIS Terra • {toIsoDate(dateOfYear)}</p>
              </div>
            </div>
          )}
          {status === "error" && (
            <div className="flex aspect-square flex-col items-center justify-center gap-2 p-6 text-center">
              <span className="text-3xl">🛰️</span>
              <p className="text-xs font-semibold text-white/80">Imagery unavailable</p>
              {error && <p className="text-xs text-white/50">{error}</p>}
              <div className="mt-2 rounded-lg bg-white/5 px-3 py-2">
                <p className="text-[10px] text-white/60">Date: {toIsoDate(dateOfYear)}</p>
                <p className="text-[10px] text-white/40">Location: {lat?.toFixed(2)}°, {lon?.toFixed(2)}°</p>
              </div>
              <a
                href={`https://worldview.earthdata.nasa.gov/?v=${lon! - 5},${lat! - 5},${lon! + 5},${lat! + 5}&t=${toIsoDate(dateOfYear)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 rounded-lg bg-nasa-red px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-nasa-red/80"
              >
                🌍 Open NASA Worldview
              </a>
              <p className="mt-2 text-[10px] text-blue-300">Optional feature - App works without it</p>
            </div>
          )}
          {status === "success" && imageUrl && (
            <div className="relative aspect-square">
              <img 
                src={imageUrl} 
                alt="NASA MODIS Terra satellite" 
                className="h-full w-full object-cover" 
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white drop-shadow">
                      {toIsoDate(dateOfYear)}
                    </p>
                    <p className="text-xs text-white/70 drop-shadow">NASA MODIS Terra</p>
                  </div>
                  <a
                    href={`https://worldview.earthdata.nasa.gov/?v=${lon! - 5},${lat! - 5},${lon! + 5},${lat! + 5}&t=${toIsoDate(dateOfYear)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-nasa-red/80 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur transition hover:bg-nasa-red"
                    title="Open in NASA Worldview"
                  >
                    🌍 Worldview
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
