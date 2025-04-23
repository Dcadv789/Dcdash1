import React from 'react';
import { Eye, Pencil, Trash2, Power, Building2, Calculator } from 'lucide-react';
import { Indicador } from '../../types/database';

interface IndicatorListProps {
  indicators: Indicador[];
  onView: (indicator: Indicador) => void;
  onEdit: (indicator: Indicador) => void;
  onDelete: (indicator: Indicador) => void;
  onToggleActive: (indicator: Indicador) => void;
  onManageCompanies: (indicator: Indicador) => void;
  onManageComposition: (indicator: Indicador) => void;
}

const IndicatorList: React.FC<IndicatorListProps> = ({
  indicators,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
  onManageCompanies,
  onManageComposition,
}) => {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-800">
          <tr className="border-b border-gray-700">
            <th className="text-left p-4 text-gray-400">Código</th>
            <th className="text-left p-4 text-gray-400">Nome</th>
            <th className="text-left p-4 text-gray-400">Tipo</th>
            <th className="text-left p-4 text-gray-400">Tipo de Dado</th>
            <th className="text-left p-4 text-gray-400">Empresa</th>
            <th className="text-right p-4 text-gray-400">Ações</th>
          </tr>
        </thead>
        <tbody>
          {indicators.map((indicator) => (
            <tr key={indicator.id} className="border-b border-gray-700">
              <td className="p-4 text-white font-mono">{indicator.codigo}</td>
              <td className="p-4 text-white">{indicator.nome}</td>
              <td className="p-4">
                <span className="capitalize text-white">{indicator.tipo}</span>
              </td>
              <td className="p-4">
                <span className="capitalize text-white">{indicator.tipo_dado}</span>
              </td>
              <td className="p-4 text-white">
                {indicator.empresa?.razao_social || '-'}
              </td>
              <td className="p-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onView(indicator)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                    title="Visualizar"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onManageCompanies(indicator)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                    title="Gerenciar Empresas"
                  >
                    <Building2 size={18} />
                  </button>
                  {indicator.tipo === 'composto' && (
                    <button
                      onClick={() => onManageComposition(indicator)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                      title="Gerenciar Composição"
                    >
                      <Calculator size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(indicator)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => onToggleActive(indicator)}
                    className={`p-2 rounded-lg ${
                      indicator.ativo 
                        ? 'text-green-500 hover:text-green-400'
                        : 'text-gray-400 hover:text-white'
                    } hover:bg-gray-700`}
                    title={indicator.ativo ? 'Ativo' : 'Inativo'}
                  >
                    <Power size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(indicator)}
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

export default IndicatorList;