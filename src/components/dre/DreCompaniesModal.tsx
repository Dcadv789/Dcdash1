import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { DreConfiguracao, Empresa } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';

interface DreCompaniesModalProps {
  conta: DreConfiguracao;
  onClose: () => void;
  onSave: () => void;
}

const DreCompaniesModal: React.FC<DreCompaniesModalProps> = ({
  conta,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar todas as empresas
      const { data: empresasData } = await supabase
        .from('empresas')
        .select('*')
        .eq('ativa', true)
        .order('razao_social');

      // Buscar empresas associadas à conta
      const { data: associacoesData } = await supabase
        .from('dre_contas_empresa')
        .select('empresa_id')
        .eq('conta_id', conta.id)
        .eq('ativo', true);

      if (empresasData) {
        setEmpresas(empresasData);
      }

      if (associacoesData) {
        setSelectedCompanies(associacoesData.map(a => a.empresa_id));
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await supabase
        .from('dre_contas_empresa')
        .update({ ativo: false })
        .eq('conta_id', conta.id);

      for (const empresaId of selectedCompanies) {
        const { data: existing } = await supabase
          .from('dre_contas_empresa')
          .select('id')
          .eq('conta_id', conta.id)
          .eq('empresa_id', empresaId)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('dre_contas_empresa')
            .update({ ativo: true })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('dre_contas_empresa')
            .insert({
              conta_id: conta.id,
              empresa_id: empresaId,
              ativo: true
            });
        }
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar empresas:', err);
      alert('Não foi possível salvar as empresas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Gerenciar Empresas"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Selecione as empresas que podem usar esta conta
          </label>
          {loading ? (
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
                          <ChevronRight size={16} />
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
                          <ChevronLeft size={16} />
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
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            loading={loading}
          >
            Salvar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DreCompaniesModal;