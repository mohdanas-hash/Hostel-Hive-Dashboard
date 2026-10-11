import React, { useState, useEffect } from 'react';
import { collegesApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { Building, MapPin, Plus, Search, Shield, X, Loader2 } from 'lucide-react';

export default function Colleges() {
  const { isCentralAdmin } = useAuth();
  const [colleges, setColleges] = useState([]);
  const [cityFilter, setCityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    is_central: false,
  });

  const loadColleges = async () => {
    try {
      setLoading(true);
      const data = await collegesApi.getAll(cityFilter);
      setColleges(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColleges();
  }, [cityFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await collegesApi.create(formData);
      setShowAddModal(false);
      setFormData({ name: '', city: '', address: '', is_central: false });
      await loadColleges();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create college');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building className="w-7 h-7 text-indigo-600" />
            Participating Colleges
          </h1>
          <p className="text-sm text-slate-500">
            Browse registered institutions or filter by university campus city
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by city..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
            />
          </div>

          {isCentralAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add College
            </button>
          )}
        </div>
      </div>

      {/* College List Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading colleges...</div>
      ) : colleges.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Building className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No colleges found</h3>
          <p className="text-sm text-slate-400 mt-1">Try changing your city search filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colleges.map((col) => (
            <div
              key={col.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-indigo-400 hover:shadow-lg transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                    ID #{col.id}
                  </span>
                  {col.is_central && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
                      <Shield className="w-3 h-3" /> Central College
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">{col.name}</h3>

                <p className="text-sm text-slate-500 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {col.city}
                    {col.address ? ` • ${col.address}` : ''}
                  </span>
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Integrated campus</span>
                <span className="font-semibold text-indigo-600">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add College Modal (Admin Only) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Add New College</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl">{error}</div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  College Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MANIT Bhopal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  City
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bhopal"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Campus location or road address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_central"
                  checked={formData.is_central}
                  onChange={(e) => setFormData({ ...formData, is_central: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="is_central" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  Mark as Central College Hub
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save College
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
