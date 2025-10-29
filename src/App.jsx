import React, { useState, useEffect } from 'react';
import WritingList from './components/WritingList';
import WritingEditor from './components/WritingEditor';
import { useWritings } from './hooks/useWritings';
import '../src/components/styles/neo-brutalism.css'

/**
 * Main App Component - Handle routing antara list dan editor
 */
function App() {
  const [currentView, setCurrentView] = useState('list'); // 'list' atau 'editor'
  const [editingWritingId, setEditingWritingId] = useState(null);
  const [viewingWritingId, setViewingWritingId] = useState(null);
  
  const { loadWritings, writings } = useWritings();

  // Load initial data
  useEffect(() => {
    loadWritings(1);
  }, []);

  // Handle new writing
  const handleNewWriting = () => {
    setEditingWritingId(null);
    setCurrentView('editor');
  };

  // Handle edit writing
  const handleEditWriting = (writingId) => {
    setEditingWritingId(writingId);
    setCurrentView('editor');
  };

  // Handle view writing (read-only mode)
  const handleViewWriting = (writingId) => {
    setViewingWritingId(writingId);
    // Untuk simplicity, kita arahkan ke editor mode tapi dengan read-only indicator
    setEditingWritingId(writingId);
    setCurrentView('editor');
  };

  // Handle save writing (setelah create/update)
  const handleSaveWriting = (savedWriting) => {
    console.log('Writing saved:', savedWriting);
    
    // Show success message
    alert(`Writing "${savedWriting.title}" has been ${savedWriting.status === 'published' ? 'published' : 'saved'} successfully!`);
    
    // Kembali ke list view
    setCurrentView('list');
    setEditingWritingId(null);
  };

  // Handle cancel editing
  const handleCancelEditing = () => {
    // Confirm jika ada unsaved changes
    if (window.confirm('Are you sure you want to leave? Any unsaved changes will be lost.')) {
      setCurrentView('list');
      setEditingWritingId(null);
      setViewingWritingId(null);
    }
  };

  // Handle delete writing dari list
  const handleDeleteWriting = (writingId) => {
    if (window.confirm('Are you sure you want to delete this writing? This action cannot be undone.')) {
      // Delete handling sudah dihandle oleh useWritings hook
      console.log('Deleting writing:', writingId);
    }
  };

  // Render current view
  const renderCurrentView = () => {
    switch (currentView) {
      case 'editor':
        return (
          <WritingEditor
            writingId={editingWritingId}
            onSave={handleSaveWriting}
            onCancel={handleCancelEditing}
            onNew={handleNewWriting}
          />
        );

      case 'list':
      default:
        return (
          <WritingList
            onEditWriting={handleEditWriting}
            onViewWriting={handleViewWriting}
            onNewWriting={handleNewWriting}
            onDeleteWriting={handleDeleteWriting}
          />
        );
    }
  };

  // App header dengan navigation
  const AppHeader = () => (
    <header style={{ 
      background: 'var(--light)',
      borderBottom: '3px solid var(--dark)',
      padding: 'var(--space-md) 0',
      marginBottom: 'var(--space-lg)',
      boxShadow: '0 4px 0 var(--dark)'
    }}>
      <div className="neo-container">
        <div className="neo-flex-between">
          {/* Logo/Brand */}
          <div 
            className="neo-heading" 
            style={{ 
              fontSize: '1.8rem',
              cursor: 'pointer'
            }}
            onClick={() => setCurrentView('list')}
            title="Go to writings list"
          >
            ✍️ WRITING APP
          </div>

          {/* Navigation */}
          <nav>
            <div className="neo-flex" style={{ gap: 'var(--space-md)' }}>
              {/* Current View Indicator */}
              <div style={{
                padding: 'var(--space-xs) var(--space-md)',
                border: '2px solid var(--dark)',
                background: 'var(--accent)',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {currentView === 'list' ? '📝 BROWSE' : '✏️ EDITING'}
              </div>

              {/* Quick Stats */}
              {currentView === 'list' && writings.length > 0 && (
                <div style={{
                  padding: 'var(--space-xs) var(--space-md)',
                  border: '2px solid var(--dark)',
                  background: 'var(--secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {writings.length} WRITINGS
                </div>
              )}

              {/* New Writing Button */}
              <button
                className="neo-btn neo-btn-primary"
                onClick={handleNewWriting}
                title="Create new writing"
              >
                + NEW WRITING
              </button>
            </div>
          </nav>
        </div>

        {/* View Switcher */}
        <div className="neo-flex" style={{ 
          gap: 'var(--space-sm)', 
          marginTop: 'var(--space-md)',
          justifyContent: 'center'
        }}>
          <button
            className={`neo-btn neo-btn-sm ${currentView === 'list' ? 'neo-btn-accent' : ''}`}
            onClick={() => setCurrentView('list')}
          >
            📚 ALL WRITINGS
          </button>
          
          {currentView === 'editor' && (
            <button
              className="neo-btn neo-btn-secondary neo-btn-sm"
              onClick={handleNewWriting}
            >
              ✨ NEW WRITING
            </button>
          )}
        </div>
      </div>
    </header>
  );

  // Loading state
  if (writings.length === 0 && currentView === 'list') {
    return (
      <div className="neo-container">
        <AppHeader />
        <div className="neo-card text-center">
          <div className="neo-heading neo-title">LOADING YOUR WRITINGS...</div>
          <p>Please wait while we fetch your content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <AppHeader />
      
      <main>
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'var(--space-xl)',
        padding: 'var(--space-lg) 0',
        borderTop: '3px solid var(--dark)',
        background: 'var(--gray)'
      }}>
        <div className="neo-container text-center">
          <div className="neo-heading" style={{ fontSize: '1rem', marginBottom: 'var(--space-sm)' }}>
            WRITING APP ✍️
          </div>
          <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
            Your personal writing space with Neo-Brutalism style
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;