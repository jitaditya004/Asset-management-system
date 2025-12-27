import { useParams } from "react-router-dom";
import Assets from "../Assets";

export default function RegionAssets() {
  const { regionName } = useParams();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        📍 Region: {regionName}
      </h2>

      <Assets region={regionName} />
    </div>
  );
}
