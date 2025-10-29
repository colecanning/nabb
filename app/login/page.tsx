'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  if (status === 'loading') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Instagram Message Sender</h1>
        <p style={styles.subtitle}>Sign in to access the application</p>
        
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          style={styles.googleButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#357ae8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4285f4';
          }}
        >
          <svg style={styles.googleIcon} viewBox="0 0 24 24">
            <path
              fill="#ffffff"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#ffffff"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#ffffff"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#ffffff"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>

        <div style={styles.notice}>
          <p style={styles.noticeText}>
            ⚠️ Access is restricted to authorized test users only. Contact your administrator to request access.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '60px 40px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as const,
    maxWidth: '400px',
    width: '100%',
  },
  title: {
    fontSize: '28px',
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: '12px',
    marginTop: '0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '40px',
    marginTop: '0',
  },
  googleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600' as const,
    color: '#ffffff',
    backgroundColor: '#4285f4',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    gap: '12px',
  },
  googleIcon: {
    width: '20px',
    height: '20px',
  },
  notice: {
    marginTop: '32px',
    padding: '16px',
    backgroundColor: '#fff3e0',
    borderRadius: '6px',
    border: '1px solid #ff9800',
  },
  noticeText: {
    fontSize: '14px',
    color: '#e65100',
    margin: '0',
    lineHeight: '1.5',
  },
};

