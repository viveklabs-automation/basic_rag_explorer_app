import React, { useState, useEffect } from 'react';
import IngestionPanel from './components/IngestionPanel';
import QueryPanel from './components/QueryPanel';
import ChunksDisplay from './components/ChunksDisplay';
import AnswerDisplay from './components/AnswerDisplay';

export default function App() {
  const [dbStatus, setDbStatus] = useState(null);
  
  // API Keys (UI override mode)
  const [groqKey, setGroqKey] = useState('');
  const [nomicKey, setNomicKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [keysSaved, setKeysSaved] = useState(false);

  // Query state
  const [loading, setLoading] = useState(false);
  const [queryState, setQueryState] = useState(0); // 1: Embedding, 2: Retrieving, 3: Generating
  const [queryResult, setQueryResult] = useState(null);
  const [queryError, setQueryError] = useState(null);

  // Fetch db status on load
  const fetchDbStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setDbStatus(data);
    } catch (error) {
      console.error('Error fetching DB status:', error);
    }
  };

  useEffect(() => {
    fetchDbStatus();
    
    // Load keys from localStorage if saved
    const savedGroq = localStorage.getItem('rag_groq_key') || '';
    const savedNomic = localStorage.getItem('rag_nomic_key') || '';
    if (savedGroq) setGroqKey(savedGroq);
    if (savedNomic) setNomicKey(savedNomic);
    if (savedGroq || savedNomic) setKeysSaved(true);
  }, []);

  const handleSaveKeys = (e) => {
    e.preventDefault();
    localStorage.setItem('rag_groq_key', groqKey);
    localStorage.setItem('rag_nomic_key', nomicKey);
    setKeysSaved(true);
    setShowSettings(false);
  };

  const handleClearKeys = () => {
    localStorage.removeItem('rag_groq_key');
    localStorage.removeItem('rag_nomic_key');
    setGroqKey('');
    setNomicKey('');
    setKeysSaved(false);
  };

  const handleQuerySubmit = async (queryText) => {
    setLoading(true);
    setQueryError(null);
    setQueryResult(null);
    
    // Step 1: Embedding
    setQueryState(1);
    
    try {
      // Simulate state transition for educational pacing
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Step 2: Retrieving
      setQueryState(2);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Step 3: Generating
      setQueryState(3);

      const headers = { 'Content-Type': 'application/json' };
      const activeGroqKey = groqKey || dbStatus?.has_groq_key;
      const activeNomicKey = nomicKey || dbStatus?.has_nomic_key;
      
      if (nomicKey) headers['X-Nomic-Api-Key'] = nomicKey;
      if (groqKey) headers['X-Groq-Api-Key'] = groqKey;

      const response = await fetch('/api/query', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ query: queryText })
      });

      const resData = await response.json();
      
      if (!response.ok) {
        throw new Error(resData.detail || 'Failed to process RAG query');
      }

      setQueryResult(resData.data);
    } catch (err) {
      console.error(err);
      setQueryError(err.message);
    } finally {
      setLoading(false);
      setQueryState(0);
    }
  };

  // Determine if keys are available either locally or from .env
  const apiKeysConfigured = (groqKey && nomicKey) || (dbStatus?.has_groq_key && dbStatus?.has_nomic_key) || keysSaved;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Animated Glowing Blobs for Premium Aesthetic */}
      <div className="glowing-blob blob-purple"></div>
      <div className="glowing-blob blob-cyan"></div>
      <div className="glowing-blob blob-blue"></div>
      
      {/* Navbar / Header */}
      <header className="glass" style={{ margin: '16px 24px 0 24px', padding: '16px 24px', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', background: 'linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>
            RAG Explorer
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Interactive Vector DB Search & LLM Context Synthesis
          </p>
        </div>

        {/* Global DB and Keys Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Key status */}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="btn btn-secondary"
            style={{ 
              padding: '6px 12px', 
              fontSize: '0.8rem', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderColor: apiKeysConfigured ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'
            }}
          >
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: apiKeysConfigured ? 'var(--success)' : 'var(--warning)',
              boxShadow: apiKeysConfigured ? '0 0 6px var(--success)' : '0 0 6px var(--warning)'
            }}></span>
            API Config: {apiKeysConfigured ? 'Loaded' : 'Required'}
          </button>

          {/* Database indicator */}
          <div style={{ 
            fontSize: '0.8rem', 
            padding: '6px 12px', 
            borderRadius: '8px', 
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={dbStatus?.initialized ? "var(--success)" : "var(--text-muted)"} strokeWidth="2.5">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
              <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>
            </svg>
            <span style={{ color: 'var(--text-secondary)' }}>
              ChromaDB Chunks: <strong style={{ color: dbStatus?.initialized ? 'var(--success)' : 'var(--text-muted)' }}>{dbStatus?.chunk_count || 0}</strong>
            </span>
          </div>
        </div>
      </header>

      {/* API Keys Configuration Panel (Collapsible Modal Style) */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="glass" style={{ width: '450px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>Configure API Credentials</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Enter your credentials to use Nomic Embed and Groq. Keys are stored locally in your browser.
              </p>
            </div>
            
            <form onSubmit={handleSaveKeys} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  Nomic API Key
                </label>
                <input
                  type="password"
                  value={nomicKey}
                  onChange={(e) => setNomicKey(e.target.value)}
                  placeholder={dbStatus?.has_nomic_key ? "Configured in backend (.env)" : "Enter Nomic API Key..."}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  Groq API Key
                </label>
                <input
                  type="password"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder={dbStatus?.has_groq_key ? "Configured in backend (.env)" : "Enter Groq API Key..."}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                  Save Keys
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleClearKeys}>
                  Clear Keys
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowSettings(false)}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid Dashboard */}
      <div className="dashboard-grid">
        
        {/* Left Side Ingestion Column */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <IngestionPanel 
            dbStatus={dbStatus} 
            onIngestSuccess={fetchDbStatus} 
            nomicKey={nomicKey}
            apiKeysConfigured={apiKeysConfigured}
          />
          
          {/* Quick Stats/Stack Details Info Box */}
          <div className="glass" style={{ padding: '20px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>RAG Pipeline Stack</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)' }}>
              <div>• <strong>Embed Model:</strong> Nomic Embed Text v1.5</div>
              <div>• <strong>Vector DB:</strong> Local ChromaDB</div>
              <div>• <strong>LLM Host:</strong> Groq Inference Engine</div>
              <div>• <strong>LLM Model:</strong> OpenGPT 120B</div>
              <div>• <strong>Parser:</strong> Python PyPDF</div>
            </div>
          </div>
        </aside>

        {/* Right Side Main Interaction Column */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <QueryPanel 
            onQuerySubmit={handleQuerySubmit} 
            loading={loading}
            queryState={queryState}
            queryVector={queryResult?.query_embedding_preview}
            dbInitialized={dbStatus?.initialized}
          />

          {queryError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', color: 'var(--error)', padding: '16px', borderRadius: '12px', fontSize: '0.85rem' }}>
              <strong>Search Query Failed:</strong> {queryError}
            </div>
          )}

          {/* Retrieved Chunks Display */}
          {queryResult?.chunks && (
            <ChunksDisplay chunks={queryResult.chunks} />
          )}

          {/* Answer Synthesis Display */}
          {queryResult?.answer && (
            <AnswerDisplay 
              answer={queryResult.answer} 
              prompt={queryResult.prompt}
              systemPrompt={queryResult.system_prompt}
            />
          )}

          {/* Empty / Welcome State (How RAG Works Flow Diagram) */}
          {!queryResult && !loading && !queryError && (
            <div className="glass" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', border: '1px solid rgba(139,92,246,0.3)', color: 'var(--accent-primary-hover)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>RAG Ingestion and Query Pipeline</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', lineHeight: '1.5' }}>
                  Ingest the VWO Product Requirements Document PDF to split it into searchable vectors, and query it. You can see the step-by-step pipeline state changes below.
                </p>
              </div>

              {/* Graphical Process Flowchart */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '700px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  📄 Load PDF
                </div>
                <span>➔</span>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  ✂️ Chunk Text
                </div>
                <span>➔</span>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  🧬 Nomic Embed
                </div>
                <span>➔</span>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  💾 ChromaDB
                </div>
                <span>➔</span>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--accent-secondary)' }}>
                  🔍 Ask Query
                </div>
                <span>➔</span>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--success)' }}>
                  🤖 Groq Synthesis
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
