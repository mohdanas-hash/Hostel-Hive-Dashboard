import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Building,
  UtensilsCrossed,
  Coffee,
  GitCompare,
  CreditCard,
  FileText,
  Rss,
  Tags,
  LogOut,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isCentralAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <NavLink to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <Building className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent">
                  Hostel Hive
                </span>
                <span className="text-[10px] text-slate-600 font-medium -mt-1 tracking-wider uppercase">
                  Campus Living Hub
                </span>
              </div>
            </NavLink>

            {/* Main Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <NavLink to="/colleges" className={navLinkClass}>
                <Building className="w-4 h-4" />
                Colleges
              </NavLink>
              <NavLink to="/hostels" className={navLinkClass}>
                <Home className="w-4 h-4" />
                Hostels
              </NavLink>
              <NavLink to="/messes" className={navLinkClass}>
                <UtensilsCrossed className="w-4 h-4" />
                Messes
              </NavLink>
              <NavLink to="/cafeterias" className={navLinkClass}>
                <Coffee className="w-4 h-4" />
                Cafeterias
              </NavLink>
              <NavLink to="/compare" className={navLinkClass}>
                <GitCompare className="w-4 h-4" />
                Compare & Insights
              </NavLink>
              <NavLink to="/feed" className={navLinkClass}>
                <Rss className="w-4 h-4" />
                Daily Feed
              </NavLink>
            </nav>
          </div>

          {/* User actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/admissions"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                      isActive
                        ? 'bg-amber-100 text-amber-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <FileText className="w-4 h-4 text-amber-600" />
                  Admissions
                </NavLink>

                <NavLink
                  to="/payments"
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Payments
                </NavLink>

                {isCentralAdmin && (
                  <NavLink
                    to="/admin/amenities"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800 flex items-center gap-1 hover:bg-purple-200 transition"
                  >
                    <Tags className="w-3.5 h-3.5" />
                    Amenities
                  </NavLink>
                )}

                <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                <div className="flex items-center gap-2">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {user?.name || 'User'}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isCentralAdmin
                          ? 'text-purple-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {user?.role?.replace('_', ' ')}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition"
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
                >
                  Sign up
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
