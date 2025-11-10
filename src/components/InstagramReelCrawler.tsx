'use client';

import { useState } from 'react';
import { useEntityExtractionStore, useFinalResultStore, useInstagramWebhookDataStore, useMatchResultsStore, useSearchResultsStore, useTranscriptionStore, useVideoDurationStore, useCustomPromptStore } from '@/lib/store';
import { crawlInstagram } from '@/lib/api';
import { TestWebhookRespose, WebhookOutput } from '@/app/api/test-webhook/route';
import { InstagramCrawlResult } from '@/lib/backend/instagram-crawler';
import testData from './testData.json';

export default function InstagramReelCrawler() {
  // const [url, setUrl] = useState('https://www.instagram.com/reel/DCKH6RPSKDe/');
  const [url, setUrl] = useState('https://www.instagram.com/p/DPU1DUPj65g/');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InstagramCrawlResult | null>(null);
  const [saveId, setSaveId] = useState<string | null>(null);
  
  // Get state and actions from Zustand store
  const { videoUrl, titleText, descriptionText, authorText, setVideoUrl, setTitleText, setDescriptionText, setAuthorText, setInstagramData } = useInstagramWebhookDataStore();
  const { updateFinalResult, setFinalResult } = useFinalResultStore();
  const { setVideoDuration } = useVideoDurationStore();
  const { setTranscription } = useTranscriptionStore();
  const { setSearchResults } = useSearchResultsStore();
  const { setMatchedResult } = useMatchResultsStore();
  const { setEntityData } = useEntityExtractionStore();
  const { customPrompt } = useCustomPromptStore();

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const data = await crawlInstagram(url);
      setResult(data);
      
      // Populate the state variables when successful
      if (data.success) {
        // Update Zustand store
        setInstagramData({
          videoUrl: data.videoUrl,
          title: data.title,
          description: data.description,
          author: data.author,
        });
        
        updateFinalResult({
          result: {
            videoUrl: data.videoUrl || null,
            title: data.title || null,
          }
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process URL',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestWebhook = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url,
          customPrompt: customPrompt || undefined,
        }),
      });

      const data = await response.json() as TestWebhookRespose;
      if (!data.success) {
        throw new Error("Failed request")
      }

      setSaveId(data.saveId);
      setResult(data.instagramCrawlResult);
      
      // Populate the state variables when successful
      if (data.instagramCrawlResult.success) {
        // Update Zustand store
        setInstagramData({
          videoUrl: data.instagramCrawlResult.videoUrl,
          title: data.instagramCrawlResult.title,
          description: data.instagramCrawlResult.description,
          author: data.instagramCrawlResult.author,
        });
        
        setVideoDuration(data.result.result?.videoDuration || null) 
        
        setTranscription(data.result.result?.videoTranscription || null);

        setSearchResults(data.result.debug?.searchResults || null);

        setMatchedResult(data.result.debug?.bestMatch?.matchedResult || null);

        setEntityData(data.result.debug?.entityExtractionResult || null);
        
        updateFinalResult(
          data.result
          // videoUrl: data.instagramCrawlResult.videoUrl || undefined,
          // title: data.instagramCrawlResult.title || undefined,
          // description: data.description || undefined,
        );
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test webhook',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUseTestData = async () => {
    setFinalResult(testData as WebhookOutput);

  };

  return (
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
            htmlFor="titleText" 
            style={{ 
              display: 'block', 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#333'
            }}
          >
            Title
          </label>
          <input
            type="text"
            id="titleText"
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
            placeholder="Title will appear here after processing"
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
              backgroundColor: '#f9f9f9'
            }}
            onFocus={(e) => e.target.style.borderColor = '#e1306c'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="authorText" 
            style={{ 
              display: 'block', 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#333'
            }}
          >
            Author
          </label>
          <input
            type="text"
            id="authorText"
            value={authorText}
            onChange={(e) => setAuthorText(e.target.value)}
            placeholder="Author will appear here after processing"
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
            Description (not included in instagram message metadata)
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

        <div style={{
          display: 'flex',
          gap: '12px',
          width: '100%'
        }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: '1',
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

          <button
            type="button"
            disabled={loading}
            onClick={handleTestWebhook}
            style={{
              flex: '1',
              padding: '14px',
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: loading ? '#9e9e9e' : '#0095f6',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#0077cc';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#0095f6';
            }}
          >
            {loading ? 'Processing...' : '🔗 Test Webhook'}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleUseTestData}
            style={{
              flex: '1',
              padding: '14px',
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: loading ? '#9e9e9e' : '#0095f6',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#0077cc';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#0095f6';
            }}
          >
            {loading ? 'Processing...' : 'Use Test Data'}
          </button>
        </div>

        {saveId && (
          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
              Save ID: {saveId}
            </p>
            <button
              onClick={() => window.open(`/view/${saveId}`, '_blank')}
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              View
            </button>
          </div>
        )}
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
              
              {result.author && (
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
                    Author:
                  </p>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#555',
                    lineHeight: '1.6',
                    margin: '0',
                    fontFamily: 'monospace'
                  }}>
                    @{result.author}
                  </p>
                </div>
              )}

              {result.title && (
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
                    Title:
                  </p>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#555',
                    lineHeight: '1.6',
                    margin: '0'
                  }}>
                    {result.title}
                  </p>
                </div>
              )}
              
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

              {result.videoUrl && (
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
                    marginBottom: '8px'
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
                    <source src={result.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <p style={{
                    fontSize: '12px',
                    color: '#888',
                    marginTop: '8px',
                    wordBreak: 'break-all',
                    fontFamily: 'monospace'
                  }}>
                    Source: {result.videoUrl}
                  </p>
                </div>
              )}

              {!result.author && !result.title && !result.description && !result.videoUrl && (
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
  );
}

