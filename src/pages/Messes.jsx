import React from 'react';
import { messesApi } from '../api/endpoints';
import ListingPage, { LOCATIONS, locationBadge } from '../components/ListingPage';
import { Badge } from '../components/ui';
import { inr, label } from '../lib/utils';

export const FOOD_TYPES = [
  { value: 'veg', label: 'Veg' },
  { value: 'non_veg', label: 'Non-veg' },
  { value: 'both', label: 'Both' },
];

const config = {
  kind: 'messes',
  title: 'Messes',
  singular: 'mess',
  api: messesApi,
  amenityCategory: 'mess',
  imageFolder: 'messes',
  defaults: {
    name: '', location: 'off_campus', address: '', distance_from_college_km: 0, food_type: 'both',
    monthly_price: '', price_per_meal: '', meals_per_day: 2, hygiene_rating: '', seating_capacity: '',
    amenities: [], image_url: '',
  },
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true, span: 2 },
    { name: 'location', label: 'Location', type: 'select', options: LOCATIONS },
    { name: 'food_type', label: 'Food type', type: 'select', options: FOOD_TYPES },
    { name: 'address', label: 'Address', type: 'text', span: 2 },
    { name: 'distance_from_college_km', label: 'Distance from college (km)', type: 'number', step: '0.1', required: true },
    { name: 'meals_per_day', label: 'Meals per day', type: 'number', required: true },
    { name: 'monthly_price', label: 'Monthly price (₹)', type: 'number', required: true },
    { name: 'price_per_meal', label: 'Price per meal (₹)', type: 'number', step: '0.5' },
    { name: 'hygiene_rating', label: 'Hygiene rating (0–5)', type: 'number', step: '0.1' },
    { name: 'seating_capacity', label: 'Seating capacity', type: 'number' },
  ],
  validate: (f) => {
    if (!(Number(f.monthly_price) > 0)) return 'Monthly price must be greater than 0.';
    if (f.hygiene_rating !== '' && f.hygiene_rating != null && (f.hygiene_rating < 0 || f.hygiene_rating > 5)) return 'Hygiene rating must be between 0 and 5.';
  },
  columns: (collegeName) => [
    {
      key: 'name', header: 'Mess',
      render: (r) => (
        <div>
          <p className="font-medium text-slate-900">{r.name}</p>
          <p className="text-xs text-slate-500">{collegeName[r.college_id]}</p>
        </div>
      ),
    },
    { key: 'location', header: 'Location', render: locationBadge },
    { key: 'food_type', header: 'Food', render: (r) => <Badge tone={r.food_type === 'veg' ? 'green' : r.food_type === 'non_veg' ? 'red' : 'slate'}>{label(r.food_type)}</Badge> },
    { key: 'monthly_price', header: 'Price / mo', align: 'right', render: (r) => inr(r.monthly_price) },
    { key: 'hygiene_rating', header: 'Hygiene', align: 'right', render: (r) => r.hygiene_rating ?? '—' },
  ],
};

export default function Messes() {
  return <ListingPage config={config} />;
}
