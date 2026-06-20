import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AddMemoryModal from './AddMemoryModal';
import { useAuth } from '../context/AuthContext';

/**
 * PageLayout – wraps every authenticated page with Sidebar + Navbar.
 * Handles the global "Add Memory" modal state.
 */
function PageLayout({ children, pageTitle }) {
  const [isAddMemoryModalOpen, setIsAddMemoryModalOpen] = useState(false);
  const { user } = useAuth();

  const handleSaveMemory = async (memoryData) => {
    // Handled by individual pages or a global memory context
    console.log('New memory data:', memoryData);
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: '220px' }}>
        <Navbar
          pageTitle={pageTitle}
          onAddMemory={() => setIsAddMemoryModalOpen(true)}
        />
        <main>{children}</main>
      </div>

      {/* Global Add Memory Modal */}
      <AddMemoryModal
        isOpen={isAddMemoryModalOpen}
        onClose={() => setIsAddMemoryModalOpen(false)}
        onSave={handleSaveMemory}
      />
    </div>
  );
}

export default PageLayout;
