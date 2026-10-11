import React, { useEffect } from 'react';
import { X, Loader2, Inbox, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

const btn = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-slate-600 hover:bg-slate-100',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
};

export function Button({ variant = 'primary', size = 'md', loading, className, children, ...props }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm',
        btn[variant],
        className
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Card({ className, children }) {
  return <div className={clsx('bg-white rounded-xl border border-slate-200 shadow-xs', className)}>{children}</div>;
}

const tones = {
  slate: 'bg-slate-100 text-slate-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  blue: 'bg-sky-50 text-sky-700',
  indigo: 'bg-indigo-50 text-indigo-700',
  purple: 'bg-purple-50 text-purple-700',
};

export function Badge({ tone = 'slate', children }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap', tones[tone])}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'indigo' }) {
  return (
    <Card className="p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1.5 tabular-nums">{value}</p>
        {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      </div>
      {Icon && (
        <div className={clsx('p-2.5 rounded-lg', tones[tone])}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </Card>
  );
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-500 text-sm">
      <Loader2 className="w-4 h-4 animate-spin" /> {label}
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', hint }) {
  return (
    <div className="flex flex-col items-center text-center py-14 text-slate-500">
      <Inbox className="w-9 h-9 text-slate-300 mb-2" />
      <p className="font-medium text-slate-700">{title}</p>
      {hint && <p className="text-sm mt-1">{hint}</p>}
    </div>
  );
}

export function ErrorBox({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span className="flex-1">{error}</span>
      {onRetry && (
        <button onClick={onRetry} className="font-semibold underline cursor-pointer">
          Retry
        </button>
      )}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, wide }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:py-10" onMouseDown={onClose}>
      <div
        className={clsx('bg-white rounded-2xl shadow-2xl w-full', wide ? 'max-w-3xl' : 'max-w-lg')}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:bg-slate-100 cursor-pointer" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onClose, loading }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}

// ---------- form controls ----------
const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500';

export function Field({ label, hint, error, children, className }) {
  return (
    <label className={clsx('block', className)}>
      <span className="block text-xs font-semibold text-slate-600 mb-1">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-slate-400 mt-1">{hint}</span>}
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  );
}

export const Input = React.forwardRef(function Input(props, ref) {
  return <input ref={ref} {...props} className={clsx(inputCls, props.className)} />;
});

export function Select({ options, placeholder, ...props }) {
  return (
    <select {...props} className={clsx(inputCls, props.className)}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function Textarea(props) {
  return <textarea rows={4} {...props} className={clsx(inputCls, props.className)} />;
}

export function Checkbox({ label, ...props }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
      <input type="checkbox" {...props} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
      {label}
    </label>
  );
}

// ---------- table ----------
export function DataTable({ columns, rows, rowKey = 'id', empty, onRowClick }) {
  if (!rows.length) return <EmptyState {...empty} />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
            {columns.map((c) => (
              <th key={c.key} className={clsx('px-4 py-3 font-semibold whitespace-nowrap', c.align === 'right' && 'text-right')}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr
              key={r[rowKey]}
              onClick={onRowClick ? () => onRowClick(r) : undefined}
              className={clsx('hover:bg-slate-50/70', onRowClick && 'cursor-pointer')}
            >
              {columns.map((c) => (
                <td key={c.key} className={clsx('px-4 py-3 align-middle', c.align === 'right' && 'text-right tabular-nums')}>
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Horizontal bar used by overview/insights charts (no chart lib needed).
export function Bar({ value, max, tone = 'bg-indigo-500' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
      <div className={clsx('h-full rounded-full', tone)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Pagination({ total, limit, offset, onChange }) {
  if (total <= limit) return null;
  const from = offset + 1;
  const to = Math.min(offset + limit, total);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-sm text-slate-600">
      <span>
        {from}–{to} of {total}
      </span>
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" disabled={offset === 0} onClick={() => onChange(Math.max(0, offset - limit))} aria-label="Previous page">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="secondary" disabled={to >= total} onClick={() => onChange(offset + limit)} aria-label="Next page">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
