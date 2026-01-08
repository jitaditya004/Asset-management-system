// pages/Unauthorized.jsx
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div
      className="
        h-full flex items-center justify-center
        bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600
      "
    >
      {/* Card */}
      <div
        className="
          w-full max-w-md
          bg-white/0 backdrop-blur-xl
          border border-white/0
          rounded-2xl
          
          p-10 
          text-center
          text-white
          animate-fadeIn
        "
      >
        {/* Error code */}
        <div
          className="
            text-6xl font-extrabold
            bg-gradient-to-r from-red-300 to-pink-300
            bg-clip-text text-transparent 
            mb-2
          "
        >
          403
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold tracking-wide">
          Access Denied
        </h1>

        {/* Description */}
        <p className="mt-2 text-sm text-white/70">
          You don’t have permission to view this page.
        </p>

        {/* Actions */}
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/"
            className="
              px-5 py-2 rounded-lg
              bg-gradient-to-r from-indigo-500 to-purple-500
              hover:from-indigo-600 hover:to-purple-600
              text-white text-sm font-medium
              shadow-md hover:shadow-lg
              transition
            "
          >
            Go to Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            className="
              px-5 py-2 rounded-lg
              border border-white/30
              text-white/80
              hover:bg-white/10
              transition
            "
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
