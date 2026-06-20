import { IoLockClosedOutline } from 'react-icons/io5';
import '../css/StoryWritingPage.css';

const STATUS_CLASS_MAP = {
  'Working on Chapter': 'story-status-working',
  'Draft': 'story-status-draft',
  'Pausing': 'story-status-pausing',
  'In Progress': 'story-status-inprogress',
};

/**
 * StoryListItem – a single row in the left Stories panel.
 */
function StoryListItem({ story, isActive, onClick }) {
  const statusClass = STATUS_CLASS_MAP[story?.status] || 'story-status-draft';

  return (
    <div
      className={`story-list-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick?.(story)}
      role="button"
      tabIndex={0}
      aria-label={`Story: ${story?.title}`}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className="story-list-item-title">
        {story?.title}
        {story?.isLocked && (
          <IoLockClosedOutline
            className="story-list-item-lock-icon"
            aria-label="Locked story"
          />
        )}
      </div>

      {story?.status && (
        <span className={`story-list-item-status ${statusClass}`}>
          {story.status}
        </span>
      )}

      {story?.currentChapter && (
        <div className="story-list-item-chapter-info">
          {story.currentChapter}
        </div>
      )}
    </div>
  );
}

export default StoryListItem;
