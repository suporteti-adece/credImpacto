import { Component } from '@angular/core';

@Component({
  selector: 'app-negocios-impacto',
  standalone: false,
  templateUrl: './negocios-impacto.component.html',
  styleUrl: './negocios-impacto.component.css',
})
export class NegociosImpactoComponent {
  exemplos = [
    {
      titulo: 'Reciclagem e economia circular',
      imagem: 'assets/imgs/imagens/Reciclagem-e-economia-circular.png',
    },

    {
      titulo: 'Agricultura sustentável',
      imagem: 'assets/imgs/imagens/AGRICULTURA SUSTENTÁVEL.jpeg',
    },

    {
      titulo: 'Educação comunitária',
      imagem: 'assets/imgs/imagens/exemplo_atuacao.png',
    },

    {
      titulo: 'Inclusão produtiva de mulheres',
      imagem: 'assets/imgs/imagens/exemplo_atuacao.png',
    },

    {
      titulo: 'Saúde preventiva',
      imagem: 'assets/imgs/imagens/exemplo_atuacao.png',
    },

    {
      titulo: 'Tecnologia social',
      imagem: 'assets/imgs/imagens/exemplo_atuacao.png',
    },

    {
      titulo: 'Segurança alimentar',
      imagem: 'assets/imgs/imagens/SEGURANÇA ALIMENTAR.jpeg',
    },

    {
      titulo: 'Energia limpa',
      imagem: 'assets/imgs/imagens/exemplo_atuacao.png',
    },

    {
      titulo: 'Empreendedorismo comunitário',
      imagem: 'assets/imgs/imagens/exemplo_atuacao.png',
    },

  ];
}
