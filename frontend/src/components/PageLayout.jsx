import { useState, createContext, useContext, useCallback } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AddMemoryModal from './AddMemoryModal';
import { useAuth } from '../context/AuthContext';
import { memoriesApi } from '../apis/memoriesApi';
import { uploadFileToCloudinary } from '../apis/cloudinaryApi';
import toast from 'react-hot-toast';

// Context so any child page can trigger a data refresh after a new memory is saved
const MemoryRefreshContext = createContext(null);
export const useMemoryRefresh = () => useContext(MemoryRefreshContext);

function PageLayout({ children, pageTitle, onMemorySaved }) {
  const [isAddMemoryModalOpen, setIsAddMemoryModalOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const { user } = useAuth();

  const handleSaveMemory = useCallback(async (memoryData) => {
    try {
      let imageUrl  = '';
      let videoUrl  = '';
      let publicId  = '';

      // Step 1: Upload media directly from browser to Cloudinary (unsigned preset)
      if (memoryData.mediaFile) {
        toast.loading('Uploading image...', { id: 'upload' });
        try {
          const folder   = 'memoryverse/memories';
          const result   = await uploadFileToCloudinary(memoryData.mediaFile, folder);
          const isVideo  = memoryData.mediaFile.type.startsWith('video');
          if (isVideo) {
            videoUrl = result.secure_url;
          } else {
            imageUrl = result.secure_url;
          }
          publicId = result.public_id;
          toast.dismiss('upload');
        } catch (uploadErr) {
          toast.dismiss('upload');
          console.warn('Image upload failed, saving without image:', uploadErr.message);
          // Continue saving memory without image rather than blocking
        }
      }

      // Step 2: Send memory data (with Cloudinary URL) to backend as JSON
      const payload = {
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
      };

      await memoriesApi.createMemory(payload);
      toast.success('Memory saved! ✨');
      setIsAddMemoryModalOpen(false);
      if (onMemorySaved) onMemorySaved();
    } catch (err) {
      toast.dismiss('upload');
      toast.error(err.message || 'Failed to save memory.');
      throw err;
    }
  }, [onMemorySaved]);

  return (
    <MemoryRefreshContext.Provider value={null}>
      <div className="page-fade-in" style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-cream)' }}>
        {/* Fixed sidebar — 220px wide */}
        <Sidebar user={user} />

        {/* Main area — starts right after sidebar, no extra margin */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <Navbar
            pageTitle={pageTitle}
            onAddMemory={() => setIsAddMemoryModalOpen(true)}
          />
          <main style={{ flex: 1 }}>{children}</main>
        </div>

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
