import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import '../css/CalendarMemoriesPage.css';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * CalendarGrid – renders a full monthly calendar.
 * Props:
 *   year, month          – currently viewed year/month (0-indexed month)
 *   selectedDate         – currently selected Date object
 *   datesWithMemories    – Set of "YYYY-MM-DD" strings that have memories
 *   onDateSelect         – callback(Date)
 *   onPrevMonth          – go to previous month
 *   onNextMonth          – go to next month
 */
function CalendarGrid({
  year,
  month,
  selectedDate,
  datesWithMemories = new Set(),
  onDateSelect,
  onPrevMonth,
  onNextMonth,
}) {
  const today = new Date();

  // Build grid: fill leading blanks + days of month
  const firstDayOfMonth = new Date(year, month, 1);
  // Monday-based: getDay() returns 0=Sun, so shift
  const startDow = (firstDayOfMonth.getDay() + 6) % 7; // 0=Mon
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const gridCells = [];
  for (let i = 0; i < startDow; i++) {
    gridCells.push(null); // empty leading cells
  }
  for (let d = 1; d <= daysInMonth; d++) {
    gridCells.push(d);
  }

  const toDateKey = (d) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const isSelected = (d) =>
    selectedDate &&
    selectedDate.getFullYear() === year &&
    selectedDate.getMonth() === month &&
    selectedDate.getDate() === d;

  const isToday = (d) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === d;

  return (
    <div className="calendar-panel">
      {/* Month Header */}
      <div className="calendar-month-header">
        <button
          className="calendar-nav-btn"
          onClick={onPrevMonth}
          aria-label="Previous month"
        >
          <IoChevronBackOutline />
        </button>
        <span className="calendar-month-title">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          className="calendar-nav-btn"
          onClick={onNextMonth}
          aria-label="Next month"
        >
          <IoChevronForwardOutline />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="calendar-weekday-row" aria-hidden="true">
        {WEEKDAY_LABELS.map((day) => (
          <div key={day} className="calendar-weekday-label">{day}</div>
        ))}
      </div>

      {/* Day Cells */}
      <div className="calendar-days-grid" role="grid" aria-label={`${MONTH_NAMES[month]} ${year}`}>
        {gridCells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="calendar-day-cell other-month" aria-hidden="true" />;
          }

          const dateKey = toDateKey(day);
          const hasContent = datesWithMemories.has(dateKey);
          const selected = isSelected(day);
          const todayFlag = isToday(day);

          return (
            <button
              key={dateKey}
              className={[
                'calendar-day-cell',
                hasContent ? 'has-memories' : '',
                selected ? 'selected' : '',
                todayFlag ? 'today' : '',
              ].join(' ').trim()}
              onClick={() => onDateSelect(new Date(year, month, day))}
              aria-label={`${MONTH_NAMES[month]} ${day}, ${year}${hasContent ? ', has memories' : ''}${selected ? ', selected' : ''}`}
              aria-pressed={selected}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarGrid;
