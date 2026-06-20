import { IoEllipsisHorizontal, IoHeartOutline, IoHeart, IoLockClosedOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../css/CollectionsPage.css';

/**
 * CollectionCard – displays a single collection with cover image,
 * name, memory count, and quick action buttons.
 */
function CollectionCard({ collection, onOptionsClick }) {
  const [isFavorited, setIsFavorited] = useState(collection?.isFavorite || false);
  const navigate = useNavigate();

  return (
    <article
      className="collection-card"
      onClick={() => navigate(`/collections/${collection._id}`)}
      role="button"
      tabIndex={0}
      aria-label={`Collection: ${collection?.name}`}
    >
      {/* Cover Image */}
      <img
        src={
          collection?.coverImage ||
          'https://placehold.co/400x200/f5e6d3/c8a882?text=Collection'
        }
        alt={collection?.name}
        className="collection-card-cover"
        loading="lazy"
      />

      {/* Private Lock Badge */}
      {collection?.isPrivate && (
        <span className="collection-card-lock-badge">
          <IoLockClosedOutline size={10} /> Private
        </span>
      )}

      {/* Favorite Button */}
      <button
        className="collection-card-favorite-btn"
        onClick={(e) => {
          e.stopPropagation();
          setIsFavorited((p) => !p);
        }}
        aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        {isFavorited ? <IoHeart color="#ff6464" /> : <IoHeartOutline />}
      </button>

      {/* More Options */}
      <button
        className="collection-card-action-btn"
        style={{ position: 'absolute', top: '10px', right: '10px' }}
        onClick={(e) => {
          e.stopPropagation();
          onOptionsClick?.(collection);
        }}
        aria-label="Collection options"
      >
        <IoEllipsisHorizontal />
      </button>

      {/* Card Info */}
      <div className="collection-card-body">
        <div className="collection-card-name">{collection?.name}</div>
        <div className="collection-card-memory-count">
          {collection?.memoryCount ?? 0} Memories
        </div>
      </div>
    </article>
  );
}

export default CollectionCard;
