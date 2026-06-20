import { useState, useEffect } from 'react';
import { IoCalendarOutline, IoLocationOutline } from 'react-icons/io5';
import PageLayout from '../components/PageLayout';
import CalendarGrid from '../components/CalendarGrid';
import { memoriesApi } from '../apis/memoriesApi';
import { diaryApi } from '../apis/diaryApi';
import '../css/CalendarMemoriesPage.css';

function CalendarMemoriesPage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);
  const [dayMemories, setDayMemories] = useState([]);
  const [dayDiaryEntries, setDayDiaryEntries] = useState([]);
  const [datesWithContent, setDatesWithContent] = useState(new Set());
  const [isLoadingDay, setIsLoadingDay] = useState(false);

  // Load which dates have content for the current month
  useEffect(() => {
    const loadMonthDates = async () => {
      try {
        const dates = await memoriesApi.getDatesWithMemories(viewYear, viewMonth + 1);
        setDatesWithContent(new Set(dates));
      } catch (err) {
        console.error('Failed to load calendar dates:', err);
      }
    };
    loadMonthDates();
  }, [viewYear, viewMonth]);

  // Load memories & diary for selected date
  useEffect(() => {
    const loadDayContent = async () => {
      setIsLoadingDay(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      try {
        const [mems, diaries] = await Promise.all([
          memoriesApi.getMemoriesByDate(dateStr),
          diaryApi.getDiaryEntriesByDate(dateStr),
        ]);
        setDayMemories(mems);
        setDayDiaryEntries(diaries);
      } catch (err) {
        console.error('Failed to load day content:', err);
      } finally {
        setIsLoadingDay(false);
      }
    };
    loadDayContent();
  }, [selectedDate]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const formattedSelectedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const totalItems = dayMemories.length + dayDiaryEntries.length;

  return (
    <PageLayout pageTitle="Calendar Memories">
      <div className="calendar-memories-page">
        <div className="calendar-memories-content">
          {/* Left: Calendar */}
          <CalendarGrid
            year={viewYear}
            month={viewMonth}
            selectedDate={selectedDate}
            datesWithMemories={datesWithContent}
            onDateSelect={setSelectedDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          {/* Right: Day Content */}
          <div className="day-memories-panel">
            <div>
              <span className="day-memories-date-title">{formattedSelectedDate}</span>
              {totalItems > 0 && (
                <span className="day-memories-count-badge">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>

            {isLoadingDay && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#c8a882' }}>
                Loading...
              </div>
            )}

            {!isLoadingDay && totalItems === 0 && (
              <div className="no-memories-on-day">
                <div className="no-memories-on-day-icon">📭</div>
                <p className="no-memories-on-day-text">
                  No memories or diary entries on this day.
                </p>
                <p style={{ fontSize: '13px', marginTop: '6px', color: '#c8a882' }}>
                  Click "Add Memory" to capture this date!
                </p>
              </div>
            )}

            {/* Memories for this day */}
            {dayMemories.map((memory) => (
              <div key={memory._id} className="day-memory-card">
                {memory.imageUrl && (
                  <img
                    src={memory.imageUrl}
                    alt={memory.title}
                    className="day-memory-card-image"
                  />
                )}
                <div className="day-memory-card-info">
                  <div className="day-memory-card-title">{memory.title}</div>
                  {memory.location && (
                    <div className="day-memory-card-location">
                      <IoLocationOutline size={11} /> {memory.location}
                    </div>
                  )}
                  {memory.description && (
                    <p className="day-memory-card-description">
                      {memory.description.slice(0, 120)}
                      {memory.description.length > 120 ? '...' : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Diary entries for this day */}
            {dayDiaryEntries.map((entry) => (
              <div key={entry._id} className="day-diary-entry-card">
                <div className="day-diary-entry-label">📖 Diary Entry</div>
                <div style={{ fontWeight: '700', marginBottom: '8px', color: '#3d2c1e' }}>
                  {entry.title}
                </div>
                <p className="day-diary-entry-preview">
                  {entry.content?.replace(/<[^>]*>/g, '').slice(0, 160)}
                  {entry.content?.length > 160 ? '...' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default CalendarMemoriesPage;
