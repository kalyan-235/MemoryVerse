import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import MemoryMapPoint from '../components/MemoryMapPoint';
import MemoryCard from '../components/MemoryCard';
import { memoriesApi } from '../apis/memoriesApi';
import { collectionsApi } from '../apis/collectionsApi';
import '../css/MemoryJourneyMap.css';

// Generate map positions dynamically for any number of memories
// Memories follow a winding path across the map
const generateMapPositions = (count) => {
  const positions = [];
  for (let i = 0; i < count; i++) {
    const progress = count === 1 ? 0.5 : i / (count - 1); // 0 to 1
    // X: spread from 10% to 88% across the map
    const x = 10 + progress * 78;
    // Y: wave pattern — memories go up and down along the path
    const wave = Math.sin(progress * Math.PI * 2.5) * 20;
    const y = 55 + wave + (i % 2 === 0 ? -8 : 8);
    // Clamp y between 20% and 80%
    positions.push({ x: Math.round(x), y: Math.round(Math.max(20, Math.min(80, y))) });
  }
  return positions;
};

// How many recent memories to show before "View All"
const RECENT_PREVIEW_COUNT = 5;

function HomePage() {
  const [memories,         setMemories]         = useState([]);
  const [collections,      setCollections]       = useState([]);
  const [favoriteMemories, setFavoriteMemories]  = useState([]);
  const [isLoading,        setIsLoading]         = useState(true);
  const [showAllRecent,    setShowAllRecent]      = useState(false);
  const [refreshKey,       setRefreshKey]         = useState(0);
  const navigate = useNavigate();

  const loadHomeData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [memoriesData, collectionsData, favoritesData] = await Promise.all([
        memoriesApi.getAllMemories({ limit: 100, map: true }), // map=true excludes collection memories
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

  // Recent memories: show 5 or all
  const recentMemories = showAllRecent ? memories : memories.slice(0, RECENT_PREVIEW_COUNT);
  const hasMore = memories.length > RECENT_PREVIEW_COUNT;

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

        {/* ═══ ADVENTURE MAP ═══ */}
        <div className="journey-map-canvas" aria-label="Memory journey map">
          <div className="journey-map-bg-layer" />
          <div className="journey-map-illustration">
            <svg className="map-svg-decoration" viewBox="0 0 1000 420" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a8c5da" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#d4e8d0" stopOpacity="0.3"/>
                </linearGradient>
                <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8fad91"/>
                  <stop offset="100%" stopColor="#6b8f6d"/>
                </linearGradient>
              </defs>
              <rect width="1000" height="420" fill="url(#skyGrad)"/>
              <polygon points="0,280 80,180 160,240 220,160 300,220 380,140 460,200 520,130 600,190 680,120 760,180 840,110 920,170 1000,140 1000,420 0,420" fill="#b8d4b8" opacity="0.6"/>
              <polygon points="0,320 60,240 120,280 200,200 280,260 360,190 440,250 520,180 600,240 680,170 760,230 840,170 920,220 1000,190 1000,420 0,420" fill="url(#mountainGrad)" opacity="0.8"/>
              <path d="M 50,380 Q 150,340 200,300 Q 300,260 380,280 Q 480,300 520,260 Q 600,220 680,240 Q 780,260 850,220 Q 920,190 980,200" fill="none" stroke="#a8c5da" strokeWidth="8" opacity="0.7"/>
              {[30,60,90,120].map(x => (
                <g key={x}>
                  <rect x={x+8} y={330} width="4" height="20" fill="#6b4e2a"/>
                  <polygon points={`${x},330 ${x+10},300 ${x+20},330`} fill="#4a7a4a"/>
                  <polygon points={`${x+2},315 ${x+10},288 ${x+18},315`} fill="#5a8a5a"/>
                </g>
              ))}
              {[820,860,900,940].map(x => (
                <g key={x}>
                  <rect x={x+8} y={330} width="4" height="20" fill="#6b4e2a"/>
                  <polygon points={`${x},330 ${x+10},300 ${x+20},330`} fill="#4a7a4a"/>
                </g>
              ))}
              <ellipse cx="150" cy="80" rx="60" ry="25" fill="white" opacity="0.5"/>
              <ellipse cx="120" cy="80" rx="40" ry="20" fill="white" opacity="0.5"/>
              <ellipse cx="650" cy="60" rx="55" ry="22" fill="white" opacity="0.4"/>
              {/* Dynamic path connecting all memory points */}
              {memories.length > 1 && (() => {
                const pos = generateMapPositions(memories.length);
                const pathD = pos.map((p, i) => {
                  const px = p.x * 10;
                  const py = p.y * 4.2;
                  return i === 0 ? `M ${px},${py}` : `L ${px},${py}`;
                }).join(' ');
                return (
                  <path d={pathD} fill="none" stroke="white"
                    strokeWidth="3" strokeDasharray="12,8" opacity="0.8"/>
                );
              })()}
            </svg>
          </div>

          {/* Memory Points — ALL memories, dynamic positions */}
          {(() => {
            const positions = generateMapPositions(memories.length);
            return memories.map((memory, index) => (
              <MemoryMapPoint
                key={memory._id}
                memory={memory}
                pointNumber={index + 1}
                positionX={positions[index]?.x ?? 50}
                positionY={positions[index]?.y ?? 50}
                totalCount={memories.length}
              />
            ));
          })()}

          {memories.length === 0 && !isLoading && (
            <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center',
              justifyContent:'center', flexDirection:'column', gap:'12px', zIndex:10 }}>
              <div style={{ fontSize:'48px' }}>🗺️</div>
              <p style={{ color:'#3d2c1e', fontWeight:'700', fontSize:'18px',
                background:'rgba(255,255,255,0.85)', padding:'10px 24px', borderRadius:'24px' }}>
                Add your first memory to start your journey!
              </p>
            </div>
          )}
        </div>

        {/* ═══ BELOW MAP SECTIONS ═══ */}
        <div className="home-sections-wrapper">

          {/* Collections Row — click opens collection page */}
          {collections.length > 0 && (
            <div style={{ marginBottom:'32px' }}>
              <div className="home-section-header">
                <h3 className="home-section-title">Your Collections</h3>
                <Link to="/collections" className="home-section-view-all">View All →</Link>
              </div>
              <div className="home-collections-row">
                {collections.map(col => (
                  <div
                    key={col._id}
                    className="home-collection-card"
                    onClick={() => navigate('/collections', { state: { openCollectionId: col._id } })}
                    role="button"
                    tabIndex={0}
                    style={{ cursor:'pointer' }}
                    aria-label={`Open collection ${col.name}`}
                  >
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Favorites strip */}
          {favoriteMemories.length > 0 && (
            <div style={{ marginBottom:'32px' }}>
              <div className="home-section-header">
                <h3 className="home-section-title">❤️ Favorites</h3>
                <Link to="/favorites" className="home-section-view-all">View All →</Link>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'16px' }}>
                {favoriteMemories.slice(0, 4).map(mem => (
                  <MemoryCard key={mem._id} memory={mem} source="map" onFavoriteToggle={loadHomeData}/>
                ))}
              </div>
            </div>
          )}

          {/* Recent Memories — max 5, with View All / Show Less */}
          <div>
            <div className="home-section-header">
              <h3 className="home-section-title">Recent Memories</h3>
              {hasMore && (
                <button
                  onClick={() => setShowAllRecent(p => !p)}
                  className="home-section-view-all"
                  style={{ background:'none', border:'none', cursor:'pointer' }}
                >
                  {showAllRecent ? 'Show Less ↑' : `View All (${memories.length}) →`}
                </button>
              )}
            </div>

            {memories.length === 0 && !isLoading ? (
              <div style={{ textAlign:'center', padding:'40px', color:'#c8a882',
                background:'#fff', borderRadius:'16px' }}>
                <div style={{ fontSize:'40px', marginBottom:'10px' }}>📷</div>
                <p style={{ fontWeight:'600' }}>No memories yet.</p>
                <p style={{ fontSize:'13px', marginTop:'4px' }}>
                  Click <strong>+ Add Memory</strong> to capture your first moment!
                </p>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'16px' }}>
                {recentMemories.map(mem => (
                  <MemoryCard
                    key={mem._id}
                    memory={mem}
                    source="map"
                    backLabel="← Back to Map"
                    onFavoriteToggle={loadHomeData}
                  />
                ))}
              </div>
            )}

            {/* Show "View All" button below grid too */}
            {hasMore && !showAllRecent && (
              <div style={{ textAlign:'center', marginTop:'20px' }}>
                <button
                  onClick={() => setShowAllRecent(true)}
                  style={{
                    padding:'12px 32px', background:'linear-gradient(135deg,#9b8ec4,#c8a882)',
                    color:'#fff', border:'none', borderRadius:'24px',
                    fontSize:'14px', fontWeight:'600', cursor:'pointer',
                    boxShadow:'0 4px 12px rgba(155,142,196,0.3)',
                  }}
                >
                  View All {memories.length} Memories
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default HomePage;
