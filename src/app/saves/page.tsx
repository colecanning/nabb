import Link from 'next/link';
import { supabase } from '@/lib/backend/supabase';
import Header from '@/components/Header';

async function getSaves() {
  const { data, error } = await supabase
    .from('saves')
    .select('id, created_at, instagram_user_id, input, output')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching saves:', error);
    return [];
  }

  return data || [];
}

export default async function SavesListPage() {
  const saves = await getSaves();

  return (
    <>
      <Header />
      <main style={{
        padding: '50px',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{ fontSize: '36px', marginBottom: '20px' }}>Saved Webhooks</h1>

        {saves.length === 0 ? (
          <div style={{
            backgroundColor: '#fff3e0',
            padding: '40px',
            borderRadius: '8px',
            border: '1px solid #ffb74d',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '16px',
              color: '#e65100',
              margin: '0',
              fontStyle: 'italic'
            }}>
              No saves found. Process an Instagram link to create your first save.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {saves.map((save) => {
              const input = save.input as any;
              const output = save.output as any;
              const hasOutput = !!output;

              return (
                <Link
                  key={save.id}
                  href={`/saves/${save.id}`}
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '24px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h2 style={{
                        fontSize: '20px',
                        marginTop: '0',
                        marginBottom: '8px',
                        color: '#1976d2'
                      }}>
                        {input?.title || 'Untitled'}
                      </h2>
                      <p style={{
                        fontSize: '14px',
                        color: '#666',
                        marginTop: '0',
                        marginBottom: '0'
                      }}>
                        {new Date(save.created_at).toLocaleString()}
                      </p>
                    </div>
                    
                    <div style={{
                      backgroundColor: hasOutput ? '#4CAF50' : '#ff9800',
                      color: 'white',
                      padding: '6px 14px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      textTransform: 'uppercase'
                    }}>
                      {hasOutput ? 'Complete' : 'Processing'}
                    </div>
                  </div>

                  {save.instagram_user_id && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px'
                    }}>
                      <span style={{
                        fontSize: '13px',
                        color: '#888',
                        fontWeight: '500'
                      }}>
                        Instagram:
                      </span>
                      <span style={{
                        fontSize: '13px',
                        color: '#666'
                      }}>
                        @{save.instagram_user_id}
                      </span>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    fontSize: '13px',
                    color: '#888'
                  }}>
                    <span>
                      ID: <code style={{
                        backgroundColor: '#f5f5f5',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '12px'
                      }}>
                        {save.id.substring(0, 8)}...
                      </code>
                    </span>
                    {hasOutput && output.result?.entities && (
                      <span>
                        • {output.result.entities.length} {output.result.entities.length === 1 ? 'entity' : 'entities'}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <Link
            href="/cycle"
            style={{
              display: 'inline-block',
              backgroundColor: '#2196F3',
              color: 'white',
              padding: '12px 24px',
              fontSize: '16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
          >
            Process New Instagram Link
          </Link>
        </div>
      </main>
    </>
  );
}

