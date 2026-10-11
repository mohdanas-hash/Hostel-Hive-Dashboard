import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  hostelsApi,
  messesApi,
  cafeteriasApi,
  collegesApi,
  postsApi,
} from '../api/endpoints';
import {
  Home,
  UtensilsCrossed,
  Coffee,
  Building,
  Rss,
  FileText,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
} from 'lucide-react';

export default function HomeOverview() {
  const [stats, setStats] = useState({
    colleges: 0,
    hostels: 0,
    messes: 0,
    cafeterias: 0,
    posts: 0,
  });
  const [todayPosts, setTodayPosts] = useState([]);
  const [featuredHostels, setFeaturedHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(false);
        const [colleges, hostels, messes, cafes, posts] = await Promise.all([
          collegesApi.getAll().catch(() => []),
          hostelsApi.getAll().catch(() => []),
          messesApi.getAll().catch(() => []),
          cafeteriasApi.getAll().catch(() => []),
          postsApi.getToday().catch(() => []),
        ]);
        setStats({
          colleges: colleges.length,
          hostels: hostels.length,
          messes: messes.length,
          cafeterias: cafes.length,
          posts: posts.length,
        });
        setTodayPosts(posts.slice(0, 3));
        setFeaturedHostels(hostels.slice(0, 3));
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-8 md:p-12 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold uppercase tracking-wider border border-white/10">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Next-Gen Campus Housing & Dining Engine
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Compare Hostels, Messes & Dining Across Colleges
          </h1>
          <p className="text-indigo-100 text-base md:text-lg leading-relaxed">
            Real side-by-side pricing between on-campus and off-campus housing, daily mess menus, verified student reviews, online admission documents upload & instant payment confirmation.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <Link
              to="/compare"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-indigo-950 font-bold rounded-2xl shadow-lg hover:bg-indigo-50 transition transform hover:-translate-y-0.5"
            >
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Compare On vs Off Campus
            </Link>
            <Link
              to="/hostels"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold rounded-2xl border border-indigo-500/50 transition backdrop-blur-sm"
            >
              <Home className="w-5 h-5" />
              Explore Hostels
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-40 bottom-0 -mb-20 w-80 h-80 bg-violet-500/30 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Colleges Listed', count: stats.colleges, icon: Building, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Hostels', count: stats.hostels, icon: Home, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Mess Services', count: stats.messes, icon: UtensilsCrossed, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Cafeterias', count: stats.cafeterias, icon: Coffee, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: "Today's Updates", count: stats.posts, icon: Rss, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 hover:shadow-md transition"
          >
            <div className={`p-3.5 rounded-2xl ${item.bg} ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">{item.label}</p>
              <p className="text-2xl font-black text-slate-900">{item.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/compare"
          className="group relative bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-indigo-400 hover:shadow-xl transition overflow-hidden flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition">
              Campus Price Differential
            </h3>
            <p className="text-sm text-slate-500">
              Analyze on-campus vs off-campus savings, amenity availability matrices, and city-wide rent charts.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm font-bold text-indigo-600">
            Open Compare Engine <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </Link>

        <Link
          to="/admissions"
          className="group relative bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-amber-400 hover:shadow-xl transition overflow-hidden flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition">
              Online Admissions & KYC
            </h3>
            <p className="text-sm text-slate-500">
              Submit hostel admissions with Aadhaar, PAN, Fee receipt & Passport photo verification before payment.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm font-bold text-amber-600">
            Manage Applications <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </Link>

        <Link
          to="/feed"
          className="group relative bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:border-violet-400 hover:shadow-xl transition overflow-hidden flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
              <Rss className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-violet-600 transition">
              Daily Campus Feed
            </h3>
            <p className="text-sm text-slate-500">
              Central admin notices, today's breakfast/lunch/dinner mess menus, cafeteria specials & hostel notices.
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm font-bold text-violet-600">
            View Live Feed <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </div>
        </Link>
      </div>

      {/* Featured Hostels & Today's Feed Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Featured Hostels */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Home className="w-5 h-5 text-indigo-600" />
              Available Hostels
            </h2>
            <Link to="/hostels" className="text-sm font-semibold text-indigo-600 hover:underline">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {featuredHostels.length === 0 ? (
              <p className="text-sm text-slate-500 bg-white p-6 rounded-2xl border border-slate-200 text-center">
                No hostels added yet.
              </p>
            ) : (
              featuredHostels.map((h) => (
                <div
                  key={h.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-indigo-300 transition flex items-center gap-4"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    {h.image_url ? (
                      <img src={h.image_url} alt={h.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Home className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          h.location === 'on_campus'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {h.location.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-medium capitalize">
                        {h.gender} • {h.room_type}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 truncate mt-1">{h.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {h.address || `${h.distance_from_college_km} km from campus`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-indigo-600">₹{h.monthly_rent}</p>
                    <p className="text-[10px] text-slate-400">/ month</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Rss className="w-5 h-5 text-violet-600" />
              Today's Campus Updates
            </h2>
            <Link to="/feed" className="text-sm font-semibold text-violet-600 hover:underline">
              See feed
            </Link>
          </div>

          <div className="space-y-3">
            {todayPosts.length === 0 ? (
              <p className="text-sm text-slate-500 bg-white p-6 rounded-2xl border border-slate-200 text-center">
                No daily updates posted for today yet.
              </p>
            ) : (
              todayPosts.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-violet-300 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 uppercase">
                      {p.kind.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">{p.post_date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{p.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
