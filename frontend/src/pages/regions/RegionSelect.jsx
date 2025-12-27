import { useNavigate } from "react-router-dom";
import RegionMapPicker from "./RegionMapPicker";

export default function RegionSelect() {
  const nav = useNavigate();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Select Region from Map
      </h2>
      <RegionMapPicker
        onRegionSelected={(region) => {
          nav(`/regions/${region}/assets`);
        }}

      />
    </div>
  );
}
