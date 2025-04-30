import React from 'react';
import { Calculator } from 'lucide-react';
import { DreConfiguracao } from '../../types/database';
import { Button } from '../shared/Button';

interface ContaComponente {
  id: string;
  categoria?: {
    id: string;
    nome: string;
    codigo: string;
  } | null;
  indicador?: {
    id: string;
    nome: string;
    codigo: string;
  } | null;
  simbolo: '+' | '-' | '=';
}

interface DreAccountDetailsProps {
  selectedConta?: DreConfiguracao;
  componentes: ContaComponente[];
  loadingComponentes: boolean;
  onManageComponents: () => void;
}

const DreAccountDetails: React.FC<DreAccountDetailsProps> = ({
  selectedConta,
  componentes,
  loadingComponentes,
  onManageComponents,
}) => {
  if (!selectedConta) {
    return (
      <div className="text-gray-400 text-center py-8">
        Selecione uma conta para visualizar seus componentes
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="bg-gray-700/50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Detalhes da Conta</h4>
        <div className="space-y-2 text-sm">
          <p className="text-gray-400">
            Ordem: <span className="text-white">{selectedConta.ordem}</span>
          </p>
          <p className="text-gray-400">
            Símbolo: <span className="text-white font-mono">{selectedConta.simbolo}</span>
          </p>
          <p className="text-gray-400">
            Visível: <span className="text-white">{selectedConta.visivel ? 'Sim' : 'Não'}</span>
          </p>
          {selectedConta.conta_pai && (
            <p className="text-gray-400">
              Conta Pai: <span className="text-white">{selectedConta.conta_pai.nome}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Componentes</h4>
        
        {loadingComponentes ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto pr-2">
            {componentes.length > 0 ? (
              <div className="space-y-2">
                {componentes.map((componente) => (
                  <div key={componente.id} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-mono text-gray-400">{componente.simbolo}</span>
                      <div>
                        {componente.categoria ? (
                          <div>
                            <span className="text-white">{componente.categoria.nome}</span>
                            <span className="text-gray-400 text-sm ml-2">
                              ({componente.categoria.codigo})
                            </span>
                          </div>
                        ) : componente.indicador ? (
                          <div>
                            <span className="text-white">{componente.indicador.nome}</span>
                            <span className="text-gray-400 text-sm ml-2">
                              ({componente.indicador.codigo})
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-4">
                Nenhum componente configurado
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DreAccountDetails;