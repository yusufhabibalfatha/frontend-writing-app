import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useWritings } from '../hooks/useWritings';
import './styles/neo-brutalism.css'

/**
 * WritingEditor Component - Editor untuk create/edit tulisan dengan Tiptap
 */
const WritingEditor = ({ 
  writingId, 
  onSave, 
  onCancel,
  onNew 
}) => {
  const {
    currentWriting,
    getWriting,
    createWriting,
    updateWriting,
    autoSaveWriting,
    autoSaveStatus,
    setAutoSaveStatusManually,
    clearCurrentWriting,
    loading
  } = useWritings();

  // State untuk form
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('draft');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      // Set status unsaved ketika content berubah
      if (autoSaveStatus === 'saved') {
        setAutoSaveStatusManually('unsaved');
      }
    },
  });

  // Load writing data jika editing existing writing
  useEffect(() => {
    if (writingId) {
      loadWritingData();
    } else {
      // New writing - reset form
      resetForm();
    }
  }, [writingId]);

  // Auto-save effect setiap 5 detik
  useEffect(() => {
    if (!editor || !writingId || autoSaveStatus !== 'unsaved') return;

    const autoSaveTimer = setTimeout(() => {
      handleAutoSave();
    }, 5000);

    return () => clearTimeout(autoSaveTimer);
  }, [editor?.getHTML(), writingId, autoSaveStatus]);

  // Load writing data
  const loadWritingData = async () => {
    try {
      const writing = await getWriting(writingId);
      if (writing) {
        setTitle(writing.title || '');
        setStatus(writing.status || 'draft');
        if (editor) {
          editor.commands.setContent(writing.content || '');
        }
        setLastSaved(new Date(writing.modified_date));
      }
    } catch (error) {
      console.error('Failed to load writing:', error);
    }
  };

  // Reset form untuk new writing
  const resetForm = () => {
    setTitle('');
    setStatus('draft');
    if (editor) {
      editor.commands.setContent('');
    }
    setLastSaved(null);
    setAutoSaveStatusManually('saved');
    clearCurrentWriting();
  };

  // Handle auto-save
  const handleAutoSave = useCallback(async () => {
    if (!writingId || !editor || autoSaveStatus !== 'unsaved') return;

    try {
      await autoSaveWriting(writingId, editor.getHTML());
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [writingId, editor, autoSaveStatus, autoSaveWriting]);

  // Handle manual save
  const handleSave = async (newStatus = status) => {
    if (!editor) return;

    setIsSaving(true);
    try {
      const writingData = {
        title: title.trim() || 'Untitled',
        content: editor.getHTML(),
        status: newStatus,
        excerpt: generateExcerpt(editor.getText())
      };

      let savedWriting;
      if (writingId) {
        // Update existing writing
        savedWriting = await updateWriting(writingId, writingData);
      } else {
        // Create new writing
        savedWriting = await createWriting(writingData);
      }

      setLastSaved(new Date());
      setAutoSaveStatusManually('saved');
      
      // Callback ke parent component
      if (onSave) {
        onSave(savedWriting);
      }

    } catch (error) {
      console.error('Failed to save writing:', error);
      alert('Failed to save writing. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle publish
  const handlePublish = async () => {
    await handleSave('published');
  };

  // Handle save as draft
  const handleSaveDraft = async () => {
    await handleSave('draft');
  };

  // Generate excerpt dari text content
  const generateExcerpt = (text, length = 150) => {
    const plainText = text.replace(/\n/g, ' ').trim();
    if (plainText.length <= length) return plainText;
    return plainText.substring(0, length) + '...';
  };

  // Handle cancel
  const handleCancel = () => {
    if (autoSaveStatus === 'unsaved' && 
        !window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
      return;
    }
    
    if (onCancel) {
      onCancel();
    }
    resetForm();
  };

  // Check jika ada perubahan yang belum disimpan
  const hasUnsavedChanges = autoSaveStatus === 'unsaved';

  // Toolbar buttons untuk editor
  const ToolbarButton = ({ onClick, children, active, title }) => (
    <button
      type="button"
      onClick={onClick}
      className={`neo-btn neo-btn-sm ${active ? 'neo-btn-accent' : ''}`}
      style={{ 
        margin: '0 2px',
        padding: '4px 8px',
        minWidth: 'auto'
      }}
      title={title}
    >
      {children}
    </button>
  );

  if (!editor) {
    return (
      <div className="neo-container">
        <div className="neo-card text-center">
          <div className="neo-heading">LOADING EDITOR...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-container">
      {/* Editor Header */}
      <div className="neo-editor">
        <div className="editor-header">
          {/* Title Input */}
          <input
            type="text"
            className="editor-title"
            placeholder="ENTER YOUR TITLE HERE..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (autoSaveStatus === 'saved') {
                setAutoSaveStatusManually('unsaved');
              }
            }}
          />

          {/* Status and Actions */}
          <div className="neo-flex-between mt-md">
            <div className="neo-flex" style={{ gap: '12px', alignItems: 'center' }}>
              {/* Status Badge */}
              <span className={`writing-status ${status}`}>
                {status.toUpperCase()}
              </span>

              {/* Auto-save Indicator */}
              <div className={`auto-save-indicator ${autoSaveStatus}`}>
                {autoSaveStatus === 'saving' && '⏳ SAVING...'}
                {autoSaveStatus === 'saved' && '✅ SAVED'}
                {autoSaveStatus === 'unsaved' && '⚡ UNSAVED CHANGES'}
              </div>

              {/* Last Saved Time */}
              {lastSaved && (
                <span className="neo-text-sm" style={{ opacity: 0.7 }}>
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="neo-flex" style={{ gap: '8px' }}>
              <button
                className="neo-btn neo-btn-sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                CANCEL
              </button>
              
              <button
                className="neo-btn neo-btn-secondary neo-btn-sm"
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                {isSaving ? 'SAVING...' : 'SAVE DRAFT'}
              </button>
              
              <button
                className="neo-btn neo-btn-primary neo-btn-sm"
                onClick={handlePublish}
                disabled={isSaving}
              >
                {isSaving ? 'PUBLISHING...' : 'PUBLISH'}
              </button>
            </div>
          </div>
        </div>

        {/* Editor Toolbar */}
        <div className="editor-toolbar">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold"
          >
            <strong>B</strong>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic"
          >
            <em>I</em>
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <s>S</s>
          </ToolbarButton>

          <div style={{ width: '1px', background: 'var(--dark)', margin: '0 8px' }} />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            H1
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            H2
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            H3
          </ToolbarButton>

          <div style={{ width: '1px', background: 'var(--dark)', margin: '0 8px' }} />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            • List
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered List"
          >
            1. List
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Blockquote"
          >
            "
          </ToolbarButton>

          <div style={{ width: '1px', background: 'var(--dark)', margin: '0 8px' }} />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            ↶
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            ↷
          </ToolbarButton>
        </div>

        {/* Editor Content */}
        <EditorContent 
          editor={editor} 
          className="editor-content"
        />

        {/* Editor Footer */}
        <div className="editor-footer">
          <div className="neo-text-sm" style={{ opacity: 0.7 }}>
            {editor.getText().length} characters • {editor.getText().split(/\s+/).length} words
          </div>
          
          <div className="neo-flex" style={{ gap: '8px' }}>
            {hasUnsavedChanges && (
              <span style={{ color: 'var(--error)', fontSize: '0.8rem' }}>
                ⚡ You have unsaved changes
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="neo-card">
            <div className="neo-heading">LOADING...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingEditor;