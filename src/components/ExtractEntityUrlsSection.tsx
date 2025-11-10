'use client';

import { useState } from 'react';
import { useFinalResultStore, Entity } from '@/lib/store';

export default function ExtractEntityUrlsSection() {
  const { finalResult, updateFinalResult } = useFinalResultStore();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const entities = finalResult?.result?.entities || [];

  const extractUrls = async () => {
    if (entities.length === 0) {
      setError('No entities found in final result');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: entities.length });

    const updatedEntities: Entity[] = [];

    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      setProgress({ current: i + 1, total: entities.length });

      try {
        const response = await fetch('/api/search-entity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entity),
        });

        const data = await response.json();

        if (data.success && data.entity) {
          updatedEntities.push(data.entity);
        } else {
          // Keep original entity if search failed
          updatedEntities.push(entity);
          console.error(`Failed to fetch URLs for entity "${entity.name}":`, data.error);
        }
      } catch (err) {
        // Keep original entity on error
        updatedEntities.push(entity);
        console.error(`Error fetching URLs for entity "${entity.name}":`, err);
      }
    }

    // Update the store with entities that now have URLs
    updateFinalResult({
      result: {
        entities: updatedEntities
      }
    });

    setLoading(false);
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
      <h2 style={{ fontSize: '28px', marginTop: '0', marginBottom: '20px' }}>
        Extract Entity URLs
      </h2>

      {entities.length > 0 ? (
        <>
          <button
            onClick={extractUrls}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#cccccc' : '#4CAF50',
              color: 'white',
              padding: '12px 24px',
              fontSize: '16px',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? `Extracting URLs... (${progress.current}/${progress.total})` : 'Extract URLs for All Entities'}
          </button>

          {error && (
            <div style={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '20px', marginTop: '0', marginBottom: '16px' }}>
              Entities ({entities.length})
            </h3>
            
            {entities.map((entity, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '16px',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  border: '1px solid #e0e0e0'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <h4 style={{
                    fontSize: '18px',
                    marginTop: '0',
                    marginBottom: '4px',
                    color: '#1976d2'
                  }}>
                    {entity.name}
                  </h4>
                  <span style={{
                    backgroundColor: '#2196F3',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    textTransform: 'capitalize'
                  }}>
                    {entity.type}
                  </span>
                </div>

                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  marginTop: '0',
                  marginBottom: '8px',
                  lineHeight: '1.5'
                }}>
                  {entity.description}
                </p>

                <p style={{
                  fontSize: '13px',
                  color: '#888',
                  marginTop: '0',
                  marginBottom: '12px',
                  fontStyle: 'italic',
                  lineHeight: '1.4'
                }}>
                  <strong>Reason:</strong> {entity.reason}
                </p>

                {entity.urls && entity.urls.length > 0 ? (
                  <div style={{
                    backgroundColor: '#ffffff',
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}>
                    <strong style={{ fontSize: '14px', color: '#333', marginBottom: '12px', display: 'block' }}>
                      URLs ({entity.urls.length}):
                    </strong>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      {entity.urls.map((entityUrl, urlIndex) => (
                        <div key={urlIndex} style={{
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          padding: '12px',
                          backgroundColor: '#fafafa',
                          display: 'flex',
                          gap: '12px'
                        }}>
                          {entityUrl.image && (
                            <img 
                              src={entityUrl.image} 
                              alt={entityUrl.title || 'Preview'}
                              style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                flexShrink: 0
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <a
                              href={entityUrl.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: '#1976d2',
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: '600',
                                display: 'block',
                                marginBottom: '4px'
                              }}
                            >
                              {entityUrl.title || entityUrl.url}
                            </a>
                            {entityUrl.siteName && (
                              <div style={{
                                fontSize: '12px',
                                color: '#666',
                                marginBottom: '4px'
                              }}>
                                {entityUrl.siteName}
                              </div>
                            )}
                            {entityUrl.description && (
                              <div style={{
                                fontSize: '12px',
                                color: '#888',
                                lineHeight: '1.4',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>
                                {entityUrl.description}
                              </div>
                            )}
                            <div style={{
                              fontSize: '11px',
                              color: '#999',
                              marginTop: '4px',
                              wordBreak: 'break-all'
                            }}>
                              {entityUrl.url}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: '#fff3e0',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#e65100'
                  }}>
                    No URLs extracted yet
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p style={{
          fontSize: '14px',
          color: '#666',
          fontStyle: 'italic',
          margin: '0'
        }}>
          No entities available. Process an Instagram link to extract entities first.
        </p>
      )}
    </div>
  );
}

