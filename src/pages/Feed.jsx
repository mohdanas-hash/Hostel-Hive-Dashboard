import React, { useState, useEffect } from 'react';
import { postsApi, collegesApi, messesApi, hostelsApi, cafeteriasApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import ImageUpload from '../components/ImageUpload';
import {
  Rss,
  Plus,
  Calendar,
  Trash2,
  X,
  Loader2,
  UtensilsCrossed,
  Home,
  Coffee,
  Bell,
} from 'lucide-react';

export default function Feed() {
  const { isCentralAdmin } = useAuth();
  const [posts, setPosts] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [messes, setMesses] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterCollegeId, setFilterCollegeId] = useState('');
  const [filterKind, setFilterKind] = useState('');

  // Post creation modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const initialForm = {
    college_id: '',
    kind: 'mess_menu',
    mess_id: '',
    hostel_id: '',
    cafeteria_id: '',
    title: '',
    body: '',
    image_url: '',
    post_date: new Date().toISOString().split('T')[0],
  };
  const [formData, setFormData] = useState(initialForm);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterCollegeId) params.college_id = Number(filterCollegeId);
      if (filterKind) params.kind = filterKind;

      const [feedPosts, collegeList, messList, hostelList, cafeList] = await Promise.all([
        postsApi.getFeed(params),
        collegesApi.getAll(),
        messesApi.getAll(),
        hostelsApi.getAll(),
        cafeteriasApi.getAll(),
      ]);
      setPosts(feedPosts);
      setColleges(collegeList);
      setMesses(messList);
      setHostels(hostelList);
      setCafes(cafeList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterCollegeId, filterKind]);

  const handleOpenCreate = () => {
    setFormData({
      ...initialForm,
      college_id: colleges[0]?.id || '',
    });
    setShowModal(true);
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this feed post?')) return;
    try {
      await postsApi.delete(id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete post');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await postsApi.create({
        college_id: Number(formData.college_id),
        kind: formData.kind,
        mess_id: formData.mess_id ? Number(formData.mess_id) : null,
        hostel_id: formData.hostel_id ? Number(formData.hostel_id) : null,
        cafeteria_id: formData.cafeteria_id ? Number(formData.cafeteria_id) : null,
        title: formData.title,
        body: formData.body,
        image_url: formData.image_url || null,
        post_date: formData.post_date || null,
      });
      setShowModal(false);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const getKindBadge = (kind) => {
    switch (kind) {
      case 'mess_menu':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
            <UtensilsCrossed className="w-3 h-3" /> Mess Menu
          </span>
        );
      case 'cafeteria_menu':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 uppercase">
            <Coffee className="w-3 h-3" /> Cafe Special
          </span>
        );
      case 'hostel_update':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 uppercase">
            <Home className="w-3 h-3" /> Hostel Update
          </span>
        );
      case 'notice':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 uppercase">
            <Bell className="w-3 h-3" /> Notice
          </span>
        );
      default:
        return <span>{kind}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Rss className="w-7 h-7 text-violet-600" />
            Daily Campus Feed
          </h1>
          <p className="text-sm text-slate-500">
            Daily mess menu updates, cafeteria specials, hostel notices and administration broadcasts
          </p>
        </div>

        {isCentralAdmin && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 shadow-md shadow-violet-100 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Feed Post
          </button>
        )}
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center gap-3">
        <select
          value={filterCollegeId}
          onChange={(e) => setFilterCollegeId(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
        >
          <option value="">All Colleges</option>
          {colleges.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filterKind}
          onChange={(e) => setFilterKind(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
        >
          <option value="">All Post Types</option>
          <option value="mess_menu">Mess Menus</option>
          <option value="cafeteria_menu">Cafeteria Menus</option>
          <option value="hostel_update">Hostel Updates</option>
          <option value="notice">Notices</option>
        </select>
      </div>

      {/* Feed Stream */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading daily updates...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Rss className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700">No Posts in Feed</h3>
          <p className="text-sm text-slate-400">
            Check back later for today's menus and campus announcements.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const college = colleges.find((c) => c.id === post.college_id);
            return (
              <div
                key={post.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-violet-300 hover:shadow-xl transition flex flex-col justify-between"
              >
                <div>
                  {post.image_url && (
                    <div className="h-44 bg-slate-100 overflow-hidden">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      {getKindBadge(post.kind)}
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.post_date}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {post.body}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-500">
                    {college?.name || `College #${post.college_id}`}
                  </span>
                  {isCentralAdmin && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Feed Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Broadcast Campus Feed Post</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl">{error}</div>}

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    College
                  </label>
                  <select
                    required
                    value={formData.college_id}
                    onChange={(e) => setFormData({ ...formData, college_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="">Select College</option>
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Post Category
                  </label>
                  <select
                    value={formData.kind}
                    onChange={(e) => setFormData({ ...formData, kind: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="mess_menu">Mess Menu</option>
                    <option value="cafeteria_menu">Cafeteria Menu</option>
                    <option value="hostel_update">Hostel Update</option>
                    <option value="notice">Notice</option>
                  </select>
                </div>
              </div>

              {formData.kind === 'mess_menu' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Associate Mess (Optional)
                  </label>
                  <select
                    value={formData.mess_id}
                    onChange={(e) => setFormData({ ...formData, mess_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="">None / General</option>
                    {messes.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.kind === 'cafeteria_menu' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Associate Cafeteria (Optional)
                  </label>
                  <select
                    value={formData.cafeteria_id}
                    onChange={(e) => setFormData({ ...formData, cafeteria_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="">None / General</option>
                    {cafes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.kind === 'hostel_update' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Associate Hostel (Optional)
                  </label>
                  <select
                    value={formData.hostel_id}
                    onChange={(e) => setFormData({ ...formData, hostel_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="">None / General</option>
                    {hostels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wednesday Special Paneer Dinner Menu"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Details / Body
                </label>
                <textarea
                  rows={3}
                  placeholder="Details of food dishes, timings or hostel announcements..."
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Post Date
                </label>
                <input
                  type="date"
                  value={formData.post_date}
                  onChange={(e) => setFormData({ ...formData, post_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              {/* Cloudinary Image */}
              <ImageUpload
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                folder="posts"
                label="Attached Image (Menu / Notice)"
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
