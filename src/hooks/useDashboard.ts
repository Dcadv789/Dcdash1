import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DashboardConfig } from '../types/dashboard';

interface UseDashboardOptions {
  table: 'dashboard_config' | 'vendas_config' | 'analise_config';
  empresaId?: string;
}

export function useDashboard({ table, empresaId }: UseDashboardOptions) {
  const [data, setData] = useState<DashboardConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!empresaId) {
      setData([]);
      setLoading(false);
      return;
    }

    fetchData();
  }, [empresaId, table]);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from(table)
        .select(`
          *,
          indicador:indicadores (
            id,
            nome,
            codigo,
            tipo_dado
          ),
          categoria:categorias (
            id,
            nome,
            codigo
          ),
          chart_components:${table.split('_')[0]}_chart_components (
            id,
            ordem,
            cor,
            categoria:categorias (
              id,
              nome
            ),
            indicador:indicadores (
              id,
              nome,
              tipo_dado
            )
          )
        `)
        .eq('empresa_id', empresaId)
        .eq('ativo', true)
        .order('posicao');

      if (error) throw error;
      setData(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchData };
}