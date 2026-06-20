import { useState, useEffect } from 'react';
import { IoAddOutline } from 'react-icons/io5';
import PageLayout from '../components/PageLayout';
import StoryListItem from '../components/StoryListItem';
import { storiesApi } from '../apis/storiesApi';
import '../css/StoryWritingPage.css';

const STORY_TABS = ['Chapters', 'Characters', 'Notes', 'Outline'];

const CHAPTER_STATUS = {
  done: 'story-chapter-dot-done',
  active: 'story-chapter-dot-active',
  locked: 'story-chapter-dot-locked',
};

function StoryWritingPage() {
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [activeTab, setActiveTab] = useState('Chapters');
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [chapterText, setChapterText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    storiesApi.getAllStories()
      .then((data) => {
        setStories(data);
        if (data.length > 0) {
          setActiveStory(data[0]);
          setChapterText(data[0]?.chapters?.[0]?.content || '');
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const words = chapterText.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [chapterText]);

  const handleSaveChapter = async () => {
    if (!activeStory) return;
    setIsSaving(true);
    try {
      await storiesApi.updateChapter(
        activeStory._id,
        activeChapterIndex,
        chapterText,
      );
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to save chapter:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const activeChapters = activeStory?.chapters || [];

  return (
    <PageLayout pageTitle="My Stories">
      <div className="story-writing-page">
        <div className="story-writing-content">
          {/* Left: Stories List */}
          <div className="stories-list-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 className="stories-panel-title">My Stories</h3>
              <button
                style={{
                  background: 'linear-gradient(135deg,#9b8ec4,#c8a882)',
                  color: '#fff', border: 'none', borderRadius: '10px',
                  padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}
                aria-label="Create new story"
              >
                <IoAddOutline size={14} /> New Story
              </button>
            </div>

            {stories.map((story) => (
              <StoryListItem
                key={story._id}
                story={story}
                isActive={activeStory?._id === story._id}
                onClick={(s) => {
                  setActiveStory(s);
                  setActiveChapterIndex(0);
                  setChapterText(s?.chapters?.[0]?.content || '');
                }}
              />
            ))}

            <div className="stories-view-all-link">View All Stories</div>
          </div>

          {/* Right: Story Editor */}
          {activeStory ? (
            <div className="story-editor-panel">
              {/* Top Bar */}
              <div className="story-editor-top-bar">
                <div className="story-editor-title-area">
                  <div className="story-editor-title-label">Story Title</div>
                  <div className="story-editor-title-value">{activeStory.title}</div>
                  <div>
                    <span className="story-editor-genre-tag">
                      {activeStory.genre}
                    </span>
                  </div>
                  {activeStory.logline && (
                    <p className="story-editor-logline">{activeStory.logline}</p>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="story-editor-tabs" role="tablist">
                {STORY_TABS.map((tab) => (
                  <button
                    key={tab}
                    role="tab"
                    className={`story-editor-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                    aria-selected={activeTab === tab}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Chapters Tab Content */}
              {activeTab === 'Chapters' && (
                <div className="story-chapter-editor">
                  {/* Chapter List */}
                  <div className="story-chapters-list">
                    {activeChapters.map((chapter, idx) => (
                      <div
                        key={idx}
                        className={`story-chapter-item ${idx === activeChapterIndex ? 'active' : ''}`}
                        onClick={() => {
                          setActiveChapterIndex(idx);
                          setChapterText(chapter.content || '');
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={chapter.title}
                      >
                        <span className="story-chapter-item-title">{chapter.title}</span>
                        <span className={`story-chapter-item-status-dot ${
                          chapter.isLocked ? CHAPTER_STATUS.locked
                            : idx === activeChapterIndex ? CHAPTER_STATUS.active
                            : CHAPTER_STATUS.done
                        }`} />
                      </div>
                    ))}
                  </div>

                  {/* Chapter Writing Area */}
                  <div className="story-chapter-body">
                    <div className="story-chapter-editor-toolbar" aria-label="Formatting toolbar">
                      {['B', 'I', 'U', 'H1', 'H2', '❝', '—', '⁋'].map((tool) => (
                        <button key={tool} className="story-editor-toolbar-btn" aria-label={`Format: ${tool}`}>
                          {tool}
                        </button>
                      ))}
                    </div>

                    <textarea
                      className="story-chapter-text-area"
                      value={chapterText}
                      onChange={(e) => setChapterText(e.target.value)}
                      placeholder="Begin writing your chapter here..."
                      aria-label={`Chapter ${activeChapterIndex + 1} content`}
                    />
                  </div>
                </div>
              )}

              {/* Other Tabs Placeholder */}
              {activeTab !== 'Chapters' && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#c8a882', fontSize: '14px' }}>
                  {activeTab} section coming soon...
                </div>
              )}

              {/* Footer */}
              <div className="story-chapter-footer">
                <span className="story-word-count">{wordCount} words</span>
                <span className="story-autosave-status">
                  {isSaving ? '⏳ Saving...' : lastSaved ? `✓ Saved ${lastSaved}` : ''}
                </span>
                <button
                  className="story-save-chapter-btn"
                  onClick={handleSaveChapter}
                  disabled={isSaving}
                >
                  Save Chapter
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#fff', borderRadius: '18px', minHeight: '400px',
              color: '#c8a882', fontSize: '15px', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '40px' }}>✍️</span>
              Select a story or create a new one to start writing.
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default StoryWritingPage;
