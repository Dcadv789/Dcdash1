import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Edit } from 'lucide-react';
import InputMask from 'react-input-mask';
import { supabase } from '../../lib/supabase';
import { Empresa, Socio } from '../../types/database';

interface CompanyCreateModalProps {
  onClose: () => void;
  onSave: (newCompany: Empresa) => void;
}

const CompanyCreateModal: React.FC<CompanyCreateModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    data_inicio_contrato: '',
    logo_url: '',
    email: '',
    telefone: '',
  });
  const [socios, setSocios] = useState<Partial<Socio>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSocio, setEditingSocio] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Criar empresa
      const { data: companyData, error: companyError } = await supabase
        .from('empresas')
        .insert({
          razao_social: formData.razao_social,
          nome_fantasia: formData.nome_fantasia || null,
          cnpj: formData.cnpj.replace(/\D/g, '') || null,
          data_inicio_contrato: formData.data_inicio_contrato || null,
          logo_url: formData.logo_url || null,
          email: formData.email || null,
          telefone: formData.telefone || null,
          ativa: true
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Se houver sócios, criar registros
      if (socios.length > 0 && companyData) {
        const { error: sociosError } = await supabase
          .from('socios')
          .insert(
            socios.map(socio => ({
              ...socio,
              empresa_id: companyData.id
            }))
          );

        if (sociosError) throw sociosError;
      }

      if (companyData) {
        onSave(companyData as Empresa);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSocio = () => {
    setSocios([...socios, { 
      nome: '',
      cpf: '',
      percentual: null,
      email: '',
      telefone: ''
    }]);
    setEditingSocio(socios.length);
  };

  const handleSaveSocio = (index: number) => {
    setEditingSocio(null);
  };

  const handleEditSocio = (index: number) => {
    setEditingSocio(index);
  };

  const handleUpdateSocio = (index: number, field: keyof Socio, value: any) => {
    setSocios(socios.map((socio, i) => 
      i === index ? { ...socio, [field]: value } : socio
    ));
  };

  const handleRemoveSocio = (index: number) => {
    setSocios(socios.filter((_, i) => i !== index));
    if (editingSocio === index) {
      setEditingSocio(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Nova Empresa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                URL da Logo
              </label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://exemplo.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Razão Social *
              </label>
              <input
                type="text"
                value={formData.razao_social}
                onChange={(e) => setFormData(prev => ({ ...prev, razao_social: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Nome Fantasia
              </label>
              <input
                type="text"
                value={formData.nome_fantasia}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_fantasia: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                CNPJ *
              </label>
              <InputMask
                mask="99.999.999/9999-99"
                value={formData.cnpj}
                onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Telefone
              </label>
              <InputMask
                mask="(99) 99999-9999"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Data de Início do Contrato
              </label>
              <input
                type="date"
                value={formData.data_inicio_contrato}
                onChange={(e) => setFormData(prev => ({ ...prev, data_inicio_contrato: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Sócios</h3>
              <button
                type="button"
                onClick={handleAddSocio}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
                Adicionar Sócio
              </button>
            </div>

            <div className="space-y-4">
              {socios.map((socio, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-6 gap-4 items-center">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={socio.nome}
                        onChange={(e) => handleUpdateSocio(index, 'nome', e.target.value)}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                        placeholder="Nome do Sócio"
                        disabled={editingSocio !== index}
                      />
                    </div>
                    <div>
                      <InputMask
                        mask="999.999.999-99"
                        value={socio.cpf || ''}
                        onChange={(e) => handleUpdateSocio(index, 'cpf', e.target.value)}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                        placeholder="CPF"
                        disabled={editingSocio !== index}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={socio.percentual || ''}
                        onChange={(e) => handleUpdateSocio(index, 'percentual', parseFloat(e.target.value))}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                        placeholder="Percentual"
                        min="0"
                        max="100"
                        step="0.01"
                        disabled={editingSocio !== index}
                      />
                    </div>
                    <div className="flex gap-2 justify-end col-span-2">
                      {editingSocio === index ? (
                        <button
                          type="button"
                          onClick={() => handleSaveSocio(index)}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-600 rounded-lg"
                          title="Salvar"
                        >
                          <Save size={20} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEditSocio(index)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded-lg"
                          title="Editar"
                        >
                          <Edit size={20} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveSocio(index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded-lg"
                        title="Excluir"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyCreateModal