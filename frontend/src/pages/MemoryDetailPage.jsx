import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IoArrowBackOutline, IoHeartOutline, IoHeart, IoPencilOutline,
  IoShareSocialOutline, IoTrashOutline, IoCalendarOutline, IoLocationOutline,
  IoChevronBackOutline, IoChevronForwardOutline,
} from 'react-icons/io5';
import PageLayout from '../components/PageLayout';
import { memoriesApi } from '../apis/memoriesApi';
import '../css/MemoryDetailPage.css';

function MemoryDetailPage() {
  const { memoryId } = useParams();
  const navigate = useNavigate();
  const [memory, setMemory] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMemory = async () => {
      setIsLoading(true);
      try {
        const data = await memoriesApi.getMemoryById(memoryId);
        setMemory(data);
        setIsFavorited(data.isFavorite || false);
      } catch (err) {
        console.error('Failed to load memory:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadMemory();
  }, [memoryId]);

  const handleFavoriteToggle = async () => {
    try {
      await memoriesApi.toggleFavorite(memoryId);
      setIsFavorited((p) => !p);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this memory? This cannot be undone.')) return;
    try {
      await memoriesApi.deleteMemory(memoryId);
      navigate('/');
    } catch (err) {
      console.error('Failed to delete memory:', err);
    }
  };

  const formattedDate = memory?.date
    ? new Date(memory.date).toLocaleDateString('en-US', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  if (isLoading) {
    return (
      <PageLayout pageTitle="Memory">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', color: '#c8a882', fontSize: '16px' }}>
          Loading memory...
        </div>
      </PageLayout>
    );
  }

  if (!memory) {
    return (
      <PageLayout pageTitle="Memory Not Found">
        <div className="memory-detail-page">
          <p style={{ color: '#e07070', fontSize: '15px' }}>Memory not found.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageTitle={memory.title}>
      <div className="memory-detail-page">
        {/* Back Button */}
        <button
          className="memory-detail-back-btn"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <IoArrowBackOutline /> Back to Map
        </button>

        <div className="memory-detail-layout">
          {/* Left: Image + Navigation */}
          <div>
            <div className="memory-detail-main-image-wrapper">
              <img
                src={memory.imageUrl || 'https://placehold.co/800x460/f5e6d3/c8a882?text=Memory'}
                alt={memory.title}
                className="memory-detail-main-image"
              />
            </div>

            {/* Prev / Next Navigation */}
            <div className="memory-detail-nav-buttons">
              <button
                className="memory-detail-prev-btn"
                onClick={() => navigate(`/memory/${memory.prevMemoryId}`)}
                disabled={!memory.prevMemoryId}
                aria-label="Previous memory"
              >
                <IoChevronBackOutline /> Previous Memory
              </button>
              <button
                className="memory-detail-next-btn"
                onClick={() => navigate(`/memory/${memory.nextMemoryId}`)}
                disabled={!memory.nextMemoryId}
                aria-label="Next memory"
              >
                Next Memory <IoChevronForwardOutline />
              </button>
            </div>
          </div>

          {/* Right: Info Panel */}
          <div className="memory-detail-info-panel">
            <h1 className="memory-detail-title">{memory.title}</h1>

            <div className="memory-detail-meta-row">
              {formattedDate && (
                <span className="memory-detail-date">
                  <IoCalendarOutline size={13} /> {formattedDate}
                </span>
              )}
              {memory.location && (
                <span className="memory-detail-location">
                  <IoLocationOutline size={13} /> {memory.location}
                </span>
              )}
            </div>

            {memory.description && (
              <p className="memory-detail-description">{memory.description}</p>
            )}

            {memory.tags?.length > 0 && (
              <div className="memory-detail-tags-row">
                {memory.tags.map((tag) => (
                  <span key={tag} className="memory-detail-tag">#{tag}</span>
                ))}
              </div>
            )}

            <div className="memory-detail-divider" />

            {/* Action Buttons */}
            <div className="memory-detail-actions">
              <button
                className={`memory-action-favorite-btn ${isFavorited ? 'favorited' : ''}`}
                onClick={handleFavoriteToggle}
                aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorited ? <IoHeart color="#ff6464" /> : <IoHeartOutline />}
                {isFavorited ? 'Favorited' : 'Favorite'}
              </button>

              <button
                className="memory-action-edit-btn"
                onClick={() => navigate(`/memory/${memoryId}/edit`)}
                aria-label="Edit memory"
              >
                <IoPencilOutline /> Edit
              </button>

              <button
                className="memory-action-share-btn"
                aria-label="Share memory"
              >
                <IoShareSocialOutline />
              </button>

              <button
                className="memory-action-delete-btn"
                onClick={handleDelete}
                aria-label="Delete memory"
              >
                <IoTrashOutline />
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default MemoryDetailPage;
