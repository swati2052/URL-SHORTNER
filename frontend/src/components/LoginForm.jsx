import React, { useState } from "react";
import axios from "axios";

import { Link, useNavigate } from "@tanstack/react-router";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";

const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");

    try {
      // The proxy in vite config forwards /api to localhost:3000
      const response = await axios.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true } // ensures cookies are stored/sent
      );
      if (response.data.success) {
        dispatch(loginSuccess());
        navigate({ to: "/" });
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || err.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white px-8 py-10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 max-w-md w-full mx-4">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-normal text-gray-500 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-normal text-gray-500 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-[#3b82f6] hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-md shadow-sm transition duration-150 cursor-pointer text-sm mt-2"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-xs text-center font-medium">
          {error}
        </div>
      )}
      <p className="mt-6 text-center text-xs text-gray-500">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-500 hover:underline font-medium">
          Register
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;
