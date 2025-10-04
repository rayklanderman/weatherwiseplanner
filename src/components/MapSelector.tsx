import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L, { LatLngExpression, LeafletEvent, LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

interface MapSelectorProps {
  lat: number | null;
  lon: number | null;
  onChange: (lat: number, lon: number) => void;
}

const DEFAULT_CENTER: LatLngExpression = [39.7392, -104.9903];

const LocationMarker = ({
  lat,
  lon,
  onChange
}: {
  lat: number | null;
  lon: number | null;
  onChange: (lat: number, lon: number) => void;
}) => {
  useMapEvents({
    click: (event: LeafletMouseEvent) => {
      onChange(event.latlng.lat, event.latlng.lng);
    }
  });

  if (lat == null || lon == null) {
    return null;
  }

  return (
    <Marker
      position={{ lat, lng: lon }}
      icon={defaultIcon}
      draggable
      eventHandlers={{
        dragend: (event: LeafletEvent) => {
          const marker = event.target as L.Marker;
          const position = marker.getLatLng();
          onChange(position.lat, position.lng);
        }
      }}
    />
  );
};

export const MapSelector = ({ lat, lon, onChange }: MapSelectorProps) => {
  const center: LatLngExpression = lat != null && lon != null ? [lat, lon] : DEFAULT_CENTER;

  return (
    <section className="space-y-4 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-lg ring-1 ring-slate-200/60 backdrop-blur">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Choose a location</h2>
          <p className="text-sm text-slate-500">Tap anywhere on the map to drop a pin.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand-dark ring-1 ring-brand/20">
          <span aria-hidden>🗺️</span>
          Interactive NASA basemap
        </span>
      </header>
      <div className="h-64 overflow-hidden rounded-2xl border border-white/70 shadow-md ring-1 ring-slate-200/60">
        <MapContainer center={center} zoom={6} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker lat={lat} lon={lon} onChange={onChange} />
        </MapContainer>
      </div>
    </section>
  );
};
