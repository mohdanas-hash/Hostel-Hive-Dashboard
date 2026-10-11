import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { Spinner } from './components/ui';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Admissions from './pages/Admissions';
import Posts from './pages/Posts';
import Reviews from './pages/Reviews';
import Payments from './pages/Payments';
import Users from './pages/Users';
import Colleges from './pages/Colleges';
import Hostels from './pages/Hostels';
import Messes from './pages/Messes';
import Cafeterias from './pages/Cafeterias';
import Amenities from './pages/Amenities';
import Insights from './pages/Insights';

function RequireAdmin({ children }) {
  const { isAuthenticated, isCentralAdmin, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!isAuthenticated || !isCentralAdmin) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAdmin>
                <Layout />
              </RequireAdmin>
            }
          >
            <Route path="/" element={<Overview />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/users" element={<Users />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/colleges" element={<Colleges />} />
            <Route path="/hostels" element={<Hostels />} />
            <Route path="/messes" element={<Messes />} />
            <Route path="/cafeterias" element={<Cafeterias />} />
            <Route path="/amenities" element={<Amenities />} />
            <Route path="/insights" element={<Insights />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
