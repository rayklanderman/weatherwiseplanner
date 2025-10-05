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
    <section className="space-y-4">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-slate-600">
          🗺️ Click anywhere on the map or drag the marker to select your location
        </p>
      </header>
      <div className="h-96 overflow-hidden rounded-2xl border-2 border-slate-200 shadow-lg ring-2 ring-slate-100">
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
