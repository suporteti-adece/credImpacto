import { Component } from '@angular/core';
interface Etapa {
  numero: number;
  // titulo: string;
  descricao: string;
  ativo?: boolean;
  azul?: boolean;
}

interface Trilha {
  titulo: string;
  subtitulo: string;
  descricao: string;
  imagem: string;
  cor: 'azul' | 'verde';
  invertido: boolean;
}

@Component({
  selector: 'app-fluxo-capacitacao',
  standalone: false,
  templateUrl: './fluxo-capacitacao.component.html',
  styleUrl: './fluxo-capacitacao.component.css',
})
export class FluxoCapacitacaoComponent {
  etapas: Etapa[] = [
    {
      numero: 1,
      // titulo: 'Cadastro e',
      descricao: 'Cadastro',
      ativo: true,
    },

    {
      numero: 2,
      // titulo: 'Capacitação',
      descricao: 'Análise de elegibilidade',
      azul: true,
    },

    {
      numero: 3,
      // titulo: 'Visita Técnica',
      descricao: 'Capacitação',
    },

    {
      numero: 4,
      // titulo: 'Aprovação',
      descricao: 'Visita técnica e Análise de crédito',
      azul: true,
    },
    {
      numero: 5,
      // titulo: 'Acompanhamento',
      descricao: 'Aprovação e Contratação',
    },
    {
      numero: 6,
      // titulo: 'Acompanhamento',
      descricao: 'Acompanhamento',
      azul: true,
    },
  ];
  trilhas: Trilha[] = [
    {
      titulo: 'MÓDULO DE RECONHECIMENTO DE IMPACTO',
      subtitulo: 'Soluções criativas para desafios sociais',
      descricao:
        'Desenvolvimento de modelos inovadores com foco em impacto territorial, sustentabilidade e transformação comunitária.',
      imagem: 'assets/imgs/imagens/MODULO DE RECONHECIMENTO DE IMPACTO.jpeg',
      cor: 'azul',
      invertido: false,
    },
    {
      titulo: 'MÓDULO DE GESTÃO',
      subtitulo: 'Capacitação em modelos de negócios',
      descricao:
        'Orientação técnica para gestão de clientes, mercados, produtos, receitas e custos.',
      imagem: 'assets/imgs/imagens/MODULO DE GESTÃO.jpeg',
      cor: 'verde',
      invertido: true,
    },

    {
      titulo: 'MÓDULO DE MONITORAMENTO',
      subtitulo: 'Avaliação e mensuração de impacto',
      descricao:
        'Módulo formativo para mensuração e acompanhamento dos negócios de impacto.',
      imagem: 'assets/imgs/imagens/MODULO DE MONITORAMENTO.jpeg',
      cor: 'azul',
      invertido: false,
    },

  ];
}
