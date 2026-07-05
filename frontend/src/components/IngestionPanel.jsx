import React, { useState, useEffect } from 'react';

export default function IngestionPanel({ 
  dbStatus, 
  onIngestSuccess, 
  nomicKey, 
  apiKeysConfigured 
}) {
  const [ingesting, setIngesting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0: Idle, 1: Loading PDF, 2: Chunking, 3: Embedding, 4: Storing, 5: Complete
  const [error, setError] = useState(null);
  const [ingestData, setIngestData] = useState(null);
  const [activeTab, setActiveTab] = useState('status'); // 'status' or 'chunks'

  const handleIngest = async () => {
    setIngesting(true);
    setError(null);
    setCurrentStep(1); // Step 1: Loading PDF
    
    // Simulate steps for UI immersion
    const stepDuration = 900;
    
    try {
      // Step 2: Splitting chunks
      setTimeout(() => setCurrentStep(2), stepDuration);
      
      // Step 3: Embedding
      setTimeout(() => setCurrentStep(3), stepDuration * 2);
      
      // Call actual backend API
      const headers = { 'Content-Type': 'application/json' };
      if (nomicKey) {
        headers['X-Nomic-Api-Key'] = nomicKey;
      }
      
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: headers
      });
      
      const resData = await response.json();
      
      if (!response.ok) {
        throw new Error(resData.detail || 'Failed to ingest document');
      }
      
      // Step 4: Indexing in ChromaDB
      setCurrentStep(4);
      setIngestData(resData.data);
      
      setTimeout(() => {
        setCurrentStep(5);
        setIngesting(false);
        onIngestSuccess();
      }, 1000);
      
    } catch (err) {
      console.error(err);
      setError(err.message);
      setIngesting(false);
      setCurrentStep(0);
    }
  };

  const steps = [
    { num: 1, title: 'PDF File Parsing', desc: 'Reading text pages from document.' },
    { num: 2, title: 'Recursive Chunking', desc: 'Splitting text into 1000-char semantic chunks.' },
    { num: 3, title: 'Embedding Vectors', desc: 'Calling Nomic Embed (768d float dimensions).' },
    { num: 4, title: 'ChromaDB Indexing', desc: 'Storing vectors with cosine metrics locally.' }
  ];

  return (
    <div className="glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-primary)' }}>
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          PDF Ingestion
        </h2>
        
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            className={`btn ${activeTab === 'status' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
            onClick={() => setActiveTab('status')}
          >
            Pipeline
          </button>
          {dbStatus?.initialized && (
            <button 
              className={`btn ${activeTab === 'chunks' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
              onClick={() => setActiveTab('chunks')}
            >
              Chunks ({dbStatus?.chunk_count})
            </button>
          )}
        </div>
      </div>

      {activeTab === 'status' ? (
        <>
          {/* File details card */}
          <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Source PDF:</span>
              <span style={{ fontWeight: '500', color: 'var(--text-primary)', wordBreak: 'break-all', textAlign: 'right' }}>
                {dbStatus?.pdf_name || 'PRD VWO.com.pdf'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Location:</span>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-secondary)' }}>data/</code>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>DB State:</span>
              <span style={{ 
                fontWeight: '600', 
                color: dbStatus?.initialized ? 'var(--success)' : 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: dbStatus?.initialized ? 'var(--success)' : 'var(--warning)',
                  display: 'inline-block'
                }}></span>
                {dbStatus?.initialized ? 'Ingested' : 'Not Ingested'}
              </span>
            </div>
          </div>

          {/* Setup Trigger */}
          {!ingesting && currentStep !== 5 && (
            <button 
              className="btn btn-primary" 
              onClick={handleIngest}
              disabled={!dbStatus?.pdf_found || (!apiKeysConfigured && !dbStatus?.has_nomic_key)}
              style={{ width: '100%' }}
            >
              {!dbStatus?.pdf_found ? (
                'PDF File Not Found'
              ) : !apiKeysConfigured && !dbStatus?.has_nomic_key ? (
                'API Keys Needed'
              ) : dbStatus?.initialized ? (
                'Re-Ingest Document'
              ) : (
                'Start PDF Ingestion Pipeline'
              )}
            </button>
          )}

          {/* Stepper display when running or finished */}
          {(ingesting || currentStep > 0) && (
            <div className="stepper-container">
              {steps.map((step) => {
                const isActive = currentStep === step.num;
                const isCompleted = currentStep > step.num;
                let stepStatus = '';
                if (isActive) stepStatus = 'active';
                if (isCompleted) stepStatus = 'completed';

                return (
                  <div key={step.num} className={`step-item ${stepStatus}`}>
                    <div className="step-indicator">
                      {isCompleted ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        step.num
                      )}
                    </div>
                    <div className="step-content">
                      <div className="step-title">{step.title}</div>
                      <div className="step-desc">
                        {isActive && <span style={{ color: 'var(--accent-secondary)', fontWeight: '500', marginRight: '6px' }}>Processing...</span>}
                        {step.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
              <strong>Ingestion Failed:</strong><br/>
              {error}
            </div>
          )}

          {currentStep === 5 && !ingesting && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', textAlign: 'center' }}>
              <strong>🎉 Pipeline Execution Successful!</strong>
              <div style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span>Pages parsed: {ingestData?.total_pages}</span>
                <span>Chunks generated: {ingestData?.total_chunks}</span>
                <span>Vectors indexed in ChromaDB</span>
              </div>
              <button 
                className="btn btn-secondary" 
                style={{ marginTop: '12px', padding: '4px 12px', fontSize: '0.75rem', width: '100%' }}
                onClick={() => setCurrentStep(0)}
              >
                Reset Pipeline UI
              </button>
            </div>
          )}
        </>
      ) : (
        /* Preview of chunks */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing preview of the first few chunks stored in the database:
          </div>
          {ingestData?.chunks ? (
            ingestData.chunks.map((chunkText, idx) => (
              <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', fontSize: '0.75rem' }}>
                <div style={{ fontWeight: '600', color: 'var(--accent-primary)', marginBottom: '4px' }}>
                  Chunk #{idx}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.4' }}>
                  "{chunkText.substring(0, 250)}..."
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '24px 0' }}>
              Run ingestion to populate chunk previews here, or view active state.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
