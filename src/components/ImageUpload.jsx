import React, { useState } from 'react';
import { imagesApi } from '../api/endpoints';
import { Upload, X, Loader2 } from 'lucide-react';

export default function ImageUpload({ value, onChange, folder = 'misc', label = 'Image' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Only image files (JPEG, PNG) are allowed');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const res = await imagesApi.upload(file, folder);
      onChange(res.url);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to upload image to Cloudinary');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 w-full max-w-sm h-48 flex items-center justify-center">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition cursor-pointer shadow-lg"
              title="Remove image"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-2">
          <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/40 transition rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer w-full max-w-sm text-center">
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-indigo-600">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm font-medium">Uploading to Cloudinary...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <div className="p-3 bg-slate-100 rounded-full text-slate-600">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-indigo-600">Click to upload</span> or drag image
                </div>
                <p className="text-xs text-slate-400">JPEG or PNG (up to 5MB)</p>
              </div>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
