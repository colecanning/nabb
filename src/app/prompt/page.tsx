'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';

export default function PromptPage() {
  const [promptContent, setPromptContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/get-prompt')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPromptContent(data.content);
        } else {
          setError(data.error || 'Failed to load prompt');
        }
      })
      .catch(err => {
        setError('Failed to fetch prompt: ' + err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />
      <main style={{
        padding: '50px',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '36px',
          marginBottom: '10px',
          marginTop: '0'
        }}>
          Entity Extraction Prompt
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '30px'
        }}>
          This is the default prompt template (v3) used for entity extraction.
        </p>

        {loading && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '16px', color: '#666' }}>Loading prompt...</p>
          </div>
        )}

        {error && (
          <div style={{
            padding: '20px',
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <p style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#c62828',
              marginTop: '0',
              marginBottom: '8px'
            }}>
              ❌ Error
            </p>
            <p style={{
              fontSize: '14px',
              color: '#555',
              margin: '0'
            }}>
              {error}
            </p>
          </div>
        )}

        {!loading && !error && promptContent && (
          <div style={{
            backgroundColor: '#ffffff',
            padding: '30px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <pre style={{
              backgroundColor: '#263238',
              color: '#aed581',
              padding: '24px',
              borderRadius: '6px',
              overflow: 'auto',
              fontSize: '14px',
              lineHeight: '1.6',
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              margin: '0',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {promptContent}
            </pre>
          </div>
        )}
      </main>
    </>
  );
}

