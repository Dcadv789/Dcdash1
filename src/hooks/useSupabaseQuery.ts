import { useEffect, useState, useCallback } from 'react';
import { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UseSupabaseQueryOptions<T> {
  query: () => Promise<{ data: T[] | null; error: PostgrestError | null }>;
  dependencies?: any[];
}

export function useSupabaseQuery<T>({ query, dependencies = [] }: UseSupabaseQueryOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await query();
      
      if (error) throw error;
      setData(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}