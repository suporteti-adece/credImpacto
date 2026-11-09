import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-acessibilidade',
  standalone: false,
  templateUrl: './acessibilidade.component.html',
  styleUrl: './acessibilidade.component.css',
})
export class AcessibilidadeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('containerAcessibilidade') containerAcessibilidade!: ElementRef<HTMLElement>;
  @ViewChild('painelLeitura') painelLeitura?: ElementRef<HTMLElement>;

  tamanhoFonte = 100;
  altoContraste = false;
  barraExpandida = false;
  painelLeituraAberto = false;
  leituraAtiva = false;
  modoLeitura: 'pagina' | 'selecao' = 'pagina';
  velocidadeLeitura = 1;

  posicaoX = 20;
  posicaoY = 20;
  painelX = 12;
  painelY = 12;
  arrastando = false;

  private pointerIdAtivo: number | null = null;
  private elementoArrastado: HTMLElement | null = null;
  private inicioX = 0;
  private inicioY = 0;
  private posicaoInicialX = 0;
  private posicaoInicialY = 0;
  private houveMovimento = false;
  private ignorarProximoClique = false;
  private identificadorLeitura = 0;
  private falaAtual: SpeechSynthesisUtterance | null = null;
  private frameLayout: number | null = null;

  constructor(private renderer: Renderer2, private zone: NgZone) {}

  ngOnInit(): void {
    const fonte = Number(localStorage.getItem('acessibilidade_fonte') ?? 100);
    this.tamanhoFonte = Number.isFinite(fonte) && fonte >= 80 && fonte <= 200 ? fonte : 100;
    this.altoContraste = localStorage.getItem('acessibilidade_contraste') === 'true';
    this.barraExpandida = localStorage.getItem('acessibilidade_barra') === 'true';
    const velocidade = Number(localStorage.getItem('acessibilidade_velocidade') ?? 1);
    this.velocidadeLeitura = [0.75, 1, 1.25, 1.5].includes(velocidade) ? velocidade : 1;
    this.recuperarPosicao();
    this.aplicarFonte();
    this.aplicarContraste();
  }

  ngAfterViewInit(): void {
    this.agendarAjusteLayout();
  }

  private posicaoPadrao(): void {
    this.posicaoX = 20;
    this.posicaoY = Math.max(12, window.innerHeight - 170);
  }

  private recuperarPosicao(): void {
    this.posicaoPadrao();
    const salva = localStorage.getItem('acessibilidade_posicao');
    if (!salva) return;
    try {
      const posicao = JSON.parse(salva);
      if (Number.isFinite(posicao?.x) && Number.isFinite(posicao?.y)) {
        this.posicaoX = posicao.x;
        this.posicaoY = posicao.y;
      }
    } catch {
      localStorage.removeItem('acessibilidade_posicao');
    }
  }

  private salvarPosicao(): void {
    localStorage.setItem('acessibilidade_posicao', JSON.stringify({ x: this.posicaoX, y: this.posicaoY }));
  }

  restaurarPosicao(): void {
    localStorage.removeItem('acessibilidade_posicao');
    this.posicaoPadrao();
    this.agendarAjusteLayout();
  }

  private limitarPosicao(): void {
    const elemento = this.containerAcessibilidade?.nativeElement;
    if (!elemento) return;
    this.posicaoX = Math.max(0, Math.min(this.posicaoX, Math.max(0, window.innerWidth - elemento.offsetWidth)));
    this.posicaoY = Math.max(0, Math.min(this.posicaoY, Math.max(0, window.innerHeight - elemento.offsetHeight)));
  }

  private agendarAjusteLayout(): void {
    if (this.frameLayout !== null) cancelAnimationFrame(this.frameLayout);
    this.frameLayout = requestAnimationFrame(() => {
      this.frameLayout = null;
      this.zone.run(() => {
        this.limitarPosicao();
        this.posicionarPainel();
      });
    });
  }

  private posicionarPainel(): void {
    if (!this.painelLeituraAberto || !this.barraExpandida) return;
    const ancora = this.containerAcessibilidade?.nativeElement;
    const painel = this.painelLeitura?.nativeElement;
    if (!ancora || !painel) return;
    const rect = ancora.getBoundingClientRect();
    const largura = painel.offsetWidth;
    const altura = painel.offsetHeight;
    const margem = 12;
    this.painelX = Math.max(margem, Math.min(rect.left, window.innerWidth - largura - margem));
    const acima = rect.top - altura - margem;
    const abaixo = rect.bottom + margem;
    this.painelY = acima >= margem ? acima :
      abaixo + altura <= window.innerHeight - margem ? abaixo :
      Math.max(margem, Math.min(abaixo, window.innerHeight - altura - margem));
  }

  iniciarArraste(event: PointerEvent): void {
    if (event.button !== 0 || !event.isPrimary) return;
    const botao = event.currentTarget as HTMLElement;
    this.arrastando = true;
    this.houveMovimento = false;
    this.ignorarProximoClique = false;
    this.pointerIdAtivo = event.pointerId;
    this.elementoArrastado = botao;
    this.inicioX = event.clientX;
    this.inicioY = event.clientY;
    this.posicaoInicialX = this.posicaoX;
    this.posicaoInicialY = this.posicaoY;
    botao.setPointerCapture(event.pointerId);
  }

  moverArraste(event: PointerEvent): void {
    if (!this.arrastando || event.pointerId !== this.pointerIdAtivo) return;
    const dx = event.clientX - this.inicioX;
    const dy = event.clientY - this.inicioY;
    if (Math.hypot(dx, dy) > 5) this.houveMovimento = true;
    if (!this.houveMovimento) return;
    this.posicaoX = this.posicaoInicialX + dx;
    this.posicaoY = this.posicaoInicialY + dy;
    this.limitarPosicao();
  }

  finalizarArraste(event: PointerEvent): void {
    if (!this.arrastando || event.pointerId !== this.pointerIdAtivo) return;
    const movido = this.houveMovimento;
    if (this.elementoArrastado?.hasPointerCapture(event.pointerId)) {
      this.elementoArrastado.releasePointerCapture(event.pointerId);
    }
    this.arrastando = false;
    this.pointerIdAtivo = null;
    this.elementoArrastado = null;
    this.houveMovimento = false;
    if (event.type === 'pointercancel') {
      this.ignorarProximoClique = false;
      return;
    }
    if (movido) {
      this.ignorarProximoClique = true;
      this.salvarPosicao();
    }
  }

  clicarBotaoFlutuante(): void {
    if (this.ignorarProximoClique) {
      this.ignorarProximoClique = false;
      return;
    }
    this.alternarBarra();
  }

  @HostListener('window:resize')
  aoRedimensionar(): void {
    this.agendarAjusteLayout();
  }

  alternarBarra(): void {
    this.barraExpandida = !this.barraExpandida;
    if (!this.barraExpandida) this.painelLeituraAberto = false;
    localStorage.setItem('acessibilidade_barra', String(this.barraExpandida));
    this.agendarAjusteLayout();
  }

  alternarPainelLeitura(): void {
    this.painelLeituraAberto = !this.painelLeituraAberto;
    this.agendarAjusteLayout();
  }

  aumentarFonte(): void {
    this.tamanhoFonte = Math.min(200, this.tamanhoFonte + 10);
    this.aplicarFonte();
    this.agendarAjusteLayout();
  }

  diminuirFonte(): void {
    this.tamanhoFonte = Math.max(80, this.tamanhoFonte - 10);
    this.aplicarFonte();
    this.agendarAjusteLayout();
  }

  private aplicarFonte(): void {
    this.renderer.setStyle(document.documentElement, 'font-size', `${this.tamanhoFonte}%`);
    localStorage.setItem('acessibilidade_fonte', String(this.tamanhoFonte));
  }

  alternarContraste(): void {
    this.altoContraste = !this.altoContraste;
    this.aplicarContraste();
  }

  private aplicarContraste(): void {
    if (this.altoContraste) this.renderer.addClass(document.body, 'alto-contraste');
    else this.renderer.removeClass(document.body, 'alto-contraste');
    localStorage.setItem('acessibilidade_contraste', String(this.altoContraste));
  }

  alterarVelocidade(valor: number | string): void {
    const velocidade = Number(valor);
    if (![0.75, 1, 1.25, 1.5].includes(velocidade)) return;
    this.velocidadeLeitura = velocidade;
    localStorage.setItem('acessibilidade_velocidade', String(velocidade));
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
      if (!texto && (elemento instanceof HTMLTextAreaElement ||
        (elemento instanceof HTMLInputElement && ['text', 'search', 'url', 'tel'].includes(elemento.type)))) {
        const inicio = elemento.selectionStart;
        const fim = elemento.selectionEnd;
        if (inicio !== null && fim !== null && fim > inicio) texto = elemento.value.substring(inicio, fim).trim();
      }
      if (!texto) {
        alert('Selecione um texto antes de iniciar a leitura.');
        return;
      }
    } else {
      const conteudo = document.querySelector('main') ||
        document.querySelector('.main-content') ||
        document.querySelector('.content-wrapper') ||
        document.querySelector('app-root');
      if (!conteudo) {
        alert('Conteúdo da página não encontrado.');
        return;
      }
      const copia = conteudo.cloneNode(true) as HTMLElement;
      copia.querySelectorAll('script, style, nav, footer, button, .barra-acessibilidade, ' +
        '.acessibilidade-container, [aria-hidden="true"], [hidden], input, select, textarea')
        .forEach(elemento => elemento.remove());
      texto = copia.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      if (!texto) {
        alert('Nenhum conteúdo disponível para leitura.');
        return;
      }
    }
    this.pararLeitura();
    const id = ++this.identificadorLeitura;
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = 'pt-BR';
    fala.rate = this.velocidadeLeitura;
    fala.pitch = 1;
    fala.volume = 1;
    this.leituraAtiva = true;
    const finalizar = () => this.zone.run(() => {
      if (id !== this.identificadorLeitura) return;
      this.leituraAtiva = false;
      this.falaAtual = null;
    });
    fala.onend = finalizar;
    fala.onerror = finalizar;
    this.falaAtual = fala;
    window.speechSynthesis.speak(fala);
  }

  pararLeitura(): void {
    this.identificadorLeitura++;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    this.falaAtual = null;
    this.leituraAtiva = false;
  }

  restaurar(): void {
    this.tamanhoFonte = 100;
    this.altoContraste = false;
    this.pararLeitura();
    this.velocidadeLeitura = 1;
    this.modoLeitura = 'pagina';
    localStorage.removeItem('acessibilidade_velocidade');
    this.aplicarFonte();
    this.aplicarContraste();
    this.agendarAjusteLayout();
  }

  ngOnDestroy(): void {
    if (this.frameLayout !== null) cancelAnimationFrame(this.frameLayout);
    this.pararLeitura();
  }
}
