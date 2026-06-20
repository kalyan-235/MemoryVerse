import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IoSearchOutline, IoTimeOutline } from 'react-icons/io5';
import PageLayout from '../components/PageLayout';
import MemoryCard from '../components/MemoryCard';
import { searchApi } from '../apis/searchApi';
import '../css/SearchPage.css';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'memories', label: '🖼️ Memories' },
  { id: 'diaries', label: '📖 Diaries' },
  { id: 'stories', label: '✍️ Stories' },
  { id: 'collections', label: '📁 Collections' },
];

const RECENT_SEARCHES_KEY = 'memoryverse_recent_searches';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeFilter, setActiveFilter] = useState('all');
  const [results, setResults] = useState({ memories: [], diaries: [], stories: [], collections: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY)) || [];
    } catch {
      return [];
    }
  });

  // Run search when query changes from URL params
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
      runSearch(urlQuery);
    }
  }, [searchParams]);

  const runSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const data = await searchApi.globalSearch(searchQuery, activeFilter);
      setResults(data);
      // Save to recent searches
      const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchParams({ q: query.trim() });
    runSearch(query.trim());
  };

  const totalResults =
    results.memories.length +
    results.diaries.length +
    results.stories.length +
    results.collections.length;

  const hasQuery = query.trim().length > 0;

  return (
    <PageLayout pageTitle="Search">
      <div className="search-page">
        <h2 className="search-page-heading">🔍 Search MemoryVerse</h2>

        {/* Large Search Bar */}
        <form onSubmit={handleSearchSubmit}>
          <div className="search-bar-large">
            <IoSearchOutline className="search-bar-large-icon" />
            <input
              type="text"
              className="search-bar-large-input"
              placeholder="Search memories, diary entries, stories, collections..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search across all content"
              autoFocus
            />
          </div>
        </form>

        {/* Filter Chips */}
        <div className="search-filters-row" role="group" aria-label="Search filters">
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter.id}
              className={`search-filter-chip ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => {
                setActiveFilter(filter.id);
                if (query.trim()) runSearch(query);
              }}
              aria-pressed={activeFilter === filter.id}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Recent Searches (when no query) */}
        {!hasQuery && recentSearches.length > 0 && (
          <div className="search-recent-section">
            <div className="search-recent-title">Recent Searches</div>
            <div className="search-recent-items">
              {recentSearches.map((s) => (
                <div
                  key={s}
                  className="search-recent-item"
                  onClick={() => { setQuery(s); setSearchParams({ q: s }); runSearch(s); }}
                  role="button"
                  tabIndex={0}
                >
                  <IoTimeOutline size={12} /> {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#c8a882' }}>
            Searching...
          </div>
        )}

        {/* Results */}
        {!isLoading && hasQuery && (
          <>
            <p className="search-results-header">
              {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
            </p>

            {totalResults === 0 && (
              <div className="search-empty-state">
                <div className="search-empty-icon">🔭</div>
                <h3 className="search-empty-title">No results found</h3>
                <p className="search-empty-desc">Try a different search term or filter.</p>
              </div>
            )}

            {/* Memories */}
            {(activeFilter === 'all' || activeFilter === 'memories') && results.memories.length > 0 && (
              <>
                <h3 className="search-results-section-title">🖼️ Memories</h3>
                <div className="search-results-grid">
                  {results.memories.map((mem) => (
                    <MemoryCard key={mem._id} memory={mem} />
                  ))}
                </div>
              </>
            )}

            {/* Diaries */}
            {(activeFilter === 'all' || activeFilter === 'diaries') && results.diaries.length > 0 && (
              <>
                <h3 className="search-results-section-title">📖 Diary Entries</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {results.diaries.map((entry) => (
                    <div key={entry._id} style={{
                      background: '#fff', borderRadius: '14px', padding: '18px',
                      borderLeft: '4px solid #9b8ec4',
                      boxShadow: '0 4px 12px rgba(139,99,71,0.07)',
                    }}>
                      <div style={{ fontWeight: '700', color: '#3d2c1e', marginBottom: '6px' }}>{entry.title}</div>
                      <p style={{ fontSize: '13px', color: '#7a5c44', lineHeight: '1.5' }}>
                        {entry.content?.replace(/<[^>]*>/g, '').slice(0, 180)}...
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {results.stories.map((story) => (
                    <div key={story._id} style={{
                      background: '#fff', borderRadius: '14px', padding: '18px',
                      borderLeft: '4px solid #c8a882',
                      boxShadow: '0 4px 12px rgba(139,99,71,0.07)',
                    }}>
                      <div style={{ fontWeight: '700', color: '#3d2c1e' }}>{story.title}</div>
                      <div style={{ fontSize: '12px', color: '#9b8ec4', marginTop: '4px' }}>{story.genre}</div>
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
