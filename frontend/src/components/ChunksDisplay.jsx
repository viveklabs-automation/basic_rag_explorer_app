import React, { useState } from 'react';

export default function ChunksDisplay({ chunks }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!chunks || chunks.length === 0) return null;

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-primary)' }}>
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          ChromaDB Retrieved Context Chunks (Top 4)
        </h2>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Metric: Cosine Similarity
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {chunks.map((chunk, index) => {
          const isExpanded = expandedId === chunk.id;
          const scorePercent = Math.round(chunk.similarity * 100);

          // Determine color indicator based on similarity score
          let scoreColor = 'var(--success)';
          if (chunk.similarity < 0.7) scoreColor = 'var(--warning)';
          if (chunk.similarity < 0.5) scoreColor = 'var(--error)';

          return (
            <div
              key={chunk.id}
              className="glass"
              style={{
                padding: '16px',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                gridColumn: isExpanded ? '1 / -1' : 'auto',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
                <span style={{
                  fontSize: '0.75rem',
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: 'var(--accent-primary-hover)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: '600'
                }}>
                  Rank #{index + 1}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Page {chunk.metadata?.page_index} (Idx: {chunk.metadata?.chunk_index})
                  </span>

                  {/* Score badge */}
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: scoreColor,
                    background: `rgba(${scoreColor === 'var(--success)' ? '16, 185, 129' : scoreColor === 'var(--warning)' ? '245, 158, 11' : '239, 68, 68'}, 0.12)`,
                    padding: '2px 8px',
                    borderRadius: '8px',
                    border: `1px solid rgba(${scoreColor === 'var(--success)' ? '16, 185, 129' : scoreColor === 'var(--warning)' ? '245, 158, 11' : '239, 68, 68'}, 0.25)`
                  }}>
                    {scorePercent}% Match
                  </span>
                </div>
              </div>

              {/* Text content preview */}
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                maxHeight: isExpanded ? 'none' : '100px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <p style={{ whiteSpace: 'pre-wrap' }}>
                  {isExpanded ? chunk.text : `"${chunk.text.substring(0, 220)}..."`}
                </p>


              </div>

              {/* Expand Toggle */}
              {chunk.text.length > 220 && (
                <button
                  onClick={() => toggleExpand(chunk.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    alignSelf: 'flex-start',
                    padding: 0
                  }}
                >
                  {isExpanded ? (
                    <>
                      Collapse
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg>
                    </>
                  ) : (
                    <>
                      Expand Full Text
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
