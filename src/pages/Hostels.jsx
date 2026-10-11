import React from 'react';
import { hostelsApi } from '../api/endpoints';
import ListingPage, { LOCATIONS, locationBadge } from '../components/ListingPage';
import { Badge } from '../components/ui';
import { inr, label } from '../lib/utils';

const config = {
  kind: 'hostels',
  title: 'Hostels',
  singular: 'hostel',
  api: hostelsApi,
  amenityCategory: 'hostel',
  imageFolder: 'hostels',
  defaults: {
    name: '', location: 'off_campus', gender: 'co_ed', address: '', distance_from_college_km: 0,
    monthly_rent: '', security_deposit: 0, room_type: 'double', total_beds: 0, available_beds: 0,
    wifi_mbps: '', has_ac: false, attached_bathroom: false, power_backup: false, cctv: false,
    includes_mess: false, amenities: [], image_url: '',
  },
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true, span: 2 },
    { name: 'location', label: 'Location', type: 'select', options: LOCATIONS },
    {
      name: 'gender', label: 'Gender', type: 'select',
      options: [{ value: 'boys', label: 'Boys' }, { value: 'girls', label: 'Girls' }, { value: 'co_ed', label: 'Co-ed' }],
    },
    { name: 'address', label: 'Address', type: 'text', span: 2 },
    { name: 'distance_from_college_km', label: 'Distance from college (km)', type: 'number', step: '0.1', required: true },
    { name: 'room_type', label: 'Room type', type: 'text', hint: 'single / double / triple / dorm' },
    { name: 'monthly_rent', label: 'Monthly rent (₹)', type: 'number', required: true },
    { name: 'security_deposit', label: 'Security deposit (₹)', type: 'number', required: true },
    { name: 'total_beds', label: 'Total beds', type: 'number', required: true },
    { name: 'available_beds', label: 'Available beds', type: 'number', required: true },
    { name: 'wifi_mbps', label: 'WiFi speed (Mbps)', type: 'number' },
    { name: 'has_ac', label: 'Air conditioning', type: 'checkbox' },
    { name: 'attached_bathroom', label: 'Attached bathroom', type: 'checkbox' },
    { name: 'power_backup', label: 'Power backup', type: 'checkbox' },
    { name: 'cctv', label: 'CCTV', type: 'checkbox' },
    { name: 'includes_mess', label: 'Mess included in rent', type: 'checkbox' },
  ],
  validate: (f) => {
    if (!(Number(f.monthly_rent) > 0)) return 'Monthly rent must be greater than 0.';
    if (Number(f.available_beds) > Number(f.total_beds)) return 'Available beds cannot exceed total beds.';
  },
  columns: (collegeName) => [
    {
      key: 'name', header: 'Hostel',
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
    { key: 'gender', header: 'Gender', render: (r) => <span className="capitalize">{label(r.gender)}</span> },
    { key: 'monthly_rent', header: 'Rent / mo', align: 'right', render: (r) => inr(r.monthly_rent) },
    {
      key: 'beds', header: 'Beds free', align: 'right',
      render: (r) => <Badge tone={r.available_beds === 0 ? 'red' : r.available_beds <= 3 ? 'amber' : 'green'}>{r.available_beds} / {r.total_beds}</Badge>,
    },
  ],
};

export default function Hostels() {
  return <ListingPage config={config} />;
}
