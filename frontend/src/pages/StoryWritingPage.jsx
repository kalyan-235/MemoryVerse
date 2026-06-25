import { useState, useEffect } from 'react';
import {
  IoAddOutline, IoTrashOutline, IoPencilOutline,
  IoCloseOutline, IoCheckmarkOutline, IoLockClosedOutline,
} from 'react-icons/io5';
import PageLayout from '../components/PageLayout';
import StoryListItem from '../components/StoryListItem';
import { storiesApi } from '../apis/storiesApi';
import toast from 'react-hot-toast';
import '../css/StoryWritingPage.css';

const STORY_TABS = ['Chapters', 'Characters', 'Notes', 'Outline'];
const GENRES = ['Fantasy', 'Sci-Fi', 'Drama', 'Romance', 'Mystery', 'Thriller',
                'Horror', 'Comedy', 'Adventure', 'Historical', 'General'];


function StoryWritingPage() {
  const [stories, setStories]                   = useState([]);
  const [activeStory, setActiveStory]           = useState(null);
  const [activeTab, setActiveTab]               = useState('Chapters');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [chapterText, setChapterText]           = useState('');
  const [wordCount, setWordCount]               = useState(0);
  const [isSaving, setIsSaving]                 = useState(false);
  const [lastSaved, setLastSaved]               = useState('');

  // New Story modal
  const [showNewStoryModal, setShowNewStoryModal] = useState(false);
  const [newTitle, setNewTitle]   = useState('');
  const [newGenre, setNewGenre]   = useState('General');
  const [newLogline, setNewLogline] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Add chapter
  const [showNewChapterInput, setShowNewChapterInput] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // Characters (stored locally in story's notes as JSON for now)
  const [characters, setCharacters] = useState([]);
  const [newCharName, setNewCharName] = useState('');
  const [newCharRole, setNewCharRole] = useState('');
  const [newCharDesc, setNewCharDesc] = useState('');

  useEffect(() => {
    storiesApi.getAllStories()
      .then(data => {
        setStories(data);
        if (data.length > 0) selectStory(data[0]);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const words = chapterText.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [chapterText]);

  const selectStory = (story) => {
    setActiveStory(story);
    setActiveChapterIndex(0);
    setChapterText(story?.chapters?.[0]?.content || '');
    setActiveTab('Chapters');
    // parse characters from story notes
    try {
      const parsed = JSON.parse(story?.notes || '{}');
      setCharacters(parsed.characters || []);
    } catch { setCharacters([]); }
  };


  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      const created = await storiesApi.createStory({
        title: newTitle, genre: newGenre, logline: newLogline,
      });
      setStories(prev => [created, ...prev]);
      selectStory(created);
      setShowNewStoryModal(false);
      setNewTitle(''); setNewGenre('General'); setNewLogline('');
      toast.success('Story created! ✍️');
    } catch (err) {
      toast.error(err.message || 'Failed to create story.');
    } finally { setIsCreating(false); }
  };

  const handleSaveChapter = async () => {
    if (!activeStory) return;
    setIsSaving(true);
    try {
      const updated = await storiesApi.updateChapter(activeStory._id, activeChapterIndex, chapterText);
      setActiveStory(updated);
      setStories(prev => prev.map(s => s._id === updated._id ? updated : s));
      setLastSaved(new Date().toLocaleTimeString());
      toast.success('Chapter saved!');
    } catch (err) {
      toast.error(err.message || 'Failed to save.');
    } finally { setIsSaving(false); }
  };

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim() || !activeStory) return;
    try {
      const updated = await storiesApi.addChapter(activeStory._id, { title: newChapterTitle });
      setActiveStory(updated);
      setStories(prev => prev.map(s => s._id === updated._id ? updated : s));
      const newIdx = updated.chapters.length - 1;
      setActiveChapterIndex(newIdx);
      setChapterText('');
      setNewChapterTitle('');
      setShowNewChapterInput(false);
      toast.success('Chapter added!');
    } catch (err) {
      toast.error(err.message || 'Failed to add chapter.');
    }
  };

  const handleDeleteStory = async (story) => {
    if (!window.confirm(`Delete "${story.title}"? This cannot be undone.`)) return;
    try {
      await storiesApi.deleteStory(story._id);
      const remaining = stories.filter(s => s._id !== story._id);
      setStories(remaining);
      if (remaining.length > 0) selectStory(remaining[0]);
      else setActiveStory(null);
      toast.success('Story deleted.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete.');
    }
  };

  const handleSaveCharacters = async (updatedChars) => {
    if (!activeStory) return;
    try {
      const existingNotes = (() => {
        try { return JSON.parse(activeStory.notes || '{}'); } catch { return {}; }
      })();
      const notesJson = JSON.stringify({ ...existingNotes, characters: updatedChars });
      const updated = await storiesApi.updateStory(activeStory._id, { notes: notesJson });
      setActiveStory(updated);
      setCharacters(updatedChars);
    } catch (err) { console.error(err); }
  };

  const handleAddCharacter = () => {
    if (!newCharName.trim()) return;
    const newChar = { name: newCharName, role: newCharRole, description: newCharDesc };
    const updated = [...characters, newChar];
    handleSaveCharacters(updated);
    setNewCharName(''); setNewCharRole(''); setNewCharDesc('');
  };

  const handleDeleteCharacter = (idx) => {
    const updated = characters.filter((_, i) => i !== idx);
    handleSaveCharacters(updated);
  };

  const handleSaveNotes = async (value) => {
    if (!activeStory) return;
    try {
      const existingNotes = (() => {
        try { return JSON.parse(activeStory.notes || '{}'); } catch { return {}; }
      })();
      const notesJson = JSON.stringify({ ...existingNotes, freeNotes: value });
      const updated = await storiesApi.updateStory(activeStory._id, { notes: notesJson });
      setActiveStory(updated);
    } catch (err) { console.error(err); }
  };

  const getFreeNotes = () => {
    try { return JSON.parse(activeStory?.notes || '{}').freeNotes || ''; } catch { return ''; }
  };

  const activeChapters = activeStory?.chapters || [];


  return (
    <PageLayout pageTitle="My Stories">
      <div className="story-writing-page">
        <div className="story-writing-content">

          {/* ── LEFT: Stories List ── */}
          <div className="stories-list-panel">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
              <h3 className="stories-panel-title">My Stories</h3>
              <button
                onClick={() => setShowNewStoryModal(true)}
                style={{
                  background:'linear-gradient(135deg,#9b8ec4,#c8a882)',
                  color:'#fff', border:'none', borderRadius:'10px',
                  padding:'6px 12px', fontSize:'12px', fontWeight:'600',
                  cursor:'pointer', display:'flex', alignItems:'center', gap:'4px',
                }}
              >
                <IoAddOutline size={14}/> New Story
              </button>
            </div>

            {stories.length === 0 && (
              <p style={{ fontSize:'13px', color:'#c8a882', textAlign:'center', marginTop:'16px' }}>
                No stories yet. Click <strong>New Story</strong> to begin!
              </p>
            )}

            {stories.map(story => (
              <div key={story._id} style={{ position:'relative' }}
                onMouseEnter={e => e.currentTarget.querySelector('.story-delete-btn').style.opacity='1'}
                onMouseLeave={e => e.currentTarget.querySelector('.story-delete-btn').style.opacity='0'}
              >
                <StoryListItem
                  story={story}
                  isActive={activeStory?._id === story._id}
                  onClick={selectStory}
                />
                <button
                  className="story-delete-btn"
                  onClick={e => { e.stopPropagation(); handleDeleteStory(story); }}
                  style={{
                    position:'absolute', top:'8px', right:'8px',
                    background:'rgba(255,255,255,0.9)', border:'1px solid #ffe0e0',
                    borderRadius:'6px', padding:'3px 6px', cursor:'pointer',
                    color:'#e07070', fontSize:'12px', opacity:'0', transition:'opacity 0.2s',
                  }}
                >
                  <IoTrashOutline />
                </button>
              </div>
            ))}
          </div>


          {/* ── RIGHT: Story Editor ── */}
          {activeStory ? (
            <div className="story-editor-panel">
              {/* Top bar */}
              <div className="story-editor-top-bar">
                <div className="story-editor-title-area">
                  <div className="story-editor-title-label">Story Title</div>
                  <div className="story-editor-title-value">{activeStory.title}</div>
                  <span className="story-editor-genre-tag">{activeStory.genre}</span>
                  {activeStory.logline && (
                    <p className="story-editor-logline">{activeStory.logline}</p>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="story-editor-tabs" role="tablist">
                {STORY_TABS.map(tab => (
                  <button key={tab} role="tab"
                    className={`story-editor-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                    aria-selected={activeTab === tab}
                  >{tab}</button>
                ))}
              </div>

              {/* ── CHAPTERS TAB ── */}
              {activeTab === 'Chapters' && (
                <div className="story-chapter-editor">
                  {/* Chapter list */}
                  <div className="story-chapters-list">
                    {activeChapters.map((chapter, idx) => (
                      <div key={idx}
                        className={`story-chapter-item ${idx === activeChapterIndex ? 'active' : ''}`}
                        onClick={() => { setActiveChapterIndex(idx); setChapterText(chapter.content || ''); }}
                        role="button" tabIndex={0}
                      >
                        <span className="story-chapter-item-title">{chapter.title}</span>
                        <span className={`story-chapter-item-status-dot ${
                          chapter.isLocked ? 'story-chapter-dot-locked'
                          : idx === activeChapterIndex ? 'story-chapter-dot-active'
                          : chapter.content ? 'story-chapter-dot-done'
                          : 'story-chapter-dot-locked'
                        }`}/>
                      </div>
                    ))}
                    {/* Add chapter */}
                    {showNewChapterInput ? (
                      <div style={{ padding:'8px' }}>
                        <input
                          type="text" placeholder="Chapter title..."
                          value={newChapterTitle}
                          onChange={e => setNewChapterTitle(e.target.value)}
                          style={{
                            width:'100%', padding:'8px 10px', border:'1px solid #9b8ec4',
                            borderRadius:'8px', fontSize:'13px', marginBottom:'6px', outline:'none',
                          }}
                          autoFocus
                          onKeyDown={e => e.key === 'Enter' && handleAddChapter()}
                        />
                        <div style={{ display:'flex', gap:'6px' }}>
                          <button onClick={handleAddChapter}
                            style={{ flex:1, padding:'6px', background:'#9b8ec4', color:'#fff',
                              border:'none', borderRadius:'7px', cursor:'pointer', fontSize:'12px' }}>
                            <IoCheckmarkOutline /> Add
                          </button>
                          <button onClick={() => setShowNewChapterInput(false)}
                            style={{ padding:'6px 10px', background:'transparent',
                              border:'1px solid #e8d5c0', borderRadius:'7px', cursor:'pointer', fontSize:'12px' }}>
                            <IoCloseOutline />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowNewChapterInput(true)}
                        style={{
                          width:'100%', padding:'10px', border:'1px dashed #c8a882',
                          borderRadius:'10px', background:'transparent', color:'#c8a882',
                          cursor:'pointer', fontSize:'12px', marginTop:'8px',
                          display:'flex', alignItems:'center', justifyContent:'center', gap:'4px',
                        }}>
                        <IoAddOutline /> Add Chapter
                      </button>
                    )}
                  </div>

                  {/* Chapter writing area */}
                  <div className="story-chapter-body">
                    <div className="story-chapter-editor-toolbar">
                      {['B','I','U','H1','H2','❝','—'].map(tool => (
                        <button key={tool} className="story-editor-toolbar-btn"
                          onMouseDown={e => { e.preventDefault();
                            document.execCommand(
                              tool==='B' ? 'bold' : tool==='I' ? 'italic'
                              : tool==='U' ? 'underline' : '',
                            );
                          }}>{tool}</button>
                      ))}
                    </div>
                    <textarea
                      className="story-chapter-text-area"
                      value={chapterText}
                      onChange={e => setChapterText(e.target.value)}
                      placeholder="Begin writing your chapter here..."
                    />
                  </div>
                </div>
              )}


              {/* ── CHARACTERS TAB ── */}
              {activeTab === 'Characters' && (
                <div style={{ padding:'24px', overflowY:'auto', flex:1 }}>
                  <h4 style={{ fontFamily:'Georgia,serif', fontSize:'16px', color:'#3d2c1e', marginBottom:'16px' }}>
                    Characters
                  </h4>
                  {/* Add character form */}
                  <div style={{
                    background:'#fdf6ec', borderRadius:'14px', padding:'16px',
                    marginBottom:'20px', border:'1px solid #e8d5c0',
                  }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
                      <input placeholder="Character name *" value={newCharName}
                        onChange={e => setNewCharName(e.target.value)}
                        style={{ padding:'10px 12px', border:'1px solid #e8d5c0', borderRadius:'10px',
                          fontSize:'13px', outline:'none', background:'#fff' }}/>
                      <input placeholder="Role (e.g. Protagonist)" value={newCharRole}
                        onChange={e => setNewCharRole(e.target.value)}
                        style={{ padding:'10px 12px', border:'1px solid #e8d5c0', borderRadius:'10px',
                          fontSize:'13px', outline:'none', background:'#fff' }}/>
                    </div>
                    <textarea placeholder="Character description, backstory, traits..."
                      value={newCharDesc} onChange={e => setNewCharDesc(e.target.value)}
                      style={{
                        width:'100%', padding:'10px 12px', border:'1px solid #e8d5c0',
                        borderRadius:'10px', fontSize:'13px', outline:'none', background:'#fff',
                        resize:'none', minHeight:'70px', fontFamily:'inherit', marginBottom:'10px',
                      }}/>
                    <button onClick={handleAddCharacter}
                      disabled={!newCharName.trim()}
                      style={{
                        padding:'9px 20px', background:'linear-gradient(135deg,#9b8ec4,#c8a882)',
                        color:'#fff', border:'none', borderRadius:'10px',
                        fontSize:'13px', fontWeight:'600', cursor:'pointer',
                      }}>
                      <IoAddOutline style={{ marginRight:'4px' }}/> Add Character
                    </button>
                  </div>
                  {/* Characters list */}
                  {characters.length === 0 ? (
                    <p style={{ color:'#c8a882', fontSize:'13px', textAlign:'center', padding:'20px' }}>
                      No characters yet. Add your first character above!
                    </p>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                      {characters.map((char, idx) => (
                        <div key={idx} style={{
                          background:'#fff', borderRadius:'12px', padding:'16px',
                          border:'1px solid #e8d5c0', position:'relative',
                        }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
                            <div style={{
                              width:'36px', height:'36px', borderRadius:'50%',
                              background:'linear-gradient(135deg,#9b8ec4,#c8a882)',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              color:'#fff', fontWeight:'700', fontSize:'14px',
                            }}>{char.name[0]}</div>
                            <div>
                              <div style={{ fontWeight:'700', color:'#3d2c1e', fontSize:'14px' }}>{char.name}</div>
                              {char.role && <div style={{ fontSize:'12px', color:'#9b8ec4' }}>{char.role}</div>}
                            </div>
                          </div>
                          {char.description && (
                            <p style={{ fontSize:'13px', color:'#7a5c44', lineHeight:'1.5' }}>{char.description}</p>
                          )}
                          <button onClick={() => handleDeleteCharacter(idx)}
                            style={{
                              position:'absolute', top:'12px', right:'12px',
                              background:'transparent', border:'none', cursor:'pointer',
                              color:'#e07070', fontSize:'15px',
                            }}>
                            <IoTrashOutline />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── NOTES TAB ── */}
              {activeTab === 'Notes' && (
                <div style={{ padding:'24px', flex:1, display:'flex', flexDirection:'column' }}>
                  <h4 style={{ fontFamily:'Georgia,serif', fontSize:'16px', color:'#3d2c1e', marginBottom:'12px' }}>
                    Story Notes
                  </h4>
                  <textarea
                    defaultValue={getFreeNotes()}
                    onBlur={e => handleSaveNotes(e.target.value)}
                    placeholder="Research notes, ideas, inspirations, world-building details..."
                    style={{
                      flex:1, minHeight:'340px', width:'100%', padding:'16px',
                      border:'1px solid #e8d5c0', borderRadius:'14px', fontSize:'14px',
                      fontFamily:'Georgia,serif', color:'#3d2c1e', lineHeight:'1.8',
                      background:'#fdf6ec', outline:'none', resize:'vertical',
                    }}
                  />
                  <p style={{ fontSize:'12px', color:'#c8a882', marginTop:'8px' }}>
                    Notes are saved automatically when you click away.
                  </p>
                </div>
              )}

              {/* ── OUTLINE TAB ── */}
              {activeTab === 'Outline' && (
                <div style={{ padding:'24px', flex:1, overflowY:'auto' }}>
                  <h4 style={{ fontFamily:'Georgia,serif', fontSize:'16px', color:'#3d2c1e', marginBottom:'16px' }}>
                    Story Outline
                  </h4>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {activeChapters.map((ch, idx) => (
                      <div key={idx} style={{
                        background:'#fff', borderRadius:'12px', padding:'16px',
                        border:'1px solid #e8d5c0', display:'flex', alignItems:'flex-start', gap:'14px',
                      }}>
                        <div style={{
                          width:'32px', height:'32px', borderRadius:'50%', flexShrink:0,
                          background: ch.content ? 'linear-gradient(135deg,#9b8ec4,#c8a882)' : '#e8d5c0',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          color:'#fff', fontWeight:'700', fontSize:'13px',
                        }}>{idx + 1}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:'700', color:'#3d2c1e', marginBottom:'4px' }}>{ch.title}</div>
                          <div style={{ fontSize:'12px', color:'#9b8ec4' }}>
                            {ch.content
                              ? `${ch.content.trim().split(/\s+/).filter(Boolean).length} words written`
                              : 'Not started yet'}
                          </div>
                          {ch.content && (
                            <p style={{ fontSize:'13px', color:'#7a5c44', marginTop:'6px',
                              fontStyle:'italic', lineHeight:'1.5' }}>
                              {ch.content.slice(0, 120)}{ch.content.length > 120 ? '...' : ''}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => { setActiveTab('Chapters'); setActiveChapterIndex(idx); setChapterText(ch.content || ''); }}
                          style={{
                            padding:'6px 12px', background:'transparent',
                            border:'1px solid #9b8ec4', borderRadius:'8px',
                            color:'#9b8ec4', cursor:'pointer', fontSize:'12px', fontWeight:'600',
                          }}>
                          <IoPencilOutline /> Edit
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="story-chapter-footer">
                <span className="story-word-count">{wordCount} words</span>
                <span className="story-autosave-status">
                  {isSaving ? '⏳ Saving...' : lastSaved ? `✓ Saved ${lastSaved}` : ''}
                </span>
                {activeTab === 'Chapters' && (
                  <button className="story-save-chapter-btn" onClick={handleSaveChapter} disabled={isSaving}>
                    Save Chapter
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'center',
              background:'#fff', borderRadius:'18px', minHeight:'400px',
              color:'#c8a882', fontSize:'15px', flexDirection:'column', gap:'12px',
            }}>
              <span style={{ fontSize:'48px' }}>✍️</span>
              <p style={{ fontWeight:'700', color:'#7a5c44', fontSize:'16px' }}>Your story starts here.</p>
              <button onClick={() => setShowNewStoryModal(true)}
                style={{
                  padding:'12px 28px', background:'linear-gradient(135deg,#9b8ec4,#c8a882)',
                  color:'#fff', border:'none', borderRadius:'12px', fontSize:'14px',
                  fontWeight:'600', cursor:'pointer',
                }}>
                <IoAddOutline /> Create New Story
              </button>
            </div>
          )}
        </div>
      </div>


      {/* ── NEW STORY MODAL ── */}
      {showNewStoryModal && (
        <div className="new-collection-modal-overlay" role="dialog" aria-modal="true">
          <div className="new-collection-modal" style={{ maxWidth:'460px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
              <h3 className="new-collection-modal-title">✍️ New Story</h3>
              <button onClick={() => setShowNewStoryModal(false)}
                style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'#7a5c44' }}>
                <IoCloseOutline />
              </button>
            </div>
            <form onSubmit={handleCreateStory}>
              <div className="new-collection-form-field">
                <label className="new-collection-form-label">Story Title *</label>
                <input type="text" className="new-collection-form-input"
                  placeholder="e.g. The Last Message" required autoFocus
                  value={newTitle} onChange={e => setNewTitle(e.target.value)}/>
              </div>
              <div className="new-collection-form-field">
                <label className="new-collection-form-label">Genre</label>
                <select className="new-collection-form-input"
                  value={newGenre} onChange={e => setNewGenre(e.target.value)}>
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="new-collection-form-field">
                <label className="new-collection-form-label">Logline (one-sentence summary)</label>
                <input type="text" className="new-collection-form-input"
                  placeholder="e.g. A man receives a message from his future self..."
                  value={newLogline} onChange={e => setNewLogline(e.target.value)}/>
              </div>
              <div className="new-collection-modal-actions">
                <button type="button" className="new-collection-cancel-btn"
                  onClick={() => setShowNewStoryModal(false)}>Cancel</button>
                <button type="submit" className="new-collection-save-btn"
                  disabled={isCreating || !newTitle.trim()}>
                  {isCreating ? 'Creating...' : 'Create Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default StoryWritingPage;
