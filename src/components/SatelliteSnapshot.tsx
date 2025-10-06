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
  const [month, day] = dateOfYear.split("-");
  const year = new Date().getFullYear();
  if (!month || !day) {
    return `-07-01`;
  }
  return `--`;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const SatelliteSnapshot = ({ lat, lon, dateOfYear }: SatelliteSnapshotProps) => {
  const [imageUrl, setImageUrl] = useState<string>();
  const [status, setStatus] = useState<FetchState>("idle");
  const [error, setError] = useState<string>();

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
      BBOX: `,,,`,
      WIDTH: "640",
      HEIGHT: "640",
      FORMAT: "image/png",
      TRANSPARENT: "true",
      TIME: toIsoDate(dateOfYear)
    });

    return `?`;
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
          throw new Error(`GIBS WMS request failed ()`);
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
          <span className="mb-2 block text-3xl"></span>
          <p className="text-xs text-white/60">Select location on map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/20 bg-white/5 backdrop-blur">
      {status === "loading" && (
        <div className="flex aspect-square items-center justify-center bg-slate-900/50">
          <div className="text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="text-xs text-white/60">Loading satellite...</p>
          </div>
        </div>
      )}
      {status === "error" && (
        <div className="flex aspect-square flex-col items-center justify-center gap-2 p-6 text-center">
          <span className="text-3xl"></span>
          <p className="text-xs text-white/80">Could not load imagery</p>
          {error && <p className="text-xs text-white/50">{error}</p>}
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
            <p className="text-xs font-semibold text-white drop-shadow">
              {toIsoDate(dateOfYear)}
            </p>
            <p className="text-xs text-white/70 drop-shadow">MODIS Terra</p>
          </div>
        </div>
      )}
    </div>
  );
};
