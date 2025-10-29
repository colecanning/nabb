'use client';

import { signOut, useSession } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.userInfo}>
          <span style={styles.welcomeText}>
            Welcome, {session.user.name || session.user.email}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={styles.signOutButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#d32f2f';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f44336';
          }}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e0e0e0',
    padding: '16px 0',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: '14px',
    color: '#666',
  },
  signOutButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600' as const,
    color: '#ffffff',
    backgroundColor: '#f44336',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

