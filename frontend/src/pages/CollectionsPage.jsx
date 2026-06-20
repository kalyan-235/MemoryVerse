import { useState, useEffect } from 'react';
import { IoAddOutline } from 'react-icons/io5';
import PageLayout from '../components/PageLayout';
import CollectionCard from '../components/CollectionCard';
import { collectionsApi } from '../apis/collectionsApi';
import '../css/CollectionsPage.css';

function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    collectionsApi.getAllCollections()
      .then(setCollections)
      .catch(console.error);
  }, []);

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await collectionsApi.createCollection({ name: newCollectionName });
      setCollections((prev) => [...prev, created]);
      setNewCollectionName('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to create collection:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout pageTitle="Your Collections">
      <div className="collections-page">
        <div className="collections-content">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h2 className="collections-page-title">Your Collections</h2>
              <p className="collections-page-subtitle">
                All your memories organized in one place.
              </p>
            </div>
            <button
              className="navbar-add-memory-btn"
              onClick={() => setIsModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px',
                background: 'linear-gradient(135deg,#9b8ec4,#c8a882)',
                color: '#fff', border: 'none', borderRadius: '24px',
                padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
              <IoAddOutline size={16} /> New Collection
            </button>
          </div>

          {/* Collections Grid */}
          <div className="collections-grid">
            {collections.map((col) => (
              <CollectionCard
                key={col._id}
                collection={col}
                onOptionsClick={() => {}}
              />
            ))}

            {/* Create New Card */}
            <div
              className="create-collection-card"
              onClick={() => setIsModalOpen(true)}
              role="button"
              tabIndex={0}
              aria-label="Create new collection"
            >
              <div className="create-collection-icon">＋</div>
              <span className="create-collection-label">Create New Collection</span>
            </div>
          </div>
        </div>

        {/* New Collection Modal */}
        {isModalOpen && (
          <div className="new-collection-modal-overlay" role="dialog" aria-modal="true">
            <div className="new-collection-modal">
              <h3 className="new-collection-modal-title">📁 New Collection</h3>
              <form onSubmit={handleCreateCollection}>
                <div className="new-collection-form-field">
                  <label className="new-collection-form-label" htmlFor="collection-name">
                    Collection Name *
                  </label>
                  <input
                    id="collection-name"
                    type="text"
                    className="new-collection-form-input"
                    placeholder="e.g. Travel Diaries, Family Moments..."
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="new-collection-modal-actions">
                  <button
                    type="button"
                    className="new-collection-cancel-btn"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="new-collection-save-btn"
                    disabled={isSubmitting || !newCollectionName.trim()}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Collection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default CollectionsPage;
