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
  // Use current year so imagery feels recent. Fallback to 2024 if parsing fails.
  const year = new Date().getFullYear();
  if (!month || !day) {
    return `${year}-07-01`;
  }
  return `${year}-${month}-${day}`;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const SatelliteSnapshot = ({ lat, lon, dateOfYear }: SatelliteSnapshotProps) => {
  const [imageUrl, setImageUrl] = useState<string>();
  const [status, setStatus] = useState<FetchState>("idle");
  const [error, setError] = useState<string>();

  const requestUrl = useMemo(() => {
    if (lat == null || lon == null) return undefined;

    const bboxPadding = 2.5; // degrees around the chosen point
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
      <section className="rounded-2xl border border-white/60 bg-white/70 p-6 text-sm text-slate-600 shadow-sm ring-1 ring-inset ring-slate-200/60 backdrop-blur">
        Drop a pin to unlock a recent MODIS satellite snapshot from NASA GIBS.
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-lg ring-1 ring-slate-200/60 backdrop-blur">
      <header className="flex items-center justify-between border-b border-slate-200/60 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Satellite snapshot</h2>
          <p className="text-xs text-slate-500">MODIS Terra True Color • NASA GIBS WMS</p>
        </div>
        <time className="text-xs font-medium text-slate-600" dateTime={toIsoDate(dateOfYear)}>
          {toIsoDate(dateOfYear)}
        </time>
      </header>
      <div className="relative aspect-square bg-slate-100">
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-sm text-slate-600">
            <span className="text-lg">🛰️</span>
            <p>We couldn’t retrieve MODIS imagery for this date window.</p>
            {error && <p className="text-xs text-slate-500">{error}</p>}
          </div>
        )}
        {status === "success" && imageUrl && (
          <img src={imageUrl} alt="NASA MODIS Terra true-color snapshot" className="h-full w-full object-cover" />
        )}
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 px-6 py-3 text-[11px] text-slate-500">
        <span>Imagery: NASA Global Imagery Browse Services (GIBS)</span>
        <a
          href="https://gibs.earthdata.nasa.gov/"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-brand-dark hover:text-brand"
        >
          Learn about GIBS
        </a>
      </footer>
    </section>
  );
};
