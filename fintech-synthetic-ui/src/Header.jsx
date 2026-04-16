import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";

function Header({ darkMode, setDarkMode, sidebarOpen, setSidebarOpen, activeCategory }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 🔥 close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".profile-menu")) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // 👤 username logic
  const username = user?.displayName || user?.email || "User";
  const initial = username.charAt(0).toUpperCase();

  return (
    <>
      <header
        style={{
          boxShadow:
            darkMode && activeCategory
              ? `0 0 40px ${
                  {
                    "Credit Card Activity": "rgba(59,130,246,0.35)",
                    "Investment Statements": "rgba(16,185,129,0.35)",
                    "Payroll Simulation": "rgba(168,85,247,0.35)",
                    "SaaS Billing": "rgba(234,179,8,0.35)",
                  }[activeCategory] || "rgba(59,130,246,0.25)"
                }`
              : "none",
        }}
        className={`
          fixed top-0 z-50 h-16
          border-b border-slate-200 dark:border-slate-800
          bg-white dark:bg-[#050B1A]
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "left-80 w-[calc(100%-20rem)]" : "left-0 w-full"}
        `}
      >
        <div className="h-full px-6 flex items-center justify-between">

          {/* LEFT */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 rounded-lg flex items-center justify-center
                bg-slate-100 dark:bg-slate-800 border
                hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              ☰
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                🪙
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  Galarix AI
                </div>
                <div className="text-xs tracking-widest text-slate-500 dark:text-slate-300">
                  FINTECH DATA
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">

            {/* DARK MODE */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border hover:scale-105 transition"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            {/* PROFILE */}
            <div className="relative profile-menu">

              {/* CLICK AREA */}
              <div
                onClick={() => setOpenMenu(!openMenu)}
                className="flex items-center gap-3 cursor-pointer hover:scale-105 transition"
              >
                {/* Avatar */}
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="profile"
                    className="w-10 h-10 rounded-full border border-white/20 shadow"
                  />
                ) : (
                  <div className="
                    w-10 h-10 rounded-full
                    bg-gradient-to-r from-red-500 to-pink-500
                    flex items-center justify-center
                    text-white font-semibold
                    shadow
                  ">
                    {initial}
                  </div>
                )}

                {/* Username */}
                <span className="hidden md:block text-sm font-medium text-slate-800 dark:text-slate-200">
                  {username}
                </span>
              </div>

              {/* DROPDOWN */}
              {openMenu && (
                <div className="
                  absolute right-0 mt-3 w-64
                  rounded-xl shadow-xl
                  backdrop-blur-xl
                  bg-white/90 dark:bg-slate-900/90
                  border border-slate-200 dark:border-slate-700
                  z-50
                  text-slate-800 dark:text-slate-200
                  animate-dropdown-in
                  origin-top-right
                ">
                  {/* USER INFO */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      {user?.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt="profile"
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                          {initial}
                        </div>
                      )}

                      <div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-white">
                          {username}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {user?.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MENU */}
                  <div className="py-2 text-sm">

                    <button
                      onClick={() => {
                        navigate("/profile");
                        setOpenMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Profile
                    </button>

                    <button className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                      Settings
                    </button>

                    <button className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                      Help
                    </button>

                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 🔥 LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl w-80">

            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Confirm Logout
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  logout();
                  setShowLogoutModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white"
              >
                Logout
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default Header;