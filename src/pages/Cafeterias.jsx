import React, { useState, useEffect } from 'react';
import { cafeteriasApi, collegesApi, amenitiesApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import ReviewSection from '../components/ReviewSection';
import {
  Coffee,
  Plus,
  MapPin,
  Clock,
  Bike,
  Star,
  X,
  Edit2,
  Trash2,
  Loader2,
} from 'lucide-react';

export default function Cafeterias() {
  const { isCentralAdmin } = useAuth();
  const [cafeterias, setCafeterias] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [amenityCatalog, setAmenityCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    college_id: '',
    city: '',
    location: '',
    food_type: '',
    max_meal_price: '',
    home_delivery: '',
    sort: 'price_asc',
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Review Drawer
  const [selectedCafeForReview, setSelectedCafeForReview] = useState(null);

  const initialForm = {
    college_id: '',
    name: '',
    location: 'on_campus',
    food_type: 'both',
    cuisine: 'Fast Food & Beverages',
    address: '',
    distance_from_college_km: 0,
    avg_meal_price: 120,
    min_item_price: 30,
    opens_at: '08:00',
    closes_at: '22:00',
    hygiene_rating: 4.2,
    seating_capacity: 50,
    home_delivery: true,
    amenities: [],
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
      if (filters.food_type) params.food_type = filters.food_type;
      if (filters.max_meal_price) params.max_meal_price = Number(filters.max_meal_price);
      if (filters.home_delivery !== '') params.home_delivery = filters.home_delivery === 'true';
      if (filters.sort) params.sort = filters.sort;

      const [cafeList, collegeList, amenityList] = await Promise.all([
        cafeteriasApi.getAll(params),
        collegesApi.getAll(),
        amenitiesApi.getAll('cafeteria'),
      ]);
      setCafeterias(cafeList);
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

  const handleOpenEdit = (c) => {
    setEditingId(c.id);
    setFormData({
      college_id: c.college_id,
      name: c.name,
      location: c.location,
      food_type: c.food_type,
      cuisine: c.cuisine || '',
      address: c.address || '',
      distance_from_college_km: c.distance_from_college_km || 0,
      avg_meal_price: c.avg_meal_price,
      min_item_price: c.min_item_price || 0,
      opens_at: c.opens_at || '',
      closes_at: c.closes_at || '',
      hygiene_rating: c.hygiene_rating || 4.2,
      seating_capacity: c.seating_capacity || 0,
      home_delivery: c.home_delivery || false,
      amenities: c.amenities || [],
      image_url: c.image_url || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this cafeteria?')) return;
    try {
      await cafeteriasApi.delete(id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete cafeteria');
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
        avg_meal_price: Number(formData.avg_meal_price),
        min_item_price: formData.min_item_price ? Number(formData.min_item_price) : null,
        hygiene_rating: formData.hygiene_rating ? Number(formData.hygiene_rating) : null,
        seating_capacity: formData.seating_capacity ? Number(formData.seating_capacity) : null,
        distance_from_college_km: Number(formData.distance_from_college_km),
        opens_at: formData.opens_at || null,
        closes_at: formData.closes_at || null,
        image_url: formData.image_url || null,
      };

      if (editingId) {
        await cafeteriasApi.update(editingId, payload);
      } else {
        await cafeteriasApi.create(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save cafeteria');
    } finally {
      setSubmitting(false);
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
            <Coffee className="w-7 h-7 text-rose-600" />
            Cafeterias & Canteens
          </h1>
          <p className="text-sm text-slate-500">
            Compare campus cafes, cuisines, opening hours, average meal costs & room delivery
          </p>
        </div>

        {isCentralAdmin && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 shadow-md shadow-rose-100 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Cafeteria
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">College</label>
          <select
            value={filters.college_id}
            onChange={(e) => setFilters({ ...filters, college_id: e.target.value })}
            className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg"
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
          <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Diet Type</label>
          <select
            value={filters.food_type}
            onChange={(e) => setFilters({ ...filters, food_type: e.target.value })}
            className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg"
          >
            <option value="">All Diets</option>
            <option value="veg">Pure Veg</option>
            <option value="non_veg">Non-Veg</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Location</label>
          <select
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg"
          >
            <option value="">Any Location</option>
            <option value="on_campus">On-Campus</option>
            <option value="off_campus">Off-Campus</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Home Delivery</label>
          <select
            value={filters.home_delivery}
            onChange={(e) => setFilters({ ...filters, home_delivery: e.target.value })}
            className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg"
          >
            <option value="">Any Delivery</option>
            <option value="true">Offers Delivery</option>
            <option value="false">Dine-in Only</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Max Meal (₹)</label>
          <input
            type="number"
            placeholder="e.g. 150"
            value={filters.max_meal_price}
            onChange={(e) => setFilters({ ...filters, max_meal_price: e.target.value })}
            className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={() =>
              setFilters({
                college_id: '',
                city: '',
                location: '',
                food_type: '',
                max_meal_price: '',
                home_delivery: '',
                sort: 'price_asc',
              })
            }
            className="w-full text-xs py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Cafeterias Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading cafeterias...</div>
      ) : cafeterias.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <Coffee className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No cafeterias found</h3>
          <p className="text-sm text-slate-400 mt-1">Try adjusting the filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cafeterias.map((c) => {
            const college = colleges.find((col) => col.id === c.college_id);
            return (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-rose-400 hover:shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    {c.image_url ? (
                      <img
                        src={c.image_url}
                        alt={c.name}
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <Coffee className="w-10 h-10" />
                        <span className="text-xs mt-1">No cafeteria photo</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase shadow-xs ${
                          c.location === 'on_campus'
                            ? 'bg-blue-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {c.location.replace('_', ' ')}
                      </span>
                      {c.home_delivery && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-700 text-white backdrop-blur-xs flex items-center gap-1">
                          <Bike className="w-3 h-3" /> Delivery
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-xl shadow-md text-right">
                      <span className="text-base font-black text-rose-600">₹{c.avg_meal_price}</span>
                      <span className="text-[10px] text-slate-500 ml-1">avg / meal</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="font-semibold text-slate-500">
                          {college?.name || `College #${c.college_id}`}
                        </span>
                        <span className="font-medium text-rose-600 font-semibold">{c.cuisine}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">{c.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {c.address || `${c.distance_from_college_km} km away`}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {c.opens_at && c.closes_at ? `${c.opens_at} - ${c.closes_at}` : 'All day'}
                        </span>
                      </div>
                      <div>
                        Hygiene Rating:{' '}
                        <strong className="text-slate-800">
                          {c.hygiene_rating ? `${c.hygiene_rating} / 5.0` : 'Unrated'}
                        </strong>
                      </div>
                      {c.min_item_price > 0 && (
                        <div>
                          Starting at: <strong className="text-slate-800">₹{c.min_item_price}</strong>
                        </div>
                      )}
                      {c.seating_capacity > 0 && (
                        <div>
                          Capacity: <strong className="text-slate-800">{c.seating_capacity} seats</strong>
                        </div>
                      )}
                    </div>

                    {c.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {c.amenities.map((am) => (
                          <span
                            key={am}
                            className="text-[10px] bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-md font-medium"
                          >
                            {am}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex flex-col gap-2">
                  <button
                    onClick={() =>
                      setSelectedCafeForReview(selectedCafeForReview?.id === c.id ? null : c)
                    }
                    className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    Reviews & Rating
                  </button>

                  {isCentralAdmin && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}

                  {selectedCafeForReview?.id === c.id && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <ReviewSection targetType="cafeteria" targetId={c.id} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Cafeteria Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Cafeteria' : 'Add Cafeteria'}
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
                    {colleges.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Cafeteria Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Campus Brew & Bites"
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
                    Diet Type
                  </label>
                  <select
                    value={formData.food_type}
                    onChange={(e) => setFormData({ ...formData, food_type: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="veg">Veg</option>
                    <option value="non_veg">Non-Veg</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Cuisine
                  </label>
                  <input
                    type="text"
                    value={formData.cuisine}
                    onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                    placeholder="e.g. South Indian, Cafe"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Avg Meal Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.avg_meal_price}
                    onChange={(e) => setFormData({ ...formData, avg_meal_price: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Min Item Price (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.min_item_price}
                    onChange={(e) =>
                      setFormData({ ...formData, min_item_price: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Opens At (HH:MM)
                  </label>
                  <input
                    type="text"
                    placeholder="08:00"
                    pattern="^([01]\d|2[0-3]):[0-5]\d$"
                    value={formData.opens_at}
                    onChange={(e) => setFormData({ ...formData, opens_at: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Closes At (HH:MM)
                  </label>
                  <input
                    type="text"
                    placeholder="22:00"
                    pattern="^([01]\d|2[0-3]):[0-5]\d$"
                    value={formData.closes_at}
                    onChange={(e) => setFormData({ ...formData, closes_at: e.target.value })}
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
                    Hygiene Rating
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.hygiene_rating}
                    onChange={(e) =>
                      setFormData({ ...formData, hygiene_rating: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    value={formData.seating_capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, seating_capacity: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="home_delivery"
                  checked={formData.home_delivery}
                  onChange={(e) =>
                    setFormData({ ...formData, home_delivery: e.target.checked })
                  }
                  className="rounded text-rose-600"
                />
                <label htmlFor="home_delivery" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  Offers Home / Hostel Room Delivery
                </label>
              </div>

              {/* Amenities */}
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
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {am.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Image Upload */}
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                folder="cafeterias"
                label="Cafeteria Image (Cloudinary)"
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
                  className="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Update Cafeteria' : 'Create Cafeteria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
