import React, { useState, useEffect } from 'react';
import { paymentsApi } from '../api/endpoints';
import { CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsApi
      .getMyPayments()
      .then(setPayments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <CreditCard className="w-7 h-7 text-emerald-600" />
          Payment Transactions
        </h1>
        <p className="text-sm text-slate-500">
          History of hostel rent and mess subscription payments, invoices and payment receipts
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading payment records...</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">No Payment History Found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            You have not made any hostel rent or mess subscription payments yet.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-bold uppercase text-slate-400">
                  <th className="py-4 px-6">ID & Order</th>
                  <th className="py-4 px-6">Kind / Purpose</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div>#{p.id}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {p.provider_order_id}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-800 capitalize">
                        {p.kind?.replace('_', ' ')}
                      </span>
                      {p.include_deposit && (
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          + Security Deposit Included
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 font-black text-emerald-600 text-base">
                      ₹{p.amount}
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {p.months} Month{p.months > 1 ? 's' : ''}
                    </td>
                    <td className="py-4 px-6">
                      {p.status === 'paid' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                        </span>
                      )}
                      {p.status === 'created' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                      {p.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
                          <XCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
