'use client';

import { useState } from 'react';

export default function CyclePage() {
  const [url, setUrl] = useState('https://www.instagram.com/reel/DCKH6RPSKDe/');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; description?: string; error?: string; debug?: any } | null>(null);

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/crawl-instagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Failed to process URL',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ 
      padding: '50px', 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ fontSize: '36px', marginBottom: '20px' }}>Instagram Reel Crawler</h1>
      
      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <form onSubmit={handleProcess}>
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="url" 
              style={{ 
                display: 'block', 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#333'
              }}
            >
              Instagram Reel URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://www.instagram.com/reel/..."
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                fontFamily: 'monospace'
              }}
              onFocus={(e) => e.target.style.borderColor = '#e1306c'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: loading ? '#9e9e9e' : '#e1306c',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#c13584';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#e1306c';
            }}
          >
            {loading ? 'Processing...' : '📸 Process Reel'}
          </button>
        </form>

        {result && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '6px',
            backgroundColor: result.success ? '#e8f5e9' : '#ffebee',
            border: `1px solid ${result.success ? '#4caf50' : '#f44336'}`
          }}>
            {result.success ? (
              <>
                <p style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#2e7d32',
                  marginBottom: '12px'
                }}>
                  ✅ Description Extracted
                </p>
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #c8e6c9'
                }}>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#555',
                    lineHeight: '1.6',
                    margin: '0'
                  }}>
                    {result.description}
                  </p>
                </div>
              </>
            ) : (
              <>
                <p style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#c62828',
                  marginBottom: '8px'
                }}>
                  ❌ Error
                </p>
                <p style={{ fontSize: '14px', color: '#555', marginBottom: result.debug ? '12px' : '0' }}>
                  {result.error || 'Unknown error occurred'}
                </p>
                {result.debug && (
                  <details style={{ marginTop: '8px' }}>
                    <summary style={{
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#c62828',
                      padding: '4px 0'
                    }}>
                      View Debug Info
                    </summary>
                    <pre style={{
                      fontSize: '11px',
                      marginTop: '8px',
                      padding: '12px',
                      backgroundColor: '#263238',
                      color: '#aed581',
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                      maxHeight: '400px'
                    }}>
                      {JSON.stringify(result.debug, null, 2)}
                    </pre>
                  </details>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

