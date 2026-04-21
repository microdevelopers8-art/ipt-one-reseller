'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      try {
        // We can call an API to clear the cookie, or do it on the client if it's not httpOnly (but it usually is)
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) {
          router.push('/login');
          router.refresh();
        }
      } catch (err) {
        console.error('Logout failed', err);
        // Fallback: just redirect
        router.push('/login');
      }
    }
    logout();
  }, [router]);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-base)',
      color: 'var(--text-secondary)',
      gap: '12px'
    }}>
      <div className="spinner"></div>
      <span>Signing out of IPT One...</span>
    </div>
  );
}
