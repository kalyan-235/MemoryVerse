import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCalendarOutline, IoLocationOutline } from 'react-icons/io5';

/**
 * MemoryMapPoint — a numbered pin on the journey map.
 * Shows a popup preview on hover.
 * totalCount adjusts pin size when there are many memories.
 */
function MemoryMapPoint({ memory, pointNumber, positionX, positionY, totalCount = 1 }) {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const navigate = useNavigate();

  // Scale pin size down when there are many memories to avoid overlap
  const pinSize = totalCount <= 10 ? 44
    : totalCount <= 20 ? 36
    : totalCount <= 40 ? 30
    : 24;

  const fontSize = totalCount <= 10 ? 13
    : totalCount <= 20 ? 11
    : 9;

  const formattedDate = memory?.date
    ? new Date(memory.date).toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '';

  const handleClick = () => {
    navigate(`/memory/${memory._id}`, {
      state: {
        source:    'map',
        returnTo:  '/',
        backLabel: '← Back to Map',
      },
    });
  };

  return (
    <div
      className="memory-map-point"
      style={{ left: `${positionX}%`, top: `${positionY}%` }}
      onMouseEnter={() => setIsPopupVisible(true)}
      onMouseLeave={() => setIsPopupVisible(false)}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      aria-label={`Memory ${pointNumber}: ${memory?.title}`}
    >
      {/* Pin circle */}
      <div
        className="memory-map-point-circle"
        style={{ width: `${pinSize}px`, height: `${pinSize}px`, fontSize: `${fontSize}px` }}
      >
        {pointNumber}
      </div>

      {/* Hover popup — show on right side if near left edge, else on left */}
      {isPopupVisible && (
        <div
          className="memory-map-popup"
          style={{
            left: positionX > 70 ? 'auto' : '50%',
            right: positionX > 70 ? '110%' : 'auto',
            transform: positionX > 70 ? 'none' : 'translateX(-50%)',
          }}
          role="tooltip"
        >
          {memory?.imageUrl ? (
            <img
              src={memory.imageUrl}
              alt={memory.title}
              className="memory-map-popup-image"
            />
          ) : (
            <div style={{
              width: '100%', height: '80px', borderRadius: '10px', marginBottom: '8px',
              background: 'linear-gradient(135deg,#f5e6d3,#e8d5c0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px',
            }}>📷</div>
          )}

          <div className="memory-map-popup-title">{memory?.title}</div>

          {formattedDate && (
            <div className="memory-map-popup-date">
              <IoCalendarOutline size={10} /> {formattedDate}
            </div>
          )}

          {memory?.location && (
            <div className="memory-map-popup-date">
              <IoLocationOutline size={10} /> {memory.location}
            </div>
          )}

          {memory?.description && (
            <p className="memory-map-popup-desc">
              {memory.description.slice(0, 70)}
              {memory.description.length > 70 ? '...' : ''}
            </p>
          )}

          <button className="memory-map-popup-view-btn">
            View Memory →
          </button>
        </div>
      )}
    </div>
  );
}

export default MemoryMapPoint;
