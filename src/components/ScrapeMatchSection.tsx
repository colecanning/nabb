'use client';

import { useMatchResultsStore, useScrapeMatchStore, useFinalResultStore } from '@/lib/store';
import { crawlInstagram } from '@/lib/api';

export default function ScrapeMatchSection() {
  const { matchedResult } = useMatchResultsStore();
  const { scrapedMatchData, scrapingMatch, setScrapedMatchData, setScrapingMatch } = useScrapeMatchStore();
  const { updateFinalResult } = useFinalResultStore();

  const handleScrapeMatch = async () => {
    if (!matchedResult) {
      alert('Please find a match first');
      return;
    }

    setScrapingMatch(true);
    setScrapedMatchData(null);

    const data = await crawlInstagram(matchedResult.url);
    setScrapedMatchData(data);
    
    // Update final result with matched Instagram URL if successful
    if (data.success) {
      updateFinalResult({
        result: {
          bestMatch: {
            videoUrl: data.videoUrl || null,
            title: data.title || null,
          }
        }
      });
    }
    
    setScrapingMatch(false);
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
      <h2 style={{ fontSize: '28px', marginTop: '0', marginBottom: '20px' }}>Scrape Match</h2>
      
      <button
        type="button"
        onClick={handleScrapeMatch}
        disabled={scrapingMatch || !matchedResult}
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '18px',
          fontWeight: '600',
          color: '#ffffff',
          backgroundColor: scrapingMatch || !matchedResult ? '#9e9e9e' : '#9c27b0',
          border: 'none',
          borderRadius: '6px',
          cursor: scrapingMatch || !matchedResult ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          if (!scrapingMatch && matchedResult) {
            e.currentTarget.style.backgroundColor = '#7b1fa2';
          }
        }}
        onMouseLeave={(e) => {
          if (!scrapingMatch && matchedResult) {
            e.currentTarget.style.backgroundColor = '#9c27b0';
          }
        }}
      >
        {scrapingMatch ? '🔄 Scraping...' : '🕷️ Scrape Match'}
      </button>

      {!matchedResult && (
        <p style={{
          fontSize: '14px',
          color: '#666',
          fontStyle: 'italic',
          marginTop: '12px',
          marginBottom: '0'
        }}>
          Find a match first to enable scraping
        </p>
      )}

      {scrapedMatchData && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          borderRadius: '6px',
          backgroundColor: scrapedMatchData.success ? '#e8f5e9' : '#ffebee',
          border: `1px solid ${scrapedMatchData.success ? '#4caf50' : '#f44336'}`
        }}>
          {scrapedMatchData.success ? (
            <>
              <p style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#2e7d32',
                marginBottom: '12px',
                marginTop: '0'
              }}>
                ✅ Match Scraped Successfully
              </p>
              
              {scrapedMatchData.title && (
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #c8e6c9',
                  marginBottom: '16px'
                }}>
                  <p style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#333',
                    marginBottom: '8px',
                    marginTop: '0'
                  }}>
                    Title:
                  </p>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#555',
                    lineHeight: '1.6',
                    margin: '0'
                  }}>
                    {scrapedMatchData.title}
                  </p>
                </div>
              )}
              
              {scrapedMatchData.description && (
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #c8e6c9',
                  marginBottom: '16px'
                }}>
                  <p style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#333',
                    marginBottom: '8px',
                    marginTop: '0'
                  }}>
                    Description:
                  </p>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#555',
                    lineHeight: '1.6',
                    margin: '0'
                  }}>
                    {scrapedMatchData.description}
                  </p>
                </div>
              )}

              {scrapedMatchData.videoUrl && (
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #c8e6c9'
                }}>
                  <p style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#333',
                    marginBottom: '8px',
                    marginTop: '0'
                  }}>
                    Video:
                  </p>
                  <video 
                    controls 
                    style={{
                      width: '100%',
                      maxHeight: '500px',
                      borderRadius: '6px',
                      backgroundColor: '#000'
                    }}
                  >
                    <source src={scrapedMatchData.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <p style={{
                    fontSize: '12px',
                    color: '#888',
                    marginTop: '8px',
                    marginBottom: '0',
                    wordBreak: 'break-all',
                    fontFamily: 'monospace'
                  }}>
                    Source: {scrapedMatchData.videoUrl}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <p style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#c62828',
                marginBottom: '8px',
                marginTop: '0'
              }}>
                ❌ Error
              </p>
              <p style={{ fontSize: '14px', color: '#555', margin: '0' }}>
                {scrapedMatchData.error || 'Unknown error occurred'}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

