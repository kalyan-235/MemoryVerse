import { useState, useEffect } from 'react';
import { IoAddOutline, IoPencilOutline, IoTrashOutline, IoBookmarkOutline } from 'react-icons/io5';
import PageLayout from '../components/PageLayout';
import DiaryEntryCard from '../components/DiaryEntryCard';
import { diaryApi } from '../apis/diaryApi';
import '../css/DiaryPage.css';

function DiaryPage() {
  const [allEntries, setAllEntries] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [isWritingNew, setIsWritingNew] = useState(false);
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryContent, setNewEntryContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    diaryApi.getAllDiaryEntries()
      .then((entries) => {
        setAllEntries(entries);
        if (entries.length > 0) setActiveEntry(entries[0]);
      })
      .catch(console.error);
  }, []);

  const handleSaveNewEntry = async (e) => {
    e.preventDefault();
    if (!newEntryTitle.trim()) return;
    setIsSaving(true);
    try {
      const saved = await diaryApi.createDiaryEntry({
        title: newEntryTitle,
        content: newEntryContent,
        date: new Date().toISOString(),
      });
      setAllEntries((prev) => [saved, ...prev]);
      setActiveEntry(saved);
      setIsWritingNew(false);
      setNewEntryTitle('');
      setNewEntryContent('');
    } catch (err) {
      console.error('Failed to save diary entry:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = activeEntry?.date
    ? new Date(activeEntry.date).toLocaleDateString('en-US', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  const dayName = activeEntry?.date
    ? new Date(activeEntry.date).toLocaleDateString('en-US', { weekday: 'long' })
    : '';

  return (
    <PageLayout pageTitle="My Diary">
      <div className="diary-page">
        <div className="diary-content">
          {/* Left Panel */}
          <div className="diary-left-panel">
            {/* All Entries List */}
            <div className="diary-all-entries-list">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 className="diary-all-entries-title">All Entries</h3>
                <button
                  onClick={() => { setIsWritingNew(true); setActiveEntry(null); }}
                  style={{
                    background: 'linear-gradient(135deg,#9b8ec4,#c8a882)',
                    color: '#fff', border: 'none', borderRadius: '10px',
                    padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}
                  aria-label="Write new diary entry"
                >
                  <IoAddOutline size={14} /> New Entry
                </button>
              </div>

              {allEntries.map((entry) => (
                <DiaryEntryCard
                  key={entry._id}
                  entry={entry}
                  isActive={activeEntry?._id === entry._id}
                  onClick={(e) => { setActiveEntry(e); setIsWritingNew(false); }}
                />
              ))}

              {allEntries.length === 0 && !isWritingNew && (
                <p style={{ fontSize: '13px', color: '#c8a882', textAlign: 'center', marginTop: '16px' }}>
                  No entries yet. Start writing!
                </p>
              )}
            </div>
          </div>

          {/* Right Panel */}
          {isWritingNew ? (
            /* New Entry Form */
            <div className="diary-new-entry-form">
              <form onSubmit={handleSaveNewEntry}>
                <input
                  type="text"
                  className="diary-entry-title-input"
                  placeholder="Give your entry a title..."
                  value={newEntryTitle}
                  onChange={(e) => setNewEntryTitle(e.target.value)}
                  required
                  autoFocus
                  aria-label="Diary entry title"
                />
                <textarea
                  className="diary-rich-editor"
                  placeholder="Write your thoughts, feelings and daily memories here..."
                  value={newEntryContent}
                  onChange={(e) => setNewEntryContent(e.target.value)}
                  style={{
                    width: '100%', border: 'none', outline: 'none', resize: 'none',
                    fontSize: '15px', lineHeight: '1.8', color: '#3d2c1e',
                    fontFamily: 'Georgia, serif', minHeight: '300px', background: 'transparent',
                  }}
                  aria-label="Diary entry content"
                />
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setIsWritingNew(false)}
                    style={{
                      padding: '12px 24px', border: '1px solid #e8d5c0', borderRadius: '12px',
                      background: 'transparent', color: '#7a5c44', cursor: 'pointer', fontSize: '14px',
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="diary-save-entry-btn" disabled={isSaving}>
                    {isSaving ? 'Saving...' : '💾 Save Entry'}
                  </button>
                </div>
              </form>
            </div>
          ) : activeEntry ? (
            /* Active Entry View */
            <div className="diary-active-entry">
              <div className="diary-active-entry-header">
                <div>
                  <span className="diary-active-entry-date">{formattedDate}</span>
                  <span className="diary-active-entry-day"> • {dayName}</span>
                </div>
                {activeEntry.mood && (
                  <div className="diary-active-entry-mood-badge">
                    {activeEntry.mood}
                  </div>
                )}
              </div>

              <h2 className="diary-active-entry-title">{activeEntry.title}</h2>

              {activeEntry.imageUrl && (
                <img
                  src={activeEntry.imageUrl}
                  alt="Diary cover"
                  className="diary-active-entry-cover-image"
                />
              )}

              <div
                className="diary-active-entry-content"
                dangerouslySetInnerHTML={{ __html: activeEntry.content }}
              />

              <div className="diary-active-entry-actions">
                <button className="diary-action-btn" aria-label="Edit entry">
                  <IoPencilOutline />
                </button>
                <button className="diary-action-btn" aria-label="Bookmark entry">
                  <IoBookmarkOutline />
                </button>
                <button className="diary-action-btn" aria-label="Delete entry">
                  <IoTrashOutline />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#fff', borderRadius: '20px', minHeight: '400px', color: '#c8a882',
              fontSize: '15px', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '40px' }}>📖</span>
              Select an entry or write a new one.
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default DiaryPage;
