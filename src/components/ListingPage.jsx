import React, { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Star, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { adminApi, amenitiesApi, collegesApi } from '../api/endpoints';
import ImageUpload from './ImageUpload';
import {
  Badge, Button, Card, Checkbox, ConfirmDialog, DataTable, ErrorBox, Field, Input, Modal,
  PageHeader, Pagination, Select, Spinner,
} from './ui';
import { errMsg, label, useAsync, useDebounced } from '../lib/utils';

const LOCATIONS = [
  { value: 'on_campus', label: 'On campus' },
  { value: 'off_campus', label: 'Off campus' },
];

// Shared CRUD screen for hostels / messes / cafeterias.
// config: { title, singular, api, amenityCategory, imageFolder, defaults, fields[], columns(collegeName) , validate? }
// field: { name, label, type: text|number|select|checkbox|time, options?, required?, step?, hint?, span? }
export default function ListingPage({ config }) {
  const { kind, title, singular, api, amenityCategory, imageFolder, defaults, fields, columns, validate } = config;

  const PAGE = 20;
  const [state, setState] = useState('active'); // active | inactive
  const [q, setQ] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [location, setLocation] = useState('');
  const [offset, setOffset] = useState(0);
  const search = useDebounced(q);

  const lookups = useAsync(async () => {
    const [colleges, amenities] = await Promise.all([collegesApi.getAll(), amenitiesApi.getAll(amenityCategory)]);
    return { colleges, amenities };
  }, []);
  const list = useAsync(
    () =>
      adminApi.listings(kind, {
        state, limit: PAGE, offset,
        ...(search.trim() && { q: search.trim() }),
        ...(collegeId && { college_id: collegeId }),
        ...(location && { location }),
      }),
    [kind, state, offset, search, collegeId, location]
  );
  const data = lookups.data && list.data ? { ...lookups.data, items: list.data.items, total: list.data.total } : null;
  const loading = !data && (lookups.loading || list.loading);
  const error = lookups.error || list.error;
  const reload = () => {
    lookups.reload();
    list.reload();
  };
  const filter = (setter) => (v) => {
    setter(v);
    setOffset(0);
  };

  const [editing, setEditing] = useState(null); // null | {} (new) | item
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  const collegeName = useMemo(() => Object.fromEntries((lookups.data?.colleges || []).map((c) => [c.id, c.name])), [lookups.data]);
  const rows = data?.items || [];

  const restore = async (item) => {
    try {
      await adminApi.restoreListing(kind, item.id);
      setActionError(null);
      list.reload();
    } catch (e) {
      setActionError(errMsg(e));
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(deleting.id);
      setDeleting(null);
      list.reload();
    } catch (e) {
      setActionError(errMsg(e));
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  const cols = [
    ...columns(collegeName),
    {
      key: 'rating',
      header: 'Rating',
      render: (r) =>
        r.avg_rating != null ? (
          <span className="inline-flex items-center gap-1 text-slate-700">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {r.avg_rating.toFixed(1)}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <div className="flex justify-end gap-1">
          {r.is_active ? (
            <>
              <Button size="sm" variant="ghost" onClick={() => setEditing(r)} aria-label="Edit"><Pencil className="w-3.5 h-3.5" /></Button>
              <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setDeleting(r)} aria-label="Deactivate">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => restore(r)}><RotateCcw className="w-3.5 h-3.5" /> Restore</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={title}
        subtitle={`${data?.total ?? 0} ${state} ${title.toLowerCase()}. Deactivating hides a listing publicly; payment history is kept and it can be restored.`}
        actions={
          <Button onClick={() => setEditing({})} disabled={!data?.colleges.length}>
            <Plus className="w-4 h-4" /> Add {singular}
          </Button>
        }
      />
      <div className="space-y-4">
        <ErrorBox error={error || actionError} onRetry={error ? reload : undefined} />
        <div className="flex gap-1 border-b border-slate-200">
          {['active', 'inactive'].map((st) => (
            <button
              key={st}
              onClick={() => { setState(st); setOffset(0); }}
              className={clsx('px-4 py-2 text-sm font-medium capitalize -mb-px border-b-2 cursor-pointer',
                state === st ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800')}
            >
              {st === 'inactive' ? 'Deactivated' : 'Active'}
            </button>
          ))}
        </div>
        <Card>
          <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <Input className="pl-9" placeholder={`Search ${title.toLowerCase()}…`} value={q} onChange={(e) => { setQ(e.target.value); setOffset(0); }} />
            </div>
            <Select
              className="!w-auto"
              placeholder="All colleges"
              value={collegeId}
              onChange={(e) => filter(setCollegeId)(e.target.value)}
              options={(data?.colleges || []).map((c) => ({ value: c.id, label: c.name }))}
            />
            <Select className="!w-auto" placeholder="Any location" value={location} onChange={(e) => filter(setLocation)(e.target.value)} options={LOCATIONS} />
          </div>
          {loading ? (
            <Spinner />
          ) : (
            <DataTable
              columns={cols}
              rows={rows}
              empty={{ title: `No ${title.toLowerCase()} found`, hint: data?.colleges.length ? 'Adjust filters or add one.' : 'Create a college first.' }}
            />
          )}
          <Pagination total={data?.total ?? 0} limit={PAGE} offset={offset} onChange={setOffset} />
        </Card>
      </div>

      {editing && (
        <ListingForm
          key={editing.id ?? 'new'}
          config={{ singular, api, imageFolder, defaults, fields, validate }}
          item={editing}
          colleges={data.colleges}
          amenities={data.amenities}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setActionError(null);
            list.reload();
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        title={`Deactivate ${singular}`}
        message={`"${deleting?.name}" will be hidden from lists and comparisons. Existing payments are kept.`}
        confirmLabel="Deactivate"
        loading={busy}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}

function ListingForm({ config, item, colleges, amenities, onClose, onSaved }) {
  const { singular, api, imageFolder, defaults, fields, validate } = config;
  const isEdit = !!item.id;
  const [form, setForm] = useState(() => ({ ...defaults, college_id: colleges[0]?.id, ...item }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const toggleAmenity = (name) =>
    set('amenities', form.amenities?.includes(name) ? form.amenities.filter((a) => a !== name) : [...(form.amenities || []), name]);

  const submit = async (e) => {
    e.preventDefault();
    const problem = validate?.(form);
    if (problem) return setError(problem);

    // Build the payload from known fields only (the PUT replaces everything; read-only response keys must not be sent).
    const payload = { college_id: Number(form.college_id), amenities: form.amenities || [], image_url: form.image_url || null };
    for (const f of fields) {
      const v = form[f.name];
      if (f.type === 'number') payload[f.name] = v === '' || v == null ? (f.required ? 0 : null) : Number(v);
      else if (f.type === 'checkbox') payload[f.name] = !!v;
      else payload[f.name] = v === '' && !f.required && f.type === 'time' ? null : v ?? '';
    }
    setBusy(true);
    setError(null);
    try {
      await (isEdit ? api.update(item.id, payload) : api.create(payload));
      onSaved();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={isEdit ? `Edit ${singular}` : `Add ${singular}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="listing-form" loading={busy}>{isEdit ? 'Save changes' : `Create ${singular}`}</Button>
        </>
      }
    >
      <form id="listing-form" onSubmit={submit} className="space-y-5">
        <ErrorBox error={error} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="College *">
            <Select
              required
              value={form.college_id}
              onChange={(e) => set('college_id', e.target.value)}
              options={colleges.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Field>
          {fields.map((f) => {
            const span = f.span === 2 ? 'sm:col-span-2' : '';
            if (f.type === 'checkbox')
              return (
                <div key={f.name} className={`flex items-end pb-2 ${span}`}>
                  <Checkbox label={f.label} checked={!!form[f.name]} onChange={(e) => set(f.name, e.target.checked)} />
                </div>
              );
            return (
              <Field key={f.name} label={`${f.label}${f.required ? ' *' : ''}`} hint={f.hint} className={span}>
                {f.type === 'select' ? (
                  <Select value={form[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value)} options={f.options} />
                ) : (
                  <Input
                    type={f.type === 'time' ? 'time' : f.type === 'number' ? 'number' : 'text'}
                    step={f.step}
                    min={f.type === 'number' ? 0 : undefined}
                    required={f.required}
                    value={form[f.name] ?? ''}
                    onChange={(e) => set(f.name, e.target.value)}
                  />
                )}
              </Field>
            );
          })}
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2">Amenities</p>
          {amenities.length ? (
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => {
                const on = form.amenities?.includes(a.name);
                return (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => toggleAmenity(a.name)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition ${
                      on ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-300 text-slate-600 hover:border-indigo-400'
                    }`}
                  >
                    {label(a.name)}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No amenities in this category yet — add some on the Amenities page.</p>
          )}
        </div>

        <ImageUpload label="Photo" folder={imageFolder} value={form.image_url} onChange={(url) => set('image_url', url)} />
      </form>
    </Modal>
  );
}

export const locationBadge = (r) => (
  <Badge tone={r.location === 'on_campus' ? 'indigo' : 'amber'}>{r.location === 'on_campus' ? 'On campus' : 'Off campus'}</Badge>
);
export { LOCATIONS };
