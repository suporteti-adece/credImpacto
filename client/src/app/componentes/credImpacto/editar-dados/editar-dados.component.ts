import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CadastroService } from '../../../services/cadastro.service';
import { UserService } from '../../../services/user.service';
import { Cadastro } from '../../../model/cadastro.model';
import { Anexo } from '../../../model/anexo.model';
import { forkJoin } from 'rxjs';
import { Cidade } from '../../../model/cidade.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
@Component({
  selector: 'app-editar-dados',
  standalone: false,
  templateUrl: './editar-dados.component.html',
  styleUrl: './editar-dados.component.css',
})
export class EditarDadosComponent implements OnInit {
  empresa!: Cadastro;
  anexos: Anexo[] = [];
  city_list: Cidade[] = [];
  cadastroForm!: FormGroup;
  editando = false;
  loading = false;
  salvando = false;
  mensagem = '';
  erro = '';

  modalAberto = false;
  anexoSelecionado?: Anexo;
  anexoSelecionadoUrl?: SafeResourceUrl;
  anexoParaAlterar?: Anexo;
  @ViewChild('fileInput')
  fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private cadastroService: CadastroService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.criarFormulario();
    this.carregarDados();
    this.loadCities();
  }

  /*===================================
        CARREGAR CIDADES
    ===================================*/

  loadCities(): void {
    this.cadastroService.getCitys('takecitys').subscribe({
      next: (cities: Cidade[]) => {
        this.city_list = cities;
      },
      error: (error) => {
        console.error('Erro ao carregar cidades:', error);
      },
    });
  }

  // ============================================================
  // FORMULÁRIO
  // ============================================================

  criarFormulario(): void {
    this.cadastroForm = this.fb.group({
      tipo_proponente: [''],
      nome_responsavel: ['', Validators.required],

      // CPF e CNPJ serão somente leitura
      cpf: [''],
      cnpj: [''],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      nome_empreendimento: ['', Validators.required],
      cep: [''],
      cidade: [``],
      bairro: [''],
      rua: [''],
      numero: [''],
      complemento: [''],

      iniciativa_impacto: [''],
      cadastro_cadimpacto: [{ value: '', disabled: true }],
      // status_atual: [''],
      area_atuacao: [''],
      resumo_negocio: ['', [Validators.maxLength(1500)]],
    });
  }

  // ============================================================
  // CARREGAR USUÁRIO
  // ============================================================

  carregarDados(): void {
    this.loading = true;
    this.erro = '';
    this.userService.user$.subscribe({
      next: (user) => {
        // console.log('USUÁRIO DO JWT:', user);
        // console.log('ID:', user?.id);
        // console.log('CHAVES:', Object.keys(user || {}));

        if (!user) {
          this.erro = 'Usuário não encontrado.';
          this.loading = false;
          return;
        }

        /*
         * Aqui estou considerando que o ID do cadastro
         * está disponível no usuário autenticado.
         *
         * Se seu JWT possuir outro nome para esse campo,
         * ajuste user.id.
         */

        const id = user._id;

        if (!id) {
          this.erro = 'Não foi possível identificar o cadastro do usuário.';
          this.loading = false;
          return;
        }
        forkJoin({
          empresa: this.cadastroService.empresaId(id),
          anexos: this.cadastroService.imagensId(id),
        }).subscribe({
          next: (resultado) => {
            this.empresa = resultado.empresa;
            this.anexos = resultado.anexos;
            this.preencherFormulario();
            this.cadastroForm.get('tipo_proponente')?.disable();
            this.cadastroForm.get('cidade')?.disable();
            this.loading = false;
            console.log('empresa', this.empresa);
          },
          error: (error) => {
            console.error('Erro ao carregar dados:', error);
            this.erro = 'Não foi possível carregar seus dados.';
            this.loading = false;
          },
        });
      },
      error: () => {
        this.erro = 'Erro ao carregar usuário.';
        this.loading = false;
      },
    });
  }

  // ============================================================
  // PREENCHER FORMULÁRIO
  // ============================================================

  preencherFormulario(): void {
    if (!this.empresa) {
      return;
    }

    this.cadastroForm.patchValue({
      tipo_proponente: this.empresa.tipo_proponente,
      nome_responsavel: this.empresa.nome_responsavel,
      cpf: this.empresa.cpf,
      telefone: this.empresa.telefone,
      email: this.empresa.email,
      cnpj: this.empresa.cnpj,
      nome_empreendimento: this.empresa.nome_empreendimento,
      cep: this.empresa.cep,
      cidade: this.empresa.cidade,
      bairro: this.empresa.bairro,
      rua: this.empresa.rua,
      numero: this.empresa.numero,
      complemento: this.empresa.complemento,
      iniciativa_impacto: this.empresa.iniciativa_impacto,
      cadastro_cadimpacto: this.empresa.cadastro_cadimpacto,
      // status_atual: this.empresa.status_atual,
      // area_atuacao: this.empresa.area_atuacao,
      resumo_negocio: this.empresa.resumo_negocio,
    });
  }

  // ============================================================
  // EDITAR
  // ============================================================

  editar(): void {
    this.editando = true;
    this.cadastroForm.get('tipo_proponente')?.enable();
    this.cadastroForm.get('cidade')?.enable();
    this.cadastroForm.get('cadastro_cadimpacto')?.enable();
    this.mensagem = '';
    this.erro = '';
  }

  // ============================================================
  // CANCELAR
  // ============================================================

  cancelar(): void {
    this.editando = false;
    this.preencherFormulario();
    this.cadastroForm.get('tipo_proponente')?.disable();
    this.cadastroForm.get('cidade')?.disable();
    this.cadastroForm.get('cadastro_cadimpacto')?.disable();
    this.mensagem = '';
    this.erro = '';
  }

  // ============================================================
  // BUSCAR EMPRESA
  // ============================================================

  buscarEmpresa(id: number): void {
    this.cadastroService.empresaId(id).subscribe({
      next: (data: Cadastro) => {
        this.empresa = data;
        console.log('empresa', this.empresa);
        this.preencherFormulario();
      },
      error: (error) => {
        console.error('Erro ao buscar empresa:', error);
        this.erro = 'Não foi possível carregar seus dados.';
        this.loading = false;
      },
    });
  }

  // ============================================================
  // EDITAR EIXO-IMPACTO
  // ============================================================

  selecionarEixo(eixo: string): void {
    if (!this.editando) {
      return;
    }
    this.cadastroForm.get('iniciativa_impacto')?.setValue(eixo);
  }

  // ============================================================
  // PEGAR ANEXOS
  // ============================================================

  anexosById(id: number): void {
    this.cadastroService.imagensId(id).subscribe({
      next: (data: Anexo[]) => {
        this.anexos = data;
        console.log('anexos', this.anexos);
      },

      error: (error) => {
        console.error('Erro ao buscar empresa:', error);
        this.erro = 'Não foi possível carregar seus dados.';
        this.loading = false;
      },
    });
  }

  // ============================================================
  // VISUALIZAR ANEXOS
  // ============================================================

  visualizarArquivo(anexo: Anexo): void {
    if (!anexo?.path) {
      return;
    }
    this.anexoSelecionado = anexo;
    this.anexoSelecionadoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      anexo.path,
    );
    this.modalAberto = true;
  }

  ehImagem(anexo?: Anexo): boolean {
    if (!anexo) {
      return false;
    }
    return anexo.mimetype?.startsWith('image/') ?? false;
  }

  ehPdf(anexo?: Anexo): boolean {
    if (!anexo) {
      return false;
    }
    return anexo.mimetype === 'application/pdf';
  }

  // ============================================================
  // FECHAR MODAL
  // ============================================================

  fecharModal(): void {
    this.modalAberto = false;
    this.anexoSelecionado = undefined;
    this.anexoSelecionadoUrl = undefined;
  }

  // ============================================================
  // SALVAR
  // ============================================================

  salvar(): void {
    if (this.cadastroForm.invalid) {
      this.cadastroForm.markAllAsTouched();
      return;
    }

    this.salvando = true;
    this.mensagem = '';
    this.erro = '';

    const dados = {
      tipo_proponente: this.cadastroForm.value.tipo_proponente,
      nome_responsavel: this.cadastroForm.value.nome_responsavel,
      telefone: this.cadastroForm.value.telefone,
      email: this.cadastroForm.value.email,
      nome_empreendimento: this.cadastroForm.value.nome_empreendimento,
      cep: this.cadastroForm.value.cep,
      cidade: this.cadastroForm.getRawValue().cidade,
      bairro: this.cadastroForm.value.bairro,
      rua: this.cadastroForm.value.rua,
      numero: this.cadastroForm.value.numero,
      complemento: this.cadastroForm.value.complemento,
      iniciativa_impacto: this.cadastroForm.value.iniciativa_impacto,
      cadastro_cadimpacto: this.cadastroForm.value.cadastro_cadimpacto,
      area_atuacao: this.cadastroForm.value.area_atuacao,
      resumo_negocio: this.cadastroForm.value.resumo_negocio,
    };

    this.cadastroService
      .atualizarEmpresa(Number(this.empresa.id), dados)
      .subscribe({
        next: (response) => {
          console.log('Dados atualizados:', response);
          this.mensagem = 'Dados atualizados com sucesso!';
          this.editando = false;
          this.salvando = false;
          this.cadastroForm.get('cadastro_cadimpacto')?.disable();

          // Atualiza os dados exibidos
          this.buscarEmpresa(Number(this.empresa.id));
        },

        error: (error) => {
          console.error('Erro ao atualizar:', error);
          this.erro =
            error?.error?.message || 'Não foi possível atualizar os dados.';
          this.salvando = false;
        },
      });
  }

  // ============================================================
  // ANEXOS
  // ============================================================

  get rg(): Anexo | undefined {
    return this.anexos?.find((anexo) => anexo.tipo_anexo === 'RG');
  }
  get cartaoCnpj(): Anexo | undefined {
    return this.anexos?.find((anexo) => anexo.tipo_anexo === 'CARTAO_CNPJ');
  }
  get fotos(): Anexo[] {
    return this.anexos?.filter((anexo) => anexo.tipo_anexo === 'FOTO') || [];
  }

  // ============================================================
  // ARQUIVO
  // ============================================================

  abrirArquivo(anexo: Anexo): void {
    if (!anexo?.path) {
      return;
    }
    window.open(anexo.path, '_blank');
  }

  // ============================================================
  // EDITAR ARQUIVO
  // ============================================================

  selecionarNovoArquivo(anexo: Anexo): void {
    this.anexoParaAlterar = anexo;
    this.fileInput.nativeElement.value = '';
    this.fileInput.nativeElement.click();
  }

  arquivoSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const arquivo = input.files[0];

    if (!this.anexoParaAlterar) {
      return;
    }
    this.alterarAnexo(this.anexoParaAlterar, arquivo);
  }

  alterarAnexo(anexo: Anexo, arquivo: File): void {
    if (!anexo.id) {
      return;
    }

    this.salvando = true;
    this.erro = '';
    this.mensagem = '';

    this.cadastroService.alterarAnexo(anexo.id, arquivo).subscribe({
      next: (response) => {
        console.log('Anexo alterado:', response);
        this.mensagem = 'Arquivo alterado com sucesso!';
        this.salvando = false;
        this.anexoParaAlterar = undefined;
        this.anexosById(Number(this.empresa.id));
      },

      error: (error) => {
        console.error('Erro ao alterar anexo:', error);

        this.erro =
          error?.error?.message || 'Não foi possível alterar o arquivo.';
        this.salvando = false;
      },
    });
  }

  excluirAnexo(anexo: Anexo): void {
    if (!anexo.id) {
      return;
    }

    const confirmar = confirm(`Deseja realmente excluir "${anexo.filename}"?`);

    if (!confirmar) {
      return;
    }

    this.salvando = true;
    this.erro = '';
    this.mensagem = '';

    this.cadastroService.excluirAnexo(anexo.id).subscribe({
      next: () => {
        this.mensagem = 'Arquivo excluído com sucesso!';
        this.salvando = false;
        this.anexosById(Number(this.empresa.id));
      },

      error: (error) => {
        console.error('Erro ao excluir anexo:', error);

        this.erro =
          error?.error?.message || 'Não foi possível excluir o arquivo.';
        this.salvando = false;
      },
    });
  }
}
