'use client';

import { useInstagramWebhookDataStore, useSearchResultsStore } from '@/lib/store';
import { searchInstagramReels } from '@/lib/api';

export default function FindInstagramReelSection() {
  const { descriptionText } = useInstagramWebhookDataStore();
  const { searchResults, searching, setSearchResults, setSearching } = useSearchResultsStore();

  const handleSearch = async () => {
    if (!descriptionText) {
      alert('Please process an Instagram link first to get a description');
      return;
    }

    setSearching(true);
    setSearchResults(null);

    const result = await searchInstagramReels(descriptionText);
    
    if (result.success) {
      setSearchResults(result.results || []);
    } else {
      alert(`Search failed: ${result.error || 'Unknown error'}`);
    }
    
    setSearching(false);
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '30px',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      marginTop: '30px'
    }}>
      <h2 style={{ fontSize: '28px', marginTop: '0', marginBottom: '20px' }}>Find Instagram Reels</h2>
      
      <button
        type="button"
        onClick={handleSearch}
        disabled={searching || !descriptionText}
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '18px',
          fontWeight: '600',
          color: '#ffffff',
          backgroundColor: searching || !descriptionText ? '#9e9e9e' : '#4285f4',
          border: 'none',
          borderRadius: '6px',
          cursor: searching || !descriptionText ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          if (!searching && descriptionText) e.currentTarget.style.backgroundColor = '#357ae8';
        }}
        onMouseLeave={(e) => {
          if (!searching && descriptionText) e.currentTarget.style.backgroundColor = '#4285f4';
        }}
      >
        {searching ? '🔍 Searching...' : '🔍 Search'}
      </button>

      {!descriptionText && (
        <p style={{
          fontSize: '14px',
          color: '#666',
          fontStyle: 'italic',
          marginTop: '12px',
          marginBottom: '0'
        }}>
          Process an Instagram link above to enable search
        </p>
      )}

      {searchResults && searchResults.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ 
            fontSize: '20px', 
            marginTop: '0', 
            marginBottom: '16px',
            color: '#333'
          }}>
            Search Results
          </h3>
          {searchResults.map((result, index) => (
            <div 
              key={index}
              style={{
                backgroundColor: '#f9f9f9',
                padding: '16px',
                borderRadius: '6px',
                border: '1px solid #e0e0e0',
                marginBottom: '12px',
                display: 'flex',
                gap: '12px'
              }}
            >
              {result.thumbnail && (
                <img 
                  src={result.thumbnail}
                  alt={result.title}
                  style={{
                    width: '120px',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                    flexShrink: 0
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1a73e8',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    {result.title}
                  </a>
                  {result.duration && (
                    <span style={{
                      fontSize: '12px',
                      color: '#fff',
                      backgroundColor: '#000',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontWeight: '600'
                    }}>
                      ⏱️ {result.duration}
                    </span>
                  )}
                </div>
                <p style={{
                  fontSize: '14px',
                  color: '#555',
                  lineHeight: '1.6',
                  margin: '0 0 8px 0'
                }}>
                  {result.snippet}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#006621',
                  margin: '0 0 12px 0',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all'
                }}>
                  {result.url}
                </p>
                {result.raw && (
                  <details style={{ marginTop: '12px' }}>
                    <summary style={{
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#4285f4',
                      padding: '4px 0',
                      userSelect: 'none'
                    }}>
                      View Raw SerpAPI Data
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
                      {JSON.stringify(result.raw, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

