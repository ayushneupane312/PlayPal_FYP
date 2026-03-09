/*
  PlayPal Navbar (Dark Sporty Theme)
  - Matches Login/Signup dark-green color scheme
  - Responsive with proper "Login" and "Register" buttons
  - Uses Tailwind CSS & Google Fonts (Poppins)
*/

import React, { useState } from "react";
import { Link } from "react-router-dom";
import playpalLogo from "../assets/playpallogo.jpg.png";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const accent = "shadow-[0_0_6px_2px_#22c55e44]"; // Emerald glow

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Tournaments", href: "#" },
    { label: "About Us", href: "#" },
  ];

  return (
    <nav
      className="w-full bg-gray-900 sticky top-0 z-50 shadow-lg"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center cursor-pointer"
        >
          <img
            src={playpalLogo}
            alt="PlayPal logo"
            className="w-auto"
            style={{ height: "72px" }} // slightly larger to better fill navbar
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              to={item.href}
              key={item.label}
              className={`relative text-base font-medium text-gray-200 
                hover:text-emerald-400 transition-all duration-200 group`}
            >
              {item.label}
              <span
                className="absolute left-0 -bottom-1 w-0 h-[2px] bg-emerald-400 rounded-full transition-all duration-300 group-hover:w-full"
              ></span>
            </Link>
          ))}

          {/* Buttons */}
          <div className="flex items-center gap-3 ml-4">
            <Link
              to="/login"
              className="px-4 py-1.5 text-sm font-semibold text-white border border-emerald-500 rounded-lg hover:bg-emerald-600 transition-all duration-200"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
            >
              Register
            </Link>
          </div>
        </div>

        {/* Hamburger Menu */}
        <button
          className="md:hidden flex items-center text-gray-200 hover:text-emerald-400 transition"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden overflow-hidden bg-gray-900 px-6 pb-2 transition-all duration-300 ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {navItems.map((item) => (
          <Link
            to={item.href}
            key={item.label}
            onClick={() => setMobileOpen(false)}
            className={`block text-base font-medium text-gray-200 py-2 border-b border-gray-800 last:border-0 
              hover:text-emerald-400 transition-all duration-200 relative group`}
          >
            {item.label}
            <span
              className="absolute left-0 -bottom-1 w-0 h-[2px] bg-emerald-400 rounded-full transition-all duration-300 group-hover:w-full"
            ></span>
          </Link>
        ))}

        {/* Mobile Buttons */}
        <div className="flex flex-col gap-3 mt-3">
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="block text-center py-2 rounded-lg border border-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all duration-200"
          >
            Login
          </Link>
          <Link
            to="/signup"
            onClick={() => setMobileOpen(false)}
            className="block text-center py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
