import { useState, useEffect } from 'react';
import { IoHeartOutline, IoImagesOutline, IoBookOutline, IoPencilOutline } from 'react-icons/io5';
import PageLayout from '../components/PageLayout';
import MemoryCard from '../components/MemoryCard';
import { favoritesApi } from '../apis/favoritesApi';
import '../css/FavoritesPage.css';

const TABS = [
  { id: 'memories', label: 'Memories', icon: <IoImagesOutline /> },
  { id: 'diaries', label: 'Diaries', icon: <IoBookOutline /> },
  { id: 'stories', label: 'Stories', icon: <IoPencilOutline /> },
];

function FavoritesPage() {
  const [activeTab, setActiveTab] = useState('memories');
  const [favoriteMemories, setFavoriteMemories] = useState([]);
  const [favoriteDiaries, setFavoriteDiaries] = useState([]);
  const [favoriteStories, setFavoriteStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      try {
        const [mems, diaries, stories] = await Promise.all([
          favoritesApi.getFavoriteMemories(),
          favoritesApi.getFavoriteDiaries(),
          favoritesApi.getFavoriteStories(),
        ]);
        setFavoriteMemories(mems);
        setFavoriteDiaries(diaries);
        setFavoriteStories(stories);
      } catch (err) {
        console.error('Failed to load favorites:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadFavorites();
  }, []);

  const currentItems =
    activeTab === 'memories' ? favoriteMemories
    : activeTab === 'diaries' ? favoriteDiaries
    : favoriteStories;

  return (
    <PageLayout pageTitle="Favorites">
      <div className="favorites-page">
        <h2 className="favorites-page-heading">❤️ Your Favorites</h2>
        <p className="favorites-page-subtext">
          All the memories, diaries and stories you've loved.
        </p>

        {/* Tabs */}
        <div className="favorites-tabs-row" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              className={`favorites-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#c8a882' }}>
            Loading favorites...
          </div>
        )}

        {/* Empty State */}
        {!isLoading && currentItems.length === 0 && (
          <div className="favorites-empty-state">
            <div className="favorites-empty-icon">
              <IoHeartOutline size={52} />
            </div>
            <h3 className="favorites-empty-title">
              No favorite {activeTab} yet
            </h3>
            <p className="favorites-empty-desc">
              Heart any {activeTab.slice(0, -1)} to see it here.
            </p>
          </div>
        )}

        {/* Memories Grid */}
        {!isLoading && activeTab === 'memories' && favoriteMemories.length > 0 && (
          <div className="favorites-items-grid">
            {favoriteMemories.map((mem) => (
              <MemoryCard key={mem._id} memory={mem} />
            ))}
          </div>
        )}

        {/* Diaries & Stories – Text Cards */}
        {!isLoading && activeTab !== 'memories' && currentItems.length > 0 && (
          <div className="favorites-items-grid">
            {currentItems.map((item) => (
              <div key={item._id} className="favorites-text-card">
                <div className="favorites-text-card-type">
                  {activeTab === 'diaries' ? '📖 Diary Entry' : '✍️ Story'}
                </div>
                <div className="favorites-text-card-title">{item.title}</div>
                <p className="favorites-text-card-preview">
                  {item.content?.replace(/<[^>]*>/g, '').slice(0, 140)}...
                </p>
                <div className="favorites-text-card-date">
                  {item.date
                    ? new Date(item.date).toLocaleDateString('en-US', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })
                    : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default FavoritesPage;
