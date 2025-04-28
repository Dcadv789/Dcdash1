import React from 'react';
import { Pencil, Trash2, Power } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardConfigListProps {
  configs: any[];
  onRefetch: () => void;
}

const DashboardConfigList: React.FC<DashboardConfigListProps> = ({
  configs,
  onRefetch,
}) => {
  const handleToggleActive = async (config: any) => {
    try {
      const { error } = await supabase
        .from('dashboard_config')
        .update({ ativo: !config.ativo })
        .eq('id', config.id);

      if (error) throw error;
      onRefetch();
    } catch (err) {
      console.error('Erro ao atualizar configuração:', err);
      alert('Não foi possível atualizar a configuração');
    }
  };

  const handleDelete = async (config: any) => {
    if (!window.confirm('Tem certeza que deseja excluir esta configuração?')) return;

    try {
      const { error } = await supabase
        .from('dashboard_config')
        .delete()
        .eq('id', config.id);

      if (error) throw error;
      onRefetch();
    } catch (err) {
      console.error('Erro ao excluir configuração:', err);
      alert('Não foi possível excluir a configuração');
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left p-4 text-gray-400">Posição</th>
            <th className="text-left p-4 text-gray-400">Título</th>
            <th className="text-left p-4 text-gray-400">Tipo</th>
            <th className="text-left p-4 text-gray-400">Indicador/Categoria</th>
            <th className="text-left p-4 text-gray-400">Status</th>
            <th className="text-right p-4 text-gray-400">Ações</th>
          </tr>
        </thead>
        <tbody>
          {configs.map((config) => (
            <tr key={config.id} className="border-b border-gray-700">
              <td className="p-4 text-white">{config.posicao}</td>
              <td className="p-4 text-white">{config.titulo}</td>
              <td className="p-4 text-white">
                {config.indicador_id ? 'Indicador' : 'Categoria'}
              </td>
              <td className="p-4 text-white">
                {config.indicador?.nome || config.categoria?.nome || '-'}
              </td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  config.ativo 
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}>
                  {config.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td className="p-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleToggleActive(config)}
                    className={`p-2 rounded-lg transition-colors ${
                      config.ativo 
                        ? 'text-green-500 hover:text-green-400'
                        : 'text-gray-400 hover:text-white'
                    } hover:bg-gray-700`}
                    title={config.ativo ? 'Desativar' : 'Ativar'}
                  >
                    <Power size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(config)}
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
    </div>
  );
};

export default DashboardConfigList;