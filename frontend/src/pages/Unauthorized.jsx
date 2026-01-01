// pages/Unauthorized.jsx
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-3xl font-bold text-red-600">403</h1>
      <p className="mt-2 text-lg">Access Denied</p>
      <p className="text-gray-600">
        You don’t have permission to view this page.
      </p>

      <Link
        to="/"
        className="mt-4 text-blue-600 hover:underline"
      >
        Go back home
      </Link>
    </div>
  );
}
