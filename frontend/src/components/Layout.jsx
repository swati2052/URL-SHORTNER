import React from "react";
import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useSelector, useDispatch } from "react-redux";
import { logoutSuccess } from "../store/authSlice";

const Layout = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutSuccess());
    navigate({ to: "/login" });
  };
  return (
    <div className="min-h-screen bg-[#f9fafb] font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side: Logo / App Name */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  U
                </div>
                URL Shortener
              </Link>
            </div>

            {/* Right side: Login Link or Logout */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <button 
                  onClick={handleLogout}
                  className="text-sm font-medium bg-red-50 hover:bg-red-100 text-red-600 transition-colors px-4 py-2 rounded-md shadow-sm border border-red-200"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-md"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors px-4 py-2 rounded-md shadow-sm"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex items-center justify-center p-4">
        <div className="w-full max-w-7xl flex justify-center">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
