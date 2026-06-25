import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { IoSearchOutline, IoTimeOutline, IoCloseOutline } from 'react-icons/io5';
import PageLayout from '../components/PageLayout';
import MemoryCard from '../components/MemoryCard';
import { searchApi } from '../apis/searchApi';
import '../css/SearchPage.css';

const FILTER_OPTIONS = [
  { id: 'all',         label: 'All' },
  { id: 'memories',   label: '🖼️ Memories' },
  { id: 'diaries',    label: '📖 Diaries' },
  { id: 'stories',    label: '✍️ Stories' },
  { id: 'collections',label: '📁 Collections' },
];

const RECENT_KEY = 'mv_recent_searches';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery]               = useState(searchParams.get('q') || '');
  const [activeFilter, setActiveFilter] = useState('all');
  const [results, setResults]           = useState({ memories:[], diaries:[], stories:[], collections:[] });
  const [isLoading, setIsLoading]       = useState(false);
  const [hasSearched, setHasSearched]   = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; }
  });

  const saveRecentSearch = useCallback((q) => {
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 8);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  }, [recentSearches]);

  const runSearch = useCallback(async (q, filter) => {
    if (!q || q.trim().length < 2) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await searchApi.globalSearch(q.trim(), filter || 'all');
      setResults(data);
      saveRecentSearch(q.trim());
    } catch (err) {
      console.error('Search failed:', err);
      setResults({ memories:[], diaries:[], stories:[], collections:[] });
    } finally {
      setIsLoading(false);
    }
  }, [saveRecentSearch]);

  // Run on initial load if URL has ?q=
  useEffect(() => {
    const urlQ = searchParams.get('q');
    if (urlQ) {
      setQuery(urlQ);
      runSearch(urlQ, activeFilter);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce — search as user types after 500ms
  useEffect(() => {
    if (!query.trim()) {
      setHasSearched(false);
      setResults({ memories:[], diaries:[], stories:[], collections:[] });
      return;
    }
    const timer = setTimeout(() => {
      setSearchParams(query.trim() ? { q: query.trim() } : {});
      runSearch(query, activeFilter);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, activeFilter]);

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    if (query.trim().length >= 2) runSearch(query, filterId);
  };

  const handleRecentClick = (s) => {
    setQuery(s);
    setSearchParams({ q: s });
    runSearch(s, activeFilter);
  };

  const clearSearch = () => {
    setQuery('');
    setHasSearched(false);
    setSearchParams({});
    setResults({ memories:[], diaries:[], stories:[], collections:[] });
  };

  const totalResults =
    results.memories.length + results.diaries.length +
    results.stories.length + results.collections.length;

  const showEmpty = hasSearched && !isLoading && totalResults === 0;

  return (
    <PageLayout pageTitle="Search">
      <div className="search-page">
        <h2 className="search-page-heading">🔍 Search MemoryVerse</h2>

        {/* Search bar */}
        <div className="search-bar-large">
          <IoSearchOutline className="search-bar-large-icon" />
          <input
            type="text"
            className="search-bar-large-input"
            placeholder="Search memories, diary entries, stories, collections..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search"
            autoFocus
          />
          {query && (
            <button onClick={clearSearch}
              style={{ background:'none', border:'none', cursor:'pointer',
                color:'#c8a882', fontSize:'18px', display:'flex', alignItems:'center' }}>
              <IoCloseOutline />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="search-filters-row">
          {FILTER_OPTIONS.map(f => (
            <button key={f.id}
              className={`search-filter-chip ${activeFilter === f.id ? 'active' : ''}`}
              onClick={() => handleFilterChange(f.id)}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Recent searches */}
        {!query && recentSearches.length > 0 && (
          <div className="search-recent-section">
            <div className="search-recent-title">Recent Searches</div>
            <div className="search-recent-items">
              {recentSearches.map(s => (
                <div key={s} className="search-recent-item"
                  onClick={() => handleRecentClick(s)} role="button" tabIndex={0}>
                  <IoTimeOutline size={12}/> {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div style={{ textAlign:'center', padding:'60px', color:'#c8a882' }}>
            <div style={{ fontSize:'32px', marginBottom:'10px' }}>🔍</div>
            Searching...
          </div>
        )}

        {/* Empty state */}
        {showEmpty && (
          <div className="search-empty-state">
            <div className="search-empty-icon">🔭</div>
            <h3 className="search-empty-title">No results found</h3>
            <p className="search-empty-desc">
              No results for "<strong>{query}</strong>". Try a different search term.
            </p>
          </div>
        )}

        {/* Results */}
        {!isLoading && hasSearched && totalResults > 0 && (
          <>
            <p className="search-results-header">
              {totalResults} result{totalResults !== 1 ? 's' : ''} for "<strong>{query}</strong>"
            </p>

            {/* Memories */}
            {(activeFilter === 'all' || activeFilter === 'memories') && results.memories.length > 0 && (
              <>
                <h3 className="search-results-section-title">🖼️ Memories</h3>
                <div className="search-results-grid">
                  {results.memories.map(mem => (
                    <MemoryCard key={mem._id} memory={mem}/>
                  ))}
                </div>
              </>
            )}

            {/* Diaries */}
            {(activeFilter === 'all' || activeFilter === 'diaries') && results.diaries.length > 0 && (
              <>
                <h3 className="search-results-section-title">📖 Diary Entries</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                  {results.diaries.map(entry => (
                    <div key={entry._id} style={{
                      background:'#fff', borderRadius:'14px', padding:'18px',
                      borderLeft:'4px solid #9b8ec4',
                      boxShadow:'0 4px 12px rgba(139,99,71,0.07)',
                      cursor:'pointer',
                    }} onClick={() => navigate('/diary')}>
                      <div style={{ fontWeight:'700', color:'#3d2c1e', marginBottom:'4px' }}>{entry.title}</div>
                      <div style={{ fontSize:'11px', color:'#9b8ec4', marginBottom:'8px' }}>
                        {entry.date ? new Date(entry.date).toLocaleDateString('en-US',{day:'numeric',month:'short',year:'numeric'}) : ''}
                      </div>
                      <p style={{ fontSize:'13px', color:'#7a5c44', lineHeight:'1.5' }}>
                        {entry.content?.replace(/<[^>]*>/g,'').slice(0,200)}...
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Stories */}
            {(activeFilter === 'all' || activeFilter === 'stories') && results.stories.length > 0 && (
              <>
                <h3 className="search-results-section-title">✍️ Stories</h3>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'14px' }}>
                  {results.stories.map(story => (
                    <div key={story._id} style={{
                      background:'#fff', borderRadius:'14px', padding:'20px',
                      borderLeft:'4px solid #c8a882',
                      boxShadow:'0 4px 12px rgba(139,99,71,0.07)',
                      cursor:'pointer',
                    }} onClick={() => navigate('/stories')}>
                      <div style={{ fontWeight:'700', color:'#3d2c1e', marginBottom:'4px' }}>{story.title}</div>
                      <div style={{ fontSize:'12px', color:'#9b8ec4', marginBottom:'8px' }}>
                        {story.genre} · {story.chapters?.length || 0} chapters
                      </div>
                      {story.logline && (
                        <p style={{ fontSize:'13px', color:'#7a5c44', fontStyle:'italic' }}>{story.logline}</p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Collections */}
            {(activeFilter === 'all' || activeFilter === 'collections') && results.collections.length > 0 && (
              <>
                <h3 className="search-results-section-title">📁 Collections</h3>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'14px' }}>
                  {results.collections.map(col => (
                    <div key={col._id} style={{
                      background:'#fff', borderRadius:'14px', overflow:'hidden',
                      boxShadow:'0 4px 12px rgba(139,99,71,0.07)', cursor:'pointer',
                    }} onClick={() => navigate('/collections')}>
                      <img
                        src={col.coverImage || `https://placehold.co/200x100/f5e6d3/c8a882?text=${encodeURIComponent(col.name)}`}
                        alt={col.name}
                        style={{ width:'100%', height:'80px', objectFit:'cover' }}
                      />
                      <div style={{ padding:'12px 14px' }}>
                        <div style={{ fontWeight:'700', color:'#3d2c1e', fontSize:'14px' }}>{col.name}</div>
                        <div style={{ fontSize:'12px', color:'#9b8ec4', marginTop:'4px' }}>
                          {col.memoryCount ?? 0} Memories
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}

export default SearchPage;
