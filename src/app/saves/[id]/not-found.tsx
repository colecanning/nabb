import Header from '@/components/Header';
import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <Header />
      <main style={{
        padding: '50px',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#ffebee',
          padding: '40px',
          borderRadius: '8px',
          border: '1px solid #ef5350',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{
            fontSize: '48px',
            marginTop: '0',
            marginBottom: '16px',
            color: '#c62828'
          }}>
            404
          </h1>
          <h2 style={{
            fontSize: '24px',
            marginTop: '0',
            marginBottom: '16px',
            color: '#c62828'
          }}>
            Save Not Found
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#666',
            marginBottom: '24px'
          }}>
            The save with this ID could not be found in the database.
          </p>
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
            Go to Cycle Page
          </Link>
        </div>
      </main>
    </>
  );
}

