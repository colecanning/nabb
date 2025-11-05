'use client';

import { useState, useEffect } from 'react';
import { useFinalResultStore, useEntityExtractionStore, useCustomPromptStore } from '@/lib/store';

export default function EntityExtractionSection() {
  const { finalResult } = useFinalResultStore();
  const { entityData, extractingEntities, setEntityData, setExtractingEntities } = useEntityExtractionStore();
  const { customPrompt, setCustomPrompt } = useCustomPromptStore();
  
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [promptDraft, setPromptDraft] = useState(customPrompt);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Sync promptDraft with saved customPrompt when the section is opened
  useEffect(() => {
    if (isPromptOpen) {
      setPromptDraft(customPrompt);
    }
  }, [isPromptOpen, customPrompt]);

  const handleExtractEntities = async () => {
    if (!finalResult || Object.keys(finalResult).length === 0) {
      alert('Please complete the Instagram reel processing first');
      return;
    }

    setExtractingEntities(true);
    setEntityData(null);

    try {
      const response = await fetch('/api/ai-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...finalResult,
          customPrompt: customPrompt || undefined,
        }),
      });

      const data = await response.json();
      setEntityData(data);
    } catch (error) {
      setEntityData({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract entities',
      });
    } finally {
      setExtractingEntities(false);
    }
  };

  const handleSavePrompt = () => {
    setCustomPrompt(promptDraft);
    alert('Prompt saved successfully!');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const hasResult = finalResult && Object.keys(finalResult).length > 0;

  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: '30px',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      marginTop: '30px'
    }}>
      <h2 style={{ fontSize: '28px', marginTop: '0', marginBottom: '20px' }}>Entity Extraction</h2>
      
      <button
        type="button"
        onClick={handleExtractEntities}
        disabled={extractingEntities || !hasResult}
        style={{
          width: '100%',
          padding: '14px',
          fontSize: '18px',
          fontWeight: '600',
          color: '#ffffff',
          backgroundColor: extractingEntities || !hasResult ? '#9e9e9e' : '#2196f3',
          border: 'none',
          borderRadius: '6px',
          cursor: extractingEntities || !hasResult ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}
        onMouseEnter={(e) => {
          if (!extractingEntities && hasResult) {
            e.currentTarget.style.backgroundColor = '#1976d2';
          }
        }}
        onMouseLeave={(e) => {
          if (!extractingEntities && hasResult) {
            e.currentTarget.style.backgroundColor = '#2196f3';
          }
        }}
      >
        {extractingEntities ? '🔄 Extracting...' : '🤖 Extract Entities'}
      </button>

      {!hasResult && (
        <p style={{
          fontSize: '14px',
          color: '#666',
          fontStyle: 'italic',
          marginTop: '12px',
          marginBottom: '0'
        }}>
          Complete the Instagram reel processing first to enable entity extraction
        </p>
      )}

      {/* Custom Prompt Editor */}
      <div style={{ marginTop: '20px' }}>
        <button
          type="button"
          onClick={() => setIsPromptOpen(!isPromptOpen)}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#1976d2',
            backgroundColor: '#ffffff',
            border: '1px solid #2196f3',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e3f2fd';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
        >
          <span>⚙️ Custom Prompt Template</span>
          <span style={{ fontSize: '20px' }}>{isPromptOpen ? '▼' : '▶'}</span>
        </button>

        {isPromptOpen && (
          <div style={{
            marginTop: '12px',
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '6px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#555',
                margin: '0',
                fontStyle: 'italic'
              }}>
                Customize the prompt template for entity extraction. Leave empty to use default.
              </p>
              <button
                type="button"
                onClick={toggleFullscreen}
                style={{
                  padding: '6px 12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1976d2',
                  backgroundColor: '#ffffff',
                  border: '1px solid #2196f3',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginLeft: '8px',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e3f2fd';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                {isFullscreen ? '↙️ Exit Fullscreen' : '↗️ Fullscreen'}
              </button>
            </div>

            <textarea
              value={promptDraft}
              onChange={(e) => setPromptDraft(e.target.value)}
              placeholder="Enter your custom prompt template here... Use JSON_INPUT as a placeholder for the input data."
              style={{
                width: '100%',
                minHeight: isFullscreen ? 'calc(100vh - 200px)' : '300px',
                padding: '12px',
                fontSize: '14px',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                lineHeight: '1.6',
                border: '1px solid #ccc',
                borderRadius: '4px',
                resize: 'vertical',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff'
              }}
            />

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '12px'
            }}>
              <button
                type="button"
                onClick={handleSavePrompt}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  backgroundColor: '#4caf50',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#45a049';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#4caf50';
                }}
              >
                💾 Save Prompt
              </button>
              <button
                type="button"
                onClick={() => {
                  setPromptDraft('');
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  backgroundColor: '#f44336',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#da190b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f44336';
                }}
              >
                🗑️ Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {entityData && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          borderRadius: '6px',
          backgroundColor: entityData.success ? '#e3f2fd' : '#ffebee',
          border: `1px solid ${entityData.success ? '#2196f3' : '#f44336'}`
        }}>
          {entityData.success ? (
            <>
              <p style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#1565c0',
                marginBottom: '12px',
                marginTop: '0'
              }}>
                ✅ Entities Extracted Successfully
              </p>
              
              {entityData.entities && entityData.entities.length > 0 ? (
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #bbdefb',
                  marginBottom: '16px'
                }}>
                  <p style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#333',
                    marginBottom: '12px',
                    marginTop: '0'
                  }}>
                    Entities Found:
                  </p>
                  {entityData.entities.map((entity, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: '#f5f5f5',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: index < entityData.entities!.length - 1 ? '12px' : '0',
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#333',
                          marginRight: '8px'
                        }}>
                          {entity.name}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#ffffff',
                          backgroundColor: '#2196f3',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          textTransform: 'uppercase'
                        }}>
                          {entity.type}
                        </span>
                      </div>
                      {entity.description && (
                        <p style={{
                          fontSize: '14px',
                          color: '#444',
                          margin: '0',
                          marginBottom: '6px',
                          lineHeight: '1.4',
                          fontWeight: '500'
                        }}>
                          {entity.description}
                        </p>
                      )}
                      <p style={{
                        fontSize: '13px',
                        color: '#666',
                        margin: '0',
                        lineHeight: '1.4',
                        fontStyle: 'italic'
                      }}>
                        {entity.reason}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #bbdefb',
                  marginBottom: '16px'
                }}>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#666',
                    fontStyle: 'italic',
                    margin: '0'
                  }}>
                    No entities were found in this content.
                  </p>
                </div>
              )}

              {entityData.response && (
                <details style={{ marginTop: '12px' }}>
                  <summary style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1565c0',
                    cursor: 'pointer',
                    padding: '8px',
                    backgroundColor: '#ffffff',
                    borderRadius: '6px',
                    border: '1px solid #bbdefb'
                  }}>
                    View Raw AI Response
                  </summary>
                  <pre style={{
                    backgroundColor: '#263238',
                    color: '#aed581',
                    padding: '16px',
                    borderRadius: '6px',
                    overflow: 'auto',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                    marginTop: '8px',
                    marginBottom: '0'
                  }}>
                    {entityData.response}
                  </pre>
                </details>
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
                {entityData.error || 'Unknown error occurred'}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

