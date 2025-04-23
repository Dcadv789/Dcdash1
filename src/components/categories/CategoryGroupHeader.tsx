import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { GrupoCategoria } from '../../types/database';

interface CategoryGroupHeaderProps {
  group: GrupoCategoria | null;
  onEdit?: (group: GrupoCategoria) => void;
  onDelete?: (group: GrupoCategoria) => void;
}

const CategoryGroupHeader: React.FC<CategoryGroupHeaderProps> = ({
  group,
  onEdit,
  onDelete,
}) => {
  if (!group) {
    return (
      <h3 className="text-lg font-medium text-white mb-4">
        Sem Grupo
      </h3>
    );
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-medium text-white">{group.nome}</h3>
      <div className="flex gap-2">
        <button
          onClick={() => onEdit?.(group)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          title="Editar grupo"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => onDelete?.(group)}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
          title="Excluir grupo"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default CategoryGroupHeader;