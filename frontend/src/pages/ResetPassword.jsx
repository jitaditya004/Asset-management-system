import React, { useState } from "react";
import API from "../api/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post(`/auth/reset-password?token=${token}`, {
        password,
      });
      Swal.fire({
        title: res.data.message,
        text: "Login with new password",
        icon: "success",
      });
      nav(`/login`);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Sorry",
        text: err?.response?.data?.message || "Password Reset Failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-red-500">
      <div className="bg-white p-8 w-96 rounded-xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">
          Reset Password
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="password"
            className="w-full border p-3 rounded-lg focus:ring focus:ring-blue-200"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="w-full bg-blue-600 text-white p-2 rounded">
            {loading ? "Processing..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
