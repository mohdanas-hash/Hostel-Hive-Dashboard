import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Banknote, Bed, Building2, Users as UsersIcon, Coffee, FileCheck2, UtensilsCrossed, AlertTriangle } from 'lucide-react';
import { adminApi, admissionsApi, collegesApi } from '../api/endpoints';
import { Badge, Bar, Card, EmptyState, ErrorBox, PageHeader, Spinner, StatCard } from '../components/ui';
import { fmtDateTime, inr, num, useAsync } from '../lib/utils';

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export default function Overview() {
  const { data, loading, error, reload } = useAsync(async () => {
    const [stats, colleges, hostelsPage, pending] = await Promise.all([
      adminApi.stats(),
      collegesApi.getAll(),
      adminApi.listings('hostels', { state: 'active', limit: 200 }),
      admissionsApi.getAll({ status: 'submitted' }),
    ]);
    return { stats, colleges, hostels: hostelsPage.items, pending };
  }, []);

  const m = useMemo(() => {
    if (!data) return null;
    const { colleges, hostels, pending } = data;
    const perCollege = colleges
      .map((c) => {
        const hs = hostels.filter((h) => h.college_id === c.id);
        const total = hs.reduce((s, h) => s + h.total_beds, 0);
        const free = hs.reduce((s, h) => s + h.available_beds, 0);
        return { ...c, hostels: hs.length, total, occupied: total - free };
      })
      .filter((c) => c.hostels);
    const { total, available } = data.stats.beds;
    return {
      occupancy: total ? ((total - available) / total) * 100 : 0,
      perCollege,
      pending: pending.slice(0, 6),
      lowBeds: hostels.filter((h) => h.total_beds > 0 && h.available_beds <= 3).sort((a, b) => a.available_beds - b.available_beds).slice(0, 6),
      onAvgRent: avg(hostels.filter((h) => h.location === 'on_campus').map((h) => h.monthly_rent)),
      offAvgRent: avg(hostels.filter((h) => h.location === 'off_campus').map((h) => h.monthly_rent)),
      hostelName: Object.fromEntries(hostels.map((h) => [h.id, h.name])),
    };
  }, [data]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const { stats } = data;
  const { counts, admissions: adm, payments: pay } = stats;
  const statusTone = { submitted: 'bg-amber-500', approved: 'bg-emerald-500', rejected: 'bg-red-500', draft: 'bg-slate-400' };
  const totalApps = Object.values(adm).reduce((a, b) => a + b, 0);
  const maxMonth = Math.max(0, ...stats.monthly_revenue.map((r) => r.amount));
  const byStatus = adm;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Live snapshot of listings, beds, admissions and revenue." />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard label="Pending admissions" value={adm.submitted} hint={`${totalApps} applications total`} icon={FileCheck2} tone="amber" />
        <StatCard label="Revenue (paid)" value={inr(pay.revenue)} hint={`Rent ${inr(pay.revenue_hostel_rent)} · Mess ${inr(pay.revenue_mess_fee)}`} icon={Banknote} tone="green" />
        <StatCard label="Bed occupancy" value={`${m.occupancy.toFixed(0)}%`} hint={`${num(stats.beds.available)} of ${num(stats.beds.total)} beds free`} icon={Bed} tone="green" />
        <StatCard label="Users" value={num(counts.users)} hint={`${counts.reviews} reviews`} icon={UsersIcon} tone="blue" />
        <StatCard label="Hostels" value={counts.hostels} hint={counts.hostels_inactive ? `${counts.hostels_inactive} deactivated` : `Avg rent ${inr(avg(data.hostels.map((h) => h.monthly_rent)))}`} icon={Building2} />
        <StatCard label="Messes" value={counts.messes} hint={counts.messes_inactive ? `${counts.messes_inactive} deactivated` : undefined} icon={UtensilsCrossed} tone="green" />
        <StatCard label="Cafeterias" value={counts.cafeterias} hint={counts.cafeterias_inactive ? `${counts.cafeterias_inactive} deactivated` : undefined} icon={Coffee} tone="amber" />
        <StatCard
          label="Hostel rent: off vs on campus"
          value={m.onAvgRent != null && m.offAvgRent != null ? `${m.offAvgRent - m.onAvgRent >= 0 ? '+' : '−'}${inr(Math.abs(m.offAvgRent - m.onAvgRent))}` : '—'}
          hint={`On ${inr(m.onAvgRent)} · Off ${inr(m.offAvgRent)}`}
          icon={Building2}
          tone="slate"
        />
      </div>

      {counts.posts_today === 0 && (
        <p className="mb-4 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3">
          Nothing posted today yet. <Link to="/posts" className="font-semibold underline">Publish today's menu or notice</Link>.
        </p>
      )}

      <Card className="p-5 mb-4">
        <h2 className="font-semibold text-slate-900 mb-4">Revenue by month</h2>
        {stats.monthly_revenue.length ? (
          <div className="space-y-3">
            {stats.monthly_revenue.map((r) => (
              <div key={r.month}>
                <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">{r.month}</span><span className="font-semibold tabular-nums">{inr(r.amount)}</span></div>
                <Bar value={r.amount} max={maxMonth} tone="bg-emerald-500" />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No paid payments yet" />
        )}
      </Card>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Awaiting review</h2>
            <Link to="/admissions" className="text-sm font-medium text-indigo-600 hover:underline">View all</Link>
          </div>
          {m.pending.length ? (
            <ul className="divide-y divide-slate-100">
              {m.pending.map((a) => (
                <li key={a.id} className="px-5 py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{m.hostelName[a.hostel_id] ?? `Hostel #${a.hostel_id}`}</p>
                    <p className="text-xs text-slate-500">{a.student_name ?? `User #${a.user_id}`} · submitted {fmtDateTime(a.submitted_at)}</p>
                  </div>
                  <Link to="/admissions" className="text-indigo-600 font-medium hover:underline">Review</Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="Inbox zero" hint="No applications waiting for review." />
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Applications by status</h2>
          <div className="space-y-3">
            {Object.entries(byStatus).map(([s, n]) => (
              <div key={s}>
                <div className="flex justify-between text-sm mb-1"><span className="capitalize text-slate-600">{s}</span><span className="font-semibold tabular-nums">{n}</span></div>
                <Bar value={n} max={totalApps} tone={statusTone[s]} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Occupancy by college</h2>
          {m.perCollege.length ? (
            <div className="space-y-4">
              {m.perCollege.map((c) => (
                <div key={c.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 truncate pr-2">{c.name}</span>
                    <span className="text-slate-500 tabular-nums">{c.occupied} / {c.total} beds</span>
                  </div>
                  <Bar value={c.occupied} max={c.total} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No hostels yet" />
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Running low on beds</h2>
          {m.lowBeds.length ? (
            <ul className="divide-y divide-slate-100">
              {m.lowBeds.map((h) => (
                <li key={h.id} className="py-2.5 flex items-center justify-between text-sm">
                  <span className="text-slate-700">{h.name}</span>
                  <Badge tone={h.available_beds === 0 ? 'red' : 'amber'}>{h.available_beds === 0 ? 'Full' : `${h.available_beds} left`}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="All hostels have space" />
          )}
        </Card>
      </div>
    </>
  );
}
