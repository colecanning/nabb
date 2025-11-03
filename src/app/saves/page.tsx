import Link from 'next/link';
import { supabase } from '@/lib/backend/supabase';
import Header from '@/components/Header';
import SaveCard from '@/components/SaveCard';

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
            {saves.map((save) => (
              <SaveCard key={save.id} save={save} />
            ))}
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

