import { IoPencilOutline, IoTrashOutline, IoBookmarkOutline } from 'react-icons/io5';
import '../css/DiaryPage.css';

/**
 * DiaryEntryCard – displays a single diary entry in the sidebar list.
 * Clicking it loads the full entry in the right panel.
 */
function DiaryEntryCard({ entry, isActive, onClick, onDelete }) {
  const formattedDate = entry?.date
    ? new Date(entry.date).toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '';

  return (
    <div
      className={`diary-entry-list-item ${isActive ? 'active-entry' : ''}`}
      onClick={() => onClick?.(entry)}
      role="button"
      tabIndex={0}
      aria-label={`Diary entry: ${entry?.title}`}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className="diary-entry-list-date">{formattedDate}</div>
      <div className="diary-entry-list-title">{entry?.title}</div>
      <div className="diary-entry-list-preview">
        {entry?.content?.replace(/<[^>]*>/g, '').slice(0, 55)}...
      </div>
    </div>
  );
}

export default DiaryEntryCard;
