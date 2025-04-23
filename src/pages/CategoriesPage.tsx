import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Power } from 'lucide-react';
import { Categoria, Empresa } from '../types/database';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import CategoryModal from '../components/categories/CategoryModal';

const CategoriesPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'receita' | 'despesa'>('receita');
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Categoria | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: empresas } = useSupabaseQuery<Empresa>({
    query: () => supabase
      .from('empresas')
      .select('id, razao_social')
      .eq('ativa', true)
      .order('razao_social'),
  });

  const { data: categories, loading, error, refetch } = useSupabaseQuery<Categoria>({
    query: () => {
      let query = supabase
        .from('categorias')
        .select(`
          *,
          grupo:grupo_categorias (
            id,
            nome
          )
        `)
        .eq('tipo', selectedType)
        .order('codigo');

      if (selectedEmpresa) {
        query = query.in(
          'id',
          supabase
            .from('empresa_categorias')
            .select('categoria_id')
            .eq('empresa_id', selectedEmpresa)
        );
      }

      return query;
    },
    dependencies: [selectedType, selectedEmpresa],
  });

  const categoriesByGroup = React.useMemo(() => {
    const groups: { [key: string]: Categoria[] } = {
      'sem-grupo': []
    };

    categories.forEach(category => {
      if (category.grupo) {
        if (!groups[category.grupo.id]) {
          groups[category.grupo.id] = [];
        }
        groups[category.grupo.id].push(category);
      } else {
        groups['sem-grupo'].push(category);
      }
    });

    return groups;
  }, [categories]);

  const handleToggleActive = async (categoria: Categoria) => {
    try {
      const { error } = await supabase
        .from('categorias')
        .update({ ativo: !categoria.ativo })
        .eq('id', categoria.id);

      if (error) throw error;
      refetch();
    } catch (err) {
      console.error('Erro ao atualizar categoria:', err);
      alert('Não foi possível atualizar a categoria');
    }
  };

  const handleDelete = async (categoria: Categoria) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', categoria.id);

      if (error) throw error;
      refetch();
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
      alert('Não foi possível excluir a categoria');
    }
  };

  const renderCategoryTable = (categories: Categoria[]) => (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-700">
          <th className="text-left p-4 text-gray-400">Código</th>
          <th className="text-left p-4 text-gray-400">Nome</th>
          <th className="text-left p-4 text-gray-400">Descrição</th>
          <th className="text-left p-4 text-gray-400">Status</th>
          <th className="text-right p-4 text-gray-400">Ações</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((categoria) => (
          <tr key={categoria.id} className="border-b border-gray-700 hover:bg-gray-700/30">
            <td className="p-4 text-white font-mono">{categoria.codigo}</td>
            <td className="p-4 text-white">{categoria.nome}</td>
            <td className="p-4 text-gray-300">{categoria.descricao || '-'}</td>
            <td className="p-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                categoria.ativo 
                  ? 'bg-green-500/20 text-green-300'
                  : 'bg-red-500/20 text-red-300'
              }`}>
                {categoria.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </td>
            <td className="p-4">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedCategory(categoria);
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                  title="Editar"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleToggleActive(categoria)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                  title={categoria.ativo ? 'Desativar' : 'Ativar'}
                >
                  <Power size={18} />
                </button>
                <button
                  onClick={() => handleDelete(categoria)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-white">Categorias</h2>
          <p className="text-gray-400 mt-1">Gerencie as categorias de receitas e despesas</p>
        </div>
        <Button
          onClick={() => {
            setSelectedCategory(undefined);
            setIsModalOpen(true);
          }}
          icon={Plus}
        >
          Nova Categoria
        </Button>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Empresa
            </label>
            <select
              value={selectedEmpresa}
              onChange={(e) => setSelectedEmpresa(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as empresas</option>
              {empresas.map(empresa => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.razao_social}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 self-end">
            <button
              onClick={() => setSelectedType('receita')}
              className={`px-4 py-2 rounded-lg ${
                selectedType === 'receita'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setSelectedType('despesa')}
              className={`px-4 py-2 rounded-lg ${
                selectedType === 'despesa'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Despesas
            </button>
          </div>
        </div>

        {categories.length === 0 ? (
          <EmptyState message={`Nenhuma categoria de ${selectedType} encontrada.`} />
        ) : (
          <div className="space-y-6">
            {Object.entries(categoriesByGroup).map(([groupId, cats]) => {
              if (cats.length === 0) return null;
              
              const groupName = cats[0].grupo?.nome || 'Sem Grupo';
              
              return (
                <div key={groupId} className="space-y-2">
                  <h3 className="text-lg font-medium text-white">{groupName}</h3>
                  <div className="overflow-x-auto">
                    {renderCategoryTable(cats)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <CategoryModal
          category={selectedCategory}
          onClose={() => {
            setSelectedCategory(undefined);
            setIsModalOpen(false);
          }}
          onSave={refetch}
        />
      )}
    </div>
  );
};

export default CategoriesPage;