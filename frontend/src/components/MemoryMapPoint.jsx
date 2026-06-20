import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCalendarOutline, IoLocationOutline } from 'react-icons/io5';

/**
 * MemoryMapPoint – A numbered pin on the journey map.
 * Shows a popup preview on hover with memory details.
 */
function MemoryMapPoint({ memory, pointNumber, positionX, positionY }) {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const navigate = useNavigate();

  const formattedDate = memory?.date
    ? new Date(memory.date).toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '';

  return (
    <div
      className="memory-map-point"
      style={{ left: `${positionX}%`, top: `${positionY}%` }}
      onMouseEnter={() => setIsPopupVisible(true)}
      onMouseLeave={() => setIsPopupVisible(false)}
      onClick={() => navigate(`/memory/${memory._id}`)}
      role="button"
      tabIndex={0}
      aria-label={`Memory point ${pointNumber}: ${memory?.title}`}
    >
      {/* Numbered Circle */}
      <div className="memory-map-point-circle">
        {pointNumber}
      </div>

      {/* Hover Popup */}
      {isPopupVisible && (
        <div className="memory-map-popup" role="tooltip">
          {memory?.imageUrl && (
            <img
              src={memory.imageUrl}
              alt={memory.title}
              className="memory-map-popup-image"
            />
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
              {memory.description.slice(0, 80)}
              {memory.description.length > 80 ? '...' : ''}
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
