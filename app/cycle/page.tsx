'use client';

import { useState } from 'react';

export default function CyclePage() {
  // const [url, setUrl] = useState('https://www.instagram.com/reel/DCKH6RPSKDe/');
  const [url, setUrl] = useState('https://www.instagram.com/p/DPU1DUPj65g/');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; description?: string; videoUrl?: string; downloadedVideoPath?: string; videoDuration?: number | null; error?: string; debug?: any } | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [videoDuration, setVideoDuration] = useState('');
  const [transcription, setTranscription] = useState('');
  const [transcribing, setTranscribing] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ title: string; url: string; snippet: string; position: number; duration?: string | null; thumbnail?: string | null; raw?: any }> | null>(null);
  const [searching, setSearching] = useState(false);

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
      
      // Populate the state variables when successful
      if (data.success) {
        setVideoUrl(data.videoUrl || '');
        setDescriptionText(data.description || '');
        setVideoDuration(data.videoDuration ? `${Math.round(data.videoDuration)}s` : '');
      }
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : 'Failed to process URL',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTranscribe = async () => {
    if (!videoUrl) {
      alert('Please process an Instagram link first to get a video URL');
      return;
    }

    setTranscribing(true);
    setTranscription('');

    try {
      const res = await fetch('/api/transcribe-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await res.json();
      
      if (data.success) {
        setTranscription(data.transcription || '');
      } else {
        alert(`Transcription failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Transcription error: ${error instanceof Error ? error.message : 'Failed to transcribe'}`);
    } finally {
      setTranscribing(false);
    }
  };

  const handleSearch = async () => {
    if (!descriptionText) {
      alert('Please process an Instagram link first to get a description');
      return;
    }

    setSearching(true);
    setSearchResults(null);

    try {
      const res = await fetch('/api/search-serp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: descriptionText }),
      });

      const data = await res.json();
      
      if (data.success) {
        setSearchResults(data.results || []);
      } else {
        alert(`Search failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Search error: ${error instanceof Error ? error.message : 'Failed to search'}`);
    } finally {
      setSearching(false);
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

          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="videoUrl" 
              style={{ 
                display: 'block', 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#333'
              }}
            >
              Video URL
            </label>
            <input
              type="text"
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Video URL will appear here after processing"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                fontFamily: 'monospace',
                backgroundColor: '#f9f9f9'
              }}
              onFocus={(e) => e.target.style.borderColor = '#e1306c'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="descriptionText" 
              style={{ 
                display: 'block', 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#333'
              }}
            >
              Description
            </label>
            <textarea
              id="descriptionText"
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              placeholder="Description will appear here after processing"
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                fontFamily: 'system-ui, sans-serif',
                backgroundColor: '#f9f9f9',
                resize: 'vertical'
              }}
              onFocus={(e) => e.target.style.borderColor = '#e1306c'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="videoDuration" 
              style={{ 
                display: 'block', 
                fontSize: '16px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#333'
              }}
            >
              Video Duration
            </label>
            <input
              type="text"
              id="videoDuration"
              value={videoDuration}
              onChange={(e) => setVideoDuration(e.target.value)}
              placeholder="Duration will appear here after processing"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                fontFamily: 'monospace',
                backgroundColor: '#f9f9f9'
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
                  ✅ Content Extracted
                </p>
                
                {result.description && (
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
                      marginBottom: '8px'
                    }}>
                      Description:
                    </p>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#555',
                      lineHeight: '1.6',
                      margin: '0'
                    }}>
                      {result.description}
                    </p>
                  </div>
                )}

                {(result.videoUrl || result.downloadedVideoPath) && (
                  <div style={{
                    backgroundColor: '#ffffff',
                    padding: '16px',
                    borderRadius: '6px',
                    border: '1px solid #c8e6c9'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <p style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: '#333',
                          margin: '0'
                        }}>
                          Video:
                        </p>
                        {result.videoDuration && (
                          <span style={{
                            fontSize: '12px',
                            color: '#fff',
                            backgroundColor: '#000',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            fontWeight: '600'
                          }}>
                            ⏱️ {Math.round(result.videoDuration)}s
                          </span>
                        )}
                      </div>
                      {result.downloadedVideoPath && (
                        <a
                          href={result.downloadedVideoPath}
                          download
                          style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#ffffff',
                            backgroundColor: '#4caf50',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            display: 'inline-block'
                          }}
                        >
                          📥 Download
                        </a>
                      )}
                    </div>
                    <video 
                      controls 
                      style={{
                        width: '100%',
                        maxHeight: '500px',
                        borderRadius: '6px',
                        backgroundColor: '#000'
                      }}
                    >
                      <source src={result.downloadedVideoPath || result.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    {result.downloadedVideoPath && (
                      <p style={{
                        fontSize: '12px',
                        color: '#4caf50',
                        marginTop: '8px',
                        fontWeight: '600'
                      }}>
                        ✅ Video downloaded and saved locally
                      </p>
                    )}
                    <p style={{
                      fontSize: '12px',
                      color: '#888',
                      marginTop: '4px',
                      wordBreak: 'break-all',
                      fontFamily: 'monospace'
                    }}>
                      Source: {result.videoUrl}
                    </p>
                  </div>
                )}

                {!result.description && !result.videoUrl && !result.downloadedVideoPath && (
                  <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                    No content extracted
                  </p>
                )}
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

      {/* Audio Transcription Section */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginTop: '30px'
      }}>
        <h2 style={{ fontSize: '28px', marginTop: '0', marginBottom: '20px' }}>Audio Transcription</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="transcription" 
            style={{ 
              display: 'block', 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#333'
            }}
          >
            Transcription Text
          </label>
          <textarea
            id="transcription"
            value={transcription}
            onChange={(e) => setTranscription(e.target.value)}
            placeholder="Click 'Get Audio Transcript' to transcribe the video"
            rows={6}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '2px solid #e0e0e0',
              borderRadius: '6px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
              fontFamily: 'system-ui, sans-serif',
              backgroundColor: '#f9f9f9',
              resize: 'vertical'
            }}
            onFocus={(e) => e.target.style.borderColor = '#e1306c'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        <button
          type="button"
          onClick={handleTranscribe}
          disabled={transcribing || !videoUrl}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '18px',
            fontWeight: '600',
            color: '#ffffff',
            backgroundColor: transcribing || !videoUrl ? '#9e9e9e' : '#833ab4',
            border: 'none',
            borderRadius: '6px',
            cursor: transcribing || !videoUrl ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            if (!transcribing && videoUrl) e.currentTarget.style.backgroundColor = '#6a2c91';
          }}
          onMouseLeave={(e) => {
            if (!transcribing && videoUrl) e.currentTarget.style.backgroundColor = '#833ab4';
          }}
        >
          {transcribing ? '🎙️ Transcribing...' : '🎙️ Get Audio Transcript'}
        </button>

        {!videoUrl && (
          <p style={{
            fontSize: '14px',
            color: '#666',
            fontStyle: 'italic',
            marginTop: '12px',
            marginBottom: '0'
          }}>
            Process an Instagram link above to enable transcription
          </p>
        )}
      </div>

      {/* Find Instagram Reel Section */}
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

      {/* Find Match Section */}
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
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '18px',
            fontWeight: '600',
            color: '#ffffff',
            backgroundColor: '#34a853',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#2d8e47';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#34a853';
          }}
        >
          🎯 Find Match
        </button>
      </div>
    </main>
  );
}

