import { useState } from "react";
import API from "../api/api";

export default function SuggestionPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      await API.post("/suggestions", { message });
      setSuccess(true);
      setMessage("");
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center ">
      <div className="backdrop-blur-lg bg-white/20 p-8 rounded-2xl shadow-xl w-[90%] max-w-lg">
        <h1 className="text-2xl font-semibold text-white mb-2">
          Send a Suggestion
        </h1>
        <p className="text-white/80 mb-6 text-sm">
          Have feedback or ideas? I’d love to hear them.
        </p>

        {success && (
          <div className="bg-green-500/20 text-green-200 p-3 rounded mb-4 text-sm">
            ✅ Suggestion sent successfully!
          </div>
        )}

        <form onSubmit={submit}>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your suggestion here..."
            className="w-full p-3 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            disabled={loading}
            className="mt-4 w-full bg-black/80 hover:bg-black text-white py-2 rounded-lg transition"
          >
            {loading ? "Sending..." : "Send Suggestion"}
          </button>
        </form>
      </div>
    </div>
  );
}
