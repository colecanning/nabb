'use client';

import { useState } from 'react';
import { useInstagramWebhookDataStore, useVideoDurationStore } from '@/lib/store';
import { getVideoDuration } from '@/lib/api';

export default function AudioLengthSection() {
  const { videoUrl } = useInstagramWebhookDataStore();
  const { videoDuration, setVideoDuration } = useVideoDurationStore();
  const [processingDuration, setProcessingDuration] = useState(false);

  const handleGetDuration = async () => {
    if (!videoUrl) {
      alert('Please process an Instagram link first to get a video URL');
      return;
    }

    setProcessingDuration(true);
    setVideoDuration(null);

    try {
      const duration = await getVideoDuration(videoUrl);
      
      if (duration !== null) {
        setVideoDuration(Math.round(duration));
      } else {
        alert('Failed to get duration: Unknown error');
      }
    } catch (error) {
      alert(`Duration error: ${error instanceof Error ? error.message : 'Failed to get duration'}`);
    } finally {
      setProcessingDuration(false);
    }
  };

  // Parse duration string to seconds for manual input
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

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      setVideoDuration(null);
      return;
    }
    
    const parsed = parseDurationToSeconds(value);
    if (parsed !== null) {
      setVideoDuration(parsed);
    }
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
          value={videoDuration !== null ? `${videoDuration}s` : ''}
          onChange={handleDurationChange}
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
  );
}

