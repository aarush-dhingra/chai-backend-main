import { useState } from 'react';
import { FiX, FiUpload, FiImage, FiVideo } from 'react-icons/fi';
import { publishVideo } from '../services/api';

function VideoUploadModal({ onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
    thumbnail: null,
    isPublished: true,
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, videoFile: file });
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, thumbnail: file });
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.videoFile || !formData.thumbnail) {
      alert('Please select both video and thumbnail');
      return;
    }

    setUploading(true);
    try {
      await publishVideo(formData);
      alert('Video uploaded successfully!');
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-dark-secondary)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--color-dark-border)]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-dark-border)]">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <FiUpload className="text-[var(--color-neon-purple)]" />
            <span>Upload Video</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--color-dark-tertiary)] rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Video Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">Video File *</label>
            {videoPreview ? (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video src={videoPreview} controls className="w-full h-full" />
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, videoFile: null });
                    setVideoPreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-[var(--color-dark-border)] rounded-lg cursor-pointer hover:border-[var(--color-neon-purple)] transition-colors">
                <FiVideo className="w-12 h-12 text-gray-500 mb-2" />
                <span className="text-gray-400">Click to upload video</span>
                <span className="text-xs text-gray-600 mt-1">MP4, WebM, or OGG</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">Thumbnail *</label>
            {thumbnailPreview ? (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, thumbnail: null });
                    setThumbnailPreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-[var(--color-dark-border)] rounded-lg cursor-pointer hover:border-[var(--color-neon-purple)] transition-colors">
                <FiImage className="w-8 h-8 text-gray-500 mb-2" />
                <span className="text-gray-400">Click to upload thumbnail</span>
                <span className="text-xs text-gray-600 mt-1">JPG, PNG, or WebP</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter video title"
              className="input"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell viewers about your video"
              className="input min-h-[120px] resize-none"
              required
            />
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-5 h-5 accent-[var(--color-neon-purple)]"
            />
            <label htmlFor="isPublished" className="text-sm font-medium">
              Publish immediately
            </label>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-[var(--color-dark-tertiary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--color-neon-purple)] to-[var(--color-neon-blue)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={uploading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VideoUploadModal;
