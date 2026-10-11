import React, { useState, useEffect } from 'react';
import { hostelsApi, collegesApi, amenitiesApi, admissionsApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import ReviewSection from '../components/ReviewSection';
import {
  Home,
  Plus,
  MapPin,
  Wifi,
  Wind,
  Shield,
  Utensils,
  Star,
  X,
  Edit2,
  Trash2,
  FileCheck2,
  Loader2,
} from 'lucide-react';

export default function Hostels() {
  const { isCentralAdmin, isAuthenticated } = useAuth();
  const [hostels, setHostels] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [amenityCatalog, setAmenityCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    college_id: '',
    city: '',
    location: '', // on_campus | off_campus
    gender: '', // boys | girls | co_ed
    max_rent: '',
    sort: 'rent_asc',
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Review Drawer / Active Target
  const [selectedHostelForReview, setSelectedHostelForReview] = useState(null);

  // Admission Apply State
  const [applyingId, setApplyingId] = useState(null);
  const [applySuccessMessage, setApplySuccessMessage] = useState(null);

  // Form State
  const initialForm = {
    college_id: '',
    name: '',
    location: 'on_campus',
    gender: 'co_ed',
    address: '',
    distance_from_college_km: 0,
    monthly_rent: 6000,
    security_deposit: 2000,
    room_type: 'double',
    total_beds: 100,
    available_beds: 20,
    amenities: [],
    wifi_mbps: 50,
    has_ac: false,
    attached_bathroom: false,
    power_backup: true,
    cctv: true,
    includes_mess: false,
    image_url: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.college_id) params.college_id = Number(filters.college_id);
      if (filters.city) params.city = filters.city;
      if (filters.location) params.location = filters.location;
      if (filters.gender) params.gender = filters.gender;
      if (filters.max_rent) params.max_rent = Number(filters.max_rent);
      if (filters.sort) params.sort = filters.sort;

      const [hostelList, collegeList, amenityList] = await Promise.all([
        hostelsApi.getAll(params),
        collegesApi.getAll(),
        amenitiesApi.getAll('hostel'),
      ]);
      setHostels(hostelList);
      setColleges(collegeList);
      setAmenityCatalog(amenityList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      ...initialForm,
      college_id: colleges[0]?.id || '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (h) => {
    setEditingId(h.id);
    setFormData({
      college_id: h.college_id,
      name: h.name,
      location: h.location,
      gender: h.gender,
      address: h.address || '',
      distance_from_college_km: h.distance_from_college_km || 0,
      monthly_rent: h.monthly_rent,
      security_deposit: h.security_deposit || 0,
      room_type: h.room_type || 'double',
      total_beds: h.total_beds || 0,
      available_beds: h.available_beds || 0,
      amenities: h.amenities || [],
      wifi_mbps: h.wifi_mbps || 0,
      has_ac: h.has_ac || false,
      attached_bathroom: h.attached_bathroom || false,
      power_backup: h.power_backup || false,
      cctv: h.cctv || false,
      includes_mess: h.includes_mess || false,
      image_url: h.image_url || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hostel?')) return;
    try {
      await hostelsApi.delete(id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete hostel');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const payload = {
        ...formData,
        college_id: Number(formData.college_id),
        monthly_rent: Number(formData.monthly_rent),
        security_deposit: Number(formData.security_deposit),
        distance_from_college_km: Number(formData.distance_from_college_km),
        total_beds: Number(formData.total_beds),
        available_beds: Number(formData.available_beds),
        wifi_mbps: formData.wifi_mbps ? Number(formData.wifi_mbps) : null,
        image_url: formData.image_url || null,
      };

      if (editingId) {
        await hostelsApi.update(editingId, payload);
      } else {
        await hostelsApi.create(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save hostel');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyAdmission = async (hostelId) => {
    try {
      setApplyingId(hostelId);
      setApplySuccessMessage(null);
      const app = await admissionsApi.apply(hostelId);
      setApplySuccessMessage(
        `Application created (ID #${app.id}). Navigate to Admissions tab to upload your documents!`
      );
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to apply for admission');
    } finally {
      setApplyingId(null);
    }
  };

  const toggleAmenity = (name) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(name);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== name)
          : [...prev.amenities, name],
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Home className="w-7 h-7 text-indigo-600" />
            Hostels Directory
          </h1>
          <p className="text-sm text-slate-500">
            Compare campus rooms, fees, amenities and apply for admissions
          </p>
        </div>

        {isCentralAdmin && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-100 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Hostel
          </button>
        )}
      </div>

      {applySuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
            <span>{applySuccessMessage}</span>
          </div>
          <button
            onClick={() => setApplySuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">College</label>
          <select
            value={filters.college_id}
            onChange={(e) => setFilters({ ...filters, college_id: e.target.value })}
            className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Colleges</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Location</label>
          <select
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Any Location</option>
            <option value="on_campus">On-Campus</option>
            <option value="off_campus">Off-Campus</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Gender</label>
          <select
            value={filters.gender}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Any Gender</option>
            <option value="boys">Boys</option>
            <option value="girls">Girls</option>
            <option value="co_ed">Co-Ed</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Max Rent (₹)</label>
          <input
            type="number"
            placeholder="e.g. 10000"
            value={filters.max_rent}
            onChange={(e) => setFilters({ ...filters, max_rent: e.target.value })}
            className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Sort By</label>
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="rent_asc">Rent: Low to High</option>
            <option value="rent_desc">Rent: High to Low</option>
            <option value="distance_asc">Nearest Campus</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() =>
              setFilters({
                college_id: '',
                city: '',
                location: '',
                gender: '',
                max_rent: '',
                sort: 'rent_asc',
              })
            }
            className="w-full text-xs py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Hostels Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading hostels...</div>
      ) : hostels.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No hostels match the criteria</h3>
          <p className="text-sm text-slate-400 mt-1">Adjust your filters to see more listings</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostels.map((h) => {
            const college = colleges.find((c) => c.id === h.college_id);
            return (
              <div
                key={h.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-indigo-400 hover:shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  {/* Image banner */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    {h.image_url ? (
                      <img
                        src={h.image_url}
                        alt={h.name}
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <Home className="w-10 h-10" />
                        <span className="text-xs mt-1">No preview image</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase shadow-xs ${
                          h.location === 'on_campus'
                            ? 'bg-blue-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {h.location.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-xs uppercase">
                        {h.gender}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-xl shadow-md text-right">
                      <span className="text-base font-black text-indigo-700">₹{h.monthly_rent}</span>
                      <span className="text-[10px] text-slate-500 ml-1">/mo</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="font-semibold text-slate-500">
                          {college?.name || `College #${h.college_id}`}
                        </span>
                        <span className="font-medium capitalize">{h.room_type} room</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">{h.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {h.address || `${h.distance_from_college_km} km from university`}
                      </p>
                    </div>

                    {/* Infrastructure Highlights */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Wifi className="w-4 h-4 text-indigo-500" />
                        <span>{h.wifi_mbps ? `${h.wifi_mbps} Mbps WiFi` : 'WiFi Included'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Wind className="w-4 h-4 text-cyan-500" />
                        <span>{h.has_ac ? 'AC Equipped' : 'Non-AC'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span>{h.cctv ? 'CCTV Monitored' : 'Security Guard'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Utensils className="w-4 h-4 text-amber-500" />
                        <span>{h.includes_mess ? 'Mess Included' : 'Mess Optional'}</span>
                      </div>
                    </div>

                    {/* Beds & Availability */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Available Beds:{' '}
                        <strong
                          className={h.available_beds > 0 ? 'text-emerald-600' : 'text-red-500'}
                        >
                          {h.available_beds} / {h.total_beds}
                        </strong>
                      </span>
                      {h.security_deposit > 0 && (
                        <span className="text-slate-400">
                          Deposit: <strong>₹{h.security_deposit}</strong>
                        </span>
                      )}
                    </div>

                    {/* Amenities tags */}
                    {h.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {h.amenities.map((am) => (
                          <span
                            key={am}
                            className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                          >
                            {am}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-6 pb-6 pt-2 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setSelectedHostelForReview(
                          selectedHostelForReview?.id === h.id ? null : h
                        )
                      }
                      className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      Reviews
                    </button>

                    {isAuthenticated && (
                      <button
                        onClick={() => handleApplyAdmission(h.id)}
                        disabled={h.available_beds <= 0 || applyingId === h.id}
                        className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-xl transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        {applyingId === h.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileCheck2 className="w-3.5 h-3.5" />
                        )}
                        Apply Admission
                      </button>
                    )}
                  </div>

                  {isCentralAdmin && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenEdit(h)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(h.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}

                  {/* Inline Review Section if active */}
                  {selectedHostelForReview?.id === h.id && (
                    <div className="mt-3 pt-3 border-t border-slate-100 animate-in fade-in">
                      <ReviewSection targetType="hostel" targetId={h.id} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Hostel Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Hostel' : 'Add New Hostel'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    College
                  </label>
                  <select
                    required
                    value={formData.college_id}
                    onChange={(e) => setFormData({ ...formData, college_id: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="">Select College</option>
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Hostel Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tagore Hostel Block B"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Location
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="on_campus">On Campus</option>
                    <option value="off_campus">Off Campus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="boys">Boys</option>
                    <option value="girls">Girls</option>
                    <option value="co_ed">Co-Ed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Room Type
                  </label>
                  <select
                    value={formData.room_type}
                    onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="triple">Triple</option>
                    <option value="dorm">Dormitory</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Monthly Rent (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.monthly_rent}
                    onChange={(e) => setFormData({ ...formData, monthly_rent: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Security Deposit (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.security_deposit}
                    onChange={(e) =>
                      setFormData({ ...formData, security_deposit: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Distance (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distance_from_college_km}
                    onChange={(e) =>
                      setFormData({ ...formData, distance_from_college_km: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Total Beds
                  </label>
                  <input
                    type="number"
                    value={formData.total_beds}
                    onChange={(e) => setFormData({ ...formData, total_beds: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Available Beds
                  </label>
                  <input
                    type="number"
                    value={formData.available_beds}
                    onChange={(e) =>
                      setFormData({ ...formData, available_beds: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Full Address / Campus Sector
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Near North Gate, MANIT Campus"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              {/* Infrastructure checkboxes */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                  Facilities & Specs
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.has_ac}
                      onChange={(e) => setFormData({ ...formData, has_ac: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    Air Conditioning
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.attached_bathroom}
                      onChange={(e) =>
                        setFormData({ ...formData, attached_bathroom: e.target.checked })
                      }
                      className="rounded text-indigo-600"
                    />
                    Attached Bathroom
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.power_backup}
                      onChange={(e) =>
                        setFormData({ ...formData, power_backup: e.target.checked })
                      }
                      className="rounded text-indigo-600"
                    />
                    Power Backup
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cctv}
                      onChange={(e) => setFormData({ ...formData, cctv: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    CCTV Surveillance
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.includes_mess}
                      onChange={(e) =>
                        setFormData({ ...formData, includes_mess: e.target.checked })
                      }
                      className="rounded text-indigo-600"
                    />
                    Mess Included
                  </label>
                </div>
              </div>

              {/* Catalog Amenities */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-2">
                  Catalog Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {amenityCatalog.map((am) => {
                    const isSelected = formData.amenities.includes(am.name);
                    return (
                      <button
                        type="button"
                        key={am.id}
                        onClick={() => toggleAmenity(am.name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {am.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cloudinary Image Upload */}
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                folder="hostels"
                label="Hostel Image (Cloudinary Upload)"
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Update Hostel' : 'Create Hostel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
