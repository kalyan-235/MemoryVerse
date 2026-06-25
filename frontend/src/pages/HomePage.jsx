import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import MemoryMapPoint from '../components/MemoryMapPoint';
import MemoryCard from '../components/MemoryCard';
import { memoriesApi } from '../apis/memoriesApi';
import { collectionsApi } from '../apis/collectionsApi';
import '../css/MemoryJourneyMap.css';

const MAP_POSITIONS = [
  { x: 18, y: 72 }, { x: 28, y: 48 }, { x: 38, y: 58 },
  { x: 50, y: 38 }, { x: 60, y: 55 }, { x: 68, y: 28 },
  { x: 78, y: 50 },
];

function HomePage() {
  const [memories, setMemories]             = useState([]);
  const [collections, setCollections]       = useState([]);
  const [favoriteMemories, setFavoriteMemories] = useState([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [refreshKey, setRefreshKey]         = useState(0);

  const loadHomeData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [memoriesData, collectionsData, favoritesData] = await Promise.all([
        memoriesApi.getAllMemories({ limit: 7, map: true }),
        collectionsApi.getAllCollections(),
        memoriesApi.getFavoriteMemories(),
      ]);
      setMemories(memoriesData);
      setCollections(collectionsData);
      setFavoriteMemories(favoritesData);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadHomeData(); }, [loadHomeData, refreshKey]);

  return (
    <PageLayout
      pageTitle="Your Journey, Your Memories"
      onMemorySaved={() => setRefreshKey(k => k + 1)}
    >
      <div className="journey-map-page">
        {/* Hero */}
        <div className="journey-map-hero">
          <h2 className="journey-map-heading">Your Journey, Your Memories</h2>
          <p className="journey-map-subheading">Relive your best moments in a beautiful way.</p>
        </div>

        {/* ===== ADVENTURE MAP ===== */}
        <div className="journey-map-canvas" aria-label="Memory journey map">
          {/* Beautiful illustrated map background */}
          <div className="journey-map-bg-layer" />

          {/* Mountain & nature illustration overlay */}
          <div className="journey-map-illustration">
            {/* Mountains left */}
            <svg className="map-svg-decoration" viewBox="0 0 1000 420" preserveAspectRatio="xMidYMid slice">
              {/* Sky gradient */}
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a8c5da" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#d4e8d0" stopOpacity="0.3"/>
                </linearGradient>
                <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8fad91"/>
                  <stop offset="100%" stopColor="#6b8f6d"/>
                </linearGradient>
                <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#c8a882"/>
                  <stop offset="100%" stopColor="#9b8ec4"/>
                </linearGradient>
              </defs>
              {/* Background sky */}
              <rect width="1000" height="420" fill="url(#skyGrad)"/>
              {/* Far mountains */}
              <polygon points="0,280 80,180 160,240 220,160 300,220 380,140 460,200 520,130 600,190 680,120 760,180 840,110 920,170 1000,140 1000,420 0,420"
                fill="#b8d4b8" opacity="0.6"/>
              {/* Near mountains */}
              <polygon points="0,320 60,240 120,280 200,200 280,260 360,190 440,250 520,180 600,240 680,170 760,230 840,170 920,220 1000,190 1000,420 0,420"
                fill="url(#mountainGrad)" opacity="0.8"/>
              {/* River/path */}
              <path d="M 50,380 Q 150,340 200,300 Q 300,260 380,280 Q 480,300 520,260 Q 600,220 680,240 Q 780,260 850,220 Q 920,190 980,200"
                fill="none" stroke="#a8c5da" strokeWidth="8" opacity="0.7"/>
              {/* Trees left */}
              {[30,60,90,120].map(x => (
                <g key={x}>
                  <rect x={x+8} y={330} width="4" height="20" fill="#6b4e2a"/>
                  <polygon points={`${x},330 ${x+10},300 ${x+20},330`} fill="#4a7a4a"/>
                  <polygon points={`${x+2},315 ${x+10},288 ${x+18},315`} fill="#5a8a5a"/>
                </g>
              ))}
              {/* Trees right */}
              {[820,860,900,940].map(x => (
                <g key={x}>
                  <rect x={x+8} y={330} width="4" height="20" fill="#6b4e2a"/>
                  <polygon points={`${x},330 ${x+10},300 ${x+20},330`} fill="#4a7a4a"/>
                  <polygon points={`${x+2},315 ${x+10},288 ${x+18},315`} fill="#5a8a5a"/>
                </g>
              ))}
              {/* Clouds */}
              <ellipse cx="150" cy="80" rx="60" ry="25" fill="white" opacity="0.5"/>
              <ellipse cx="120" cy="80" rx="40" ry="20" fill="white" opacity="0.5"/>
              <ellipse cx="180" cy="75" rx="45" ry="22" fill="white" opacity="0.5"/>
              <ellipse cx="650" cy="60" rx="55" ry="22" fill="white" opacity="0.4"/>
              <ellipse cx="620" cy="62" rx="38" ry="18" fill="white" opacity="0.4"/>
              {/* Journey path dashes */}
              <path d="M 160,370 Q 220,330 280,310 Q 360,285 440,265 Q 520,245 600,240 Q 680,235 760,220 Q 840,205 920,195"
                fill="none" stroke="white" strokeWidth="3" strokeDasharray="12,8" opacity="0.8"/>
            </svg>
          </div>

          {/* Memory Points on Map */}
          {memories.slice(0, 7).map((memory, index) => (
            <MemoryMapPoint
              key={memory._id}
              memory={memory}
              pointNumber={index + 1}
              positionX={MAP_POSITIONS[index]?.x ?? 50}
              positionY={MAP_POSITIONS[index]?.y ?? 50}
            />
          ))}

          {/* Empty state */}
          {memories.length === 0 && !isLoading && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: '12px', zIndex: 10,
            }}>
              <div style={{ fontSize: '48px' }}>🗺️</div>
              <p style={{
                color: '#3d2c1e', fontWeight: '700', fontSize: '18px',
                background: 'rgba(255,255,255,0.8)', padding: '10px 24px',
                borderRadius: '24px',
              }}>
                Add your first memory to start your journey!
              </p>
            </div>
          )}

          {isLoading && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 10,
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.85)', borderRadius: '16px',
                padding: '16px 32px', color: '#9b8ec4', fontWeight: '600',
              }}>
                Loading your journey...
              </div>
            </div>
          )}
        </div>

        {/* ===== BELOW MAP ===== */}
        <div className="home-sections-wrapper">

          {/* Collections Row */}
          {collections.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div className="home-section-header">
                <h3 className="home-section-title">Your Collections</h3>
                <Link to="/collections" className="home-section-view-all">View All →</Link>
              </div>
              <div className="home-collections-row">
                {collections.map((col) => (
                  <Link to={`/collections/${col._id}`} key={col._id}
                    style={{ textDecoration: 'none' }}
                    className="home-collection-card">
                    <img
                      src={col.coverImage || `https://placehold.co/280x110/f5e6d3/c8a882?text=${encodeURIComponent(col.name)}`}
                      alt={col.name}
                      className="home-collection-card-img"
                    />
                    <div className="home-collection-card-overlay">
                      <div className="home-collection-card-name">{col.name}</div>
                      <div className="home-collection-card-count">
                        {col.memoryCount ?? 0} Memories
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Favorites */}
          {favoriteMemories.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div className="home-section-header">
                <h3 className="home-section-title">❤️ Favorites</h3>
                <Link to="/favorites" className="home-section-view-all">View All →</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '16px' }}>
                {favoriteMemories.slice(0, 4).map(mem => (
                  <MemoryCard key={mem._id} memory={mem} />
                ))}
              </div>
            </div>
          )}

          {/* Recent Memories */}
          <div>
            <div className="home-section-header">
              <h3 className="home-section-title">Recent Memories</h3>
            </div>
            {memories.length === 0 && !isLoading ? (
              <div style={{
                textAlign: 'center', padding: '40px', color: '#c8a882',
                background: '#fff', borderRadius: '16px',
              }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📷</div>
                <p style={{ fontWeight: '600' }}>No memories yet.</p>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>
                  Click <strong>+ Add Memory</strong> in the top bar to get started!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '16px' }}>
                {memories.slice(0, 8).map(mem => (
                  <MemoryCard
                    key={mem._id}
                    memory={mem}
                    onFavoriteToggle={() => loadHomeData()}
                  />
                ))}              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default HomePage;
