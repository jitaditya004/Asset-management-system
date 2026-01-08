import { useState } from "react";
import { reportIssue } from "../services/maintenance.service";

export default function SendToRepair({ asset, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [issue, setIssue] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!asset?.asset_id) return;

    try {
      setLoading(true);
      await reportIssue({
        asset_id: asset.asset_id,
        issue_description: issue || "Sent for repair",
      });

      alert("Asset sent to maintenance");
      await onSuccess();
      setOpen(false);
      setIssue("");
    } catch (err) {
      alert("Failed to send asset to maintenance");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Guard
  if (asset.status !== "ACTIVE") return null;

  return (
    <div className="mt-3">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="
            w-full
            flex items-center justify-center gap-2
            px-4 py-2
            rounded-lg
            bg-orange-500 text-white
            hover:bg-orange-600
            active:scale-95
            transition
            text-sm font-medium
          "
        >
          🛠️ Send to Repair
        </button>
      ) : (
        <div
          className="
            mt-2
            rounded-lg border bg-gray-50/30
            p-3 space-y-3
            animate-[fadeIn_0.15s_ease-out]
          "
        >
          <textarea
            rows={3}
            placeholder="Describe the issue (optional)"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            className="
              w-full
              rounded-xl
              bg-white/10 backdrop-blur-md
              border border-white/20
              px-4 py-3
              text-sm text-white
              placeholder:text-white/40
              resize-none

              focus:outline-none
              focus:border-orange-400/60
              focus:shadow-[0_0_0_2px_rgba(251,146,60,0.25)]
              focus:bg-white/15

              transition-all duration-200
            "
          />


          <div className="flex justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="
                px-3 py-1.5 text-sm 
                rounded-md
                border
                hover:bg-gray-100/50
              "
            >
              Cancel
            </button>

            <button
              onClick={submit}
              disabled={loading}
              className="
                px-4 py-1.5 text-sm font-medium
                rounded-md
                bg-red-600 text-white
                hover:bg-red-700
                disabled:opacity-50
                active:scale-95
                transition
              "
            >
              {loading ? "Sending..." : "Confirm"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
