'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAccount } from './use-account';
import type { Favorite } from '@/lib/account-favorites';

export function useFavorites() {
  const { user } = useAccount();
  const client = useQueryClient();
  const key = ['cloudy-favorites', user?.provider, user?.id];
  const query = useQuery<{ favorites: Favorite[] }>({
    queryKey: key, enabled: !!user,
    queryFn: async () => {
      const response = await fetch('/api/account/favorites', { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not load favorites.');
      return response.json();
    },
  });
  async function toggle(favorite: Favorite) {
    if (!user) throw new Error('Sign in to save favorites.');
    const response = await fetch('/api/account/favorites', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(favorite), cache: 'no-store',
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not save favorites.');
    client.setQueryData(key, result);
  }
  return { user, favorites: query.data?.favorites || [], pending: query.isPending, error: query.isError, toggle };
}
