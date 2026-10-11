import React, { useState, useEffect } from 'react';
import { compareApi, collegesApi, hostelsApi, messesApi, cafeteriasApi } from '../api/endpoints';
import {
  GitCompare,
  Building,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

export default function Compare() {
  const [activeTab, setActiveTab] = useState('price_comparison'); // 'price_comparison' | 'side_by_side' | 'city_overview'
  const [colleges, setColleges] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [collegePriceData, setCollegePriceData] = useState(null);

  // City Overview
  const [cityInput, setCityInput] = useState('Bhopal');
  const [cityOverviewData, setCityOverviewData] = useState(null);

  // Side-by-side comparison state
  const [compareType, setCompareType] = useState('hostels'); // 'hostels' | 'messes' | 'cafeterias' | 'colleges'
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sideComparisonResult, setSideComparisonResult] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    collegesApi.getAll().then((data) => {
      setColleges(data);
      if (data.length > 0) {
        setSelectedCollegeId(data[0].id);
      }
    });
  }, []);

  // Fetch College Price Differential (on-campus vs off-campus)
  useEffect(() => {
    if (selectedCollegeId && activeTab === 'price_comparison') {
      setLoading(true);
      compareApi
        .getCollegePrices(selectedCollegeId)
        .then(setCollegePriceData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [selectedCollegeId, activeTab]);

  // Fetch City Overview
  useEffect(() => {
    if (activeTab === 'city_overview' && cityInput) {
      setLoading(true);
      compareApi
        .getCityOverview(cityInput)
        .then(setCityOverviewData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [activeTab, cityInput]);

  // Fetch items for side-by-side picker
  useEffect(() => {
    if (activeTab === 'side_by_side') {
      setSelectedIds([]);
      setSideComparisonResult(null);
      if (compareType === 'hostels') hostelsApi.getAll().then(setAvailableItems);
      if (compareType === 'messes') messesApi.getAll().then(setAvailableItems);
      if (compareType === 'cafeterias') cafeteriasApi.getAll().then(setAvailableItems);
      if (compareType === 'colleges') collegesApi.getAll().then(setAvailableItems);
    }
  }, [activeTab, compareType]);

  const handleRunSideCompare = async () => {
    if (selectedIds.length === 0) return;
    try {
      setLoading(true);
      let res = null;
      if (compareType === 'hostels') res = await compareApi.compareHostels(selectedIds);
      if (compareType === 'messes') res = await compareApi.compareMesses(selectedIds);
      if (compareType === 'cafeterias') res = await compareApi.compareCafeterias(selectedIds);
      if (compareType === 'colleges') res = await compareApi.compareColleges(selectedIds);
      setSideComparisonResult(res);
    } catch (err) {
      alert(err.response?.data?.detail || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectId = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GitCompare className="w-7 h-7 text-indigo-600" />
            Compare & Analytics Engine
          </h1>
          <p className="text-sm text-slate-500">
            Real on-campus vs off-campus price differentials, side-by-side matrices, and city metrics
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('price_comparison')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'price_comparison'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Campus Differential
          </button>
          <button
            onClick={() => setActiveTab('side_by_side')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'side_by_side'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Side-by-Side Matrix
          </button>
          <button
            onClick={() => setActiveTab('city_overview')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'city_overview'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            City Overview
          </button>
        </div>
      </div>

      {/* TAB 1: CAMPUS DIFFERENTIAL (MAIN FEATURE) */}
      {activeTab === 'price_comparison' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Select Campus</h3>
                <p className="text-xs text-slate-500">
                  Compare on-campus hostels against outside private alternatives
                </p>
              </div>
            </div>

            <select
              value={selectedCollegeId}
              onChange={(e) => setSelectedCollegeId(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {colleges.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.name} ({col.city})
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400">Computing price differences...</div>
          ) : collegePriceData ? (
            <div className="space-y-6">
              {/* Summary Hero Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl border border-blue-200 p-6 shadow-xs space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">
                    On-Campus
                  </div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase">Average College Rent</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-blue-700">
                      ₹{collegePriceData.summary?.on_campus_avg_rent?.toFixed(0) || 'N/A'}
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Calculated from all active on-campus halls & dorms.
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-emerald-200 p-6 shadow-xs space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">
                    Off-Campus
                  </div>
                  <h4 className="text-sm font-bold text-slate-500 uppercase">Average Outside Rent</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-700">
                      ₹{collegePriceData.summary?.off_campus_avg_rent?.toFixed(0) || 'N/A'}
                    </span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Calculated from private PGs and hostels within college vicinity.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-900 to-violet-900 text-white rounded-3xl p-6 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-indigo-200 uppercase">Rent Differential</h4>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">
                      ₹{Math.abs(collegePriceData.summary?.rent_difference || 0).toFixed(0)}
                    </span>
                    <span className="text-xs text-indigo-200">
                      {collegePriceData.summary?.rent_difference < 0
                        ? 'Cheaper on-campus'
                        : 'Cheaper outside'}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200">
                    {collegePriceData.summary?.rent_difference < 0
                      ? 'Students save on hostel fees staying inside college campus.'
                      : 'Outside private hostels offer more budget-friendly rates.'}
                  </p>
                </div>
              </div>

              {/* Breakdown by Listings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* On-campus listings */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
                  <h3 className="font-bold text-slate-900 text-lg flex items-center justify-between">
                    <span>On-Campus Hostels ({collegePriceData.on_campus?.length || 0})</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      Inside Campus
                    </span>
                  </h3>

                  <div className="space-y-3">
                    {collegePriceData.on_campus?.length === 0 ? (
                      <p className="text-sm text-slate-400 py-4 text-center">No on-campus listings</p>
                    ) : (
                      collegePriceData.on_campus?.map((h) => (
                        <div
                          key={h.id}
                          className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-sm text-slate-800">{h.name}</p>
                            <p className="text-xs text-slate-500 capitalize">
                              {h.gender} • {h.room_type} room
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-black text-blue-600">₹{h.monthly_rent}</p>
                            <span className="text-[10px] text-slate-400">/mo</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Off-campus listings */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
                  <h3 className="font-bold text-slate-900 text-lg flex items-center justify-between">
                    <span>Off-Campus PGs & Hostels ({collegePriceData.off_campus?.length || 0})</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Outside Area
                    </span>
                  </h3>

                  <div className="space-y-3">
                    {collegePriceData.off_campus?.length === 0 ? (
                      <p className="text-sm text-slate-400 py-4 text-center">No off-campus listings</p>
                    ) : (
                      collegePriceData.off_campus?.map((h) => (
                        <div
                          key={h.id}
                          className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-sm text-slate-800">{h.name}</p>
                            <p className="text-xs text-slate-500">
                              {h.distance_from_college_km} km away • {h.gender}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-black text-emerald-600">₹{h.monthly_rent}</p>
                            <span className="text-[10px] text-slate-400">/mo</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 2: SIDE-BY-SIDE MATRIX */}
      {activeTab === 'side_by_side' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900">Choose Comparison Category</h3>
                <p className="text-xs text-slate-500">
                  Select 2 or more entities to generate a side-by-side spec & amenity matrix
                </p>
              </div>

              <div className="flex gap-2">
                {['hostels', 'messes', 'cafeterias', 'colleges'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setCompareType(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
                      compareType === t
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Selectable checklist */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-bold uppercase text-slate-400 mb-2">
                Available items (Check to include):
              </p>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2">
                {availableItems.map((item) => {
                  const isChecked = selectedIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleSelectId(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                        isChecked
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                          isChecked ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {isChecked && '✓'}
                      </span>
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleRunSideCompare}
                disabled={selectedIds.length < 2 || loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <GitCompare className="w-4 h-4" />
                {loading ? 'Analyzing...' : `Compare Selected (${selectedIds.length})`}
              </button>
            </div>
          </div>

          {/* Comparison Result Table */}
          {sideComparisonResult && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-x-auto p-6 space-y-6">
              <h3 className="font-bold text-lg text-slate-900">Side-by-Side Specifications</h3>

              {/* Items Table */}
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-3 px-4 text-xs font-bold uppercase text-slate-400">Property</th>
                    {(sideComparisonResult.items || sideComparisonResult.colleges || []).map(
                      (item) => (
                        <th key={item.id} className="py-3 px-4 font-bold text-slate-800 text-base">
                          {item.name}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {compareType === 'hostels' && (
                    <>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-500 text-xs">Monthly Rent</td>
                        {sideComparisonResult.items.map((i) => (
                          <td key={i.id} className="py-3 px-4 font-black text-indigo-600">
                            ₹{i.monthly_rent}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-500 text-xs">Location</td>
                        {sideComparisonResult.items.map((i) => (
                          <td key={i.id} className="py-3 px-4 capitalize font-medium text-slate-700">
                            {i.location.replace('_', ' ')}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-500 text-xs">Room Type</td>
                        {sideComparisonResult.items.map((i) => (
                          <td key={i.id} className="py-3 px-4 capitalize text-slate-700">
                            {i.room_type}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-500 text-xs">Available Beds</td>
                        {sideComparisonResult.items.map((i) => (
                          <td key={i.id} className="py-3 px-4 text-slate-700">
                            {i.available_beds} / {i.total_beds}
                          </td>
                        ))}
                      </tr>
                    </>
                  )}

                  {compareType === 'messes' && (
                    <>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-500 text-xs">Monthly Price</td>
                        {sideComparisonResult.items.map((i) => (
                          <td key={i.id} className="py-3 px-4 font-black text-amber-600">
                            ₹{i.monthly_price}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-500 text-xs">Diet / Food</td>
                        {sideComparisonResult.items.map((i) => (
                          <td key={i.id} className="py-3 px-4 capitalize text-slate-700">
                            {i.food_type}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-semibold text-slate-500 text-xs">Meals / Day</td>
                        {sideComparisonResult.items.map((i) => (
                          <td key={i.id} className="py-3 px-4 text-slate-700 font-semibold">
                            {i.meals_per_day}
                          </td>
                        ))}
                      </tr>
                    </>
                  )}
                </tbody>
              </table>

              {/* Amenity Matrix */}
              {sideComparisonResult.amenity_matrix && (
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-bold uppercase text-slate-500 mb-3">Amenity Availability</h4>
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="py-2 px-4 text-xs font-bold uppercase text-slate-400">Amenity</th>
                        {sideComparisonResult.items.map((item) => (
                          <th key={item.id} className="py-2 px-4 font-semibold text-slate-700 text-xs">
                            {item.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.entries(sideComparisonResult.amenity_matrix).map(([amenity, hasMap]) => (
                        <tr key={amenity}>
                          <td className="py-2 px-4 font-medium text-slate-700 capitalize text-xs">
                            {amenity}
                          </td>
                          {sideComparisonResult.items.map((item) => {
                            const hasIt = hasMap[item.id];
                            return (
                              <td key={item.id} className="py-2 px-4">
                                {hasIt ? (
                                  <span className="inline-flex items-center text-emerald-600 font-bold text-xs">
                                    <Check className="w-4 h-4 mr-1" /> Yes
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-slate-300 text-xs">
                                    <X className="w-4 h-4 mr-1" /> No
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CITY OVERVIEW */}
      {activeTab === 'city_overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Enter City Name
              </label>
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="e.g. Bhopal"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <button
              onClick={() => {
                setLoading(true);
                compareApi
                  .getCityOverview(cityInput)
                  .then(setCityOverviewData)
                  .finally(() => setLoading(false));
              }}
              className="mt-5 px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-md hover:bg-indigo-700 transition"
            >
              Analyze City
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400">Loading city overview...</div>
          ) : cityOverviewData ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              <h3 className="font-bold text-lg text-slate-900">
                City Housing Summary for "{cityOverviewData.city}"
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cityOverviewData.colleges?.map((c) => (
                  <div
                    key={c.college_id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <h4 className="font-bold text-slate-900">{c.college_name}</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">On-Campus Avg Rent:</span>
                        <strong className="text-blue-700">
                          {c.on_campus_avg ? `₹${c.on_campus_avg.toFixed(0)}` : 'None'}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Off-Campus Avg Rent:</span>
                        <strong className="text-emerald-700">
                          {c.off_campus_avg ? `₹${c.off_campus_avg.toFixed(0)}` : 'None'}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
