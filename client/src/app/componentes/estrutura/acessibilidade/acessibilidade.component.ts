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

    // Se estiver lendo, interrompe a leitura
    if (this.leituraAtiva) {
      window.speechSynthesis.cancel();
      this.leituraAtiva = false;
      return;
    }

    // Procura o conteúdo principal do Angular
    const conteudo =
      document.querySelector('main') ||
      document.querySelector('.main-content') ||
      document.querySelector('.content-wrapper') ||
      document.querySelector('app-root');

    if (!conteudo) {
      alert('Conteúdo do sistema não encontrado.');
      return;
    }

    // Cria uma cópia para não modificar o HTML original
    const copia = conteudo.cloneNode(true) as HTMLElement;

    // Remove elementos que não devem ser lidos
    copia
      .querySelectorAll(
        'script, style, nav, footer, button, ' +
          '.barra-acessibilidade, .acessibilidade-container, ' +
          '[aria-hidden="true"]',
      )
      .forEach((elemento) => elemento.remove());

    // Obtém somente o texto
    const texto = copia.textContent?.replace(/\s+/g, ' ').trim() ?? '';

    if (!texto) {
      alert('Nenhum texto disponível para leitura.');
      return;
    }

    // Configura a leitura em português brasileiro
    const fala = new SpeechSynthesisUtterance(texto);

    fala.lang = 'pt-BR';
    fala.rate = 1;
    fala.pitch = 1;
    fala.volume = 1;

    fala.onstart = () => {
      this.leituraAtiva = true;
    };

    fala.onend = () => {
      this.leituraAtiva = false;
    };

    fala.onerror = () => {
      this.leituraAtiva = false;
    };

    // Inicia a leitura
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
