import React, { useState, useEffect } from 'react';
import { useWritings } from '../hooks/useWritings';
import WritingCard from './WritingCard';
import './styles/neo-brutalism.css'

/**
 * WritingList Component - Menampilkan daftar semua tulisan dengan search, filter, dan load more
 */
const WritingList = ({ 
  onEditWriting, 
  onViewWriting,
  onNewWriting 
}) => {
  const {
    writings,
    loading,
    error,
    pagination,
    loadWritings,
    loadMoreWritings,
    deleteWriting,
    searchWritings,
    clearError
  } = useWritings();

  // State untuk search dan filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'draft', 'published'
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load writings ketika search/filter berubah
  useEffect(() => {
    loadInitialWritings();
  }, [debouncedSearch, statusFilter]);

  // Load initial writings
  const loadInitialWritings = async () => {
    if (statusFilter === 'all') {
      await loadWritings(1, debouncedSearch);
    } else {
      // Untuk filter status, kita akan handle secara client-side untuk simplicity
      await loadWritings(1, debouncedSearch);
    }
  };

  // Handle load more
  const handleLoadMore = async () => {
    if (pagination.hasNext) {
      await loadMoreWritings(pagination.currentPage + 1, debouncedSearch);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  // Handle delete writing
  const handleDeleteWriting = async (writingId) => {
    try {
      await deleteWriting(writingId);
      // Tidak perlu reload, karena hook sudah handle optimistic update
    } catch (error) {
      console.error('Failed to delete writing:', error);
    }
  };

  // Filter writings by status client-side
  const filteredWritings = writings.filter(writing => {
    if (statusFilter === 'all') return true;
    return writing.status === statusFilter;
  });

  // Sort writings by modified date (newest first)
  const sortedWritings = [...filteredWritings].sort((a, b) => 
    new Date(b.modified_date) - new Date(a.modified_date)
  );

  // Count writings by status untuk filter buttons
  const draftCount = writings.filter(w => w.status === 'draft').length;
  const publishedCount = writings.filter(w => w.status === 'published').length;

  return (
    <div className="neo-container">
      {/* Header Section */}
      <div className="neo-flex-between mb-lg">
        <div>
          <h1 className="neo-heading neo-title">MY WRITINGS</h1>
          <p className="neo-text" style={{ opacity: 0.8 }}>
            {pagination.totalItems} total writings • {draftCount} drafts • {publishedCount} published
          </p>
        </div>
        
        <button 
          className="neo-btn neo-btn-primary neo-btn-lg"
          onClick={onNewWriting}
          title="Create new writing"
        >
          + NEW WRITING
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="neo-search-container">
        {/* Search Input */}
        <div className="mb-md">
          <input
            type="text"
            className="search-input"
            placeholder="SEARCH BY TITLE..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          <button
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('all')}
          >
            ALL ({writings.length})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'published' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('published')}
          >
            PUBLISHED ({publishedCount})
          </button>
          <button
            className={`filter-btn ${statusFilter === 'draft' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('draft')}
          >
            DRAFT ({draftCount})
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="neo-card" style={{ 
          background: 'var(--error)', 
          color: 'var(--light)',
          borderColor: 'var(--dark)'
        }}>
          <div className="neo-flex-between">
            <span>❌ {error}</span>
            <button 
              className="neo-btn neo-btn-sm"
              onClick={clearError}
              style={{ background: 'var(--light)' }}
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && writings.length === 0 && (
        <div className="neo-card text-center">
          <div className="neo-heading neo-subtitle">LOADING WRITINGS...</div>
          <p>Fetching your amazing content...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && sortedWritings.length === 0 && (
        <div className="neo-card text-center">
          <div className="neo-heading neo-subtitle">NO WRITINGS FOUND</div>
          <p className="mb-md">
            {debouncedSearch || statusFilter !== 'all' 
              ? 'Try changing your search or filter criteria' 
              : 'Start by creating your first writing!'
            }
          </p>
          <button 
            className="neo-btn neo-btn-primary"
            onClick={onNewWriting}
          >
            CREATE YOUR FIRST WRITING
          </button>
        </div>
      )}

      {/* Writings Grid */}
      <div className="neo-grid">
        {sortedWritings.map(writing => (
          <WritingCard
            key={writing.id}
            writing={writing}
            onEdit={onEditWriting}
            onDelete={handleDeleteWriting}
            onView={onViewWriting}
          />
        ))}
      </div>

      {/* Load More Section */}
      {pagination.hasNext && (
        <div className="load-more-container">
          <button
            className="neo-btn-load-more"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'LOADING...' : `LOAD MORE (${pagination.totalItems - writings.length} REMAINING)`}
          </button>
        </div>
      )}

      {/* Loading More Indicator */}
      {loading && writings.length > 0 && (
        <div className="neo-card text-center">
          <div className="neo-heading">LOADING MORE WRITINGS...</div>
        </div>
      )}

      {/* End of List Message */}
      {!pagination.hasNext && writings.length > 0 && (
        <div className="neo-card text-center" style={{ opacity: 0.7 }}>
          <div className="neo-heading">🎉 YOU'VE REACHED THE END!</div>
          <p>That's all your writings for now.</p>
        </div>
      )}
    </div>
  );
};

export default WritingList;