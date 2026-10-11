import React, { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { cafeteriasApi, collegesApi, hostelsApi, messesApi, postsApi } from '../api/endpoints';
import ImageUpload from '../components/ImageUpload';
import {
  Badge, Button, Card, ConfirmDialog, EmptyState, ErrorBox, Field, Input, Modal, PageHeader, Select, Spinner, Textarea,
} from '../components/ui';
import { errMsg, fetchAll, fmtDate, label, today, useAsync } from '../lib/utils';

const KINDS = [
  { value: 'mess_menu', label: 'Mess menu', target: 'mess_id', tone: 'green' },
  { value: 'cafeteria_menu', label: 'Cafeteria menu', target: 'cafeteria_id', tone: 'amber' },
  { value: 'hostel_update', label: 'Hostel update', target: 'hostel_id', tone: 'blue' },
  { value: 'notice', label: 'Notice', target: null, tone: 'purple' },
];
const kindMeta = Object.fromEntries(KINDS.map((k) => [k.value, k]));

export default function Posts() {
  const [collegeId, setCollegeId] = useState('');
  const [kind, setKind] = useState('');
  const { data, loading, error, reload } = useAsync(async () => {
    const [posts, colleges, hostels, messes, cafeterias] = await Promise.all([
      postsApi.getFeed({ limit: 200, ...(collegeId && { college_id: collegeId }), ...(kind && { kind }) }),
      collegesApi.getAll(),
      fetchAll((p) => hostelsApi.getAll(p)),
      fetchAll((p) => messesApi.getAll(p)),
      fetchAll((p) => cafeteriasApi.getAll(p)),
    ]);
    return { posts, colleges, listings: { hostel_id: hostels, mess_id: messes, cafeteria_id: cafeterias } };
  }, [collegeId, kind]);

  const [editing, setEditing] = useState(null); // null | {} (new) | post
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);

  const collegeName = useMemo(() => Object.fromEntries((data?.colleges || []).map((c) => [c.id, c.name])), [data]);

  const remove = async () => {
    setBusy(true);
    try {
      await postsApi.delete(deleting.id);
      setDeleting(null);
      reload();
    } catch (e) {
      setActionError(errMsg(e));
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Daily posts"
        subtitle="Menus, updates and notices published to the public feed."
        actions={<Button onClick={() => setEditing({})} disabled={!data?.colleges.length}><Plus className="w-4 h-4" /> New post</Button>}
      />
      <ErrorBox error={error || actionError} onRetry={error ? reload : undefined} />
      <div className="flex flex-wrap gap-3 mb-4">
        <Select className="!w-auto" placeholder="All colleges" value={collegeId} onChange={(e) => setCollegeId(e.target.value)} options={(data?.colleges || []).map((c) => ({ value: c.id, label: c.name }))} />
        <Select className="!w-auto" placeholder="All kinds" value={kind} onChange={(e) => setKind(e.target.value)} options={KINDS} />
      </div>
      {loading ? (
        <Spinner />
      ) : !data.posts.length ? (
        <Card><EmptyState title="No posts match" hint="Publish today's menu or a notice." /></Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.posts.map((p) => (
            <Card key={p.id} className="overflow-hidden flex flex-col">
              {p.image_url && <img src={p.image_url} alt="" className="h-40 w-full object-cover" />}
              <div className="p-4 flex-1 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={kindMeta[p.kind].tone}>{kindMeta[p.kind].label}</Badge>
                  <span className="text-xs text-slate-500">{fmtDate(p.post_date)}</span>
                </div>
                <h3 className="font-semibold text-slate-900">{p.title}</h3>
                {p.body && <p className="text-sm text-slate-600 whitespace-pre-line line-clamp-5">{p.body}</p>}
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">{collegeName[p.college_id] ?? `College #${p.college_id}`}</span>
                  <span className="flex">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(p)} aria-label="Edit post"><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setDeleting(p)} aria-label="Delete post">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <PostForm
          key={editing.id ?? 'new'}
          post={editing}
          colleges={data.colleges}
          listings={data.listings}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setActionError(null);
            reload();
          }}
        />
      )}
      <ConfirmDialog open={!!deleting} title="Delete post" message={`"${deleting?.title}" will be removed from the feed permanently.`} loading={busy} onConfirm={remove} onClose={() => setDeleting(null)} />
    </>
  );
}

function PostForm({ post, colleges, listings, onClose, onSaved }) {
  const isEdit = !!post.id;
  const [form, setForm] = useState(() =>
    isEdit
      ? {
          college_id: post.college_id, kind: post.kind, title: post.title, body: post.body, post_date: post.post_date,
          image_url: post.image_url || '',
          target_id: post.mess_id ?? post.hostel_id ?? post.cafeteria_id ?? '',
        }
      : { college_id: colleges[0]?.id, kind: 'mess_menu', target_id: '', title: '', body: '', post_date: today(), image_url: '' }
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const targetKey = kindMeta[form.kind].target;
  const targets = targetKey ? listings[targetKey].filter((l) => l.college_id === Number(form.college_id)) : [];

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = {
        college_id: Number(form.college_id),
        kind: form.kind,
        title: form.title.trim(),
        body: form.body,
        post_date: form.post_date || null,
        image_url: form.image_url || null,
        ...(targetKey && form.target_id && { [targetKey]: Number(form.target_id) }),
      };
      await (isEdit ? postsApi.update(post.id, body) : postsApi.create(body));
      onSaved();
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={isEdit ? 'Edit post' : 'New daily post'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="post-form" loading={busy}>{isEdit ? 'Save changes' : 'Publish'}</Button>
        </>
      }
    >
      <form id="post-form" onSubmit={submit} className="space-y-4">
        <ErrorBox error={error} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="College *">
            <Select required value={form.college_id} onChange={(e) => setForm((f) => ({ ...f, college_id: e.target.value, target_id: '' }))} options={colleges.map((c) => ({ value: c.id, label: c.name }))} />
          </Field>
          <Field label="Kind *">
            <Select value={form.kind} onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value, target_id: '' }))} options={KINDS} />
          </Field>
          {targetKey && (
            <Field label={`Linked ${label(targetKey.replace('_id', ''))} (optional)`}>
              <Select placeholder="None" value={form.target_id} onChange={(e) => set('target_id', e.target.value)} options={targets.map((t) => ({ value: t.id, label: t.name }))} />
            </Field>
          )}
          <Field label="Post date"><Input type="date" value={form.post_date} onChange={(e) => set('post_date', e.target.value)} /></Field>
        </div>
        <Field label="Title *"><Input required maxLength={200} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Today's lunch menu" /></Field>
        <Field label="Body"><Textarea value={form.body} onChange={(e) => set('body', e.target.value)} /></Field>
        <ImageUpload label="Image" folder="posts" value={form.image_url} onChange={(u) => set('image_url', u)} />
      </form>
    </Modal>
  );
}
