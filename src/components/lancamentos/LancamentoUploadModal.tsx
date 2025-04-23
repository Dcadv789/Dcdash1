import React, { useCallback, useState } from 'react';
import { Download, Upload, X, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { downloadExampleWorkbook, processExcelFile } from '../../utils/excel';

interface LancamentoUploadModalProps {
  onClose: () => void;
}

const LancamentoUploadModal: React.FC<LancamentoUploadModalProps> = ({ onClose }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validar extensão do arquivo
    const validExtensions = ['xlsx', 'xls', 'csv'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !validExtensions.includes(extension)) {
      setStatus('error');
      setMessage('Formato de arquivo inválido. Por favor, use Excel (.xlsx, .xls) ou CSV.');
      return;
    }

    setStatus('loading');
    setMessage('');
    setErrors([]);

    try {
      const result = await processExcelFile(file);
      
      if (result.success) {
        setStatus('success');
        setMessage(result.message || 'Arquivo processado com sucesso!');
      } else {
        setStatus('error');
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setMessage(result.message || 'Erro ao processar arquivo');
        }
      }
    } catch (err) {
      setStatus('error');
      setMessage('Ocorreu um erro ao processar o arquivo. Tente novamente.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <Modal
      title="Upload de Lançamentos"
      onClose={onClose}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-300 mb-4">Como fazer o upload?</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-gray-300 mb-2">
                1. Baixe nossa planilha modelo clicando no botão abaixo<br />
                2. Preencha os dados seguindo o exemplo e as instruções<br />
                3. Arraste o arquivo preenchido para a área indicada ou clique para selecionar
              </p>
              
              <Button
                variant="secondary"
                icon={Download}
                onClick={downloadExampleWorkbook}
              >
                Baixar Modelo
              </Button>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Instruções de Preenchimento:</h4>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-300 font-medium">Campos Obrigatórios:</p>
                    <ul className="list-disc list-inside text-gray-400 space-y-1">
                      <li>Mês (1 a 12)</li>
                      <li>Ano (4 dígitos)</li>
                      <li>Tipo (receita ou despesa)</li>
                      <li>Valor (usar ponto para decimais)</li>
                      <li>CNPJ da Empresa (apenas números)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">Campos Opcionais:</p>
                    <ul className="list-disc list-inside text-gray-400 space-y-1">
                      <li>Código da Categoria</li>
                      <li>Código do Indicador</li>
                      <li>Descrição</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm text-yellow-300">
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <p>
                Importante: Você deve preencher apenas Categoria OU Indicador, nunca os dois ao mesmo tempo.
                Se ambos forem preenchidos, o lançamento será rejeitado.
              </p>
            </div>
          </div>
        </div>

        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-500 bg-blue-500/10' 
              : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload 
            size={32} 
            className={`mx-auto mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
          />
          
          {isDragActive ? (
            <p className="text-blue-300">Solte o arquivo aqui...</p>
          ) : (
            <p className="text-gray-400">
              Arraste e solte seu arquivo aqui, ou clique para selecionar
            </p>
          )}
          
          <p className="text-sm text-gray-500 mt-2">
            Arquivos suportados: Excel (.xlsx, .xls) ou CSV
          </p>
        </div>

        {status === 'loading' && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-blue-300">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current"></div>
              Processando seu arquivo...
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-green-300">
            {message}
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
            {message && <p className="mb-4">{message}</p>}
            {errors.length > 0 && (
              <div className="space-y-2">
                <p className="font-medium">Erros encontrados:</p>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LancamentoUploadModal;