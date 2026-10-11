import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { adminApi } from '../api/endpoints';
import { Badge, Card, DataTable, ErrorBox, Input, PageHeader, Pagination, Select, Spinner, StatCard } from '../components/ui';
import { fmtDateTime, inr, label, useAsync, useDebounced } from '../lib/utils';
import { Banknote } from 'lucide-react';

const PAGE = 20;
const TONE = { paid: 'green', created: 'amber', failed: 'red' };

export default function Payments() {
  const [status, setStatus] = useState('');
  const [kind, setKind] = useState('');
  const [q, setQ] = useState('');
  const [offset, setOffset] = useState(0);
  const search = useDebounced(q);
  const { data, loading, error, reload } = useAsync(
    () => adminApi.payments({ limit: PAGE, offset, ...(status && { status }), ...(kind && { kind }), ...(search.trim() && { q: search.trim() }) }),
    [status, kind, search, offset]
  );
  const reset = (set) => (e) => {
    set(e.target.value);
    setOffset(0);
  };

  const columns = [
    { key: 'id', header: '#', render: (r) => <span className="text-slate-500">#{r.id}</span> },
    {
      key: 'user', header: 'Student',
      render: (r) => (
        <div>
          <p className="font-medium text-slate-900">{r.user_name ?? `User #${r.user_id}`}</p>
          {r.user_email && <p className="text-xs text-slate-500">{r.user_email}</p>}
        </div>
      ),
    },
    { key: 'kind', header: 'For', render: (r) => <div><p className="capitalize">{label(r.kind)}</p><p className="text-xs text-slate-500">{r.hostel_name ?? r.mess_name ?? '—'}</p></div> },
    { key: 'months', header: 'Months', align: 'right', render: (r) => (r.include_deposit ? `${r.months} + deposit` : r.months) },
    { key: 'amount', header: 'Amount', align: 'right', render: (r) => <span className="font-semibold">{inr(r.amount)}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={TONE[r.status]}>{r.status}</Badge> },
    { key: 'ref', header: 'Reference', render: (r) => <span className="text-xs text-slate-500 font-mono">{r.provider_payment_id ?? r.provider_order_id}</span> },
    { key: 'when', header: 'Date', render: (r) => fmtDateTime(r.paid_at ?? r.created_at) },
  ];

  return (
    <>
      <PageHeader title="Payments" subtitle="Every rent and mess-fee payment. Provider is currently the mock gateway." />
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <StatCard label="Paid total (current filters)" value={inr(data?.total_amount)} icon={Banknote} tone="green" />
        <StatCard label="Payments (current filters)" value={data?.total ?? '—'} />
      </div>
      <div className="space-y-4">
        <ErrorBox error={error} onRetry={reload} />
        <Card>
          <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <Input className="pl-9" placeholder="Search student name, email or order id…" value={q} onChange={reset(setQ)} />
            </div>
            <Select className="!w-auto" placeholder="Any status" value={status} onChange={reset(setStatus)} options={['paid', 'created', 'failed'].map((v) => ({ value: v, label: v }))} />
            <Select className="!w-auto" placeholder="Any type" value={kind} onChange={reset(setKind)} options={[{ value: 'hostel_rent', label: 'Hostel rent' }, { value: 'mess_fee', label: 'Mess fee' }]} />
          </div>
          {loading && !data ? <Spinner /> : <DataTable columns={columns} rows={data?.items || []} empty={{ title: 'No payments match' }} />}
          <Pagination total={data?.total ?? 0} limit={PAGE} offset={offset} onChange={setOffset} />
        </Card>
      </div>
    </>
  );
}
