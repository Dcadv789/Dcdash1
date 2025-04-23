export const USER_ROLES = {
  MASTER: 'master',
  CONSULTOR: 'consultor',
  CLIENTE: 'cliente',
} as const;

export const USER_ROLES_LABELS = {
  [USER_ROLES.MASTER]: 'Master',
  [USER_ROLES.CONSULTOR]: 'Consultor',
  [USER_ROLES.CLIENTE]: 'Cliente',
} as const;

export const STATUS_LABELS = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
} as const;

export const MASKS = {
  PHONE: '(99) 99999-9999',
  CPF: '999.999.999-99',
  CNPJ: '99.999.999/9999-99',
} as const;