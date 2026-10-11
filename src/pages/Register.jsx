import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collegesApi } from '../api/endpoints';
import { UserPlus, User, Lock, Mail, AlertCircle, Building, GraduationCap } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student', // student or visitor
    college_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    collegesApi.getAll().then(setColleges).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await register({
        ...formData,
        college_id: formData.college_id ? Number(formData.college_id) : null,
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create Account</h2>
          <p className="text-sm text-slate-500">Join Hostel Hive as a Student or Visitor</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              >
                <option value="student">Student (can pay & apply)</option>
                <option value="visitor">Visitor (browse & review)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                College (Optional)
              </label>
              <select
                value={formData.college_id}
                onChange={(e) => setFormData({ ...formData, college_id: e.target.value })}
                className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              >
                <option value="">None / External</option>
                {colleges.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.name} ({col.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-100 transition duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <GraduationCap className="w-5 h-5" />
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
