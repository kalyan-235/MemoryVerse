import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoHeartOutline, IoHeart, IoLocationOutline,
         IoCalendarOutline, IoVideocamOutline } from 'react-icons/io5';
import '../css/MemoryCard.css';

/**
 * MemoryCard
 * Props:
 *   memory          — the memory object
 *   source          — 'map' (default) | 'collection' — controls prev/next scope
 *   collectionId    — required when source='collection'
 *   backLabel       — label for back button on detail page
 *   onFavoriteToggle — callback after toggling
 */
function MemoryCard({ memory, source = 'map', collectionId = null, backLabel, onFavoriteToggle }) {
  const [isFavorited, setIsFavorited] = useState(memory?.isFavorite || false);
  const navigate = useNavigate();

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorited(p => !p);
    onFavoriteToggle?.(memory._id, !isFavorited);
  };

  const handleCardClick = () => {
    const label    = source === 'collection' ? `← ${collectionId ? 'Collection' : 'Collections'}` : '← Back to Map';
    const returnTo = source === 'collection' ? '/collections' : '/';
    navigate(`/memory/${memory._id}`, {
      state: {
        source,
        collectionId: collectionId || memory.collectionId || null,
        backLabel:    backLabel || label,
        returnTo,                    // exact path to return to on back click
      },
    });
  };

  const formattedDate = memory?.date
    ? new Date(memory.date).toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '';

  return (
    <article
      className="memory-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleCardClick()}
      aria-label={`Memory: ${memory?.title}`}
    >
      <img
        src={memory?.imageUrl || 'https://placehold.co/400x220/f5e6d3/c8a882?text=Memory'}
        alt={memory?.title}
        className="memory-card-thumbnail"
        loading="lazy"
      />

      {memory?.videoUrl && (
        <span className="memory-card-video-badge">
          <IoVideocamOutline size={10}/> Video
        </span>
      )}

      <button
        className={`memory-card-favorite-btn ${isFavorited ? 'favorited' : ''}`}
        onClick={handleFavoriteClick}
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        {isFavorited ? <IoHeart color="#ff6464"/> : <IoHeartOutline/>}
      </button>

      <div className="memory-card-body">
        <h3 className="memory-card-title">{memory?.title}</h3>

        {formattedDate && (
          <div className="memory-card-date">
            <IoCalendarOutline size={11}/> {formattedDate}
          </div>
        )}

        {memory?.location && (
          <div className="memory-card-location">
            <IoLocationOutline size={11}/> {memory.location}
          </div>
        )}

        {memory?.description && (
          <p className="memory-card-description">{memory.description}</p>
        )}

        {memory?.tags?.length > 0 && (
          <div className="memory-card-tags-row">
            {memory.tags.slice(0, 3).map(tag => (
              <span key={tag} className="memory-card-tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default MemoryCard;
