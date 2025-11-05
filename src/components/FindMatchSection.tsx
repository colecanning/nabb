'use client';

import { useInstagramWebhookDataStore, useSearchResultsStore, useMatchResultsStore, useVideoDurationStore } from '@/lib/store';
import { findFirstMatchByDuration } from '@/lib/matching';

export default function FindMatchSection() {
  // const { titleText } = useInstagramWebhookDataStore();
  const { searchResults } = useSearchResultsStore();
  const { matchedResult, findingMatch, setMatchedResult, setFindingMatch } = useMatchResultsStore();
  const { videoDuration } = useVideoDurationStore();

  const handleFindMatch = async () => {
    if (!searchResults || searchResults.length === 0) {
      alert('Please search for Instagram reels first');
      return;
    }

    setFindingMatch(true);
    setMatchedResult(null);

    const result = await findFirstMatchByDuration(searchResults, videoDuration);
    
    if (result.success && result.matchedResult) {
      setMatchedResult(result.matchedResult);
    } else {
      alert(result.error || 'No good match found');
    }
    
    setFindingMatch(false);
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
      <h2 style={{ fontSize: '28px', marginTop: '0', marginBottom: '20px' }}>Find Match</h2>
      
      <button
        type="button"
        onClick={handleFindMatch}
        disabled={findingMatch || !searchResults || searchResults.length === 0}
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '18px',
          fontWeight: '600',
          color: '#ffffff',
          backgroundColor: findingMatch || !searchResults || searchResults.length === 0 ? '#9e9e9e' : '#34a853',
          border: 'none',
          borderRadius: '6px',
          cursor: findingMatch || !searchResults || searchResults.length === 0 ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          if (!findingMatch && searchResults && searchResults.length > 0) {
            e.currentTarget.style.backgroundColor = '#2d8e47';
          }
        }}
        onMouseLeave={(e) => {
          if (!findingMatch && searchResults && searchResults.length > 0) {
            e.currentTarget.style.backgroundColor = '#34a853';
          }
        }}
      >
        {findingMatch ? '🔍 Finding Match...' : '🎯 Find Match'}
      </button>

      {(!searchResults || searchResults.length === 0) && (
        <p style={{
          fontSize: '14px',
          color: '#666',
          fontStyle: 'italic',
          marginTop: '12px',
          marginBottom: '0'
        }}>
          Search for Instagram reels first to enable matching
        </p>
      )}

      {matchedResult && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ 
            fontSize: '20px', 
            marginTop: '0', 
            marginBottom: '16px',
            color: '#2e7d32'
          }}>
            ✅ Best Match Found
          </h3>

          {/* Match Score Breakdown */}
          <div style={{
            backgroundColor: '#fff',
            padding: '16px',
            borderRadius: '6px',
            border: '1px solid #c8e6c9',
            marginBottom: '16px'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                  Overall Match Score
                </span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#2e7d32' }}>
                  {(matchedResult.matchScore * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{
                height: '8px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${matchedResult.matchScore * 100}%`,
                  backgroundColor: '#4caf50',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <span style={{ fontSize: '13px', color: '#555' }}>
                  ⏱️ Duration Match (60% weight)
                </span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>
                  {(matchedResult.durationScore * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{
                height: '6px',
                backgroundColor: '#e0e0e0',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${matchedResult.durationScore * 100}%`,
                  backgroundColor: '#ff9800',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <span style={{ fontSize: '13px', color: '#555' }}>
                  📝 Title Match (40% weight)
                </span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>
                  {(matchedResult.titleScore * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{
                height: '6px',
                backgroundColor: '#e0e0e0',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${matchedResult.titleScore * 100}%`,
                  backgroundColor: '#2196f3',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Matched Result Card */}
          <div 
            style={{
              backgroundColor: '#e8f5e9',
              padding: '16px',
              borderRadius: '6px',
              border: '2px solid #4caf50',
              display: 'flex',
              gap: '12px'
            }}
          >
            {matchedResult.thumbnail && (
              <img 
                src={matchedResult.thumbnail}
                alt={matchedResult.title}
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
                  href={matchedResult.url}
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
                  {matchedResult.title}
                </a>
                {matchedResult.duration && (
                  <span style={{
                    fontSize: '12px',
                    color: '#fff',
                    backgroundColor: '#000',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontWeight: '600'
                  }}>
                    ⏱️ {matchedResult.duration}
                  </span>
                )}
              </div>
              <p style={{
                fontSize: '14px',
                color: '#555',
                lineHeight: '1.6',
                margin: '0 0 8px 0'
              }}>
                {matchedResult.snippet}
              </p>
              <p style={{
                fontSize: '12px',
                color: '#006621',
                margin: '0',
                fontFamily: 'monospace',
                wordBreak: 'break-all'
              }}>
                {matchedResult.url}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

