import React from 'react';
import './styles/neo-brutalism.css';

/**
 * WritingCard Component - Menampilkan kartu untuk setiap tulisan
 * 
 * @param {Object} writing - Data writing
 * @param {Function} onEdit - Callback ketika edit diklik
 * @param {Function} onDelete - Callback ketika delete diklik
 * @param {Function} onView - Callback ketika view diklik
 */
const WritingCard = ({ 
  writing, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  if (!writing) return null;

  // Format date untuk display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Potong excerpt jika terlalu panjang
  const truncateExcerpt = (text, maxLength = 120) => {
    if (!text) return 'No content available';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Potong title jika terlalu panjang
  const truncateTitle = (title, maxLength = 50) => {
    if (!title) return 'Untitled';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
  };

  return (
    <div className={`writing-card ${writing.status}`}>
      {/* Header dengan title dan status */}
      <div className="writing-card-header">
        <div style={{ flex: 1 }}>
          <h3 
            className="writing-title"
            onClick={() => onView && onView(writing.id)}
            style={{ cursor: onView ? 'pointer' : 'default' }}
            title={writing.title}
          >
            {truncateTitle(writing.title)}
          </h3>
          
          <div className="neo-flex" style={{ gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`writing-status ${writing.status}`}>
              {writing.status === 'draft' ? 'DRAFT' : 'PUBLISHED'}
            </span>
            
            <span className="writing-date">
              {formatDate(writing.created_date)}
            </span>
            
            {writing.modified_date !== writing.created_date && (
              <span 
                className="writing-date"
                style={{ 
                  background: 'var(--secondary)',
                  fontSize: '0.7rem'
                }}
                title={`Edited: ${formatDate(writing.modified_date)}`}
              >
                Edited
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Excerpt/Preview Content */}
      <div className="writing-excerpt">
        {writing.excerpt ? (
          <p>{truncateExcerpt(writing.excerpt)}</p>
        ) : writing.content ? (
          <p 
            dangerouslySetInnerHTML={{ 
              __html: truncateExcerpt(
                writing.content.replace(/<[^>]*>/g, '')
              ) 
            }} 
          />
        ) : (
          <p style={{ opacity: 0.6, fontStyle: 'italic' }}>
            No content yet...
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="neo-flex-between">
        <div className="neo-flex" style={{ gap: '8px' }}>
          {/* View Button */}
          {onView && (
            <button
              className="neo-btn neo-btn-sm"
              onClick={() => onView(writing.id)}
              title="View this writing"
            >
              👁️ View
            </button>
          )}
          
          {/* Edit Button */}
          <button
            className="neo-btn neo-btn-secondary neo-btn-sm"
            onClick={() => onEdit(writing.id)}
            title="Edit this writing"
          >
            ✏️ Edit
          </button>
        </div>

        {/* Delete Button */}
        <button
          className="neo-btn neo-btn-danger neo-btn-sm"
          onClick={() => {
            if (window.confirm(`Are you sure you want to delete "${truncateTitle(writing.title)}"?`)) {
              onDelete(writing.id);
            }
          }}
          title="Delete this writing"
        >
          🗑️ Delete
        </button>
      </div>

      {/* Content Length Indicator */}
      <div 
        style={{ 
          marginTop: '12px',
          fontSize: '0.7rem',
          opacity: 0.7,
          textAlign: 'right'
        }}
      >
        {writing.content ? 
          `${writing.content.replace(/<[^>]*>/g, '').length} characters` : 
          '0 characters'
        }
      </div>
    </div>
  );
};

export default WritingCard;