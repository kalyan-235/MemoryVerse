import { useState, useEffect, useRef } from 'react';
import {
  IoAddOutline, IoCloseOutline, IoImageOutline,
  IoArrowBackOutline, IoTrashOutline,
} from 'react-icons/io5';
import PageLayout from '../components/PageLayout';
import CollectionCard from '../components/CollectionCard';
import MemoryCard from '../components/MemoryCard';
import { collectionsApi } from '../apis/collectionsApi';
import { memoriesApi } from '../apis/memoriesApi';
import { uploadFileToCloudinary } from '../apis/cloudinaryApi';
import toast from 'react-hot-toast';
import '../css/CollectionsPage.css';

/* ─────────────────────────────────────────────────────────────────
   STATE MACHINE:
     view = 'grid'   → show all collection cards
     view = 'folder' → show memories inside activeCollection
   ───────────────────────────────────────────────────────────────── */

function CollectionsPage() {
  const [view, setView]                       = useState('grid');   // 'grid' | 'folder'
  const [collections, setCollections]         = useState([]);
  const [activeCollection, setActiveCollection] = useState(null);
  const [folderMemories, setFolderMemories]   = useState([]);
  const [isLoadingMemories, setIsLoadingMemories] = useState(false);

  // New collection modal
  const [showNewCollModal, setShowNewCollModal] = useState(false);
  const [newCollName, setNewCollName]           = useState('');
  const [isCreating, setIsCreating]             = useState(false);

  // Add memory to folder modal
  const [showAddMemModal, setShowAddMemModal] = useState(false);
  const [memTitle,    setMemTitle]    = useState('');
  const [memDesc,     setMemDesc]     = useState('');
  const [memDate,     setMemDate]     = useState(new Date().toISOString().split('T')[0]);
  const [memLocation, setMemLocation] = useState('');
  const [memFile,     setMemFile]     = useState(null);
  const [memPreview,  setMemPreview]  = useState('');
  const [isSavingMem, setIsSavingMem] = useState(false);
  const fileRef = useRef(null);

  // Load all collections on mount
  useEffect(() => {
    collectionsApi.getAllCollections()
      .then(setCollections)
      .catch(console.error);
  }, []);

  /* ── Open a collection folder ── */
  const openFolder = async (col) => {
    setActiveCollection(col);
    setView('folder');
    setIsLoadingMemories(true);
    try {
      const mems = await memoriesApi.getMemoriesByCollection(col._id);
      setFolderMemories(mems);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load memories.');
    } finally {
      setIsLoadingMemories(false);
    }
  };

  /* ── Back to grid ── */
  const backToGrid = () => {
    setView('grid');
    setActiveCollection(null);
    setFolderMemories([]);
  };

  /* ── Create new collection ── */
  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollName.trim()) return;
    setIsCreating(true);
    try {
      const created = await collectionsApi.createCollection({ name: newCollName.trim() });
      setCollections(prev => [...prev, { ...created, memoryCount: 0 }]);
      setNewCollName('');
      setShowNewCollModal(false);
      toast.success('Collection created! 📁');
    } catch (err) {
      toast.error(err.message || 'Failed to create collection.');
    } finally {
      setIsCreating(false);
    }
  };

  /* ── Delete collection ── */
  const handleDeleteCollection = async () => {
    if (!activeCollection) return;
    if (!window.confirm(`Delete "${activeCollection.name}"? Memories inside won't be deleted.`)) return;
    try {
      await collectionsApi.deleteCollection(activeCollection._id);
      setCollections(prev => prev.filter(c => c._id !== activeCollection._id));
      backToGrid();
      toast.success('Collection deleted.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete.');
    }
  };

  /* ── Media select for add-memory form ── */
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMemFile(file);
    setMemPreview(URL.createObjectURL(file));
  };

  const resetMemForm = () => {
    setMemTitle(''); setMemDesc(''); setMemLocation('');
    setMemDate(new Date().toISOString().split('T')[0]);
    setMemFile(null); setMemPreview('');
  };

  /* ── Add memory to current folder ── */
  const handleAddMemory = async (e) => {
    e.preventDefault();
    if (!memTitle.trim() || !activeCollection) return;
    setIsSavingMem(true);
    try {
      let imageUrl = '';
      let videoUrl = '';
      let publicId = '';

      // Upload to Cloudinary directly from browser
      if (memFile) {
        toast.loading('Uploading image...', { id: 'col-upload' });
        try {
          const result  = await uploadFileToCloudinary(memFile, 'memoryverse/memories');
          const isVideo = memFile.type.startsWith('video');
          if (isVideo) videoUrl = result.secure_url;
          else imageUrl = result.secure_url;
          publicId = result.public_id;
          toast.dismiss('col-upload');
        } catch (uploadErr) {
          toast.dismiss('col-upload');
          console.warn('Image upload failed:', uploadErr.message);
        }
      }

      // Save memory as JSON with Cloudinary URL
      const saved = await memoriesApi.createMemory({
        title:        memTitle,
        description:  memDesc,
        date:         memDate,
        location:     memLocation,
        tags:         [],
        collectionId: activeCollection._id,
        imageUrl,
        videoUrl,
        imagePublicId: !videoUrl ? publicId : '',
        videoPublicId:  videoUrl ? publicId : '',
      });

      // Add to folder view immediately
      setFolderMemories(prev => [saved, ...prev]);
      // Update memory count on the card
      setCollections(prev => prev.map(c =>
        c._id === activeCollection._id
          ? { ...c, memoryCount: (c.memoryCount || 0) + 1 }
          : c
      ));
      resetMemForm();
      setShowAddMemModal(false);
      toast.success('Memory added to collection! ✨');
    } catch (err) {
      toast.error(err.message || 'Failed to save memory.');
    } finally {
      setIsSavingMem(false);
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     RENDER: FOLDER VIEW
  ═══════════════════════════════════════════════════════════════ */
  if (view === 'folder' && activeCollection) {
    return (
      <PageLayout pageTitle={activeCollection.name}>
        <div className="collections-page">
          <div className="collections-content">

            {/* Folder header */}
            <div style={{ display:'flex', alignItems:'center', gap:'14px', marginBottom:'28px', flexWrap:'wrap' }}>
              <button onClick={backToGrid} style={{
                display:'flex', alignItems:'center', gap:'6px', background:'transparent',
                border:'1px solid #e8d5c0', borderRadius:'10px', padding:'8px 14px',
                cursor:'pointer', color:'#7a5c44', fontSize:'13px', fontWeight:'600',
              }}>
                <IoArrowBackOutline /> Collections
              </button>

              <div style={{ flex:1 }}>
                <h2 className="collections-page-title">{activeCollection.name}</h2>
                <p className="collections-page-subtitle">
                  {folderMemories.length} {folderMemories.length === 1 ? 'Memory' : 'Memories'}
                </p>
              </div>

              <button onClick={() => setShowAddMemModal(true)} style={{
                display:'flex', alignItems:'center', gap:'6px',
                background:'linear-gradient(135deg,#9b8ec4,#c8a882)',
                color:'#fff', border:'none', borderRadius:'24px',
                padding:'10px 20px', fontSize:'13px', fontWeight:'600',
                cursor:'pointer', boxShadow:'0 4px 12px rgba(155,142,196,0.3)',
              }}>
                <IoAddOutline size={16}/> Add Memory
              </button>

              <button onClick={handleDeleteCollection} style={{
                background:'transparent', border:'1px solid #ffe0e0',
                borderRadius:'10px', padding:'9px 12px', cursor:'pointer',
                color:'#e07070', fontSize:'16px', display:'flex', alignItems:'center',
              }}>
                <IoTrashOutline />
              </button>
            </div>

            {/* Memories grid */}
            {isLoadingMemories ? (
              <div style={{ textAlign:'center', padding:'60px', color:'#c8a882' }}>
                Loading memories...
              </div>
            ) : folderMemories.length === 0 ? (
              <div style={{
                textAlign:'center', padding:'80px 20px', background:'#fff',
                borderRadius:'20px', color:'#c8a882',
              }}>
                <div style={{ fontSize:'52px', marginBottom:'12px' }}>📷</div>
                <p style={{ fontWeight:'700', color:'#7a5c44', fontSize:'16px' }}>
                  No memories in this collection yet.
                </p>
                <p style={{ fontSize:'13px', marginTop:'6px', marginBottom:'20px' }}>
                  Click <strong>Add Memory</strong> to upload photos here.
                </p>
                <button onClick={() => setShowAddMemModal(true)} style={{
                  padding:'12px 28px',
                  background:'linear-gradient(135deg,#9b8ec4,#c8a882)',
                  color:'#fff', border:'none', borderRadius:'12px',
                  fontSize:'14px', fontWeight:'600', cursor:'pointer',
                }}>
                  <IoAddOutline /> Add First Memory
                </button>
              </div>
            ) : (
              <div className="collections-grid">
                {folderMemories.map(mem => (
                  <MemoryCard key={mem._id} memory={mem} />
                ))}
              </div>
            )}
          </div>

          {/* Add Memory to Folder Modal */}
          {showAddMemModal && (
            <div className="new-collection-modal-overlay" role="dialog" aria-modal="true"
              onClick={e => e.target === e.currentTarget && setShowAddMemModal(false)}>
              <div className="new-collection-modal" style={{ maxWidth:'520px', maxHeight:'90vh', overflowY:'auto' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
                  <h3 className="new-collection-modal-title">
                    ✨ Add to "{activeCollection.name}"
                  </h3>
                  <button onClick={() => setShowAddMemModal(false)}
                    style={{ background:'none', border:'none', fontSize:'22px', cursor:'pointer', color:'#7a5c44' }}>
                    <IoCloseOutline />
                  </button>
                </div>

                <form onSubmit={handleAddMemory}>
                  {/* Image upload */}
                  {memPreview ? (
                    <div style={{ position:'relative', marginBottom:'16px' }}>
                      <img src={memPreview} alt="preview" style={{
                        width:'100%', height:'180px', objectFit:'cover', borderRadius:'12px', display:'block',
                      }}/>
                      <button type="button" onClick={() => { setMemFile(null); setMemPreview(''); }}
                        style={{
                          position:'absolute', top:'8px', right:'8px', background:'rgba(255,255,255,0.9)',
                          border:'none', borderRadius:'50%', width:'28px', height:'28px', cursor:'pointer',
                          fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center',
                        }}>
                        <IoCloseOutline />
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => fileRef.current?.click()}
                      className="memory-media-upload-zone" style={{ marginBottom:'16px', cursor:'pointer' }}>
                      <div style={{ fontSize:'32px', color:'#c8a882', marginBottom:'6px' }}>
                        <IoImageOutline />
                      </div>
                      <p style={{ fontSize:'14px', fontWeight:'600', color:'#7a5c44' }}>
                        Upload Photo or Video
                      </p>
                      <p style={{ fontSize:'12px', color:'#c8a882', marginTop:'4px' }}>
                        Optional — JPG, PNG, MP4
                      </p>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*,video/*"
                    style={{ display:'none' }} onChange={handleFileSelect}/>

                  <div className="new-collection-form-field">
                    <label className="new-collection-form-label">Memory Title *</label>
                    <input type="text" className="new-collection-form-input" required
                      placeholder="e.g. Sunset at the beach..." autoFocus
                      value={memTitle} onChange={e => setMemTitle(e.target.value)}/>
                  </div>

                  <div className="new-collection-form-field">
                    <label className="new-collection-form-label">Description</label>
                    <textarea className="new-collection-form-input"
                      placeholder="What made this moment special?"
                      style={{ minHeight:'75px', resize:'none', fontFamily:'inherit' }}
                      value={memDesc} onChange={e => setMemDesc(e.target.value)}/>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                    <div className="new-collection-form-field">
                      <label className="new-collection-form-label">Date</label>
                      <input type="date" className="new-collection-form-input"
                        value={memDate} onChange={e => setMemDate(e.target.value)}/>
                    </div>
                    <div className="new-collection-form-field">
                      <label className="new-collection-form-label">Location</label>
                      <input type="text" className="new-collection-form-input"
                        placeholder="Where was this?"
                        value={memLocation} onChange={e => setMemLocation(e.target.value)}/>
                    </div>
                  </div>

                  <div className="new-collection-modal-actions" style={{ marginTop:'20px' }}>
                    <button type="button" className="new-collection-cancel-btn"
                      onClick={() => { setShowAddMemModal(false); resetMemForm(); }}>
                      Cancel
                    </button>
                    <button type="submit" className="new-collection-save-btn"
                      disabled={isSavingMem || !memTitle.trim()}>
                      {isSavingMem ? 'Saving...' : '💾 Save Memory'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </PageLayout>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER: GRID VIEW (all collections)
  ═══════════════════════════════════════════════════════════════ */
  return (
    <PageLayout pageTitle="Your Collections">
      <div className="collections-page">
        <div className="collections-content">

          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'4px' }}>
            <div>
              <h2 className="collections-page-title">Your Collections</h2>
              <p className="collections-page-subtitle">
                All your memories organized in one place.
              </p>
            </div>
            <button onClick={() => setShowNewCollModal(true)} style={{
              display:'flex', alignItems:'center', gap:'6px',
              background:'linear-gradient(135deg,#9b8ec4,#c8a882)',
              color:'#fff', border:'none', borderRadius:'24px',
              padding:'10px 20px', fontSize:'13px', fontWeight:'600',
              cursor:'pointer', boxShadow:'0 4px 12px rgba(155,142,196,0.3)',
            }}>
              <IoAddOutline size={16}/> New Collection
            </button>
          </div>

          {/* Grid */}
          <div className="collections-grid">
            {collections.map(col => (
              <CollectionCard
                key={col._id}
                collection={col}
                onClick={openFolder}          // ← opens folder in-page
                onOptionsClick={() => {}}
              />
            ))}

            {/* Create new placeholder */}
            <div className="create-collection-card"
              onClick={() => setShowNewCollModal(true)}
              role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setShowNewCollModal(true)}>
              <div className="create-collection-icon">＋</div>
              <span className="create-collection-label">Create New Collection</span>
            </div>
          </div>
        </div>

        {/* New Collection Modal */}
        {showNewCollModal && (
          <div className="new-collection-modal-overlay" role="dialog" aria-modal="true"
            onClick={e => e.target === e.currentTarget && setShowNewCollModal(false)}>
            <div className="new-collection-modal">
              <h3 className="new-collection-modal-title">📁 New Collection</h3>
              <form onSubmit={handleCreateCollection}>
                <div className="new-collection-form-field">
                  <label className="new-collection-form-label" htmlFor="coll-name">
                    Collection Name *
                  </label>
                  <input id="coll-name" type="text" className="new-collection-form-input"
                    placeholder="e.g. Travel Diaries, Family Moments..." required autoFocus
                    value={newCollName} onChange={e => setNewCollName(e.target.value)}/>
                </div>
                <div className="new-collection-modal-actions">
                  <button type="button" className="new-collection-cancel-btn"
                    onClick={() => setShowNewCollModal(false)}>Cancel</button>
                  <button type="submit" className="new-collection-save-btn"
                    disabled={isCreating || !newCollName.trim()}>
                    {isCreating ? 'Creating...' : 'Create Collection'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

export default CollectionsPage;
