'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/login' })}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minHeight: 44,
        padding: '10px 12px',
        borderRadius: 10,
        color: '#666',
        fontSize: 14,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 16 }}>🚪</span>
      <span>Logout</span>
    </button>
  );
}