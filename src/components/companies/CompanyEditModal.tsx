import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Edit } from 'lucide-react';
import InputMask from 'react-input-mask';
import { Empresa, Socio } from '../../types/database';
import { supabase } from '../../lib/supabase';

interface CompanyEditModalProps {
  company: Empresa;
  onClose: () => void;
  onSave: (updatedCompany: Empresa) => void;
}

const CompanyEditModal: React.FC<CompanyEditModalProps> = ({ company, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    razao_social: company.razao_social,
    nome_fantasia: company.nome_fantasia || '',
    cnpj: company.cnpj || '',
    data_inicio_contrato: company.data_inicio_contrato || '',
    logo_url: company.logo_url || '',
    email: company.email || '',
    telefone: company.telefone || '',
  });
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSocio, setEditingSocio] = useState<string | null>(null);

  useEffect(() => {
    fetchSocios();
  }, []);

  const fetchSocios = async () => {
    const { data, error } = await supabase
      .from('socios')
      .select('*')
      .eq('empresa_id', company.id);

    if (!error && data) {
      setSocios(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('empresas')
        .update({
          razao_social: formData.razao_social,
          nome_fantasia: formData.nome_fantasia || null,
          cnpj: formData.cnpj.replace(/\D/g, '') || null,
          data_inicio_contrato: formData.data_inicio_contrato || null,
          logo_url: formData.logo_url || null,
          email: formData.email || null,
          telefone: formData.telefone.replace(/\D/g, '') || null,
        })
        .eq('id', company.id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        onSave(data as Empresa);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSocio = async () => {
    const { data, error } = await supabase
      .from('socios')
      .insert({
        empresa_id: company.id,
        nome: '',
        cpf: '',
        percentual: null,
        email: '',
        telefone: '',
      })
      .select()
      .single();

    if (!error && data) {
      setSocios([...socios, data]);
      setEditingSocio(data.id);
    }
  };

  const handleSaveSocio = async (socio: Socio) => {
    const { error } = await supabase
      .from('socios')
      .update(socio)
      .eq('id', socio.id);

    if (!error) {
      setEditingSocio(null);
    }
  };

  const handleEditSocio = (socioId: string) => {
    setEditingSocio(socioId);
  };

  const handleUpdateSocio = (socio: Socio, field: keyof Socio, value: any) => {
    setSocios(socios.map(s => s.id === socio.id ? { ...s, [field]: value } : s));
  };

  const handleDeleteSocio = async (socioId: string) => {
    const { error } = await supabase
      .from('socios')
      .delete()
      .eq('id', socioId);

    if (!error) {
      setSocios(socios.filter(s => s.id !== socioId));
      if (editingSocio === socioId) {
        setEditingSocio(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl w-full max-w-4xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Editar Empresa</h2>
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
                Razão Social
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
                CNPJ
              </label>
              <InputMask
                mask="99.999.999/9999-99"
                value={formData.cnpj}
                onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                placeholder="empresa@exemplo.com"
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
                placeholder="(00) 00000-0000"
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
              {socios.map((socio) => (
                <div key={socio.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-6 gap-4 items-center">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={socio.nome}
                        onChange={(e) => handleUpdateSocio(socio, 'nome', e.target.value)}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                        placeholder="Nome do Sócio"
                        disabled={editingSocio !== socio.id}
                      />
                    </div>
                    <div>
                      <InputMask
                        mask="999.999.999-99"
                        value={socio.cpf || ''}
                        onChange={(e) => handleUpdateSocio(socio, 'cpf', e.target.value)}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                        placeholder="CPF"
                        disabled={editingSocio !== socio.id}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={socio.percentual || ''}
                        onChange={(e) => handleUpdateSocio(socio, 'percentual', parseFloat(e.target.value))}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                        placeholder="Percentual"
                        min="0"
                        max="100"
                        step="0.01"
                        disabled={editingSocio !== socio.id}
                      />
                    </div>
                    <div className="flex gap-2 justify-end col-span-2">
                      {editingSocio === socio.id ? (
                        <button
                          type="button"
                          onClick={() => handleSaveSocio(socio)}
                          className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-600 rounded-lg"
                          title="Salvar"
                        >
                          <Save size={20} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEditSocio(socio.id)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded-lg"
                          title="Editar"
                        >
                          <Edit size={20} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteSocio(socio.id)}
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

export default CompanyEditModal;