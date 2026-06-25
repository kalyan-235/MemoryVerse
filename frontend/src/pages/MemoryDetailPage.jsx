import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  IoArrowBackOutline, IoHeartOutline, IoHeart, IoPencilOutline,
  IoShareSocialOutline, IoTrashOutline, IoCalendarOutline,
  IoLocationOutline, IoChevronBackOutline, IoChevronForwardOutline,
  IoCloseOutline, IoSaveOutline,
} from 'react-icons/io5';
import PageLayout from '../components/PageLayout';
import { memoriesApi } from '../apis/memoriesApi';
import toast from 'react-hot-toast';
import '../css/MemoryDetailPage.css';

function MemoryDetailPage() {
  const { memoryId } = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();

  // These are set when navigating here from MemoryCard
  const source       = location.state?.source       || 'map';
  const collectionId = location.state?.collectionId || null;
  const backLabel    = location.state?.backLabel     || '← Back to Map';
  // returnTo = the exact path to go back to (never changes even after prev/next)
  const returnTo     = location.state?.returnTo      || '/';

  const [memory,      setMemory]      = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isEditing,   setIsEditing]   = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);

  const [editTitle,    setEditTitle]    = useState('');
  const [editDesc,     setEditDesc]     = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDate,     setEditDate]     = useState('');

  useEffect(() => { loadMemory(memoryId); }, [memoryId]);

  const loadMemory = async (id) => {
    setIsLoading(true);
    try {
      const data = await memoriesApi.getMemoryById(id, { source, collectionId });
      setMemory(data);
      setIsFavorited(data.isFavorite || false);
      setEditTitle(data.title       || '');
      setEditDesc(data.description  || '');
      setEditLocation(data.location || '');
      setEditDate(data.date ? data.date.split('T')[0] : '');
    } catch (err) {
      toast.error('Memory not found.');
    } finally {
      setIsLoading(false);
    }
  };

  // Prev/Next: navigate but keep the same returnTo so back always works
  const goToMemory = (id) => {
    if (!id) return;
    navigate(`/memory/${id}`, {
      state: { source, collectionId, backLabel, returnTo },
      replace: true, // replace history so back button works correctly
    });
  };

  // Back: go to the exact return path (not browser history)
  const handleBack = () => navigate(returnTo);

  const handleFavoriteToggle = async () => {
    try {
      await memoriesApi.toggleFavorite(memoryId);
      setIsFavorited(p => !p);
      toast.success(isFavorited ? 'Removed from favorites' : 'Added ❤️');
    } catch { toast.error('Failed.'); }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) { toast.error('Title is required.'); return; }
    setIsSaving(true);
    try {
      const updated = await memoriesApi.updateMemory(memoryId, {
        title:       editTitle,
        description: editDesc,
        location:    editLocation,
        date:        editDate ? new Date(editDate).toISOString() : memory.date,
      });
      setMemory(p => ({ ...p, ...updated }));
      setIsEditing(false);
      toast.success('Memory updated!');
    } catch (err) {
      toast.error(err.message || 'Failed to update.');
    } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this memory?')) return;
    try {
      await memoriesApi.deleteMemory(memoryId);
      toast.success('Deleted.');
      navigate(returnTo); // go back to return path after delete
    } catch (err) { toast.error(err.message || 'Failed.'); }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: memory?.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    }
  };

  const formattedDate = memory?.date
    ? new Date(memory.date).toLocaleDateString('en-US', {
        weekday:'long', day:'numeric', month:'long', year:'numeric',
      })
    : '';

  if (isLoading) {
    return (
      <PageLayout pageTitle="Memory">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
          minHeight:'60vh', color:'#c8a882', flexDirection:'column', gap:'12px' }}>
          <div style={{ fontSize:'40px' }}>📷</div>
          Loading memory...
        </div>
      </PageLayout>
    );
  }

  if (!memory) {
    return (
      <PageLayout pageTitle="Not Found">
        <div className="memory-detail-page">
          <p style={{ color:'#e07070' }}>Memory not found.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout pageTitle={memory.title}>
      <div className="memory-detail-page">

        {/* Back button — always goes to returnTo path */}
        <button className="memory-detail-back-btn" onClick={handleBack}>
          <IoArrowBackOutline /> {backLabel}
        </button>

        <div className="memory-detail-layout">
          {/* Left */}
          <div>
            <div className="memory-detail-main-image-wrapper">
              {memory.videoUrl ? (
                <video src={memory.videoUrl} controls style={{
                  width:'100%', height:'460px', objectFit:'cover', borderRadius:'20px',
                }}/>
              ) : (
                <img
                  src={memory.imageUrl || 'https://placehold.co/800x460/f5e6d3/c8a882?text=Memory'}
                  alt={memory.title}
                  className="memory-detail-main-image"
                />
              )}
            </div>

            {/* Prev / Next */}
            <div className="memory-detail-nav-buttons">
              <button
                className="memory-detail-prev-btn"
                onClick={() => goToMemory(memory.prevMemoryId)}
                disabled={!memory.prevMemoryId}
              >
                <IoChevronBackOutline /> Previous
              </button>
              <button
                className="memory-detail-next-btn"
                onClick={() => goToMemory(memory.nextMemoryId)}
                disabled={!memory.nextMemoryId}
              >
                Next <IoChevronForwardOutline />
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="memory-detail-info-panel">
            {isEditing ? (
              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
                  <h3 style={{ fontFamily:'Georgia,serif', fontSize:'18px', color:'#3d2c1e' }}>Edit Memory</h3>
                  <button onClick={() => setIsEditing(false)}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'#c8a882', fontSize:'20px' }}>
                    <IoCloseOutline />
                  </button>
                </div>

                {[
                  { label:'Title *', type:'text', val:editTitle, set:setEditTitle },
                  { label:'Location', type:'text', val:editLocation, set:setEditLocation },
                  { label:'Date', type:'date', val:editDate, set:setEditDate },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom:'14px' }}>
                    <label style={{ fontSize:'11px', fontWeight:'700', color:'#9b8ec4',
                      textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'5px' }}>
                      {f.label}
                    </label>
                    <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)}
                      style={{ width:'100%', padding:'10px 12px', border:'1px solid #e8d5c0',
                        borderRadius:'10px', fontSize:'14px', color:'#3d2c1e',
                        background:'#fdf6ec', outline:'none' }}/>
                  </div>
                ))}

                <div style={{ marginBottom:'14px' }}>
                  <label style={{ fontSize:'11px', fontWeight:'700', color:'#9b8ec4',
                    textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'5px' }}>
                    Description
                  </label>
                  <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)}
                    style={{ width:'100%', padding:'10px 12px', border:'1px solid #e8d5c0',
                      borderRadius:'10px', fontSize:'14px', color:'#3d2c1e',
                      background:'#fdf6ec', outline:'none', resize:'none',
                      minHeight:'80px', fontFamily:'inherit' }}/>
                </div>

                <div style={{ display:'flex', gap:'10px' }}>
                  <button onClick={() => setIsEditing(false)}
                    style={{ flex:1, padding:'11px', border:'1px solid #e8d5c0',
                      borderRadius:'10px', background:'transparent', color:'#7a5c44', cursor:'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={handleSaveEdit} disabled={isSaving}
                    style={{ flex:1, padding:'11px',
                      background:'linear-gradient(135deg,#9b8ec4,#c8a882)',
                      border:'none', borderRadius:'10px', color:'#fff', cursor:'pointer',
                      fontWeight:'600', display:'flex', alignItems:'center',
                      justifyContent:'center', gap:'6px' }}>
                    {isSaving ? 'Saving...' : <><IoSaveOutline /> Save</>}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="memory-detail-title">{memory.title}</h1>

                <div className="memory-detail-meta-row">
                  {formattedDate && (
                    <span className="memory-detail-date">
                      <IoCalendarOutline size={13}/> {formattedDate}
                    </span>
                  )}
                  {memory.location && (
                    <span className="memory-detail-location">
                      <IoLocationOutline size={13}/> {memory.location}
                    </span>
                  )}
                </div>

                {memory.description && (
                  <p className="memory-detail-description">{memory.description}</p>
                )}

                {memory.tags?.length > 0 && (
                  <div className="memory-detail-tags-row">
                    {memory.tags.map(tag => (
                      <span key={tag} className="memory-detail-tag">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="memory-detail-divider" />

                <div className="memory-detail-actions">
                  <button
                    className={`memory-action-favorite-btn ${isFavorited ? 'favorited' : ''}`}
                    onClick={handleFavoriteToggle}>
                    {isFavorited ? <IoHeart color="#ff6464"/> : <IoHeartOutline/>}
                    {isFavorited ? 'Favorited' : 'Favorite'}
                  </button>
                  <button className="memory-action-edit-btn" onClick={() => setIsEditing(true)}>
                    <IoPencilOutline/> Edit
                  </button>
                  <button className="memory-action-share-btn" onClick={handleShare}>
                    <IoShareSocialOutline/>
                  </button>
                  <button className="memory-action-delete-btn" onClick={handleDelete}>
                    <IoTrashOutline/>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

export default MemoryDetailPage;
