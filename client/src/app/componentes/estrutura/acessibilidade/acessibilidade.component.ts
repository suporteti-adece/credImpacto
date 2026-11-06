import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-acessibilidade',
  standalone: false,
  templateUrl: './acessibilidade.component.html',
  styleUrl: './acessibilidade.component.css',
})
export class AcessibilidadeComponent implements OnInit, OnDestroy {
  tamanhoFonte = 100;
  altoContraste = false;
  leituraAtiva = false;

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    const fonteSalva = Number(
      localStorage.getItem('acessibilidade_fonte') ?? 100,
    );

    this.tamanhoFonte =
      Number.isFinite(fonteSalva) && fonteSalva >= 80 && fonteSalva <= 200
        ? fonteSalva
        : 100;

    this.altoContraste =
      localStorage.getItem('acessibilidade_contraste') === 'true';

    this.aplicarFonte();
    this.aplicarContraste();

    this.barraExpandida =
      localStorage.getItem('acessibilidade_barra') === 'true';
  }

  aumentarFonte(): void {
    this.tamanhoFonte = Math.min(200, this.tamanhoFonte + 10);
    this.aplicarFonte();
  }

  diminuirFonte(): void {
    this.tamanhoFonte = Math.max(80, this.tamanhoFonte - 10);
    this.aplicarFonte();
  }

  private aplicarFonte(): void {
    this.renderer.setStyle(
      document.documentElement,
      'font-size',
      `${this.tamanhoFonte}%`,
    );

    localStorage.setItem('acessibilidade_fonte', String(this.tamanhoFonte));
  }

  alternarContraste(): void {
    this.altoContraste = !this.altoContraste;
    this.aplicarContraste();
  }

  private aplicarContraste(): void {
    if (this.altoContraste) {
      this.renderer.addClass(document.body, 'alto-contraste');
    } else {
      this.renderer.removeClass(document.body, 'alto-contraste');
    }

    localStorage.setItem(
      'acessibilidade_contraste',
      String(this.altoContraste),
    );
  }

  alternarLeitura(): void {
    if (!('speechSynthesis' in window)) {
      alert('Leitura por voz não suportada neste navegador.');
      return;
    }

    if (this.leituraAtiva) {
      window.speechSynthesis.cancel();
      this.leituraAtiva = false;
      return;
    }

    const conteudo = document.querySelector('main');
    const texto = conteudo?.textContent?.trim() ?? '';

    if (!texto) {
      alert('Nenhum conteúdo disponível para leitura.');
      return;
    }

    const fala = new SpeechSynthesisUtterance(texto);

    fala.lang = 'pt-BR';
    fala.rate = 1;

    fala.onstart = () => {
      this.leituraAtiva = true;
    };

    fala.onend = () => {
      this.leituraAtiva = false;
    };

    fala.onerror = () => {
      this.leituraAtiva = false;
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(fala);
  }

  restaurar(): void {
    this.tamanhoFonte = 100;
    this.altoContraste = false;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.leituraAtiva = false;
    this.aplicarFonte();
    this.aplicarContraste();
  }

  barraExpandida = false;

  alternarBarra(): void {
    this.barraExpandida = !this.barraExpandida;

    localStorage.setItem('acessibilidade_barra', String(this.barraExpandida));
  }

  ngOnDestroy(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
