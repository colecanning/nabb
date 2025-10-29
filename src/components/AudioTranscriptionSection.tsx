'use client';

import { useInstagramWebhookDataStore, useFinalResultStore, useTranscriptionStore } from '@/lib/store';
import { transcribeVideo } from '@/lib/api';

export default function AudioTranscriptionSection() {
  const { videoUrl } = useInstagramWebhookDataStore();
  const { updateFinalResult } = useFinalResultStore();
  const { transcription, transcribing, setTranscription, setTranscribing } = useTranscriptionStore();

  const handleTranscribe = async () => {
    if (!videoUrl) {
      alert('Please process an Instagram link first to get a video URL');
      return;
    }

    setTranscribing(true);
    setTranscription('');

    try {
      const transcription = await transcribeVideo(videoUrl);
      
      if (transcription !== null) {
        setTranscription(transcription);
        
        // Update final result with transcription
        updateFinalResult({
          audioTranscription: transcription,
        });
      } else {
        alert('Failed to get transcription: Unknown error');
      }
    } catch (error) {
      alert(`Transcription error: ${error instanceof Error ? error.message : 'Failed to transcribe'}`);
    } finally {
      setTranscribing(false);
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
  );
}

