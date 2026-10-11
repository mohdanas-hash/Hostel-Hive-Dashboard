import React, { useState, useEffect } from 'react';
import { admissionsApi, hostelsApi, paymentsApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  CreditCard,
  ChevronRight,
  Eye,
  Loader2,
} from 'lucide-react';

const DOC_LABELS = {
  passport_photo: 'Passport Size Photo (Image only)',
  fee_receipt: 'University Fee Receipt (PDF or Image)',
  aadhaar: 'Aadhaar Card (PDF or Image)',
  pan: 'PAN Card (PDF or Image)',
};

export default function Admissions() {
  const { isCentralAdmin } = useAuth();
  const [applications, setApplications] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  // Upload state
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Review modal state (Admin)
  const [reviewModalApp, setReviewModalApp] = useState(null);
  const [reviewApprove, setReviewApprove] = useState(true);
  const [reviewReason, setReviewReason] = useState('');
  const [reviewing, setReviewing] = useState(false);

  // Payment modal state (Student)
  const [payModalApp, setPayModalApp] = useState(null);
  const [payMonths, setPayMonths] = useState(1);
  const [includeDeposit, setIncludeDeposit] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paySuccessMessage, setPaySuccessMessage] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [apps, hostelList] = await Promise.all([
        admissionsApi.getAll(),
        hostelsApi.getAll(),
      ]);
      setApplications(apps);
      setHostels(hostelList);
      if (apps.length > 0 && !selectedApp) {
        setSelectedApp(apps[0]);
      } else if (selectedApp) {
        // Refresh currently active selectedApp
        const refreshed = apps.find((a) => a.id === selectedApp.id);
        if (refreshed) setSelectedApp(refreshed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDocumentUpload = async (docType, file) => {
    if (!selectedApp || !file) return;
    try {
      setUploadingDoc(docType);
      setUploadError(null);
      const updated = await admissionsApi.uploadDocument(selectedApp.id, docType, file);
      setSelectedApp(updated);
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err) {
      setUploadError(err.response?.data?.detail || 'Failed to upload document');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleSubmitApplication = async () => {
    if (!selectedApp) return;
    try {
      const updated = await admissionsApi.submit(selectedApp.id);
      setSelectedApp(updated);
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      alert('Application successfully submitted! You may now proceed to pay hostel rent.');
    } catch (err) {
      alert(err.response?.data?.detail?.message || err.response?.data?.detail || 'Submission failed');
    }
  };

  const handleReviewApplication = async (e) => {
    e.preventDefault();
    if (!reviewModalApp) return;
    try {
      setReviewing(true);
      const updated = await admissionsApi.review(
        reviewModalApp.id,
        reviewApprove,
        reviewApprove ? null : reviewReason
      );
      setReviewModalApp(null);
      setSelectedApp(updated);
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err) {
      alert(err.response?.data?.detail || 'Review action failed');
    } finally {
      setReviewing(false);
    }
  };

  const handleDownloadDoc = (appId, docType) => {
    // Open the private document stream directly via browser with Bearer token
    const token = localStorage.getItem('token');
    fetch(admissionsApi.downloadDocumentUrl(appId, docType), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Cannot view document');
        return res.blob();
      })
      .then((blob) => {
        const fileUrl = window.URL.createObjectURL(blob);
        window.open(fileUrl, '_blank');
      })
      .catch((err) => alert(err.message));
  };

  const handlePayHostelRent = async () => {
    if (!payModalApp) return;
    try {
      setPaying(true);
      const order = await paymentsApi.create({
        kind: 'hostel_rent',
        hostel_id: payModalApp.hostel_id,
        months: Number(payMonths),
        include_deposit: Boolean(includeDeposit),
      });

      // Confirm mock payment
      await paymentsApi.confirm(order.id, `mock_pay_${Date.now()}`, true);

      setPaySuccessMessage(`Payment completed! Order #${order.id} for ₹${order.amount}`);
      setPayModalApp(null);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Payment could not be processed');
    } finally {
      setPaying(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            <Clock className="w-3.5 h-3.5" /> Draft (Upload Docs)
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
            <Clock className="w-3.5 h-3.5" /> Submitted (Payment Ready)
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
            <XCircle className="w-3.5 h-3.5" /> Rejected
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-7 h-7 text-indigo-600" />
          Hostel Admissions & Document Verification
        </h1>
        <p className="text-sm text-slate-500">
          Upload required identification documents (Aadhaar, PAN, Fee Receipt & Photo), submit for admission and clear hostel rent
        </p>
      </div>

      {paySuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{paySuccessMessage}</span>
          </div>
          <button onClick={() => setPaySuccessMessage(null)} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading admissions applications...</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">No Admission Applications Found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Browse the Hostels tab and click "Apply Admission" to start your room application.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications Master List */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs space-y-3 lg:col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
              Applications ({applications.length})
            </h3>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {applications.map((app) => {
                const hostel = hostels.find((h) => h.id === app.hostel_id);
                const isSelected = selectedApp?.id === app.id;
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`p-4 rounded-2xl border transition cursor-pointer space-y-2 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800">
                        App #{app.id} • User #{app.user_id}
                      </span>
                      {getStatusBadge(app.status)}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {hostel?.name || `Hostel #${app.hostel_id}`}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{new Date(app.created_at).toLocaleDateString()}</span>
                      <span className="font-semibold text-indigo-600 flex items-center gap-0.5">
                        View Details <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Application Detail & KYC Document Uploads */}
          {selectedApp && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900">
                      Admission Application #{selectedApp.id}
                    </h2>
                    {getStatusBadge(selectedApp.status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Hostel:{' '}
                    <strong>
                      {hostels.find((h) => h.id === selectedApp.hostel_id)?.name ||
                        `Hostel ID ${selectedApp.hostel_id}`}
                    </strong>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {isCentralAdmin && (
                    <button
                      onClick={() => {
                        setReviewModalApp(selectedApp);
                        setReviewApprove(true);
                        setReviewReason('');
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      Admin Review KYC
                    </button>
                  )}

                  {/* Payment Allowed if Submitted or Approved */}
                  {(selectedApp.status === 'submitted' || selectedApp.status === 'approved') && (
                    <button
                      onClick={() => setPayModalApp(selectedApp)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      Pay Hostel Rent
                    </button>
                  )}
                </div>
              </div>

              {selectedApp.reject_reason && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Application Rejected by Admin</span>
                  </div>
                  <p>{selectedApp.reject_reason}</p>
                </div>
              )}

              {/* Uploads Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
                    Mandatory Admission Documents
                  </h3>
                  <span className="text-xs text-slate-400">
                    {selectedApp.documents.length} / 4 Uploaded
                  </span>
                </div>

                {uploadError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                    {uploadError}
                  </p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['passport_photo', 'fee_receipt', 'aadhaar', 'pan'].map((docType) => {
                    const doc = selectedApp.documents.find((d) => d.doc_type === docType);
                    const isUploading = uploadingDoc === docType;
                    const canUpload =
                      selectedApp.status === 'draft' || selectedApp.status === 'rejected';

                    return (
                      <div
                        key={docType}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            {DOC_LABELS[docType]}
                          </span>
                          {doc ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Ready
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                              Missing
                            </span>
                          )}
                        </div>

                        {doc ? (
                          <div className="flex items-center justify-between pt-1">
                            <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                              {doc.original_name}
                            </div>
                            <button
                              onClick={() => handleDownloadDoc(selectedApp.id, docType)}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Doc
                            </button>
                          </div>
                        ) : null}

                        {/* Upload trigger */}
                        {canUpload && (
                          <label className="block pt-1 cursor-pointer">
                            <div className="w-full py-2 px-3 border border-dashed border-slate-300 hover:border-indigo-500 rounded-xl text-center text-xs font-semibold text-indigo-600 hover:bg-indigo-50/50 transition flex items-center justify-center gap-1.5">
                              {isUploading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              <span>{doc ? 'Replace Document' : 'Upload File'}</span>
                            </div>
                            <input
                              type="file"
                              accept={
                                docType === 'passport_photo'
                                  ? 'image/jpeg,image/png'
                                  : 'image/jpeg,image/png,application/pdf'
                              }
                              className="hidden"
                              disabled={isUploading}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleDocumentUpload(docType, file);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button for Draft Applications */}
              {(selectedApp.status === 'draft' || selectedApp.status === 'rejected') && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Once all 4 documents are uploaded, submit the application to unlock rent payment.
                  </p>
                  <button
                    onClick={handleSubmitApplication}
                    disabled={selectedApp.missing_documents?.length > 0}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-40 cursor-pointer"
                  >
                    Submit Application
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Review Modal (Admin Only) */}
      {reviewModalApp && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Review Admission Application</h3>
            <form onSubmit={handleReviewApplication} className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    checked={reviewApprove}
                    onChange={() => setReviewApprove(true)}
                    className="text-purple-600"
                  />
                  <span>Approve Documents & Application</span>
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input
                    type="radio"
                    name="decision"
                    checked={!reviewApprove}
                    onChange={() => setReviewApprove(false)}
                    className="text-purple-600"
                  />
                  <span>Reject (Request Re-upload)</span>
                </label>
              </div>

              {!reviewApprove && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Rejection Reason
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                    placeholder="e.g. Aadhaar card photo is blurry. Please upload a clear scanned copy."
                    className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewModalApp(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className="px-5 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {reviewing ? 'Saving...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Hostel Rent Modal */}
      {payModalApp && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Pay Hostel Rent
              </h3>
              <button onClick={() => setPayModalApp(null)} className="text-slate-400">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Months to Pay
                </label>
                <select
                  value={payMonths}
                  onChange={(e) => setPayMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  {[1, 2, 3, 6, 12].map((num) => (
                    <option key={num} value={num}>
                      {num} Month{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={includeDeposit}
                  onChange={(e) => setIncludeDeposit(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                Include Security Deposit (One-time)
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Calculated on backend</span>
              <button
                onClick={handlePayHostelRent}
                disabled={paying}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {paying && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
