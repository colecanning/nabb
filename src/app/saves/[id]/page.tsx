import { notFound } from 'next/navigation';
import { supabase } from '@/lib/backend/supabase';
import Header from '@/components/Header';
import { EntityUrl } from '@/lib/store';

interface SavePageProps {
  params: {
    id: string;
  };
}

async function getSave(id: string) {
  const { data, error } = await supabase
    .from('saves')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function SavePage({ params }: SavePageProps) {
  const save = await getSave(params.id);

  if (!save) {
    notFound();
  }

  return (
    <>
      <Header />
      <main style={{
        padding: '50px',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{ fontSize: '36px', marginBottom: '20px' }}>Save Details</h1>

        {/* Metadata Section */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '30px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px'
        }}>
          <h2 style={{ fontSize: '24px', marginTop: '0', marginBottom: '20px' }}>
            Metadata
          </h2>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <strong style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>
                ID:
              </strong>
              <code style={{
                backgroundColor: '#f5f5f5',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace',
                display: 'block'
              }}>
                {save.id}
              </code>
            </div>

            <div>
              <strong style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>
                Created At:
              </strong>
              <span style={{ fontSize: '16px' }}>
                {new Date(save.created_at).toLocaleString()}
              </span>
            </div>

            {save.instagram_user_id && (
              <div>
                <strong style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>
                  Instagram User ID:
                </strong>
                <span style={{ fontSize: '16px' }}>
                  {save.instagram_user_id}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Input Section */}
        {save.input && (
          <div style={{
            backgroundColor: '#ffffff',
            padding: '30px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            marginBottom: '30px'
          }}>
            <h2 style={{ fontSize: '24px', marginTop: '0', marginBottom: '20px' }}>
              Input
            </h2>
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
              {JSON.stringify(save.input, null, 2)}
            </pre>
          </div>
        )}

        {/* Instagram Reel Section */}
        {save.output && (save.output as any)?.debug?.bestMatchInstagramCrawlResult && (
          <div style={{
            backgroundColor: '#ffffff',
            padding: '30px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            marginBottom: '30px'
          }}>
            <h2 style={{ fontSize: '24px', marginTop: '0', marginBottom: '20px' }}>
              Instagram Reel
            </h2>
            
            {(() => {
              const reel = (save.output as any).debug.bestMatchInstagramCrawlResult;
              return (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {reel.title && (
                    <div>
                      <strong style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>
                        Title:
                      </strong>
                      <p style={{ fontSize: '16px', marginTop: '0', marginBottom: '0', lineHeight: '1.5' }}>
                        {reel.title}
                      </p>
                    </div>
                  )}

                  {reel.author && (
                    <div>
                      <strong style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>
                        Author:
                      </strong>
                      <p style={{ fontSize: '16px', marginTop: '0', marginBottom: '0' }}>
                        @{reel.author}
                      </p>
                    </div>
                  )}

                  {reel.description && (
                    <div>
                      <strong style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>
                        Description:
                      </strong>
                      <p style={{ fontSize: '14px', marginTop: '0', marginBottom: '0', lineHeight: '1.5', color: '#555' }}>
                        {reel.description}
                      </p>
                    </div>
                  )}

                  {reel.videoUrl && (
                    <div>
                      <strong style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '8px' }}>
                        Video:
                      </strong>
                      <video
                        controls
                        style={{
                          width: '100%',
                          maxWidth: '500px',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        <source src={reel.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}

                  {reel.url && (
                    <div>
                      <strong style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '4px' }}>
                        Instagram URL:
                      </strong>
                      <a
                        href={reel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#1976d2',
                          textDecoration: 'none',
                          fontSize: '14px',
                          wordBreak: 'break-all'
                        }}
                      >
                        {reel.url}
                      </a>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Entities Section */}
        {save.output && (save.output as any)?.result?.entities && (save.output as any).result.entities.length > 0 && (
          <div style={{
            backgroundColor: '#ffffff',
            padding: '30px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            marginBottom: '30px'
          }}>
            <h2 style={{ fontSize: '24px', marginTop: '0', marginBottom: '20px' }}>
              Entities ({(save.output as any).result.entities.length})
            </h2>
            
            {(save.output as any).result.entities.map((entity: any, index: number) => (
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
                  <h3 style={{
                    fontSize: '18px',
                    marginTop: '0',
                    marginBottom: '4px',
                    color: '#1976d2'
                  }}>
                    {entity.name}
                  </h3>
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
                    <strong style={{ fontSize: '14px', color: '#333' }}>
                      URLs ({entity.urls.length}):
                    </strong>
                    <ul style={{
                      marginTop: '8px',
                      marginBottom: '0',
                      paddingLeft: '20px',
                      listStyleType: 'disc'
                    }}>
                      {entity.urls.map((url: EntityUrl, urlIndex: number) => (
                        <li key={urlIndex} style={{ marginBottom: '4px' }}>
                          <a
                            href={url.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#1976d2',
                              textDecoration: 'none',
                              fontSize: '13px',
                              wordBreak: 'break-all'
                            }}
                          >
                            {url.title || url.url}
                          </a>
                        </li>
                      ))}
                    </ul>
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
        )}

        {/* Output Section */}
        {save.output ? (
          <div style={{
            backgroundColor: '#ffffff',
            padding: '30px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            marginBottom: '30px'
          }}>
            <h2 style={{ fontSize: '24px', marginTop: '0', marginBottom: '20px' }}>
              Output
            </h2>
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
              {JSON.stringify(save.output, null, 2)}
            </pre>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#fff3e0',
            padding: '30px',
            borderRadius: '8px',
            border: '1px solid #ffb74d',
            marginBottom: '30px'
          }}>
            <p style={{
              fontSize: '16px',
              color: '#e65100',
              margin: '0',
              fontStyle: 'italic'
            }}>
              No output data available yet. Processing may still be in progress.
            </p>
          </div>
        )}
      </main>
    </>
  );
}

