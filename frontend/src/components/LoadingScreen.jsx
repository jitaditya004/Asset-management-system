export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr
              from-blue-300 via-purple-100 to-pink-200">
      <div className="flex flex-col items-center gap-6">
        {/* Gradient spinner */}
        <div className="relative w-16 h-16">
          <div
            className="
              absolute inset-0
              rounded-full
              bg-gradient-to-tr
              from-blue-500 via-purple-500 to-pink-500
              animate-spin
            "
          />
          <div
            className="
              absolute inset-1
              rounded-full
              bg-gradient-to-br from-blue-100 via-purple-100 to-pink-200
            "
          />
        </div>

        {/* Text shimmer */}
        <div className="text-center ">
          <p
            className="
              text-sm font-medium
              bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
              bg-clip-text text-transparent
              animate-pulse
            "
          >
            Loading, please wait…
          </p>
        </div>
      </div>
    </div>
  );
}
