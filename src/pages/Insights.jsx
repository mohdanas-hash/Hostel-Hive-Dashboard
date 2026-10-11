import React, { useState } from 'react';
import { collegesApi, compareApi } from '../api/endpoints';
import { Badge, Bar, Card, EmptyState, ErrorBox, Field, PageHeader, Select, Spinner } from '../components/ui';
import { inr, useAsync } from '../lib/utils';

const SECTIONS = [
  { key: 'hostel', title: 'Hostel rent / month' },
  { key: 'mess', title: 'Mess price / month' },
  { key: 'cafeteria', title: 'Cafeteria avg meal' },
];

export default function Insights() {
  const colleges = useAsync(() => collegesApi.getAll(), []);
  const [collegeId, setCollegeId] = useState('');
  const id = collegeId || colleges.data?.[0]?.id;
  const prices = useAsync(() => (id ? compareApi.getCollegePrices(id) : Promise.resolve(null)), [id]);

  return (
    <>
      <PageHeader title="Price insights" subtitle="On-campus vs off-campus pricing around a college (active listings only)." />
      <div className="mb-4 max-w-xs">
        <Field label="College">
          <Select value={id ?? ''} onChange={(e) => setCollegeId(e.target.value)} options={(colleges.data || []).map((c) => ({ value: c.id, label: c.name }))} />
        </Field>
      </div>
      <ErrorBox error={colleges.error || prices.error} />
      {colleges.loading || prices.loading ? (
        <Spinner />
      ) : !prices.data ? (
        <Card><EmptyState title="No colleges yet" /></Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          {SECTIONS.map(({ key, title }) => {
            const s = prices.data[key];
            const on = s.on_campus.summary;
            const off = s.off_campus.summary;
            const max = Math.max(on?.max ?? 0, off?.max ?? 0);
            const diff = s.off_campus_vs_on_campus_avg;
            return (
              <Card key={key} className="p-5 space-y-4">
                <h2 className="font-semibold text-slate-900">{title}</h2>
                {[['On campus', on, 'bg-indigo-500', s.on_campus.items], ['Off campus', off, 'bg-amber-500', s.off_campus.items]].map(([name, sum, tone, items]) => (
                  <div key={name} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{name} <span className="text-slate-400">({sum?.count ?? 0})</span></span>
                      <span className="font-semibold tabular-nums">{sum ? inr(sum.avg) : '—'}</span>
                    </div>
                    <Bar value={sum?.avg ?? 0} max={max} tone={tone} />
                    {sum && <p className="text-xs text-slate-500">Range {inr(sum.min)} – {inr(sum.max)}</p>}
                    {items.slice(0, 5).map((i) => (
                      <p key={i.id} className="text-xs text-slate-500 flex justify-between"><span className="truncate pr-2">{i.name}</span><span>{inr(i.price)}</span></p>
                    ))}
                  </div>
                ))}
                {diff != null && (
                  <Badge tone={diff < 0 ? 'green' : 'amber'}>
                    Off-campus is {inr(Math.abs(diff))} {diff < 0 ? 'cheaper' : 'costlier'} on average
                  </Badge>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
