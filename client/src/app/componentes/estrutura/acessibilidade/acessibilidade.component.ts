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

    const velocidadeSalva = Number(
      localStorage.getItem('acessibilidade_velocidade') ?? 1,
    );

    this.velocidadeLeitura = [0.75, 1, 1.25, 1.5].includes(velocidadeSalva)
      ? velocidadeSalva
      : 1;
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

  painelLeituraAberto = false;

  modoLeitura: 'pagina' | 'selecao' = 'pagina';
  velocidadeLeitura = 1;

  private falaAtual: SpeechSynthesisUtterance | null = null;
  private identificadorLeitura = 0;

  alternarPainelLeitura(): void {
    this.painelLeituraAberto = !this.painelLeituraAberto;
  }

  iniciarLeitura(): void {
    if (!('speechSynthesis' in window)) {
      alert('Seu navegador não suporta leitura por voz.');
      return;
    }

    let texto = '';

    if (this.modoLeitura === 'selecao') {
      texto = window.getSelection()?.toString().trim() ?? '';

      const elemento = document.activeElement;

      if (
        !texto &&
        (elemento instanceof HTMLTextAreaElement ||
          (elemento instanceof HTMLInputElement &&
            ['text', 'search', 'url', 'tel'].includes(elemento.type)))
      ) {
        const inicio = elemento.selectionStart;
        const fim = elemento.selectionEnd;

        if (inicio !== null && fim !== null && fim > inicio) {
          texto = elemento.value.substring(inicio, fim).trim();
        }
      }

      if (!texto) {
        alert('Selecione um texto antes de iniciar a leitura.');
        return;
      }
    } else {
      const conteudo =
        document.querySelector('main') ||
        document.querySelector('.main-content') ||
        document.querySelector('.content-wrapper') ||
        document.querySelector('app-root');

      if (!conteudo) {
        alert('Conteúdo da página não encontrado.');
        return;
      }

      const copia = conteudo.cloneNode(true) as HTMLElement;

      copia
        .querySelectorAll(
          'script, style, nav, footer, button, ' +
            '.barra-acessibilidade, .acessibilidade-container, ' +
            '[aria-hidden="true"], [hidden], ' +
            'input, select, textarea',
        )
        .forEach((elemento) => elemento.remove());

      texto = copia.textContent?.replace(/\s+/g, ' ').trim() ?? '';

      if (!texto) {
        alert('Nenhum conteúdo disponível para leitura.');
        return;
      }
    }

    // Cancela qualquer leitura anterior
    this.pararLeitura();

    const id = ++this.identificadorLeitura;

    const fala = new SpeechSynthesisUtterance(texto);

    fala.lang = 'pt-BR';
    fala.rate = this.velocidadeLeitura;
    fala.pitch = 1;
    fala.volume = 1;

    // ATIVA IMEDIATAMENTE O BOTÃO PARAR
    this.leituraAtiva = true;

    fala.onstart = () => {
      if (id === this.identificadorLeitura) {
        this.leituraAtiva = true;
      }
    };

    const finalizar = () => {
      if (id === this.identificadorLeitura) {
        this.leituraAtiva = false;
        this.falaAtual = null;
      }
    };

    fala.onend = finalizar;
    fala.onerror = finalizar;

    this.falaAtual = fala;

    window.speechSynthesis.speak(fala);
  }

  pararLeitura(): void {
    // Invalida eventos de leituras anteriores
    this.identificadorLeitura++;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.falaAtual = null;
    this.leituraAtiva = false;
  }

  alterarVelocidade(valor: string): void {
    const velocidade = Number(valor);

    if ([0.75, 1, 1.25, 1.5].includes(velocidade)) {
      this.velocidadeLeitura = velocidade;

      localStorage.setItem('acessibilidade_velocidade', String(velocidade));
    }
  }

  restaurar(): void {
    this.tamanhoFonte = 100;
    this.altoContraste = false;

    this.pararLeitura();

    this.velocidadeLeitura = 1;
    this.modoLeitura = 'pagina';
    localStorage.removeItem('acessibilidade_velocidade');

    this.leituraAtiva = false;
    this.aplicarFonte();
    this.aplicarContraste();
  }

  barraExpandida = false;

  alternarBarra(): void {
    this.barraExpandida = !this.barraExpandida;

    if (!this.barraExpandida) {
      this.painelLeituraAberto = false;
    }

    localStorage.setItem('acessibilidade_barra', String(this.barraExpandida));
  }

  ngOnDestroy(): void {
    this.pararLeitura();
  }
}
