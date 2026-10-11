import React from 'react';
import { cafeteriasApi } from '../api/endpoints';
import ListingPage, { LOCATIONS, locationBadge } from '../components/ListingPage';
import { Badge } from '../components/ui';
import { FOOD_TYPES } from './Messes';
import { inr, label } from '../lib/utils';

const config = {
  kind: 'cafeterias',
  title: 'Cafeterias',
  singular: 'cafeteria',
  api: cafeteriasApi,
  amenityCategory: 'cafeteria',
  imageFolder: 'cafeterias',
  defaults: {
    name: '', location: 'off_campus', address: '', distance_from_college_km: 0, food_type: 'both',
    cuisine: '', avg_meal_price: '', min_item_price: '', opens_at: '', closes_at: '',
    hygiene_rating: '', seating_capacity: '', home_delivery: false, amenities: [], image_url: '',
  },
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true, span: 2 },
    { name: 'location', label: 'Location', type: 'select', options: LOCATIONS },
    { name: 'food_type', label: 'Food type', type: 'select', options: FOOD_TYPES },
    { name: 'address', label: 'Address', type: 'text', span: 2 },
    { name: 'cuisine', label: 'Cuisine', type: 'text', hint: 'e.g. Snacks, Thali', span: 2 },
    { name: 'distance_from_college_km', label: 'Distance from college (km)', type: 'number', step: '0.1', required: true },
    { name: 'avg_meal_price', label: 'Avg meal price (₹)', type: 'number', required: true },
    { name: 'min_item_price', label: 'Cheapest item (₹)', type: 'number' },
    { name: 'hygiene_rating', label: 'Hygiene rating (0–5)', type: 'number', step: '0.1' },
    { name: 'opens_at', label: 'Opens at', type: 'time' },
    { name: 'closes_at', label: 'Closes at', type: 'time' },
    { name: 'seating_capacity', label: 'Seating capacity', type: 'number' },
    { name: 'home_delivery', label: 'Home delivery', type: 'checkbox' },
  ],
  validate: (f) => {
    if (!(Number(f.avg_meal_price) > 0)) return 'Average meal price must be greater than 0.';
    if (f.hygiene_rating !== '' && f.hygiene_rating != null && (f.hygiene_rating < 0 || f.hygiene_rating > 5)) return 'Hygiene rating must be between 0 and 5.';
  },
  columns: (collegeName) => [
    {
      key: 'name', header: 'Cafeteria',
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.image_url ? <img src={r.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-slate-100" />}
          <div>
            <p className="font-medium text-slate-900">{r.name}</p>
            <p className="text-xs text-slate-500">{collegeName[r.college_id]}</p>
          </div>
        </div>
      ),
    },
    { key: 'location', header: 'Location', render: locationBadge },
    { key: 'food_type', header: 'Food', render: (r) => <Badge tone={r.food_type === 'veg' ? 'green' : r.food_type === 'non_veg' ? 'red' : 'slate'}>{label(r.food_type)}</Badge> },
    { key: 'hours', header: 'Hours', render: (r) => (r.opens_at && r.closes_at ? `${r.opens_at} – ${r.closes_at}` : '—') },
    { key: 'avg_meal_price', header: 'Avg meal', align: 'right', render: (r) => inr(r.avg_meal_price) },
  ],
};

export default function Cafeterias() {
  return <ListingPage config={config} />;
}
