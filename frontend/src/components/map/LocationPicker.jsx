import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    }
  });
  return null;
}

export default function LocationPicker({ value, onChange }) {
  const [position, setPosition] = useState(value);

  const handleSelect = (latlng) => {
    setPosition(latlng);
    onChange(latlng);
  };

  return (
    <MapContainer
      center={position || [23.8315, 91.2868]}
      zoom={12}
      className="h-64 w-full rounded border"
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onSelect={handleSelect} />
      {position && <Marker position={position} />}
    </MapContainer>
  );
}
