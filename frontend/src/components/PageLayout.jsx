import { useState, createContext, useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import AddMemoryModal from './AddMemoryModal';
import { useAuth } from '../context/AuthContext';
import { memoriesApi } from '../apis/memoriesApi';
import { uploadFileToCloudinary } from '../apis/cloudinaryApi';
import toast from 'react-hot-toast';
import { IoAddOutline } from 'react-icons/io5';

const MemoryRefreshContext = createContext(null);
export const useMemoryRefresh = () => useContext(MemoryRefreshContext);

function PageLayout({ children, pageTitle, onMemorySaved }) {
  const [isAddMemoryModalOpen, setIsAddMemoryModalOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const { user } = useAuth();

  const handleSaveMemory = useCallback(async (memoryData) => {
    try {
      let imageUrl = '';
      let videoUrl = '';
      let publicId = '';

      if (memoryData.mediaFile) {
        toast.loading('Uploading...', { id: 'upload' });
        try {
          const result  = await uploadFileToCloudinary(memoryData.mediaFile, 'memoryverse/memories');
          const isVideo = memoryData.mediaFile.type.startsWith('video');
          if (isVideo) videoUrl = result.secure_url;
          else imageUrl = result.secure_url;
          publicId = result.public_id;
          toast.dismiss('upload');
        } catch (uploadErr) {
          toast.dismiss('upload');
          console.warn('Upload failed, saving without image:', uploadErr.message);
        }
      }

      await memoriesApi.createMemory({
        title:        memoryData.title,
        description:  memoryData.description  || '',
        date:         memoryData.date          || new Date().toISOString(),
        location:     memoryData.location      || '',
        tags:         memoryData.tags          || [],
        collectionId: memoryData.collectionId  || null,
        imageUrl,
        videoUrl,
        imagePublicId: !videoUrl ? publicId : '',
        videoPublicId:  videoUrl ? publicId : '',
      });

      toast.success('Memory saved! ✨');
      setIsAddMemoryModalOpen(false);
      if (onMemorySaved) onMemorySaved();
    } catch (err) {
      toast.dismiss('upload');
      toast.error(err.message || 'Failed to save memory.');
      throw err;
    }
  }, [onMemorySaved]);

  const openAddModal = () => setIsAddMemoryModalOpen(true);
  const location = useLocation();
  const isAuth = ['/login','/register','/welcome','/forgot-password','/verify-otp','/reset-password'].includes(location.pathname);

  return (
    <MemoryRefreshContext.Provider value={null}>
      <div className="page-fade-in" style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-cream)' }}>

        {/* ── Desktop Sidebar ── */}
        <Sidebar user={user} />

        {/* ── Main Content ── */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Desktop Navbar */}
          <Navbar pageTitle={pageTitle} onAddMemory={openAddModal} />

          {/* Mobile Header */}
          <MobileHeader pageTitle={pageTitle} onAddMemory={openAddModal} />

          <main style={{ flex: 1 }}>{children}</main>
        </div>

        {/* ── Mobile Bottom Navigation ── */}
        <MobileBottomNav />

        {/* ── Mobile FAB (floating add button) ── */}
        <button
          className="mobile-fab"
          onClick={openAddModal}
          aria-label="Add new memory"
        >
          <IoAddOutline size={28} />
        </button>

        {/* ── Add Memory Modal ── */}
        <AddMemoryModal
          isOpen={isAddMemoryModalOpen}
          onClose={() => setIsAddMemoryModalOpen(false)}
          onSave={handleSaveMemory}
          collections={collections}
        />
      </div>
    </MemoryRefreshContext.Provider>
  );
}

export default PageLayout;
