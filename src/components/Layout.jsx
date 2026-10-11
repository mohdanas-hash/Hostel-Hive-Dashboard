import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  LayoutDashboard, GraduationCap, Building2, UtensilsCrossed, Coffee, Tags, FileCheck2,
  Newspaper, Star, Scale, Banknote, Users, LogOut, Menu, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { title: 'Overview', items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }] },
  {
    title: 'Operations',
    items: [
      { to: '/admissions', label: 'Admissions', icon: FileCheck2 },
      { to: '/payments', label: 'Payments', icon: Banknote },
      { to: '/users', label: 'Users', icon: Users },
      { to: '/posts', label: 'Daily posts', icon: Newspaper },
      { to: '/reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    title: 'Listings',
    items: [
      { to: '/colleges', label: 'Colleges', icon: GraduationCap },
      { to: '/hostels', label: 'Hostels', icon: Building2 },
      { to: '/messes', label: 'Messes', icon: UtensilsCrossed },
      { to: '/cafeterias', label: 'Cafeterias', icon: Coffee },
      { to: '/amenities', label: 'Amenities', icon: Tags },
    ],
  },
  { title: 'Analytics', items: [{ to: '/insights', label: 'Price insights', icon: Scale }] },
];

function Sidebar({ onNavigate }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      {NAV.map((g) => (
        <div key={g.title}>
          <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{g.title}</p>
          {g.items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition',
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const signOut = () => {
    logout();
    navigate('/login');
  };

  const brand = (
    <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-200 shrink-0">
      <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
        <Building2 className="w-5 h-5" />
      </div>
      <div className="leading-tight">
        <p className="font-bold text-slate-900">Hostel Hive</p>
        <p className="text-[10px] uppercase tracking-wider text-slate-400">Admin console</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen">
        {brand}
        <Sidebar />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col">
            {brand}
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <button className="lg:hidden p-2 -ml-2 text-slate-600 cursor-pointer" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button onClick={signOut} title="Sign out" className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-8 py-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
