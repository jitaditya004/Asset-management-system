import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { requestAsset } from "../services/request.service";

export default function RequestAsset() {
  const { assetId } = useParams(); // asset_id
  const navigate = useNavigate();

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!reason.trim()) {
      setError("Please provide a reason");
      return;
    }

    try {
      setLoading(true);
      await requestAsset(assetId, reason);
      alert("Request sent successfully");
      navigate("/my-requests");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send request"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="min-h-[70vh] flex items-center justify-center px-4">
    <div
      className="
        w-full max-w-lg
        bg-white/10 backdrop-blur-xl
        border border-white/10
        rounded-2xl shadow-xl
        p-6 space-y-6
        text-white
      "
    >
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-wide">
          📦 Request Asset
        </h1>
        <p className="text-sm text-white/50">
          Provide a reason so the admin can review your request
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="
            bg-red-500/10 border border-red-500/20
            text-red-300
            px-4 py-2 rounded-lg text-sm
          "
        >
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1 text-white/70">
            Reason for Request
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Why do you need this asset?"
            className="
              w-full rounded-lg
              bg-white/10 border border-white/10
              px-3 py-2
              text-white placeholder:text-white/40
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              resize-none
            "
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            disabled={loading}
            className="
              flex-1
              bg-gradient-to-r from-indigo-600 to-purple-600
              hover:from-indigo-700 hover:to-purple-700
              text-white py-2 rounded-lg
              font-medium
              transition
              disabled:opacity-50
            "
          >
            {loading ? "Sending..." : "Send Request"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              flex-1
              border border-white/20
              text-white/80
              py-2 rounded-lg
              hover:bg-white/10
              transition
            "
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
);

}
