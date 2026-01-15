import React, { useState } from "react";
import API from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import {useAuth} from "../hook/useAuth";

export default function Login() {
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const {reloadUser} = useAuth();

  

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/login", { email, password });
      await reloadUser();
      nav("/");
    } catch (err) {
      alert(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="
      min-h-screen flex flex-col items-center justify-center
      bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 gap-2
    ">
      {/* Card */}
      <div className="
              w-full max-w-md
              bg-white/10 backdrop-blur-xl
              border border-white/20
              rounded-2xl
              shadow-2xl
              p-8
              text-white
              animate-fadeIn
            ">
              {/* Title */}
              <div className="flex flex-col items-center gap-3">
        <span className="
          px-3 py-1 text-xs font-semibold tracking-wide
          rounded-full
          bg-white/10 border border-white/20
          text-white/80
        ">
          ASSET MANAGEMENT PORTAL
        </span>

        <h2 className="
          text-4xl font-extrabold
          bg-gradient-to-r from-indigo-200 to-purple-300
          bg-clip-text text-transparent
        ">
          Welcome Back
        </h2>

        <p className="text-white/80 text-sm mb-3">
          Sign in to continue
        </p>
      </div>


        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          <input
            className="
              w-full
              bg-white/10 backdrop-blur
              border border-white/20
              rounded-lg
              px-4 py-2.5
              text-white
              placeholder:text-white/40
              focus:outline-none
              focus:ring-2 focus:ring-indigo-400
              transition
            "
            placeholder="Email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            required
          />

          <input
            type="password"
            className="
              w-full
              bg-white/10 backdrop-blur
              border border-white/20
              rounded-lg
              px-4 py-2.5
              text-white
              placeholder:text-white/40
              focus:outline-none
              focus:ring-2 focus:ring-indigo-400
              transition
            "
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            disabled={loading}
            className="
              w-full
              bg-gradient-to-r from-indigo-500 to-purple-500
              hover:from-indigo-600 hover:to-purple-600
              text-white
              py-2.5
              rounded-lg
              font-medium
              shadow-lg
              hover:shadow-xl
              transition
              disabled:opacity-50
            "
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-white/70">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-indigo-300 hover:text-indigo-200 font-medium transition"
          >
            Sign up
          </Link>
        </div>

      </div>
    </div>
  );

}
