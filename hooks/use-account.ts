'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

type User = { id: string; name: string; provider?: 'discord' | 'google' | 'email'; email?: string };
export function useAccount() {
  const client = useQueryClient();
  const [loggingOut, setLoggingOut] = useState(false);
  const query = useQuery<{ user: User | null }>({ queryKey: ['cloudy-account'], queryFn: async () => {
    const response = await fetch('/api/account', { cache: 'no-store' });
    if (!response.ok) throw new Error('Unable to load account');
    return response.json();
  }, staleTime: 60000, retry: 1 });
  async function logout() {
    setLoggingOut(true);
    try {
      const response = await fetch('/api/account', { method: 'POST' });
      if (!response.ok) throw new Error('Unable to sign out');
      client.setQueryData(['cloudy-account'], { user: null });
    } finally { setLoggingOut(false); }
  }
  return { user: query.data?.user || null, pending: query.isPending, error: query.isError, logout, loggingOut };
}
