import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { amenitiesApi } from '../api/endpoints';
import { Button, Card, ConfirmDialog, ErrorBox, Field, Input, PageHeader, Select, Spinner } from '../components/ui';
import { errMsg, label, useAsync } from '../lib/utils';

const CATEGORIES = [
  { value: 'hostel', label: 'Hostel' },
  { value: 'mess', label: 'Mess' },
  { value: 'cafeteria', label: 'Cafeteria' },
];

export default function Amenities() {
  const { data, loading, error, reload } = useAsync(() => amenitiesApi.getAll(), []);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('hostel');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const add = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      await amenitiesApi.create({ name: name.trim(), category });
      setName('');
      reload();
    } catch (err) {
      setFormError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await amenitiesApi.delete(deleting.id);
      setDeleting(null);
      reload();
    } catch (err) {
      setFormError(errMsg(err));
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Amenities" subtitle="The catalog listings pick from. Names are stored lower-case; use underscores for spaces (ro_water)." />
      <div className="space-y-4">
        <ErrorBox error={error || formError} onRetry={error ? reload : undefined} />
        <Card className="p-4">
          <form onSubmit={add} className="flex flex-wrap items-end gap-3">
            <Field label="Name" className="flex-1 min-w-48"><Input required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. laundry" /></Field>
            <Field label="Category"><Select value={category} onChange={(e) => setCategory(e.target.value)} options={CATEGORIES} /></Field>
            <Button type="submit" loading={busy}><Plus className="w-4 h-4" /> Add</Button>
          </form>
        </Card>
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {CATEGORIES.map((c) => {
              const items = (data || []).filter((a) => a.category === c.value);
              return (
                <Card key={c.value} className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">{c.label} · {items.length}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((a) => (
                      <span key={a.id} className="inline-flex items-center gap-1 pl-3 pr-1.5 py-1 rounded-full bg-slate-100 text-sm text-slate-700">
                        {label(a.name)}
                        <button onClick={() => setDeleting(a)} className="p-0.5 rounded-full hover:bg-slate-300 cursor-pointer" aria-label={`Delete ${a.name}`}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {!items.length && <p className="text-sm text-slate-400">None yet</p>}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={!!deleting}
        title="Delete amenity"
        message={`"${deleting?.name}" will also be removed from every listing that uses it.`}
        loading={busy}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
