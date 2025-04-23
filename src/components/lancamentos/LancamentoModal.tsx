import React, { useState, useEffect, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Categoria, Empresa, Indicador } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';

interface LancamentoModalProps {
  lancamento?: Lancamento;
  onClose: () => void;
  onSave: () => void;
}

const LancamentoModal: React.FC<LancamentoModalProps> = ({
  lancamento,
  onClose,
  onSave,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [formData, setFormData] = useState({
    valor: lancamento?.valor.toString() || '',
    tipo: lancamento?.tipo || 'receita',
    mes: lancamento?.mes || new Date().getMonth() + 1,
    ano: lancamento?.ano || new Date().getFullYear(),
    categoria_id: lancamento?.categoria_id || '',
    categoria_codigo: '',
    indicador_id: lancamento?.indicador_id || '',
    indicador_codigo: '',
    empresa_id: lancamento?.empresa_id || '',
    descricao: lancamento?.descricao || '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empresasRes, categoriasRes, indicadoresRes] = await Promise.all([
        supabase.from('empresas').select('*').eq('ativa', true).order('razao_social'),
        supabase.from('categorias').select('*').eq('ativo', true).order('codigo'),
        supabase.from('indicadores').select('*').eq('ativo', true).order('codigo'),
      ]);

      if (empresasRes.data) setEmpresas(empresasRes.data);
      if (categoriasRes.data) setCategorias(categoriasRes.data);
      if (indicadoresRes.data) setIndicadores(indicadoresRes.data);

      // Preencher códigos iniciais se existirem
      if (lancamento?.categoria_id) {
        const categoria = categoriasRes.data?.find(c => c.id === lancamento.categoria_id);
        if (categoria) {
          setFormData(prev => ({ ...prev, categoria_codigo: categoria.codigo }));
        }
      }

      if (lancamento?.indicador_id) {
        const indicador = indicadoresRes.data?.find(i => i.id === lancamento.indicador_id);
        if (indicador) {
          setFormData(prev => ({ ...prev, indicador_codigo: indicador.codigo }));
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados necessários');
    }
  };

  const handleCategoriaCodigo = (codigo: string) => {
    const categoria = categorias.find(c => c.codigo === codigo);
    setFormData(prev => ({
      ...prev,
      categoria_codigo: codigo,
      categoria_id: categoria?.id || '',
      // Limpar indicador se categoria for selecionada
      indicador_id: '',
      indicador_codigo: ''
    }));
  };

  const handleCategoriaId = (id: string) => {
    const categoria = categorias.find(c => c.id === id);
    setFormData(prev => ({
      ...prev,
      categoria_id: id,
      categoria_codigo: categoria?.codigo || '',
      // Limpar indicador se categoria for selecionada
      indicador_id: '',
      indicador_codigo: ''
    }));
  };

  const handleIndicadorCodigo = (codigo: string) => {
    const indicador = indicadores.find(i => i.codigo === codigo);
    setFormData(prev => ({
      ...prev,
      indicador_codigo: codigo,
      indicador_id: indicador?.id || '',
      // Limpar categoria se indicador for selecionado
      categoria_id: '',
      categoria_codigo: ''
    }));
  };

  const handleIndicadorId = (id: string) => {
    const indicador = indicadores.find(i => i.id === id);
    setFormData(prev => ({
      ...prev,
      indicador_id: id,
      indicador_codigo: indicador?.codigo || '',
      // Limpar categoria se indicador for selecionado
      categoria_id: '',
      categoria_codigo: ''
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Aqui você pode implementar a lógica de processamento do arquivo
    // Por enquanto, apenas mostraremos uma mensagem
    alert('Funcionalidade de upload será implementada em breve!');
  };

  const validateForm = (): string | null => {
    if (formData.categoria_id && formData.indicador_id) {
      return 'Você deve selecionar apenas categoria OU indicador, não ambos.';
    }
    if (!formData.categoria_id && !formData.indicador_id) {
      return 'Você deve selecionar uma categoria OU um indicador.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = {
        valor: parseFloat(formData.valor),
        tipo: formData.tipo,
        mes: formData.mes,
        ano: formData.ano,
        categoria_id: formData.categoria_id || null,
        indicador_id: formData.indicador_id || null,
        empresa_id: formData.empresa_id,
        descricao: formData.descricao || null,
      };

      if (lancamento) {
        const { error } = await supabase
          .from('lancamentos')
          .update(data)
          .eq('id', lancamento.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lancamentos')
          .insert([data]);

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar lançamento:', err);
      setError('Não foi possível salvar o lançamento');
    } finally {
      setLoading(false);
    }
  };

  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  return (
    <Modal
      title={lancamento ? 'Editar Lançamento' : 'Novo Lançamento'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <Button
            type="button"
            variant="secondary"
            icon={Upload}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Planilha
          </Button>
        </div>

        {/* Primeira linha: Empresa, Mês e Ano */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Empresa
            </label>
            <div className="relative">
              <select
                value={formData.empresa_id}
                onChange={(e) => setFormData(prev => ({ ...prev, empresa_id: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                required
              >
                <option value="">Selecione</option>
                {empresas.map(empresa => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.razao_social}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Mês
            </label>
            <div className="relative">
              <select
                value={formData.mes}
                onChange={(e) => setFormData(prev => ({ ...prev, mes: parseInt(e.target.value) }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                required
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Ano
            </label>
            <input
              type="number"
              min="1900"
              max="2100"
              value={formData.ano}
              onChange={(e) => setFormData(prev => ({ ...prev, ano: parseInt(e.target.value) }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Segunda linha: Valor, Código Categoria e Código Indicador */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Valor
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Código da Categoria
            </label>
            <input
              type="text"
              value={formData.categoria_codigo}
              onChange={(e) => handleCategoriaCodigo(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: R0001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Código do Indicador
            </label>
            <input
              type="text"
              value={formData.indicador_codigo}
              onChange={(e) => handleIndicadorCodigo(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: I0001"
            />
          </div>
        </div>

        {/* Terceira linha: Tipo, Categoria e Indicador */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Tipo
            </label>
            <div className="relative">
              <select
                value={formData.tipo}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'receita' | 'despesa' }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                required
              >
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Categoria
            </label>
            <div className="relative">
              <select
                value={formData.categoria_id}
                onChange={(e) => handleCategoriaId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Selecione</option>
                {categorias
                  .filter(cat => cat.tipo === formData.tipo)
                  .map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Indicador
            </label>
            <div className="relative">
              <select
                value={formData.indicador_id}
                onChange={(e) => handleIndicadorId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Selecione</option>
                {indicadores.map(indicador => (
                  <option key={indicador.id} value={indicador.id}>
                    {indicador.nome}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Descrição
          </label>
          <textarea
            value={formData.descricao}
            onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LancamentoModal;