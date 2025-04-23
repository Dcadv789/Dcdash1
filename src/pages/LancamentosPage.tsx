import React, { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Lancamento, Empresa, Categoria, Indicador } from '../types/database';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import LancamentoFilters from '../components/lancamentos/LancamentoFilters';
import LancamentoList from '../components/lancamentos/LancamentoList';
import LancamentoModal from '../components/lancamentos/LancamentoModal';
import LancamentoViewModal from '../components/lancamentos/LancamentoViewModal';
import LancamentoUploadModal from '../components/lancamentos/LancamentoUploadModal';

const LancamentosPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [selectedIndicador, setSelectedIndicador] = useState<string>('');
  const [selectedLancamento, setSelectedLancamento] = useState<Lancamento | undefined>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: empresas } = useSupabaseQuery<Empresa>({
    query: () => supabase
      .from('empresas')
      .select('id, razao_social')
      .eq('ativa', true)
      .order('razao_social'),
  });

  const { data: categorias } = useSupabaseQuery<Categoria>({
    query: () => supabase
      .from('categorias')
      .select('*')
      .eq('ativo', true)
      .order('nome'),
  });

  const { data: indicadores } = useSupabaseQuery<Indicador>({
    query: () => supabase
      .from('indicadores')
      .select('*')
      .eq('ativo', true)
      .order('nome'),
  });

  const { data: lancamentos, loading, error, refetch } = useSupabaseQuery<Lancamento>({
    query: () => {
      let query = supabase
        .from('lancamentos')
        .select(`
          *,
          categoria:categorias (
            id,
            nome
          ),
          indicador:indicadores (
            id,
            nome
          ),
          empresa:empresas (
            id,
            razao_social
          )
        `)
        .eq('ano', selectedYear);

      if (selectedMonth !== null) {
        query = query.eq('mes', selectedMonth);
      }

      if (selectedType !== 'todos') {
        query = query.eq('tipo', selectedType);
      }

      if (selectedEmpresa) {
        query = query.eq('empresa_id', selectedEmpresa);
      }

      if (selectedCategoria) {
        query = query.eq('categoria_id', selectedCategoria);
      }

      if (selectedIndicador) {
        query = query.eq('indicador_id', selectedIndicador);
      }

      return query.order('mes', { ascending: false });
    },
    dependencies: [selectedType, selectedEmpresa, selectedYear, selectedMonth, selectedCategoria, selectedIndicador],
  });

  const handleDelete = async (lancamento: Lancamento) => {
    if (!window.confirm('Tem certeza que deseja excluir este lançamento?')) return;

    try {
      const { error } = await supabase
        .from('lancamentos')
        .delete()
        .eq('id', lancamento.id);

      if (error) throw error;
      refetch();
    } catch (err) {
      console.error('Erro ao excluir lançamento:', err);
      alert('Não foi possível excluir o lançamento');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white">Lançamentos</h2>
          <p className="text-gray-400 mt-1">Gerencie os lançamentos financeiros</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            icon={Plus}
          >
            Novo Lançamento
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsUploadModalOpen(true)}
            icon={Upload}
          >
            Upload
          </Button>
        </div>
      </div>

      <LancamentoFilters
        selectedType={selectedType}
        selectedEmpresa={selectedEmpresa}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        selectedCategoria={selectedCategoria}
        selectedIndicador={selectedIndicador}
        empresas={empresas}
        categorias={categorias}
        indicadores={indicadores}
        onTypeChange={setSelectedType}
        onEmpresaChange={setSelectedEmpresa}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
        onCategoriaChange={setSelectedCategoria}
        onIndicadorChange={setSelectedIndicador}
      />

      {lancamentos.length === 0 ? (
        <EmptyState message="Nenhum lançamento encontrado." />
      ) : (
        <LancamentoList
          lancamentos={lancamentos}
          onView={(lancamento) => {
            setSelectedLancamento(lancamento);
            setIsViewModalOpen(true);
          }}
          onEdit={(lancamento) => {
            setSelectedLancamento(lancamento);
            setIsEditModalOpen(true);
          }}
          onDelete={handleDelete}
        />
      )}

      {isViewModalOpen && selectedLancamento && (
        <LancamentoViewModal
          lancamento={selectedLancamento}
          onClose={() => {
            setSelectedLancamento(undefined);
            setIsViewModalOpen(false);
          }}
        />
      )}

      {(isCreateModalOpen || (isEditModalOpen && selectedLancamento)) && (
        <LancamentoModal
          lancamento={isEditModalOpen ? selectedLancamento : undefined}
          onClose={() => {
            setSelectedLancamento(undefined);
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
          }}
          onSave={refetch}
        />
      )}

      {isUploadModalOpen && (
        <LancamentoUploadModal
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}
    </div>
  );
};

export default LancamentosPage;