import { useState, useRef } from 'react';
import { IoCloseOutline, IoImageOutline, IoVideocamOutline } from 'react-icons/io5';
import '../css/AddMemoryModal.css';

function AddMemoryModal({ isOpen, onClose, onSave, collections = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    location: '',
    tags: [],
    collectionId: '',
  });
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(',', '');
      if (newTag && !formData.tags.includes(newTag)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave({ ...formData, mediaFile });
      onClose();
    } catch (err) {
      // error is shown by parent (toast)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="add-memory-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-memory-title"
    >
      <div className="add-memory-modal">
        {/* Header */}
        <div className="add-memory-modal-header">
          <h2 id="add-memory-title" className="add-memory-modal-title">
            ✨ New Memory
          </h2>
          <button className="add-memory-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <IoCloseOutline />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Media Upload */}
          {mediaPreview ? (
            <div className="memory-media-preview">
              <img src={mediaPreview} alt="Memory preview" className="memory-media-preview-img" />
              <button
                type="button"
                className="memory-media-preview-remove-btn"
                onClick={handleRemoveMedia}
                aria-label="Remove media"
              >
                <IoCloseOutline />
              </button>
            </div>
          ) : (
            <div
              className="memory-media-upload-zone"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload photo or video"
            >
              <div className="memory-media-upload-icon">
                <IoImageOutline />
              </div>
              <p className="memory-media-upload-text">Upload Photo or Video</p>
              <p className="memory-media-upload-subtext">JPG, PNG, MP4 · Max 20MB</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={handleMediaSelect}
          />

          {/* Title */}
          <div className="add-memory-form-field">
            <label className="add-memory-form-label" htmlFor="memory-title">
              Memory Title *
            </label>
            <input
              id="memory-title"
              type="text"
              className="add-memory-form-input"
              placeholder="Give this memory a name..."
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </div>

          {/* Description */}
          <div className="add-memory-form-field">
            <label className="add-memory-form-label" htmlFor="memory-description">
              Description
            </label>
            <textarea
              id="memory-description"
              className="add-memory-form-textarea"
              placeholder="What made this moment special?"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          {/* Date & Location */}
          <div className="add-memory-form-row">
            <div className="add-memory-form-field">
              <label className="add-memory-form-label" htmlFor="memory-date">Date</label>
              <input
                id="memory-date"
                type="date"
                className="add-memory-form-input"
                value={formData.date}
                onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div className="add-memory-form-field">
              <label className="add-memory-form-label" htmlFor="memory-location">Location</label>
              <input
                id="memory-location"
                type="text"
                className="add-memory-form-input"
                placeholder="Where was this?"
                value={formData.location}
                onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
              />
            </div>
          </div>

          {/* Collection */}
          {collections.length > 0 && (
            <div className="add-memory-form-field">
              <label className="add-memory-form-label" htmlFor="memory-collection">
                Add to Collection
              </label>
              <select
                id="memory-collection"
                className="add-memory-form-select"
                value={formData.collectionId}
                onChange={(e) => setFormData((p) => ({ ...p, collectionId: e.target.value }))}
              >
                <option value="">None</option>
                {collections.map((col) => (
                  <option key={col._id} value={col._id}>{col.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tags */}
          <div className="add-memory-form-field">
            <label className="add-memory-form-label">Tags</label>
            <div className="memory-tags-input-wrapper" onClick={() => document.getElementById('tag-input')?.focus()}>
              {formData.tags.map((tag) => (
                <span key={tag} className="memory-tag-pill">
                  #{tag}
                  <button
                    type="button"
                    className="memory-tag-remove-btn"
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="tag-input"
                type="text"
                className="memory-tag-text-input"
                placeholder="Type a tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="add-memory-modal-footer">
            <button type="button" className="add-memory-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="add-memory-save-btn"
              disabled={isSubmitting || !formData.title.trim()}
            >
              {isSubmitting ? 'Saving...' : '💾 Save Memory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddMemoryModal;
