import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { collegesApi } from '../api/endpoints';
import { Badge, Button, Card, Checkbox, ConfirmDialog, DataTable, ErrorBox, Field, Input, Modal, PageHeader, Spinner } from '../components/ui';
import { errMsg, useAsync } from '../lib/utils';

const EMPTY = { name: '', city: '', address: '', is_central: false };

export default function Colleges() {
  const { data, loading, error, reload } = useAsync(() => collegesApi.getAll(), []);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [pageError, setPageError] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const openEdit = (c) => {
    setForm({ name: c.name, city: c.city, address: c.address, is_central: c.is_central });
    setEditId(c.id);
    setOpen(true);
  };
  const remove = async () => {
    setBusy(true);
    try {
      await collegesApi.delete(deleting.id);
      setPageError(null);
      setDeleting(null);
      reload();
    } catch (err) {
      setPageError(errMsg(err)); // e.g. "College is still in use: 3 hostels"
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };
  const close = () => {
    setEditId(null);
    setOpen(false);
    setForm(EMPTY);
    setFormError(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      const body = { ...form, name: form.name.trim(), city: form.city.trim() };
      await (editId ? collegesApi.update(editId, body) : collegesApi.create(body));
      close();
      reload();
    } catch (err) {
      setFormError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'name', header: 'College', render: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
    { key: 'city', header: 'City' },
    { key: 'address', header: 'Address', render: (r) => r.address || <span className="text-slate-400">—</span> },
    { key: 'is_central', header: '', render: (r) => r.is_central && <Badge tone="purple">Central college</Badge> },
    {
      key: 'actions', header: '', align: 'right',
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button size="sm" variant="ghost" onClick={() => openEdit(r)} aria-label="Edit"><Pencil className="w-3.5 h-3.5" /></Button>
          <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setDeleting(r)} aria-label="Delete"><Trash2 className="w-3.5 h-3.5" /></Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Colleges"
        subtitle="Every listing and daily post belongs to a college. A college can only be deleted once nothing references it."
        actions={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Add college</Button>}
      />
      <ErrorBox error={error || pageError} onRetry={error ? reload : undefined} />
      <Card>{loading ? <Spinner /> : <DataTable columns={columns} rows={data || []} empty={{ title: 'No colleges yet', hint: 'Add one to start creating listings.' }} />}</Card>

      <Modal
        open={open}
        onClose={close}
        title={editId ? 'Edit college' : 'Add college'}
        footer={
          <>
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button type="submit" form="college-form" loading={busy}>{editId ? 'Save changes' : 'Create college'}</Button>
          </>
        }
      >
        <form id="college-form" onSubmit={submit} className="space-y-4">
          <ErrorBox error={formError} />
          <Field label="Name *"><Input required value={form.name} onChange={(e) => set('name', e.target.value)} /></Field>
          <Field label="City *"><Input required value={form.city} onChange={(e) => set('city', e.target.value)} /></Field>
          <Field label="Address"><Input value={form.address} onChange={(e) => set('address', e.target.value)} /></Field>
          <Checkbox label="This is the central college" checked={form.is_central} onChange={(e) => set('is_central', e.target.checked)} />
        </form>
      </Modal>
      <ConfirmDialog
        open={!!deleting}
        title="Delete college"
        message={`"${deleting?.name}" will be permanently deleted. This fails if it still has listings, posts or users.`}
        loading={busy}
        onConfirm={remove}
        onClose={() => setDeleting(null)}
      />
    </>
  );
}
