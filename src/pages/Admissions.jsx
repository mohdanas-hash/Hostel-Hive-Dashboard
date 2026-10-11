import React, { useEffect, useMemo, useState } from 'react';
import { Check, X, FileText, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import { admissionsApi, hostelsApi } from '../api/endpoints';
import { Badge, Button, Card, DataTable, ErrorBox, Modal, PageHeader, Spinner, Textarea, Field } from '../components/ui';
import { errMsg, fetchAll, fmtDateTime, label, useAsync } from '../lib/utils';

const STATUSES = ['submitted', 'approved', 'rejected', 'draft'];
const TONE = { draft: 'slate', submitted: 'amber', approved: 'green', rejected: 'red' };
const DOC_TYPES = ['passport_photo', 'fee_receipt', 'aadhaar', 'pan'];
function Student({ app }) {
  return (
    <div>
      <p className="font-medium text-slate-900">{app.student_name ?? `User #${app.user_id}`}</p>
      {app.student_email && <p className="text-xs text-slate-500">{app.student_email}</p>}
    </div>
  );
}
const kb = (n) => `${Math.max(1, Math.round(n / 1024))} KB`;

export default function Admissions() {
  const [status, setStatus] = useState('submitted');
  const { data, loading, error, reload } = useAsync(async () => {
    const [apps, hostels] = await Promise.all([admissionsApi.getAll({ status }), fetchAll((p) => hostelsApi.getAll(p))]);
    return { apps, hostels: Object.fromEntries(hostels.map((h) => [h.id, h])) };
  }, [status]);
  const [selected, setSelected] = useState(null);

  const hostelName = (id) => data?.hostels[id]?.name ?? `Hostel #${id}`;

  const columns = [
    { key: 'id', header: '#', render: (r) => <span className="text-slate-500">#{r.id}</span> },
    { key: 'user', header: 'Student', render: (r) => <Student app={r} /> },
    { key: 'hostel', header: 'Hostel', render: (r) => <span className="font-medium text-slate-900">{hostelName(r.hostel_id)}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge tone={TONE[r.status]}>{r.status}</Badge> },
    { key: 'docs', header: 'Documents', render: (r) => `${r.documents.length} / ${DOC_TYPES.length}` },
    { key: 'submitted_at', header: 'Submitted', render: (r) => fmtDateTime(r.submitted_at) },
    { key: 'open', header: '', align: 'right', render: () => <Button size="sm" variant="secondary">Review</Button> },
  ];

  return (
    <>
      <PageHeader title="Admissions" subtitle="Review student documents and approve or reject hostel applications." />
      <div className="flex gap-1 mb-4 border-b border-slate-200">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={clsx(
              'px-4 py-2 text-sm font-medium capitalize -mb-px border-b-2 cursor-pointer',
              status === s ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <ErrorBox error={error} onRetry={reload} />
      <Card>
        {loading ? <Spinner /> : <DataTable columns={columns} rows={data?.apps || []} onRowClick={setSelected} empty={{ title: `No ${status} applications` }} />}
      </Card>
      {selected && (
        <ReviewModal
          app={selected}
          hostel={data.hostels[selected.hostel_id]}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            reload();
          }}
        />
      )}
    </>
  );
}

function ReviewModal({ app, hostel, onClose, onDone }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const canReview = app.status === 'submitted';

  const review = async (approve) => {
    if (!approve && !reason.trim()) return setError('Please give a reason for rejecting.');
    setBusy(true);
    setError(null);
    try {
      await admissionsApi.review(app.id, approve, approve ? null : reason.trim());
      onDone();
    } catch (e) {
      setError(errMsg(e));
      setBusy(false);
    }
  };

  const byType = useMemo(() => Object.fromEntries(app.documents.map((d) => [d.doc_type, d])), [app]);

  return (
    <Modal
      open
      wide
      onClose={onClose}
      title={`Application #${app.id} — ${hostel?.name ?? `Hostel #${app.hostel_id}`}`}
      footer={
        canReview ? (
          rejecting ? (
            <>
              <Button variant="secondary" onClick={() => setRejecting(false)}>Back</Button>
              <Button variant="danger" loading={busy} onClick={() => review(false)}><X className="w-4 h-4" /> Confirm rejection</Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setRejecting(true)}><X className="w-4 h-4" /> Reject</Button>
              <Button variant="success" loading={busy} onClick={() => review(true)}><Check className="w-4 h-4" /> Approve</Button>
            </>
          )
        ) : (
          <Button variant="secondary" onClick={onClose}>Close</Button>
        )
      }
    >
      <div className="space-y-5">
        <ErrorBox error={error} />
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><dt className="text-xs text-slate-500">Student</dt><dd><Student app={app} /></dd></div>
          <div><dt className="text-xs text-slate-500">Status</dt><dd><Badge tone={TONE[app.status]}>{app.status}</Badge></dd></div>
          <div><dt className="text-xs text-slate-500">Submitted</dt><dd>{fmtDateTime(app.submitted_at)}</dd></div>
          <div><dt className="text-xs text-slate-500">Reviewed</dt><dd>{fmtDateTime(app.reviewed_at)}</dd></div>
        </dl>
        {app.reject_reason && (
          <p className="text-sm bg-red-50 text-red-700 rounded-lg p-3"><strong>Rejected:</strong> {app.reject_reason}</p>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          {DOC_TYPES.map((t) => (
            <DocumentCard key={t} appId={app.id} type={t} doc={byType[t]} />
          ))}
        </div>
        {rejecting && (
          <Field label="Reason for rejection (shown to the student) *">
            <Textarea autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. PAN image is blurry — please re-upload" />
          </Field>
        )}
      </div>
    </Modal>
  );
}

// Documents are private and need the Bearer token, so they are fetched as blobs rather than linked.
function DocumentCard({ appId, type, doc }) {
  const [url, setUrl] = useState(null);
  const [err, setErr] = useState(null);
  const isImage = doc?.content_type?.startsWith('image/');

  useEffect(() => {
    if (!doc) return;
    let objectUrl;
    let cancelled = false;
    admissionsApi
      .fetchDocumentBlob(appId, type)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => !cancelled && setErr('Could not load file'));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [appId, type, doc]);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-3 py-2 bg-slate-50 flex items-center justify-between text-sm">
        <span className="font-medium capitalize">{label(type)}</span>
        {doc ? <span className="text-xs text-slate-500">{kb(doc.size_bytes)}</span> : <Badge tone="red">Missing</Badge>}
      </div>
      <div className="h-44 flex items-center justify-center bg-slate-100">
        {!doc ? (
          <span className="text-sm text-slate-400">Not uploaded</span>
        ) : err ? (
          <span className="text-sm text-red-600">{err}</span>
        ) : !url ? (
          <Spinner label="" />
        ) : isImage ? (
          <a href={url} target="_blank" rel="noreferrer" className="w-full h-full">
            <img src={url} alt={label(type)} className="w-full h-full object-contain" />
          </a>
        ) : (
          <a href={url} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-indigo-600 text-sm font-medium">
            <FileText className="w-8 h-8" /> Open PDF <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
      {doc && <p className="px-3 py-1.5 text-xs text-slate-500 truncate" title={doc.original_name}>{doc.original_name}</p>}
    </div>
  );
}
