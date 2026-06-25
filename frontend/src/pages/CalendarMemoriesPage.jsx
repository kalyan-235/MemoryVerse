import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoLocationOutline, IoImagesOutline, IoBookOutline } from 'react-icons/io5';
import PageLayout from '../components/PageLayout';
import CalendarGrid from '../components/CalendarGrid';
import { memoriesApi } from '../apis/memoriesApi';
import { diaryApi } from '../apis/diaryApi';
import '../css/CalendarMemoriesPage.css';

function CalendarMemoriesPage() {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);
  const [dayMemories, setDayMemories]   = useState([]);
  const [dayDiaries,  setDayDiaries]    = useState([]);
  const [datesWithContent, setDatesWithContent] = useState(new Set());
  const [isLoadingDay, setIsLoadingDay] = useState(false);
  const navigate = useNavigate();

  // Load which dates have memories this month
  useEffect(() => {
    memoriesApi.getDatesWithMemories(viewYear, viewMonth + 1)
      .then(dates => setDatesWithContent(new Set(dates)))
      .catch(console.error);
  }, [viewYear, viewMonth]);

  // Load content for selected date
  const loadDayContent = useCallback(async (date) => {
    setIsLoadingDay(true);
    const dateStr = date.toISOString().split('T')[0];
    try {
      const [mems, diaries] = await Promise.all([
        memoriesApi.getMemoriesByDate(dateStr),
        diaryApi.getDiaryEntriesByDate(dateStr),
      ]);
      setDayMemories(mems);
      setDayDiaries(diaries);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDay(false);
    }
  }, []);

  useEffect(() => { loadDayContent(selectedDate); }, [selectedDate, loadDayContent]);

  const handleDateSelect = (date) => setSelectedDate(date);

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const formattedSelected = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const totalItems = dayMemories.length + dayDiaries.length;

  return (
    <PageLayout pageTitle="Calendar Memories">
      <div className="calendar-memories-page">
        <div style={{ padding: '28px 28px 0' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '26px', fontWeight: '700', color: '#3d2c1e' }}>
            Calendar Memories
          </h2>
          <p style={{ fontSize: '14px', color: '#9b8ec4', marginTop: '4px' }}>
            View your memories and diary entries by date.
          </p>
        </div>

        <div className="calendar-memories-content">
          {/* Left: Calendar */}
          <CalendarGrid
            year={viewYear}
            month={viewMonth}
            selectedDate={selectedDate}
            datesWithMemories={datesWithContent}
            onDateSelect={handleDateSelect}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          {/* Right: Day Content */}
          <div className="day-memories-panel">
            {/* Date header */}
            <div style={{ marginBottom: '20px' }}>
              <span className="day-memories-date-title">{formattedSelected}</span>
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
                <p className="no-memories-on-day-text">No memories or entries on this day.</p>
                <p style={{ fontSize: '13px', marginTop: '6px', color: '#c8a882' }}>
                  Add a memory using the <strong>+ Add Memory</strong> button above.
                </p>
              </div>
            )}

            {/* Memories for this day */}
            {dayMemories.length > 0 && (
              <>
                <div style={{
                  fontSize: '12px', fontWeight: '700', textTransform: 'uppercase',
                  letterSpacing: '1px', color: '#9b8ec4', marginBottom: '12px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <IoImagesOutline /> Photos & Videos ({dayMemories.length})
                </div>
                {dayMemories.map(memory => (
                  <div
                    key={memory._id}
                    className="day-memory-card"
                    onClick={() => navigate(`/memory/${memory._id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {memory.imageUrl ? (
                      <img
                        src={memory.imageUrl}
                        alt={memory.title}
                        className="day-memory-card-image"
                      />
                    ) : (
                      <div style={{
                        width: '90px', height: '90px', borderRadius: '12px',
                        background: 'linear-gradient(135deg,#f5e6d3,#e8d5c0)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '28px', flexShrink: 0,
                      }}>📷</div>
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
                          {memory.description.slice(0, 100)}
                          {memory.description.length > 100 ? '...' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Diary entries for this day */}
            {dayDiaries.length > 0 && (
              <>
                <div style={{
                  fontSize: '12px', fontWeight: '700', textTransform: 'uppercase',
                  letterSpacing: '1px', color: '#9b8ec4',
                  margin: `${dayMemories.length > 0 ? '20px' : '0'} 0 12px`,
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <IoBookOutline /> Diary Entries ({dayDiaries.length})
                </div>
                {dayDiaries.map(entry => (
                  <div
                    key={entry._id}
                    className="day-diary-entry-card"
                    onClick={() => navigate('/diary')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="day-diary-entry-label">📖 Diary Entry</div>
                    <div style={{ fontWeight: '700', marginBottom: '8px', color: '#3d2c1e', fontSize: '15px' }}>
                      {entry.title}
                    </div>
                    {entry.mood && (
                      <span style={{
                        display: 'inline-block', background: 'rgba(155,142,196,0.15)',
                        color: '#9b8ec4', borderRadius: '20px', padding: '2px 10px',
                        fontSize: '12px', marginBottom: '8px',
                      }}>
                        {entry.mood}
                      </span>
                    )}
                    <p className="day-diary-entry-preview">
                      {entry.content?.replace(/<[^>]*>/g, '').slice(0, 180)}
                      {entry.content?.length > 180 ? '...' : ''}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default CalendarMemoriesPage;
