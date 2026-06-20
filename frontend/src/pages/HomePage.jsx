import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import MemoryMapPoint from '../components/MemoryMapPoint';
import MemoryCard from '../components/MemoryCard';
import CollectionCard from '../components/CollectionCard';
import { memoriesApi } from '../apis/memoriesApi';
import { collectionsApi } from '../apis/collectionsApi';
import '../css/MemoryJourneyMap.css';

// Preset positions on the adventure map for each memory point (% based)
const MAP_POSITIONS = [
  { x: 18, y: 72 }, { x: 28, y: 48 }, { x: 38, y: 58 },
  { x: 50, y: 38 }, { x: 60, y: 55 }, { x: 68, y: 28 },
  { x: 78, y: 50 },
];

function HomePage() {
  const [memories, setMemories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [favoriteMemories, setFavoriteMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [memoriesData, collectionsData, favoritesData] = await Promise.all([
          memoriesApi.getAllMemories({ limit: 7 }),
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
    };
    loadHomeData();
  }, []);

  return (
    <PageLayout pageTitle="Your Journey, Your Memories">
      <div className="journey-map-page">
        {/* Hero Header */}
        <div className="journey-map-hero">
          <h2 className="journey-map-heading">Your Journey, Your Memories</h2>
          <p className="journey-map-subheading">
            Relive your best moments in a beautiful way.
          </p>
        </div>

        {/* ===== ADVENTURE MAP ===== */}
        <div className="journey-map-canvas" aria-label="Memory journey map">
          {/* Illustrated Background */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #d4e8d0 0%, #a8c5da 35%, #f5e6d3 65%, #c8e0b0 100%)',
          }} />

          {/* Decorative path SVG */}
          {memories.length > 1 && (
            <svg className="journey-path-svg" aria-hidden="true">
              <polyline
                className="journey-path-line"
                points={memories.slice(0, 7).map((_, i) => {
                  const pos = MAP_POSITIONS[i] || { x: 50, y: 50 };
                  return `${pos.x * 8},${pos.y * 4.2}`;
                }).join(' ')}
              />
            </svg>
          )}

          {/* Memory Points */}
          {memories.slice(0, 7).map((memory, index) => (
            <MemoryMapPoint
              key={memory._id}
              memory={memory}
              pointNumber={index + 1}
              positionX={MAP_POSITIONS[index]?.x ?? 50}
              positionY={MAP_POSITIONS[index]?.y ?? 50}
            />
          ))}

          {memories.length === 0 && !isLoading && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '10px',
            }}>
              <div style={{ fontSize: '40px' }}>🗺️</div>
              <p style={{ color: '#7a5c44', fontWeight: '600', fontSize: '16px' }}>
                Add your first memory to start your journey!
              </p>
            </div>
          )}
        </div>

        {/* ===== BELOW MAP SECTIONS ===== */}
        <div className="home-sections-wrapper">

          {/* Collections Section */}
          <div style={{ marginBottom: '32px' }}>
            <div className="home-section-header">
              <h3 className="home-section-title">Your Collections</h3>
              <Link to="/collections" className="home-section-view-all">
                View All →
              </Link>
            </div>
            <div className="home-collections-row">
              {collections.map((col) => (
                <div key={col._id} className="home-collection-card">
                  <img
                    src={col.coverImage || 'https://placehold.co/280x110/f5e6d3/c8a882?text=Collection'}
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

          {/* Favorites Section */}
          {favoriteMemories.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div className="home-section-header">
                <h3 className="home-section-title">❤️ Favorites</h3>
                <Link to="/favorites" className="home-section-view-all">View All →</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {favoriteMemories.slice(0, 4).map((mem) => (
                  <MemoryCard key={mem._id} memory={mem} />
                ))}
              </div>
            </div>
          )}

          {/* Recent Memories Section */}
          <div>
            <div className="home-section-header">
              <h3 className="home-section-title">Recent Memories</h3>
              <Link to="/collections" className="home-section-view-all">View All →</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {memories.slice(0, 4).map((mem) => (
                <MemoryCard key={mem._id} memory={mem} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
}

export default HomePage;
