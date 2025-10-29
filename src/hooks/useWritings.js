import { useState, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook untuk manage writings state dan operations
 */
export const useWritings = () => {
  // State management
  const [writings, setWritings] = useState([]);
  const [currentWriting, setCurrentWriting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });

  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved'); // 'saved', 'saving', 'unsaved'

  /**
   * Load writings dengan pagination dan search
   */
  const loadWritings = useCallback(async (page = 1, search = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.getWritings(page, search);
      
      setWritings(result.data);
      setPagination(result.pagination);
      
    } catch (err) {
      setError(err.message);
      console.error('Error loading writings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load more writings (untuk load more functionality)
   */
  const loadMoreWritings = useCallback(async (page, search = '') => {
    try {
      const result = await api.getWritings(page, search);
      
      // Append new writings to existing ones
      setWritings(prev => [...prev, ...result.data]);
      setPagination(result.pagination);
      
    } catch (err) {
      setError(err.message);
      console.error('Error loading more writings:', err);
    }
  }, []);

  /**
   * Get single writing by ID
   */
  const getWriting = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.getWriting(id);
      setCurrentWriting(result.data);
      return result.data;
    } catch (err) {
      setError(err.message);
      console.error('Error fetching writing:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new writing
   */
  const createWriting = useCallback(async (writingData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.createWriting(writingData);
      
      // Add new writing to the beginning of the list
      setWritings(prev => [result.data, ...prev]);
      
      return result.data;
    } catch (err) {
      setError(err.message);
      console.error('Error creating writing:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update writing
   */
  const updateWriting = useCallback(async (id, updateData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.updateWriting(id, updateData);
      
      // Update in writings list
      setWritings(prev => 
        prev.map(writing => 
          writing.id === id ? result.data : writing
        )
      );
      
      // Update current writing if it's the one being edited
      if (currentWriting && currentWriting.id === id) {
        setCurrentWriting(result.data);
      }
      
      return result.data;
    } catch (err) {
      setError(err.message);
      console.error('Error updating writing:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentWriting]);

  /**
   * Auto-save writing content
   */
  const autoSaveWriting = useCallback(async (id, content) => {
    setAutoSaveStatus('saving');
    
    try {
      await api.autoSaveWriting(id, content);
      setAutoSaveStatus('saved');
      
      // Optimistically update local state
      setWritings(prev => 
        prev.map(writing => 
          writing.id === id ? { ...writing, content } : writing
        )
      );
      
      if (currentWriting && currentWriting.id === id) {
        setCurrentWriting(prev => ({ ...prev, content }));
      }
      
    } catch (err) {
      setAutoSaveStatus('unsaved');
      console.error('Error auto-saving writing:', err);
      throw err;
    }
  }, [currentWriting]);

  /**
   * Delete writing
   */
  const deleteWriting = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.deleteWriting(id);
      
      // Remove from writings list
      setWritings(prev => prev.filter(writing => writing.id !== id));
      
      // Clear current writing if it's the one being deleted
      if (currentWriting && currentWriting.id === id) {
        setCurrentWriting(null);
      }
      
    } catch (err) {
      setError(err.message);
      console.error('Error deleting writing:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentWriting]);

  /**
   * Search writings
   */
  const searchWritings = useCallback(async (keyword, page = 1) => {
    return loadWritings(page, keyword);
  }, [loadWritings]);

  /**
   * Clear current writing (ketika keluar dari editor)
   */
  const clearCurrentWriting = useCallback(() => {
    setCurrentWriting(null);
    setAutoSaveStatus('saved');
  }, []);

  /**
   * Set auto-save status manually
   */
  const setAutoSaveStatusManually = useCallback((status) => {
    setAutoSaveStatus(status);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Return hook API
  return {
    // State
    writings,
    currentWriting,
    loading,
    error,
    pagination,
    autoSaveStatus,
    
    // Actions
    loadWritings,
    loadMoreWritings,
    getWriting,
    createWriting,
    updateWriting,
    autoSaveWriting,
    deleteWriting,
    searchWritings,
    clearCurrentWriting,
    setAutoSaveStatusManually,
    clearError,
    
    // Convenience getters
    hasWritings: writings.length > 0,
    canLoadMore: pagination.hasNext,
    currentPage: pagination.currentPage
  };
};