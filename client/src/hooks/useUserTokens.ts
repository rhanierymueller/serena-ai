import { useEffect, useState, useCallback } from 'react';
import { getUser } from '../services/userSession';
import { BASE_URL } from '../config';

export function useUserTokens() {
  const [tokens, setTokens] = useState<{ total: number; used: number }>({ total: 0, used: 0 });

  const fetchTokens = useCallback(async () => {
    const user = getUser();
    if (!user?.id) return;

    const res = await fetch(`${BASE_URL}/api/tokens/${user.id}`);
    const data = await res.json();
    setTokens(data);
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  return { ...tokens, refetchTokens: fetchTokens };
}
