import React, { useState, useEffect } from 'react';
import { amenitiesApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { Tags, Plus, Trash2, ShieldAlert } from 'lucide-react';

export default function AmenitiesAdmin() {
  const { isCentralAdmin } = useAuth();
  const [amenities, setAmenities] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('hostel');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadAmenities = async () => {
    try {
      setLoading(true);
      const data = await amenitiesApi.getAll(activeCategory);
      setAmenities(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAmenities();
  }, [activeCategory]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setSubmitting(true);
      setError(null);
      await amenitiesApi.create({
        name: newName.trim().toLowerCase(),
        category: newCategory,
      });
      setNewName('');
      await loadAmenities();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add amenity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this amenity from the catalog?')) return;
    try {
      await amenitiesApi.delete(id);
      await loadAmenities();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete amenity');
    }
  };

  if (!isCentralAdmin) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center space-y-2">
        <ShieldAlert className="w-10 h-10 text-red-600 mx-auto" />
        <h3 className="text-lg font-bold text-red-900">Access Restricted</h3>
        <p className="text-sm text-red-700">Only Central Admin can manage the global amenity catalog.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Tags className="w-7 h-7 text-purple-600" />
          Global Amenity Catalog Management
        </h1>
        <p className="text-sm text-slate-500">
          Admin catalog for standardized facility tags across Hostels, Messes and Cafeterias
        </p>
      </div>

      {/* Add Amenity Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Add New Facility Tag
        </h3>
        {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-xl">{error}</p>}
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="e.g. ro_water, laundry, gym, high_speed_wifi"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
          >
            <option value="hostel">Hostel Amenity</option>
            <option value="mess">Mess Amenity</option>
            <option value="cafeteria">Cafeteria Amenity</option>
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Amenity
          </button>
        </form>
      </div>

      {/* Category filter buttons */}
      <div className="flex gap-2">
        {[
          { label: 'All Catalog', cat: '' },
          { label: 'Hostel Amenities', cat: 'hostel' },
          { label: 'Mess Amenities', cat: 'mess' },
          { label: 'Cafeteria Amenities', cat: 'cafeteria' },
        ].map((btn) => (
          <button
            key={btn.cat}
            onClick={() => setActiveCategory(btn.cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeCategory === btn.cat
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading amenities...</div>
      ) : amenities.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 text-slate-400">
          No amenities found in this category
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {amenities.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between group hover:border-purple-300 transition"
            >
              <div>
                <p className="font-bold text-xs text-slate-800">{item.name}</p>
                <span className="text-[10px] text-purple-600 font-semibold uppercase">
                  {item.category}
                </span>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
