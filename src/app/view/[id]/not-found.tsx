export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '50px 20px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '60px 40px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06)'
      }}>
        <h1 style={{
          fontSize: '72px',
          marginTop: '0',
          marginBottom: '20px',
          color: '#dc3545'
        }}>
          404
        </h1>
        <h2 style={{
          fontSize: '28px',
          marginTop: '0',
          marginBottom: '16px',
          color: '#212529'
        }}>
          Save Not Found
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#6c757d',
          marginBottom: '32px',
          lineHeight: '1.6'
        }}>
          The save you're looking for doesn't exist or may have been deleted.
        </p>
        <a
          href="/saves"
          style={{
            display: 'inline-block',
            backgroundColor: '#007bff',
            color: '#ffffff',
            padding: '12px 32px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
        >
          View All Saves
        </a>
      </div>
    </main>
  );
}

