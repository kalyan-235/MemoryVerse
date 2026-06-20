import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoHeartOutline, IoHeart, IoLocationOutline,
         IoCalendarOutline, IoVideocamOutline } from 'react-icons/io5';
import '../css/MemoryCard.css';

function MemoryCard({ memory, onFavoriteToggle }) {
  const [isFavorited, setIsFavorited] = useState(memory?.isFavorite || false);
  const navigate = useNavigate();

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorited((prev) => !prev);
    onFavoriteToggle?.(memory._id, !isFavorited);
  };

  const handleCardClick = () => {
    navigate(`/memory/${memory._id}`);
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
      aria-label={`Memory: ${memory?.title}`}
    >
      {/* Thumbnail */}
      <img
        src={memory?.imageUrl || 'https://placehold.co/400x220/f5e6d3/c8a882?text=Memory'}
        alt={memory?.title}
        className="memory-card-thumbnail"
        loading="lazy"
      />

      {/* Video Badge */}
      {memory?.videoUrl && (
        <span className="memory-card-video-badge">
          <IoVideocamOutline size={10} /> Video
        </span>
      )}

      {/* Favorite Button */}
      <button
        className={`memory-card-favorite-btn ${isFavorited ? 'favorited' : ''}`}
        onClick={handleFavoriteClick}
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        {isFavorited ? <IoHeart color="#ff6464" /> : <IoHeartOutline />}
      </button>

      {/* Card Body */}
      <div className="memory-card-body">
        <h3 className="memory-card-title">{memory?.title}</h3>

        {formattedDate && (
          <div className="memory-card-date">
            <IoCalendarOutline size={11} />
            {formattedDate}
          </div>
        )}

        {memory?.location && (
          <div className="memory-card-location">
            <IoLocationOutline size={11} />
            {memory.location}
          </div>
        )}

        {memory?.description && (
          <p className="memory-card-description">{memory.description}</p>
        )}

        {memory?.tags?.length > 0 && (
          <div className="memory-card-tags-row">
            {memory.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="memory-card-tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default MemoryCard;
