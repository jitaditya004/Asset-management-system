import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import API from "../../api/api";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    }
  });
  return null;
}

export default function RegionMapPicker({ onRegionSelected }) {
  const [point, setPoint] = useState(null);

  const confirm = async () => {
    const res = await API.post("/geo/resolve-region", {
      latitude: point.lat,
      longitude: point.lng
    });

    onRegionSelected(res.data.region);
  };

  return (
    <div className="space-y-3">
      <MapContainer
        center={[23.8315, 91.2868]}
        zoom={12}
        className="h-96 w-full rounded"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickHandler onPick={setPoint} />
        {point && <Marker position={[point.lat, point.lng]} />}
      </MapContainer>

      {point && (
        <button
          onClick={confirm}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Select this region
        </button>
      )}
    </div>
  );
}
