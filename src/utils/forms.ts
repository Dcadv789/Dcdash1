import { FormErrors } from '../types/forms';
import { isValidEmail, isValidCPF, isValidCNPJ } from './validation';
import { MASKS } from '../constants';

export const cleanMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const applyMask = (value: string, mask: string): string => {
  const cleanValue = cleanMask(value);
  let result = '';
  let maskIndex = 0;
  let valueIndex = 0;

  while (maskIndex < mask.length && valueIndex < cleanValue.length) {
    if (mask[maskIndex] === '9') {
      result += cleanValue[valueIndex];
      valueIndex++;
    } else {
      result += mask[maskIndex];
    }
    maskIndex++;
  }

  return result;
};

export const validateCompanyForm = (data: any): FormErrors => {
  const errors: FormErrors = {};

  if (!data.razao_social?.trim()) {
    errors.razao_social = 'Razão social é obrigatória';
  }

  if (data.cnpj && !isValidCNPJ(cleanMask(data.cnpj))) {
    errors.cnpj = 'CNPJ inválido';
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Email inválido';
  }

  return errors;
};

export const validateUserForm = (data: any): FormErrors => {
  const errors: FormErrors = {};

  if (!data.nome?.trim()) {
    errors.nome = 'Nome é obrigatório';
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Email inválido';
  }

  return errors;
};

export const validateSocioForm = (data: any): FormErrors => {
  const errors: FormErrors = {};

  if (!data.nome?.trim()) {
    errors.nome = 'Nome é obrigatório';
  }

  if (data.cpf && !isValidCPF(cleanMask(data.cpf))) {
    errors.cpf = 'CPF inválido';
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Email inválido';
  }

  if (data.percentual && (data.percentual < 0 || data.percentual > 100)) {
    errors.percentual = 'Percentual deve estar entre 0 e 100';
  }

  return errors;
};