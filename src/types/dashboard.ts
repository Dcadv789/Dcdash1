import { Categoria, Indicador, Cliente } from './database';

export type TipoVisualizacao = 'card' | 'chart' | 'list';
export type TipoGrafico = 'line' | 'bar' | 'area' | 'pie';
export type TipoDado = 'moeda' | 'numero' | 'percentual';

export interface DashboardConfig {
  id: string;
  posicao: number;
  titulo: string;
  tipo_visualizacao: TipoVisualizacao;
  tipo_grafico?: TipoGrafico;
  categoria_id?: string;
  indicador_id?: string;
  empresa_id: string;
  ativo: boolean;
  categoria?: Categoria;
  indicador?: Indicador;
  chart_components?: ChartComponent[];
  list_components?: ListComponent[];
}

export interface ChartComponent {
  id: string;
  ordem: number;
  cor: string;
  categoria?: Categoria;
  indicador?: Indicador;
}

export interface ListComponent {
  id: string;
  ordem: number;
  categoria?: Categoria;
  indicador?: Indicador;
  cliente?: Cliente;
}

export interface DashboardData {
  name: string;
  [key: string]: any;
}