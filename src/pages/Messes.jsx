import React, { useState, useEffect } from 'react';
import { messesApi, collegesApi, amenitiesApi, paymentsApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import ReviewSection from '../components/ReviewSection';
import {
  UtensilsCrossed,
  Plus,
  MapPin,
  Star,
  X,
  Edit2,
  Trash2,
  CreditCard,
  Loader2,
  Leaf,
  Drumstick,
} from 'lucide-react';

export default function Messes() {
  const { isCentralAdmin, isAuthenticated } = useAuth();
  const [messes, setMesses] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [amenityCatalog, setAmenityCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    college_id: '',
    city: '',
    location: '',
    food_type: '',
    max_price: '',
    sort: 'price_asc',
  });

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Reviews Drawer
  const [selectedMessForReview, setSelectedMessForReview] = useState(null);

  // Mess Payment Modal
  const [payMess, setPayMess] = useState(null);
  const [payMonths, setPayMonths] = useState(1);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  const initialForm = {
    college_id: '',
    name: '',
    location: 'on_campus',
    food_type: 'both',
    address: '',
    distance_from_college_km: 0,
    monthly_price: 3200,
    price_per_meal: 60,
    meals_per_day: 3,
    hygiene_rating: 4.5,
    seating_capacity: 150,
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
      if (filters.max_price) params.max_price = Number(filters.max_price);
      if (filters.sort) params.sort = filters.sort;

      const [messList, collegeList, amenityList] = await Promise.all([
        messesApi.getAll(params),
        collegesApi.getAll(),
        amenitiesApi.getAll('mess'),
      ]);
      setMesses(messList);
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

  const handleOpenEdit = (m) => {
    setEditingId(m.id);
    setFormData({
      college_id: m.college_id,
      name: m.name,
      location: m.location,
      food_type: m.food_type,
      address: m.address || '',
      distance_from_college_km: m.distance_from_college_km || 0,
      monthly_price: m.monthly_price,
      price_per_meal: m.price_per_meal || 0,
      meals_per_day: m.meals_per_day || 2,
      hygiene_rating: m.hygiene_rating || 4.5,
      seating_capacity: m.seating_capacity || 0,
      amenities: m.amenities || [],
      image_url: m.image_url || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this mess service?')) return;
    try {
      await messesApi.delete(id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete mess');
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
        monthly_price: Number(formData.monthly_price),
        price_per_meal: formData.price_per_meal ? Number(formData.price_per_meal) : null,
        meals_per_day: Number(formData.meals_per_day),
        hygiene_rating: formData.hygiene_rating ? Number(formData.hygiene_rating) : null,
        seating_capacity: formData.seating_capacity ? Number(formData.seating_capacity) : null,
        distance_from_college_km: Number(formData.distance_from_college_km),
        image_url: formData.image_url || null,
      };

      if (editingId) {
        await messesApi.update(editingId, payload);
      } else {
        await messesApi.create(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save mess');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayMessSubscription = async () => {
    if (!payMess) return;
    try {
      setPaying(true);
      // Create payment order
      const order = await paymentsApi.create({
        kind: 'mess_fee',
        mess_id: payMess.id,
        months: Number(payMonths),
      });

      // Confirm mock payment automatically
      await paymentsApi.confirm(order.id, `pay_mock_${Date.now()}`, true);

      setPaymentSuccess(`Successfully paid ₹${order.amount} for ${payMess.name}! Order #${order.id}`);
      setPayMess(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to complete mess payment');
    } finally {
      setPaying(false);
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
            <UtensilsCrossed className="w-7 h-7 text-amber-600" />
            Mess & Dining Services
          </h1>
          <p className="text-sm text-slate-500">
            Compare monthly subscription fees, meal frequency, dietary plans and pay mess fees
          </p>
        </div>

        {isCentralAdmin && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 shadow-md shadow-amber-100 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Mess
          </button>
        )}
      </div>

      {paymentSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <span>{paymentSuccess}</span>
          </div>
          <button
            onClick={() => setPaymentSuccess(null)}
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
            <option value="both">Both (Veg & Non-Veg)</option>
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
          <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Max Price (₹)</label>
          <input
            type="number"
            placeholder="e.g. 4000"
            value={filters.max_price}
            onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
            className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Sort By</label>
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg"
          >
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
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
                food_type: '',
                max_price: '',
                sort: 'price_asc',
              })
            }
            className="w-full text-xs py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Messes Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading mess services...</div>
      ) : messes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No mess services found</h3>
          <p className="text-sm text-slate-400 mt-1">Try adjusting dietary or price filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {messes.map((m) => {
            const college = colleges.find((c) => c.id === m.college_id);
            return (
              <div
                key={m.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-amber-400 hover:shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    {m.image_url ? (
                      <img
                        src={m.image_url}
                        alt={m.name}
                        className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <UtensilsCrossed className="w-10 h-10" />
                        <span className="text-xs mt-1">No mess photo</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase shadow-xs ${
                          m.location === 'on_campus'
                            ? 'bg-blue-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {m.location.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-xs uppercase flex items-center gap-1">
                        {m.food_type === 'veg' && <Leaf className="w-3 h-3 text-green-400" />}
                        {m.food_type === 'non_veg' && <Drumstick className="w-3 h-3 text-red-400" />}
                        {m.food_type}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-xl shadow-md text-right">
                      <span className="text-base font-black text-amber-700">₹{m.monthly_price}</span>
                      <span className="text-[10px] text-slate-500 ml-1">/mo</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span className="font-semibold text-slate-500">
                          {college?.name || `College #${m.college_id}`}
                        </span>
                        <span className="font-medium text-amber-600 font-semibold">
                          {m.meals_per_day} Meals / Day
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">{m.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {m.address || `${m.distance_from_college_km} km away`}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100 text-slate-600">
                      <div>
                        Hygiene Rating:{' '}
                        <strong className="text-slate-800">
                          {m.hygiene_rating ? `${m.hygiene_rating} / 5.0` : 'Unrated'}
                        </strong>
                      </div>
                      <div>
                        Per Meal:{' '}
                        <strong className="text-slate-800">
                          {m.price_per_meal ? `₹${m.price_per_meal}` : 'Included in plan'}
                        </strong>
                      </div>
                      {m.seating_capacity > 0 && (
                        <div className="col-span-2">
                          Seating Capacity: <strong className="text-slate-800">{m.seating_capacity} Seats</strong>
                        </div>
                      )}
                    </div>

                    {/* Amenities */}
                    {m.amenities?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {m.amenities.map((am) => (
                          <span
                            key={am}
                            className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-medium"
                          >
                            {am}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 pt-2 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setSelectedMessForReview(selectedMessForReview?.id === m.id ? null : m)
                      }
                      className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500" />
                      Reviews
                    </button>

                    {isAuthenticated && (
                      <button
                        onClick={() => {
                          setPayMess(m);
                          setPayMonths(1);
                        }}
                        className="flex-1 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Pay Mess Fee
                      </button>
                    )}
                  </div>

                  {isCentralAdmin && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="text-xs text-amber-600 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}

                  {selectedMessForReview?.id === m.id && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <ReviewSection targetType="mess" targetId={m.id} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pay Mess Modal */}
      {payMess && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                Pay Mess Subscription
              </h3>
              <button onClick={() => setPayMess(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-200">
              <p className="text-sm font-bold text-slate-900">{payMess.name}</p>
              <p className="text-xs text-slate-500">Monthly Rate: ₹{payMess.monthly_price}</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Duration (Months)
              </label>
              <select
                value={payMonths}
                onChange={(e) => setPayMonths(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                {[1, 2, 3, 6, 12].map((num) => (
                  <option key={num} value={num}>
                    {num} Month{num > 1 ? 's' : ''} (₹{payMess.monthly_price * num})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Total payable</span>
                <p className="text-xl font-black text-amber-600">₹{payMess.monthly_price * payMonths}</p>
              </div>
              <button
                onClick={handlePayMessSubscription}
                disabled={paying}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {paying && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Mess Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Mess Service' : 'Add Mess Service'}
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
                    Mess Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Annapurna Central Mess"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    Food Type
                  </label>
                  <select
                    value={formData.food_type}
                    onChange={(e) => setFormData({ ...formData, food_type: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="non_veg">Non-Vegetarian</option>
                    <option value="both">Both Veg & Non-Veg</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Monthly Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.monthly_price}
                    onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Price / Meal (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.price_per_meal}
                    onChange={(e) =>
                      setFormData({ ...formData, price_per_meal: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Meals / Day
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.meals_per_day}
                    onChange={(e) => setFormData({ ...formData, meals_per_day: e.target.value })}
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
                    Hygiene (0-5)
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

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Near Student Activity Center"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
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
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {am.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cloudinary Image */}
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                folder="messes"
                label="Mess Image (Cloudinary)"
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
                  className="px-5 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Update Mess' : 'Create Mess'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
