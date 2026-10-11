import React, { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { adminApi } from '../api/endpoints';
import { Badge, Button, Card, ConfirmDialog, EmptyState, ErrorBox, Pagination, PageHeader, Select, Spinner } from '../components/ui';
import { errMsg, fmtDateTime, useAsync } from '../lib/utils';

const PAGE = 20;
const TYPES = [{ value: 'hostel', label: 'Hostels' }, { value: 'mess', label: 'Messes' }, { value: 'cafeteria', label: 'Cafeterias' }];
const RATINGS = [5, 4, 3, 2, 1].map((n) => ({ value: n, label: `${n} star${n > 1 ? 's' : ''}` }));

export default function Reviews() {
  const [type, setType] = useState('');
  const [rating, setRating] = useState('');
  const [offset, setOffset] = useState(0);
  const { data, loading, error, reload } = useAsync(
    () => adminApi.reviews({ limit: PAGE, offset, ...(type && { target_type: type }), ...(rating && { rating }) }),
    [type, rating, offset]
  );
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  const remove = async () => {
    setBusy(true);
    try {
      await adminApi.deleteReview(deleting.id);
      setDeleting(null);
      // stepping back a page if we just removed the last row of this one
      if (data.items.length === 1 && offset > 0) setOffset(offset - PAGE);
      else reload();
    } catch (e) {
      setActionError(errMsg(e));
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Reviews" subtitle="Moderate student reviews across all listings." />
      <div className="flex flex-wrap gap-3 mb-4">
        <Select className="!w-auto" placeholder="All listing types" value={type} onChange={(e) => { setType(e.target.value); setOffset(0); }} options={TYPES} />
        <Select className="!w-auto" placeholder="Any rating" value={rating} onChange={(e) => { setRating(e.target.value); setOffset(0); }} options={RATINGS} />
      </div>
      <div className="space-y-4">
        <ErrorBox error={error || actionError} onRetry={error ? reload : undefined} />
        <Card>
          {loading && !data ? (
            <Spinner />
          ) : !data?.items.length ? (
            <EmptyState title="No reviews match" />
          ) : (
            <>
              <ul className="divide-y divide-slate-100">
                {data.items.map((r) => (
                  <li key={r.id} className="px-5 py-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="flex gap-0.5" aria-label={`${r.rating} of 5`}>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} className={`w-4 h-4 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                          ))}
                        </span>
                        <Badge tone="indigo">{r.target_type}</Badge>
                        <span className="text-sm font-medium text-slate-900">{r.target_name ?? `#${r.target_id} (removed)`}</span>
                      </div>
                      {r.comment && <p className="text-sm text-slate-700">{r.comment}</p>}
                      <p className="text-xs text-slate-500 mt-1">{r.user_name ?? `User #${r.user_id}`} · {fmtDateTime(r.created_at)}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 shrink-0" onClick={() => setDeleting(r)} aria-label="Delete review">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
              <Pagination total={data.total} limit={PAGE} offset={offset} onChange={setOffset} />
            </>
          )}
        </Card>
      </div>
      <ConfirmDialog open={!!deleting} title="Delete review" message="This review is removed permanently and the listing's average rating is recalculated." loading={busy} onConfirm={remove} onClose={() => setDeleting(null)} />
    </>
  );
}
