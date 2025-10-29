'use client';

import { useState } from 'react';
import Header from '../components/Header';
import InstagramReelCrawler from '../components/InstagramReelCrawler';
import { useInstagramWebhookDataStore, useFinalResultStore } from '@/lib/store';

export default function CyclePage() {
  // Get Instagram data from Zustand store
  const { videoUrl, titleText, descriptionText } = useInstagramWebhookDataStore();
  // Get final result from Zustand store
  const { finalResult, updateFinalResult } = useFinalResultStore();
  const [videoDuration, setVideoDuration] = useState('');
  const [processingDuration, setProcessingDuration] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [transcribing, setTranscribing] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ title: string; url: string; snippet: string; position: number; duration?: string | null; thumbnail?: string | null; raw?: any }> | null>(null);
  const [searching, setSearching] = useState(false);
  const [matchedResult, setMatchedResult] = useState<{ title: string; url: string; snippet: string; position: number; duration?: string | null; thumbnail?: string | null; matchScore: number; durationScore: number; titleScore: number } | null>(null);
  const [findingMatch, setFindingMatch] = useState(false);
  const [scrapedMatchData, setScrapedMatchData] = useState<{ success?: boolean; title?: string; description?: string; videoUrl?: string; error?: string; debug?: any } | null>(null);
  const [scrapingMatch, setScrapingMatch] = useState(false);

  const handleGetDuration = async () => {
    if (!videoUrl) {
      alert('Please process an Instagram link first to get a video URL');
      return;
    }

    setProcessingDuration(true);
    setVideoDuration('');

    try {
      const res = await fetch('/api/get-video-duration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await res.json();
      
      if (data.success) {
        setVideoDuration(data.duration ? `${Math.round(data.duration)}s` : '');
      } else {
        alert(`Failed to get duration: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Duration error: ${error instanceof Error ? error.message : 'Failed to get duration'}`);
    } finally {
      setProcessingDuration(false);
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
        
        // Update final result with transcription
        updateFinalResult({
          audioTranscription: data.transcription || undefined,
        });
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

  // Helper function to calculate string similarity (Levenshtein distance based)
  const calculateStringSimilarity = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    console.log('Comparing titles:', {
      ourTitle: str1,
      searchResultTitle: str2,
      ourTitleNormalized: s1,
      searchResultNormalized: s2
    });
    
    if (s1 === s2) {
      console.log('  → Exact match! Score: 1.0');
      return 1;
    }
    if (s1.length === 0 || s2.length === 0) {
      console.log('  → Empty string. Score: 0');
      return 0;
    }
    
    // Remove leading and trailing "..." from search result and extra whitespace
    const s2WithoutEllipsis = s2.replace(/^\.{3,}\s*/g, '').replace(/\s*\.{3,}$/g, '').trim();
    console.log('  → Search result without ellipsis:', s2WithoutEllipsis);
    
    // Create versions without special characters for more flexible matching
    const s1NoSpecialChars = s1.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const s2NoSpecialChars = s2WithoutEllipsis.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    console.log('  → Without special chars:', {
      ourTitle: s1NoSpecialChars,
      searchResult: s2NoSpecialChars
    });
    
    // Check if search result (without ellipsis and special chars) is a substring of our title
    if (s2NoSpecialChars.length > 0 && s1NoSpecialChars.includes(s2NoSpecialChars)) {
      console.log('  → Substring match! Search result is in our title (special chars removed). Score: 1.0');
      return 1.0; // Perfect match if truncated search result is contained in our title
    }
    
    // Check if search result (without trailing ...) is a substring of our title
    if (s2WithoutEllipsis.length > 0 && s1.includes(s2WithoutEllipsis)) {
      console.log('  → Substring match! Search result is in our title. Score: 1.0');
      return 1.0; // Perfect match if truncated search result is contained in our title
    }
    
    // Also check the reverse - if our title is in the search result
    if (s1.length > 0 && s2.includes(s1)) {
      console.log('  → Substring match! Our title is in search result. Score: 1.0');
      return 1.0;
    }
    
    // Check if one string contains the other
    if (s1.includes(s2) || s2.includes(s1)) {
      console.log('  → Contains match. Score: 0.8');
      return 0.8;
    }
    
    // Calculate Levenshtein distance
    const matrix: number[][] = [];
    
    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    const maxLength = Math.max(s1.length, s2.length);
    const distance = matrix[s2.length][s1.length];
    const score = 1 - distance / maxLength;
    console.log('  → Levenshtein distance calculation. Score:', score.toFixed(3));
    return score;
  };

  // Helper function to parse duration string to seconds
  const parseDurationToSeconds = (duration: string): number | null => {
    if (!duration) return null;
    
    // Handle formats like "45s", "1:23", "2:34:56", etc.
    const secondsMatch = duration.match(/^(\d+)s?$/i);
    if (secondsMatch) {
      return parseInt(secondsMatch[1]);
    }
    
    const timeMatch = duration.match(/^(?:(\d+):)?(\d+):(\d+)$/);
    if (timeMatch) {
      const hours = timeMatch[1] ? parseInt(timeMatch[1]) : 0;
      const minutes = parseInt(timeMatch[2]);
      const seconds = parseInt(timeMatch[3]);
      return hours * 3600 + minutes * 60 + seconds;
    }
    
    const minutesMatch = duration.match(/^(\d+):(\d+)$/);
    if (minutesMatch) {
      const minutes = parseInt(minutesMatch[1]);
      const seconds = parseInt(minutesMatch[2]);
      return minutes * 60 + seconds;
    }
    
    return null;
  };

  const handleScrapeMatch = async () => {
    if (!matchedResult) {
      alert('Please find a match first');
      return;
    }

    setScrapingMatch(true);
    setScrapedMatchData(null);

    try {
      const res = await fetch('/api/crawl-instagram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: matchedResult.url }),
      });

      const data = await res.json();
      setScrapedMatchData(data);
      
      // Update final result with matched Instagram URL if successful
      if (data.success) {
        updateFinalResult({
          matchedInstagramUrl: matchedResult.url
        });
      }
    } catch (error) {
      setScrapedMatchData({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape matched URL',
      });
    } finally {
      setScrapingMatch(false);
    }
  };

  const handleFindMatch = async () => {
    if (!searchResults || searchResults.length === 0) {
      alert('Please search for Instagram reels first');
      return;
    }

    setFindingMatch(true);
    setMatchedResult(null);

    try {
      console.log('=== Starting Match Process ===');
      console.log('Our video duration:', videoDuration);
      console.log('Our title:', titleText);
      console.log('Number of search results:', searchResults.length);
      
      // Parse our video duration
      const ourDurationSeconds = parseDurationToSeconds(videoDuration);
      console.log('Our duration in seconds:', ourDurationSeconds);
      
      let bestMatch: typeof matchedResult = null;
      let bestScore = 0;

      for (const result of searchResults) {
        console.log('\n--- Checking result:', result.title);
        let score = 0;
        let durationScore = 0;
        let titleScore = 0;
        
        // Duration matching (weight: 0.6)
        if (ourDurationSeconds && result.duration) {
          const resultDurationSeconds = parseDurationToSeconds(result.duration);
          console.log('Duration comparison:', {
            ours: ourDurationSeconds,
            theirs: resultDurationSeconds,
            theirsDurationString: result.duration
          });
          if (resultDurationSeconds) {
            const durationDiff = Math.abs(ourDurationSeconds - resultDurationSeconds);
            const durationSimilarity = Math.max(0, 1 - (durationDiff / Math.max(ourDurationSeconds, resultDurationSeconds)));
            durationScore = durationSimilarity;
            score += durationSimilarity * 0.6;
            console.log('Duration score:', durationSimilarity.toFixed(3), '(weighted:', (durationSimilarity * 0.6).toFixed(3) + ')');
          }
        } else {
          console.log('Duration matching skipped:', { ourDuration: ourDurationSeconds, theirDuration: result.duration });
        }
        
        // Title matching (weight: 0.4) - using snippet from SERP API
        if (titleText && result.snippet) {
          console.log('\nTitle matching (using snippet):');
          const titleSimilarity = calculateStringSimilarity(titleText, result.snippet);
          titleScore = titleSimilarity;
          score += titleSimilarity * 0.4;
          console.log('Title score:', titleSimilarity.toFixed(3), '(weighted:', (titleSimilarity * 0.4).toFixed(3) + ')');
        } else {
          console.log('Title matching skipped:', { ourTitle: titleText, theirSnippet: result.snippet });
        }
        
        console.log('Total score for this result:', score.toFixed(3));
        
        if (score > bestScore) {
          console.log('🎯 New best match!');
          bestScore = score;
          bestMatch = {
            ...result,
            matchScore: score,
            durationScore: durationScore,
            titleScore: titleScore
          };
        }
      }

      console.log('\n=== Match Process Complete ===');
      console.log('Best score:', bestScore.toFixed(3));
      console.log('Best match:', bestMatch?.title);

      // Only show match if score is above threshold (e.g., 0.5)
      if (bestMatch && bestScore > 0.5) {
        console.log('✅ Match found and displayed!');
        setMatchedResult(bestMatch);
      } else {
        console.log('❌ No match above threshold (0.5)');
        alert('No good match found. Try adjusting the search or check if the video exists in the results.');
      }
    } catch (error) {
      console.error('Match error:', error);
      alert(`Match error: ${error instanceof Error ? error.message : 'Failed to find match'}`);
    } finally {
      setFindingMatch(false);
    }
  };

  return (
    <>
      <Header />
      <main style={{ 
        padding: '50px', 
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{ fontSize: '36px', marginBottom: '20px' }}>Instagram Reel Crawler</h1>
      
        <InstagramReelCrawler />

      {/* Get Audio Length Section */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginTop: '30px'
      }}>
        <h2 style={{ fontSize: '28px', marginTop: '0', marginBottom: '20px' }}>Get Audio Length</h2>
        
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
            placeholder="Click 'Process' to get video duration"
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
          type="button"
          onClick={handleGetDuration}
          disabled={processingDuration || !videoUrl}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '18px',
            fontWeight: '600',
            color: '#ffffff',
            backgroundColor: processingDuration || !videoUrl ? '#9e9e9e' : '#ff9800',
            border: 'none',
            borderRadius: '6px',
            cursor: processingDuration || !videoUrl ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            if (!processingDuration && videoUrl) e.currentTarget.style.backgroundColor = '#f57c00';
          }}
          onMouseLeave={(e) => {
            if (!processingDuration && videoUrl) e.currentTarget.style.backgroundColor = '#ff9800';
          }}
        >
          {processingDuration ? '⏱️ Processing...' : '⏱️ Process'}
        </button>

        {!videoUrl && (
          <p style={{
            fontSize: '14px',
            color: '#666',
            fontStyle: 'italic',
            marginTop: '12px',
            marginBottom: '0'
          }}>
            Process an Instagram link above to enable duration extraction
          </p>
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

      {/* Scrape Match Section */}
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

      {/* Result Section */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginTop: '30px'
      }}>
        <h2 style={{ fontSize: '28px', marginTop: '0', marginBottom: '20px' }}>Result</h2>
        
        {Object.keys(finalResult).length > 0 ? (
          <pre style={{
            backgroundColor: '#263238',
            color: '#aed581',
            padding: '20px',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            margin: '0'
          }}>
            {JSON.stringify(finalResult, null, 2)}
          </pre>
        ) : (
          <p style={{
            fontSize: '14px',
            color: '#666',
            fontStyle: 'italic',
            margin: '0'
          }}>
            Process an Instagram link above to see the final result
          </p>
        )}
      </div>
    </main>
    </>
  );
}

