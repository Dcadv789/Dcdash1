import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Power, Eye, Building2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Categoria, Empresa, GrupoCategoria } from '../types/database';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorAlert } from '../components/shared/ErrorAlert';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import { Modal } from '../components/shared/Modal';
import CategoryModal from '../components/categories/CategoryModal';
import CategoryFilters from '../components/categories/CategoryFilters';
import CategoryGroupHeader from '../components/categories/CategoryGroupHeader';
import GroupModal from '../components/categories/GroupModal';

const CategoriesPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Categoria | undefined>();
  const [selectedGroup, setSelectedGroup] = useState<GrupoCategoria | undefined>();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCompaniesModalOpen, setIsCompaniesModalOpen] = useState(false);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const { data: empresas } = useSupabaseQuery<Empresa>({
    query: () => supabase
      .from('empresas')
      .select('id, razao_social')
      .eq('ativa', true)
      .order('razao_social'),
  });

  const { data: grupos } = useSupabaseQuery<GrupoCategoria>({
    query: () => supabase
      .from('grupo_categorias')
      .select('*')
      .eq('ativo', true)
      .order('nome'),
  });

  const { data: categories, loading, error, refetch } = useSupabaseQuery<Categoria>({
    query: async () => {
      let categoriesQuery = supabase
        .from('categorias')
        .select(`
          *,
          grupo:grupo_categorias (
            id,
            nome,
            descricao
          )
        `);

      if (selectedType !== 'todos') {
        categoriesQuery = categoriesQuery.eq('tipo', selectedType);
      }

      if (selectedEmpresa) {
        const { data: empresaCategorias } = await supabase
          .from('empresa_categorias')
          .select('categoria_id')
          .eq('empresa_id', selectedEmpresa);

        const categoriaIds = empresaCategorias?.map(ec => ec.categoria_id) || [];
        
        if (categoriaIds.length === 0) {
          // Se não houver categorias associadas, retornamos um array vazio
          return { data: [], error: null };
        }

        categoriesQuery = categoriesQuery.in('id', categoriaIds);
      }

      return categoriesQuery.order('codigo');
    },
    dependencies: [selectedType, selectedEmpresa],
  });

  useEffect(() => {
    if (selectedCategory && (isCompaniesModalOpen || isViewModalOpen)) {
      fetchCategoryCompanies();
    }
  }, [selectedCategory, isCompaniesModalOpen, isViewModalOpen]);

  const fetchCategoryCompanies = async () => {
    if (!selectedCategory) return;

    setLoadingCompanies(true);
    try {
      const { data } = await supabase
        .from('empresa_categorias')
        .select('empresa_id')
        .eq('categoria_id', selectedCategory.id);

      if (data) {
        setSelectedCompanies(data.map(item => item.empresa_id));
      }
    } catch (err) {
      console.error('Erro ao carregar empresas da categoria:', err);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleSaveCompanies = async () => {
    if (!selectedCategory) return;

    setLoadingCompanies(true);
    try {
      await supabase
        .from('empresa_categorias')
        .delete()
        .eq('categoria_id', selectedCategory.id);

      if (selectedCompanies.length > 0) {
        const { error } = await supabase
          .from('empresa_categorias')
          .insert(
            selectedCompanies.map(empresaId => ({
              categoria_id: selectedCategory.id,
              empresa_id: empresaId
            }))
          );

        if (error) throw error;
      }

      setIsCompaniesModalOpen(false);
      setSelectedCategory(undefined);
      refetch();
    } catch (err) {
      console.error('Erro ao salvar empresas:', err);
      alert('Não foi possível salvar as empresas');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const categoriesByGroup = React.useMemo(() => {
    const groups: { [key: string]: Categoria[] } = {
      'sem-grupo': []
    };

    grupos.forEach(grupo => {
      groups[grupo.id] = [];
    });

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
  }, [categories, grupos]);

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

  const handleDeleteGroup = async (group: GrupoCategoria) => {
    if (!window.confirm('Tem certeza que deseja excluir este grupo?')) return;

    try {
      const { error } = await supabase
        .from('grupo_categorias')
        .delete()
        .eq('id', group.id);

      if (error) throw error;
      refetch();
    } catch (err) {
      console.error('Erro ao excluir grupo:', err);
      alert('Não foi possível excluir o grupo');
    }
  };

  const renderCategoryTable = (categories: Categoria[]) => (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-700">
          <th className="text-left p-4 text-gray-400">Código</th>
          <th className="text-left p-4 text-gray-400">Nome</th>
          <th className="text-left p-4 text-gray-400">Status</th>
          <th className="text-right p-4 text-gray-400">Ações</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((categoria) => (
          <tr key={categoria.id} className="border-b border-gray-700">
            <td className="p-4 text-white font-mono">{categoria.codigo}</td>
            <td className="p-4 text-white">{categoria.nome}</td>
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
                    setIsViewModalOpen(true);
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                  title="Visualizar"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory(categoria);
                    setIsCompaniesModalOpen(true);
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                  title="Gerenciar Empresas"
                >
                  <Building2 size={18} />
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory(categoria);
                    setIsCategoryModalOpen(true);
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
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setSelectedCategory(undefined);
              setIsCategoryModalOpen(true);
            }}
            icon={Plus}
          >
            Nova Categoria
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedGroup(undefined);
              setIsGroupModalOpen(true);
            }}
            icon={Plus}
          >
            Novo Grupo
          </Button>
        </div>
      </div>

      <CategoryFilters
        selectedType={selectedType}
        selectedEmpresa={selectedEmpresa}
        empresas={empresas}
        onTypeChange={setSelectedType}
        onEmpresaChange={setSelectedEmpresa}
      />

      {categories.length === 0 ? (
        <div className="bg-black rounded-xl p-6">
          <EmptyState message={`Nenhuma categoria ${selectedType !== 'todos' ? `de ${selectedType}` : ''} encontrada.`} />
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(categoriesByGroup).map(([groupId, cats]) => {
            if (cats.length === 0) return null;
            
            const group = groupId === 'sem-grupo' ? null : grupos.find(g => g.id === groupId);
            
            return (
              <div key={groupId}>
                <CategoryGroupHeader
                  group={group}
                  onEdit={group ? (group) => {
                    setSelectedGroup(group);
                    setIsGroupModalOpen(true);
                  } : undefined}
                  onDelete={group ? () => handleDeleteGroup(group) : undefined}
                />
                <div className="mt-2">
                  {renderCategoryTable(cats)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isViewModalOpen && selectedCategory && (
        <Modal
          title="Detalhes da Categoria"
          onClose={() => {
            setSelectedCategory(undefined);
            setIsViewModalOpen(false);
          }}
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Código</label>
                <p className="text-lg text-white font-mono">{selectedCategory.codigo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nome</label>
                <p className="text-lg text-white">{selectedCategory.nome}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Tipo</label>
                <p className="text-lg text-white capitalize">{selectedCategory.tipo}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Grupo</label>
                <p className="text-lg text-white">{selectedCategory.grupo?.nome || 'Sem grupo'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Descrição</label>
                <p className="text-lg text-white">{selectedCategory.descricao || '-'}</p>
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">Empresas Associadas</label>
              {loadingCompanies ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              ) : selectedCompanies.length > 0 ? (
                <div className="bg-gray-700 rounded-lg p-4 grid grid-cols-2 gap-4">
                  {empresas
                    .filter(empresa => selectedCompanies.includes(empresa.id))
                    .map(empresa => (
                      <div key={empresa.id} className="flex items-center gap-2 text-white">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>{empresa.razao_social}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-400">Nenhuma empresa associada</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {isCompaniesModalOpen && selectedCategory && (
        <Modal
          title="Gerenciar Empresas"
          onClose={() => {
            setSelectedCategory(undefined);
            setIsCompaniesModalOpen(false);
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Selecione as empresas que podem usar esta categoria
              </label>
              {loadingCompanies ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Empresas Disponíveis</h4>
                    <div className="space-y-2">
                      {empresas
                        .filter(empresa => !selectedCompanies.includes(empresa.id))
                        .map(empresa => (
                          <label key={empresa.id} className="flex items-center gap-3 p-2 hover:bg-gray-600 rounded-lg cursor-pointer">
                            <button
                              type="button"
                              onClick={() => setSelectedCompanies(prev => [...prev, empresa.id])}
                              className="p-1 text-gray-400 hover:text-white hover:bg-gray-500 rounded"
                            >
                              <ArrowRight size={16} />
                            </button>
                            <span className="text-white">{empresa.razao_social}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Empresas Selecionadas</h4>
                    <div className="space-y-2">
                      {empresas
                        .filter(empresa => selectedCompanies.includes(empresa.id))
                        .map(empresa => (
                          <label key={empresa.id} className="flex items-center gap-3 p-2 hover:bg-gray-600 rounded-lg cursor-pointer">
                            <button
                              type="button"
                              onClick={() => setSelectedCompanies(prev => prev.filter(id => id !== empresa.id))}
                              className="p-1 text-gray-400 hover:text-white hover:bg-gray-500 rounded"
                            >
                              <ArrowLeft size={16} />
                            </button>
                            <span className="text-white">{empresa.razao_social}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedCategory(undefined);
                  setIsCompaniesModalOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveCompanies}
                loading={loadingCompanies}
              >
                Salvar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {isCategoryModalOpen && (
        <CategoryModal
          category={selectedCategory}
          onClose={() => {
            setSelectedCategory(undefined);
            setIsCategoryModalOpen(false);
          }}
          onSave={refetch}
        />
      )}

      {isGroupModalOpen && (
        <GroupModal
          group={selectedGroup}
          onClose={() => {
            setSelectedGroup(undefined);
            setIsGroupModalOpen(false);
          }}
          onSave={refetch}
        />
      )}
    </div>
  );
};

export default CategoriesPage;