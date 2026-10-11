import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomeOverview from './pages/HomeOverview';
import Colleges from './pages/Colleges';
import Hostels from './pages/Hostels';
import Messes from './pages/Messes';
import Cafeterias from './pages/Cafeterias';
import Compare from './pages/Compare';
import Admissions from './pages/Admissions';
import Payments from './pages/Payments';
import Feed from './pages/Feed';
import AmenitiesAdmin from './pages/AmenitiesAdmin';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isCentralAdmin, loading } = useAuth();
  if (loading) return <div className="text-center py-20 text-slate-400">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isCentralAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<HomeOverview />} />
              <Route path="/colleges" element={<Colleges />} />
              <Route path="/hostels" element={<Hostels />} />
              <Route path="/messes" element={<Messes />} />
              <Route path="/cafeterias" element={<Cafeterias />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/feed" element={<Feed />} />

              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Student / User routes */}
              <Route
                path="/admissions"
                element={
                  <ProtectedRoute>
                    <Admissions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <ProtectedRoute>
                    <Payments />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected routes */}
              <Route
                path="/admin/amenities"
                element={
                  <ProtectedRoute adminOnly>
                    <AmenitiesAdmin />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
