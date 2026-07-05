import React, { useState } from 'react';

export default function QueryPanel({ 
  onQuerySubmit, 
  loading, 
  queryState, 
  queryVector, 
  dbInitialized 
}) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    onQuerySubmit(query);
  };

  const sampleQueries = [
    "What are the key features of VWO?",
    "Explain the A/B testing workflow in VWO.",
    "What integrations does VWO support?",
    "What are the target audiences for this PRD?"
  ];

  return (
    <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-secondary)' }}>
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Ask Document Explorer
        </h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dbInitialized ? "Enter your query about the PRD..." : "Please ingest the document first..."}
          disabled={!dbInitialized || loading}
          style={{
            flexGrow: 1,
            padding: '12px 16px',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={!dbInitialized || !query.trim() || loading}
          style={{ minWidth: '100px' }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="pulse-glow" style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%' }}></span>
              Querying
            </span>
          ) : 'Search'}
        </button>
      </form>

      {/* Sample Queries */}
      {dbInitialized && !loading && (
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '500' }}>
            Try search examples:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {sampleQueries.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(q);
                  onQuerySubmit(q);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.target.style.borderColor = 'var(--accent-secondary)';
                  e.target.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.color = 'var(--text-secondary)';
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Query Status Timeline */}
      {loading && (
        <div style={{ 
          background: 'rgba(230, 184, 125, 0.06)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '12px', 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
        }}>
          {/* Neon Progress Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Pipeline Stage: {queryState === 1 ? 'Embedding' : queryState === 2 ? 'Retrieval' : 'Generation'}</span>
              <span>{queryState === 1 ? '33%' : queryState === 2 ? '66%' : '100%'}</span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ 
                width: queryState === 1 ? '33%' : queryState === 2 ? '66%' : '100%', 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--accent-secondary) 0%, var(--accent-primary) 100%)',
                boxShadow: '0 0 10px var(--accent-secondary)',
                borderRadius: '2px',
                transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
              }}></div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Step 1 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              fontSize: '0.85rem',
              background: queryState === 1 ? 'rgba(6, 182, 212, 0.06)' : 'transparent',
              border: queryState === 1 ? '1px solid rgba(6, 182, 212, 0.15)' : '1px solid transparent',
              padding: '10px 14px',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}>
              <span className={queryState === 1 ? "pulse-glow" : ""} style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: queryState >= 1 ? 'var(--accent-secondary)' : 'var(--text-muted)',
                boxShadow: queryState >= 1 ? '0 0 8px var(--accent-secondary)' : 'none',
                flexShrink: 0
              }}></span>
              <span style={{ 
                color: queryState === 1 ? '#fff' : queryState > 1 ? 'var(--text-secondary)' : 'var(--text-muted)',
                fontWeight: queryState === 1 ? '600' : '400'
              }}>
                1. Embedding User Query using Nomic Embed model (nomic-embed-text-v1.5)
              </span>
            </div>

            {/* Step 2 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              fontSize: '0.85rem',
              background: queryState === 2 ? 'rgba(139, 92, 246, 0.06)' : 'transparent',
              border: queryState === 2 ? '1px solid rgba(139, 92, 246, 0.15)' : '1px solid transparent',
              padding: '10px 14px',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}>
              <span className={queryState === 2 ? "pulse-glow" : ""} style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: queryState >= 2 ? 'var(--accent-primary)' : 'var(--text-muted)',
                boxShadow: queryState >= 2 ? '0 0 8px var(--accent-primary)' : 'none',
                flexShrink: 0
              }}></span>
              <span style={{ 
                color: queryState === 2 ? '#fff' : queryState > 2 ? 'var(--text-secondary)' : 'var(--text-muted)',
                fontWeight: queryState === 2 ? '600' : '400'
              }}>
                2. Querying ChromaDB index (fetching top 4 most similar chunks)
              </span>
            </div>

            {/* Step 3 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              fontSize: '0.85rem',
              background: queryState === 3 ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
              border: queryState === 3 ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid transparent',
              padding: '10px 14px',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}>
              <span className={queryState === 3 ? "pulse-glow" : ""} style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                background: queryState >= 3 ? 'var(--success)' : 'var(--text-muted)',
                boxShadow: queryState >= 3 ? '0 0 8px var(--success)' : 'none',
                flexShrink: 0
              }}></span>
              <span style={{ 
                color: queryState === 3 ? '#fff' : queryState > 3 ? 'var(--text-secondary)' : 'var(--text-muted)',
                fontWeight: queryState === 3 ? '600' : '400'
              }}>
                3. Compiling prompts and generating response using Groq + OpenGPT 120B
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Query Embedding Vector Visualizer */}
      {queryVector && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Generated Query Embedding Vector Preview:</span>
            <code style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>nomic-embed-text-v1.5 (768 Dimensions)</code>
          </div>
          <div className="vector-grid">
            {queryVector.map((val, idx) => (
              <span key={idx} className="vector-dimension">
                {val.toFixed(4)}
              </span>
            ))}
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', alignSelf: 'center', marginLeft: '6px' }}>... +753 dimensions</span>
          </div>
        </div>
      )}
    </div>
  );
}
