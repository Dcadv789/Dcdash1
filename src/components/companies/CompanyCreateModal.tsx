import React, { useState } from 'react';
import { X, Plus, Trash2, Save, Edit } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Empresa, Socio } from '../../types/database';
import { CompanyFormData, SocioFormData, FormErrors } from '../../types/forms';
import { MASKS } from '../../constants';
import { validateCompanyForm, validateSocioForm, cleanMask } from '../../utils/forms';

interface CompanyCreateModalProps {
  onClose: () => void;
  onSave: (newCompany: Empresa) => void;
}

const CompanyCreateModal: React.FC<CompanyCreateModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState<CompanyFormData>({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    data_inicio_contrato: '',
    logo_url: '',
    email: '',
    telefone: '',
  });
  const [socios, setSocios] = useState<Partial<SocioFormData>[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [socioErrors, setSocioErrors] = useState<FormErrors[]>([]);
  const [editingSocio, setEditingSocio] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validar formulário da empresa
    const formErrors = validateCompanyForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setLoading(false);
      return;
    }

    // Validar formulários dos sócios
    const sociosErrors = socios.map(socio => validateSocioForm(socio));
    if (sociosErrors.some(errors => Object.keys(errors).length > 0)) {
      setSocioErrors(sociosErrors);
      setLoading(false);
      return;
    }

    try {
      // Criar empresa
      const { data: companyData, error: companyError } = await supabase
        .from('empresas')
        .insert({
          razao_social: formData.razao_social,
          nome_fantasia: formData.nome_fantasia || null,
          cnpj: cleanMask(formData.cnpj) || null,
          data_inicio_contrato: formData.data_inicio_contrato || null,
          logo_url: formData.logo_url || null,
          email: formData.email || null,
          telefone: cleanMask(formData.telefone) || null,
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
              empresa_id: companyData.id,
              cpf: socio.cpf ? cleanMask(socio.cpf) : null,
              telefone: socio.telefone ? cleanMask(socio.telefone) : null
            }))
          );

        if (sociosError) throw sociosError;
      }

      if (companyData) {
        onSave(companyData as Empresa);
        onClose();
      }
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Erro ao criar empresa'
      });
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
    setSocioErrors([...socioErrors, {}]);
  };

  const handleSaveSocio = (index: number) => {
    const socioErrors = validateSocioForm(socios[index]);
    if (Object.keys(socioErrors).length > 0) {
      const newSocioErrors = [...socioErrors];
      newSocioErrors[index] = socioErrors;
      setSocioErrors(newSocioErrors);
      return;
    }
    setEditingSocio(null);
  };

  const handleEditSocio = (index: number) => {
    setEditingSocio(index);
  };

  const handleUpdateSocio = (index: number, field: keyof SocioFormData, value: any) => {
    setSocios(socios.map((socio, i) => 
      i === index ? { ...socio, [field]: value } : socio
    ));
    
    // Limpar erro do campo quando ele for atualizado
    const newSocioErrors = [...socioErrors];
    if (newSocioErrors[index]) {
      delete newSocioErrors[index][field];
      setSocioErrors(newSocioErrors);
    }
  };

  const handleRemoveSocio = (index: number) => {
    setSocios(socios.filter((_, i) => i !== index));
    setSocioErrors(socioErrors.filter((_, i) => i !== index));
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
          {errors.submit && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
              {errors.submit}
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
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, razao_social: e.target.value }));
                  if (errors.razao_social) {
                    setErrors(prev => ({ ...prev, razao_social: '' }));
                  }
                }}
                className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.razao_social ? 'border-red-500' : 'border-gray-600'
                }`}
                required
              />
              {errors.razao_social && (
                <p className="mt-1 text-sm text-red-400">{errors.razao_social}</p>
              )}
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
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => {
                  const masked = applyMask(e.target.value, MASKS.CNPJ);
                  setFormData(prev => ({ ...prev, cnpj: masked }));
                  if (errors.cnpj) {
                    setErrors(prev => ({ ...prev, cnpj: '' }));
                  }
                }}
                className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cnpj ? 'border-red-500' : 'border-gray-600'
                }`}
                required
              />
              {errors.cnpj && (
                <p className="mt-1 text-sm text-red-400">{errors.cnpj}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="empresa@exemplo.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Telefone
              </label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => {
                  const masked = applyMask(e.target.value, MASKS.PHONE);
                  setFormData(prev => ({ ...prev, telefone: masked }));
                }}
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
              {socios.map((socio, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                  <div className="grid grid-cols-6 gap-4">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={socio.nome}
                        onChange={(e) => handleUpdateSocio(index, 'nome', e.target.value)}
                        className={`w-full bg-gray-600 border rounded-lg px-3 py-2 text-white ${
                          socioErrors[index]?.nome ? 'border-red-500' : 'border-gray-500'
                        }`}
                        placeholder="Nome do Sócio"
                        disabled={editingSocio !== index}
                      />
                      {socioErrors[index]?.nome && (
                        <p className="mt-1 text-sm text-red-400">{socioErrors[index].nome}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={socio.cpf}
                        onChange={(e) => {
                          const masked = applyMask(e.target.value, MASKS.CPF);
                          handleUpdateSocio(index, 'cpf', masked);
                        }}
                        className={`w-full bg-gray-600 border rounded-lg px-3 py-2 text-white ${
                          socioErrors[index]?.cpf ? 'border-red-500' : 'border-gray-500'
                        }`}
                        placeholder="CPF"
                        disabled={editingSocio !== index}
                      />
                      {socioErrors[index]?.cpf && (
                        <p className="mt-1 text-sm text-red-400">{socioErrors[index].cpf}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="number"
                        value={socio.percentual || ''}
                        onChange={(e) => handleUpdateSocio(index, 'percentual', parseFloat(e.target.value))}
                        className={`w-full bg-gray-600 border rounded-lg px-3 py-2 text-white ${
                          socioErrors[index]?.percentual ? 'border-red-500' : 'border-gray-500'
                        }`}
                        placeholder="Percentual"
                        min="0"
                        max="100"
                        step="0.01"
                        disabled={editingSocio !== index}
                      />
                      {socioErrors[index]?.percentual && (
                        <p className="mt-1 text-sm text-red-400">{socioErrors[index].percentual}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="email"
                        value={socio.email || ''}
                        onChange={(e) => handleUpdateSocio(index, 'email', e.target.value)}
                        className={`w-full bg-gray-600 border rounded-lg px-3 py-2 text-white ${
                          socioErrors[index]?.email ? 'border-red-500' : 'border-gray-500'
                        }`}
                        placeholder="Email"
                        disabled={editingSocio !== index}
                      />
                      {socioErrors[index]?.email && (
                        <p className="mt-1 text-sm text-red-400">{socioErrors[index].email}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={socio.telefone || ''}
                        onChange={(e) => {
                          const masked = applyMask(e.target.value, MASKS.PHONE);
                          handleUpdateSocio(index, 'telefone', masked);
                        }}
                        className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                        placeholder="Telefone"
                        disabled={editingSocio !== index}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
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

export default CompanyCreateModal;