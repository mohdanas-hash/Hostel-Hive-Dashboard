import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { adminApi } from '../api/endpoints';
import { Badge, Card, DataTable, ErrorBox, Input, PageHeader, Pagination, Select, Spinner } from '../components/ui';
import { fmtDate, ROLE_LABEL, useAsync, useDebounced } from '../lib/utils';

const PAGE = 20;

export default function Users() {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [offset, setOffset] = useState(0);
  const search = useDebounced(q);
  const { data, loading, error, reload } = useAsync(
    () => adminApi.users({ limit: PAGE, offset, ...(role && { role }), ...(search.trim() && { q: search.trim() }) }),
    [role, search, offset]
  );

  const columns = [
    { key: 'name', header: 'Name', render: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (r) => <Badge tone={r.role === 'central_admin' ? 'purple' : r.role === 'student' ? 'green' : 'slate'}>{ROLE_LABEL[r.role]}</Badge> },
    { key: 'admissions', header: 'Admissions', align: 'right' },
    { key: 'payments', header: 'Payments', align: 'right' },
    { key: 'reviews', header: 'Reviews', align: 'right' },
    { key: 'created_at', header: 'Joined', render: (r) => fmtDate(r.created_at) },
  ];

  return (
    <>
      <PageHeader title="Users" subtitle="Registered students and visitors (read-only)." />
      <div className="space-y-4">
        <ErrorBox error={error} onRetry={reload} />
        <Card>
          <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <Input className="pl-9" placeholder="Search name or email…" value={q} onChange={(e) => { setQ(e.target.value); setOffset(0); }} />
            </div>
            <Select className="!w-auto" placeholder="All roles" value={role} onChange={(e) => { setRole(e.target.value); setOffset(0); }} options={[{ value: 'student', label: 'Students' }, { value: 'visitor', label: 'Visitors' }]} />
          </div>
          {loading && !data ? <Spinner /> : <DataTable columns={columns} rows={data?.items || []} empty={{ title: 'No users found' }} />}
          <Pagination total={data?.total ?? 0} limit={PAGE} offset={offset} onChange={setOffset} />
        </Card>
      </div>
    </>
  );
}
