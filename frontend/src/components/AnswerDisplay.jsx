import React, { useState, useEffect } from 'react';

export default function AnswerDisplay({ answer, prompt, systemPrompt }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState('');

  // Custom typing effect for LLM output
  useEffect(() => {
    if (!answer) {
      setTypedAnswer('');
      return;
    }

    setTypedAnswer('');
    let idx = 0;
    const speed = 6; // ms per char (relatively fast for smooth reading)
    const interval = setInterval(() => {
      setTypedAnswer((prev) => prev + answer.charAt(idx));
      idx++;
      if (idx >= answer.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [answer]);

  if (!answer) return null;

  // Custom regex-based parser for markdown elements
  const renderFormattedText = (text) => {
    if (!text) return { __html: '' };
    let html = text;
    
    // HTML escape
    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre style="font-family: var(--font-mono); background: rgba(230, 184, 125, 0.04); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color); font-size: 0.75rem; overflow-x: auto; margin: 12px 0; color: var(--text-secondary); line-height: 1.4;">${code.trim()}</pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code style="font-family: var(--font-mono); background: rgba(230, 184, 125, 0.04); padding: 2px 6px; border-radius: 4px; color: var(--text-secondary); font-size: 0.85em;">$1</code>');

    // Bold text
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="color: var(--text-primary); font-weight: 600;">$1</strong>');

    // Parse bullet points
    const rawLines = html.split('\n');
    
    // Filter out blank lines followed immediately by indented items
    const lines = [];
    for (let i = 0; i < rawLines.length; i++) {
      const currentLine = rawLines[i];
      const nextLine = rawLines[i + 1];
      if (currentLine.trim() === '' && nextLine && (nextLine.startsWith('    ') || nextLine.startsWith('\t'))) {
        continue;
      }
      lines.push(currentLine);
    }

    const processedLines = lines.map(line => {
      const trimmed = line.trim();
      
      let isIndented = false;
      let lineText = line;
      if (lineText.startsWith('    ')) {
        isIndented = true;
        lineText = lineText.substring(4);
      } else if (lineText.startsWith('\t')) {
        isIndented = true;
        lineText = lineText.substring(1);
      }

      if (trimmed === '') {
        // Render empty lines with precise height control
        return '<div style="height: 16px;"></div>';
      }

      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        const itemContent = trimmed.substring(2);
        return `<div style="margin: 0; line-height: 1.5; color: var(--text-secondary);">• ${itemContent}</div>`;
      } else {
        if (isIndented) {
          return `<div style="margin-left: 20px; margin-top: 0; margin-bottom: 0; line-height: 1.5; color: var(--text-secondary);">${lineText}</div>`;
        } else {
          return `<div style="margin: 0; line-height: 1.5; color: var(--text-secondary);">${lineText}</div>`;
        }
      }
    });
    
    return { __html: processedLines.join('') };
  };

  return (
    <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--success)' }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Synthesized Answer
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Model: <strong style={{ color: 'var(--text-secondary)' }}>OpenGPT 120B (Groq)</strong>
          </span>
          <button
            onClick={() => setShowPrompt(!showPrompt)}
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
          >
            {showPrompt ? 'Hide Prompt' : 'View Raw Prompt'}
          </button>
        </div>
      </div>

      {/* Answer content */}
      <div
        style={{
          fontSize: '0.95rem',
          lineHeight: '1.6',
          color: 'var(--text-secondary)',
          background: 'rgba(230, 184, 125, 0.06)',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid rgba(230, 184, 125, 0.15)'
        }}
        dangerouslySetInnerHTML={renderFormattedText(typedAnswer)}
      />

      {/* Raw Prompt Inspector */}
      {showPrompt && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary-hover)', fontWeight: '600' }}>
            System Instructions Prompt:
          </div>
          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            background: 'rgba(0,0,0,0.3)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            whiteSpace: 'pre-wrap',
            color: 'var(--text-secondary)',
            lineHeight: '1.4'
          }}>
            {systemPrompt}
          </pre>

          <div style={{ fontSize: '0.8rem', color: 'var(--accent-secondary-hover)', fontWeight: '600', marginTop: '10px' }}>
            Compiled User Prompt (Context Chunks Injected):
          </div>
          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            background: 'rgba(0,0,0,0.3)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            whiteSpace: 'pre-wrap',
            color: 'var(--text-secondary)',
            lineHeight: '1.4',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {prompt}
          </pre>
        </div>
      )}
    </div>
  );
}
