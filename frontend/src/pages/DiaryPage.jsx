import { useState, useEffect } from 'react';
import {
  IoAddOutline, IoPencilOutline, IoTrashOutline,
  IoSaveOutline, IoCloseOutline, IoSearchOutline,
} from 'react-icons/io5';
import PageLayout from '../components/PageLayout';
import { diaryApi } from '../apis/diaryApi';
import toast from 'react-hot-toast';
import '../css/DiaryPage.css';

const MOOD_OPTIONS = ['😊 Happy', '😢 Sad', '😌 Peaceful', '😤 Frustrated', '🥰 Grateful', '😴 Tired', '🔥 Excited', '🤔 Thoughtful'];

function DiaryPage() {
  const [allEntries, setAllEntries]     = useState([]);
  const [activeEntry, setActiveEntry]   = useState(null);
  const [isEditing, setIsEditing]       = useState(false);   // edit existing
  const [isWritingNew, setIsWritingNew] = useState(false);   // new entry
  const [isSaving, setIsSaving]         = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');

  // Form state (used for both new + edit)
  const [formTitle,   setFormTitle]   = useState('');
  const [formContent, setFormContent] = useState('');
  const [formDate,    setFormDate]    = useState(new Date().toISOString().split('T')[0]);
  const [formMood,    setFormMood]    = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const entries = await diaryApi.getAllDiaryEntries();
      setAllEntries(entries);
      if (entries.length > 0 && !activeEntry) setActiveEntry(entries[0]);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Open new entry form ──
  const handleNewEntry = () => {
    setFormTitle('');
    setFormContent('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormMood('');
    setIsWritingNew(true);
    setIsEditing(false);
    setActiveEntry(null);
  };

  // ── Open edit form for existing entry ──
  const handleEditEntry = (entry) => {
    setFormTitle(entry.title);
    setFormContent(entry.content || '');
    setFormDate(entry.date ? entry.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    setFormMood(entry.mood || '');
    setIsEditing(true);
    setIsWritingNew(false);
  };

  // ── Save new entry ──
  const handleSaveNew = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setIsSaving(true);
    try {
      const saved = await diaryApi.createDiaryEntry({
        title: formTitle,
        content: formContent,
        date: new Date(formDate).toISOString(),
        mood: formMood,
      });
      setAllEntries(prev => [saved, ...prev]);
      setActiveEntry(saved);
      setIsWritingNew(false);
      toast.success('Diary entry saved! 📖');
    } catch (err) {
      toast.error(err.message || 'Failed to save entry.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Update existing entry ──
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !activeEntry) return;
    setIsSaving(true);
    try {
      const updated = await diaryApi.updateDiaryEntry(activeEntry._id, {
        title: formTitle,
        content: formContent,
        date: new Date(formDate).toISOString(),
        mood: formMood,
      });
      setAllEntries(prev => prev.map(e => e._id === updated._id ? updated : e));
      setActiveEntry(updated);
      setIsEditing(false);
      toast.success('Entry updated! ✨');
    } catch (err) {
      toast.error(err.message || 'Failed to update entry.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete entry ──
  const handleDeleteEntry = async (entry) => {
    if (!window.confirm(`Delete "${entry.title}"? This cannot be undone.`)) return;
    try {
      await diaryApi.deleteDiaryEntry(entry._id);
      const remaining = allEntries.filter(e => e._id !== entry._id);
      setAllEntries(remaining);
      setActiveEntry(remaining[0] || null);
      setIsEditing(false);
      toast.success('Entry deleted.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete.');
    }
  };

  // ── Cancel edit / new ──
  const handleCancel = () => {
    setIsEditing(false);
    setIsWritingNew(false);
  };

  // ── Filtered entries ──
  const filteredEntries = allEntries.filter(e =>
    e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formattedDate = (dateStr) => dateStr
    ? new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  const dayName = (dateStr) => dateStr
    ? new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' })
    : '';

  // ── Shared form (new + edit) ──
  const renderForm = (isNew) => (
    <div className="diary-new-entry-form">
      <form onSubmit={isNew ? handleSaveNew : handleSaveEdit}>
        <input
          type="text"
          className="diary-entry-title-input"
          placeholder={isNew ? 'Give your entry a title...' : 'Entry title'}
          value={formTitle}
          onChange={e => setFormTitle(e.target.value)}
          required autoFocus
        />

        {/* Date + Mood row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#9b8ec4',
              textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>
              Date
            </label>
            <input
              type="date"
              value={formDate}
              onChange={e => setFormDate(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #e8d5c0',
                borderRadius: '10px', fontSize: '14px', color: '#3d2c1e',
                background: '#fdf6ec', outline: 'none',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#9b8ec4',
              textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '5px' }}>
              Mood
            </label>
            <select
              value={formMood}
              onChange={e => setFormMood(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #e8d5c0',
                borderRadius: '10px', fontSize: '14px', color: '#3d2c1e',
                background: '#fdf6ec', outline: 'none',
              }}
            >
              <option value="">Select mood...</option>
              {MOOD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <textarea
          className="diary-rich-editor"
          placeholder="Write your thoughts, feelings and daily memories here..."
          value={formContent}
          onChange={e => setFormContent(e.target.value)}
          style={{
            width: '100%', border: '1px solid #e8d5c0', borderRadius: '12px',
            outline: 'none', resize: 'vertical', fontSize: '15px', lineHeight: '1.8',
            color: '#3d2c1e', fontFamily: 'Georgia, serif', minHeight: '280px',
            background: '#fdf6ec', padding: '16px',
          }}
        />

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button
            type="button" onClick={handleCancel}
            style={{
              padding: '12px 24px', border: '1px solid #e8d5c0', borderRadius: '12px',
              background: 'transparent', color: '#7a5c44', cursor: 'pointer', fontSize: '14px',
            }}
          >
            Cancel
          </button>
          <button type="submit" className="diary-save-entry-btn" disabled={isSaving || !formTitle.trim()}>
            {isSaving ? 'Saving...' : (isNew ? '💾 Save Entry' : '✅ Update Entry')}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <PageLayout pageTitle="My Diary">
      <div className="diary-page">
        <div className="diary-content">

          {/* ── LEFT PANEL ── */}
          <div className="diary-left-panel">
            <div className="diary-all-entries-list">
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h3 className="diary-all-entries-title">All Entries</h3>
                <button
                  onClick={handleNewEntry}
                  style={{
                    background: 'linear-gradient(135deg,#9b8ec4,#c8a882)',
                    color: '#fff', border: 'none', borderRadius: '10px',
                    padding: '6px 12px', fontSize: '12px', fontWeight: '600',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  <IoAddOutline size={14}/> New Entry
                </button>
              </div>

              {/* Search */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#f5e6d3', borderRadius: '10px', padding: '8px 12px',
                marginBottom: '12px',
              }}>
                <IoSearchOutline style={{ color: '#c8a882', fontSize: '14px' }} />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none', background: 'transparent', outline: 'none',
                    fontSize: '13px', color: '#3d2c1e', width: '100%',
                  }}
                />
              </div>

              {/* Entries list */}
              {filteredEntries.length === 0 && (
                <p style={{ fontSize: '13px', color: '#c8a882', textAlign: 'center', marginTop: '16px' }}>
                  {searchQuery ? 'No entries found.' : 'No entries yet. Start writing!'}
                </p>
              )}
              {filteredEntries.map(entry => (
                <div
                  key={entry._id}
                  className={`diary-entry-list-item ${activeEntry?._id === entry._id ? 'selected' : ''}`}
                  onClick={() => { setActiveEntry(entry); setIsEditing(false); setIsWritingNew(false); }}
                  style={{
                    cursor: 'pointer',
                    background: activeEntry?._id === entry._id ? 'rgba(155,142,196,0.12)' : 'transparent',
                    borderRadius: '10px', padding: '10px',
                    borderLeft: activeEntry?._id === entry._id ? '3px solid #9b8ec4' : '3px solid transparent',
                    marginBottom: '4px',
                  }}
                >
                  <div className="diary-entry-list-date">{formattedDate(entry.date)}</div>
                  <div className="diary-entry-list-title">{entry.title}</div>
                  <div className="diary-entry-list-preview">
                    {entry.content?.replace(/<[^>]*>/g, '').slice(0, 55)}...
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          {isWritingNew ? renderForm(true)
          : isEditing ? renderForm(false)
          : activeEntry ? (
            <div className="diary-active-entry">
              {/* Header */}
              <div className="diary-active-entry-header">
                <div>
                  <span className="diary-active-entry-date">{formattedDate(activeEntry.date)}</span>
                  <span className="diary-active-entry-day"> • {dayName(activeEntry.date)}</span>
                </div>
                {activeEntry.mood && (
                  <div className="diary-active-entry-mood-badge">{activeEntry.mood}</div>
                )}
              </div>

              <h2 className="diary-active-entry-title">{activeEntry.title}</h2>

              {activeEntry.imageUrl && (
                <img src={activeEntry.imageUrl} alt="Diary cover"
                  className="diary-active-entry-cover-image"/>
              )}

              {/* Content */}
              <div className="diary-active-entry-content" style={{ whiteSpace: 'pre-wrap' }}>
                {activeEntry.content || (
                  <span style={{ color: '#c8a882', fontStyle: 'italic' }}>No content written yet.</span>
                )}
              </div>

              {/* Action buttons */}
              <div className="diary-active-entry-actions">
                <button
                  className="diary-action-btn"
                  onClick={() => handleEditEntry(activeEntry)}
                  title="Edit entry"
                  aria-label="Edit entry"
                >
                  <IoPencilOutline />
                </button>
                <button
                  className="diary-action-btn"
                  onClick={() => handleDeleteEntry(activeEntry)}
                  title="Delete entry"
                  aria-label="Delete entry"
                  style={{ color: '#e07070' }}
                >
                  <IoTrashOutline />
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#fff', borderRadius: '20px', minHeight: '400px',
              color: '#c8a882', fontSize: '15px', flexDirection: 'column', gap: '10px',
            }}>
              <span style={{ fontSize: '48px' }}>📖</span>
              <p style={{ fontWeight: '600', color: '#7a5c44' }}>Your diary awaits.</p>
              <p style={{ fontSize: '13px' }}>Select an entry or click <strong>New Entry</strong> to start.</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default DiaryPage;
