import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../api/api";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    API.get("/user/me").then(() => {
      setOk(true);
      setLoading(false);
    }).catch(() => {
      setOk(false);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="container py-8">Loading...</div>;
  return ok ? children : <Navigate to="/login" replace />;
}
