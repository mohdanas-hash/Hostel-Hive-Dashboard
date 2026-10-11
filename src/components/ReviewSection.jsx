import React, { useState, useEffect } from 'react';
import { reviewsApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { Star, MessageSquare, Send } from 'lucide-react';

export default function ReviewSection({ targetType, targetId }) {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsApi.getByTarget(targetType, targetId);
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetId) {
      loadReviews();
    }
  }, [targetType, targetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    try {
      setSubmitting(true);
      setError(null);
      await reviewsApi.create({
        target_type: targetType,
        target_id: Number(targetId),
        rating: Number(rating),
        comment,
      });
      setComment('');
      setRating(5);
      await loadReviews();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          Reviews & Ratings ({reviews.length})
        </h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold border border-amber-200">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>
              {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} / 5.0
            </span>
          </div>
        )}
      </div>

      {/* Add Review Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Write a review</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (food quality, cleanliness, internet, management...)"
            rows={2}
            className="w-full text-sm bg-white border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer shadow-xs transition"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Posting...' : 'Post Review'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
          Please log in to share your review and rating.
        </p>
      )}

      {/* Reviews List */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {loading ? (
          <p className="text-sm text-slate-400 py-4 text-center">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="p-3.5 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/50 transition">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    U#{rev.user_id}
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-slate-700 mt-1 leading-relaxed">{rev.comment || '(No written comment)'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
