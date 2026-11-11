import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CadastroService } from '../../../services/cadastro.service';
import { Cadastro } from '../../../model/cadastro.model';
import { ViewportScroller } from '@angular/common';
import { min } from 'rxjs';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Cidade } from '../../../model/cidade.model';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { cpfValidator } from '../../../validators/cpf-email.validators';

interface DadosEmpresa {
  cnpj: string | null;
  data_inicio_atividade: string | null;
  cnae_principal_codigo: string | null;
  cnae_principal_descricao: string | null;
  natureza_juridica: string | null;
  capital_social: string | null;
  nome_socio: string | null;
  qualificacao: string | null;
}

@Component({
  selector: 'app-cadastro',
  standalone: false,
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css',
})
export class CadastroComponent implements OnInit {
  /*===================================
      WIZARD
  ===================================*/

  step: number = 1;

  /*===================================
      FORMULÁRIO
  ===================================*/

  cadastroForm!: FormGroup;
  cadastro!: Cadastro;
  passwordPtn =
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&()_+\\-=\\[\\]{};:\'",.<>/?\\\\|`~#^]).{8,}$';

  /*===================================
      LISTAS
  ===================================*/

  city_list: Cidade[] = [];
  dados_empresas: DadosEmpresa[] = [];
  empresaCarregando = false;
  empresaConsultada = false;
  erroConsultaEmpresa = '';

  /*===================================
      UPLOAD
  ===================================*/

  rgFile?: File;
  cnpjFile?: File;
  fotos: File[] = [];

  private readonly MAX_RG = 2 * 1024 * 1024; // 2 MB
  private readonly MAX_CNPJ = 2 * 1024 * 1024; // 2 MB
  private readonly MAX_FOTOS = 5 * 1024 * 1024; // 5 MB

  /*===================================
      CONTROLE
  ===================================*/

  loading: boolean = false;
  progress: number = 0;

  constructor(
    private fb: FormBuilder,
    private cadastroService: CadastroService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.cadastro = new Cadastro();
    this.loadCities();
  }

  /*===================================
      FORM
  ===================================*/

  private createForm(): void {
    this.cadastroForm = this.fb.group(
      {
        /*===================================
      PERFIL
      ===================================*/

        tipo_proponente: ['', Validators.required],
        nome_responsavel: ['', [Validators.required, Validators.minLength(3)]],
        cpf: ['', [Validators.required, cpfValidator()]],
        telefone: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        cnpj: ['', Validators.required],
        password: [
          '',
          [Validators.required, Validators.pattern(this.passwordPtn)],
        ],
        confirm_password: ['', Validators.required],

        profile_id: ['7'],
        nome_empreendimento: ['', Validators.required],
        cep: ['', Validators.required],
        cidade: [null, Validators.required],
        bairro: ['', Validators.required],
        rua: ['', Validators.required],
        numero: ['', Validators.required],
        complemento: [''],
        linha_credito: ['CredImpacto'],
        aceite_termos: [false, Validators.requiredTrue],

      /*===================================
      IMPACTO
      ===================================*/

        cadastro_cadimpacto: ['', Validators.required],
        resumo_negocio: ['', [Validators.required, Validators.maxLength(1500)]],

      /*===================================
      PERFIL
      ===================================*/

        rg: [null],
        cartaoCnpj: [null],
        fotos: [null],
      },
      {
        validators: this.passwordMatchValidator(),
      },
    );
  }

  /*===================================
      GETTER
  ===================================*/

  get f() {
    return this.cadastroForm.controls;
  }

  /*===================================
      COMPARAR SENHAS
  ===================================*/

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirm = control.get('confirm_password')?.value;

      if (!password || !confirm) {
        return null;
      }

      return password === confirm ? null : { passwordMismatch: true };
    };
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

  /*===================================
      CONSULTAS
  ===================================*/

  consultaCPF(epf: any, form: any) {
    this.cadastroService.consultarCPF(epf).subscribe((res: any) => {
      if (res.mensagem === 'CPF já cadastrado!') {
        this.toastr.error(res.mensagem);
        this.resetFormulario();
      } else {
        this.toastr.success(res.mensagem);
      }
    });
  }

  consultaCNPJ(epf: any, form: any) {
    this.cadastroService.consultarCNPJ(epf).subscribe((res: any) => {
      if (res.mensagem === 'CNPJ já cadastrado!') {
        this.toastr.error(res.mensagem);
        this.resetFormulario();
      } else {
        this.toastr.success(res.mensagem);
      }
    });
  }

  pegarDadosEmpresa(epf: any, form: any) {
    const cnpj = String(epf ?? '').replace(/\D/g, '');
    this.dados_empresas = [];
    this.empresaConsultada = false;
    this.erroConsultaEmpresa = '';

    if (cnpj.length !== 14) {
      this.empresaCarregando = false;
      return;
    }

    this.empresaCarregando = true;
    this.cadastroService.getCNPJ(cnpj).subscribe({
      next: (dados: DadosEmpresa[]) => {
        this.dados_empresas = dados;
        this.empresaConsultada = true;
        this.empresaCarregando = false;
      },
      error: (erro: any) => {
        this.empresaCarregando = false;
        this.erroConsultaEmpresa =
          erro.error?.message || 'Não foi possível consultar os dados do CNPJ.';
        this.toastr.error(this.erroConsultaEmpresa);
      },
    });
  }

  consultarEmpresa(cnpj: string): void {
    this.consultaCNPJ(cnpj, this.cadastroForm);
    this.pegarDadosEmpresa(cnpj, this.cadastroForm);
  }

  private normalizarNome(nome: string): string {
    return nome
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLocaleUpperCase('pt-BR');
  }

  get responsavelEhSocio(): boolean {
    const responsavel = this.normalizarNome(
      this.f['nome_responsavel']?.value ?? '',
    );
    return !!responsavel && this.dados_empresas.some(
      (empresa) => this.normalizarNome(empresa.nome_socio ?? '') === responsavel,
    );
  }

  consultaEmail(email: any, form: any) {
    this.cadastroService.consultarEmail(email).subscribe((res: any) => {
      if (res.mensagem === 'Email já cadastrado!') {
        this.toastr.error(res.mensagem);
        this.resetFormulario();
      } else {
        this.toastr.success(res.mensagem);
      }
    });
  }

  /*===================================
      BUSCAR CEP
  ===================================*/

  buscarCEP(): void {
    const cep = this.f['cep'].value;
    if (!cep) {
      return;
    }
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) {
      alert('CEP inválido. O CEP deve conter 8 dígitos.');
      return;
    }
    this.cadastroService.getAddressByCEP(cepLimpo).subscribe({
      next: (endereco) => {
        this.cadastroForm.patchValue({
          rua: endereco.logradouro,
          bairro: endereco.bairro,
          // cidade: this.city_list.find(city => city.nome === endereco.localidade)?.id || null
        });
        const cidade = this.city_list.find(
          (c) =>
            c.nome_municipio?.toUpperCase() ===
            endereco.localidade.toUpperCase(),
        );
        if (cidade) {
          this.cadastroForm.patchValue({ cidade: cidade.id });
        }
      },
      error: () => {
        console.error('Erro ao buscar endereço pelo CEP.');
      },
    });
  }

  /*===================================
    AVANÇAR ETAPA
===================================*/

  nextStep(): void {
    if (!this.validarEtapaAtual()) {
      this.markFields();
      return;
    }

    if (this.step < 3) {
      this.step++;
      this.scrollTop();
    }
  }

  /*===================================
    VOLTAR ETAPA
===================================*/

  previousStep(): void {
    if (this.step > 1) {
      this.step--;
      this.scrollTop();
    }
  }

  /*===================================
    SCROLL
===================================*/

  private scrollTop(): void {
    window.scroll({
      top: 0,

      behavior: 'smooth',
    });
  }

  /*===================================
  VALIDA ETAPA
  ===================================*/

  private validarEtapaAtual(): boolean {
    switch (this.step) {
      case 1:
        return this.validarPerfil();

      case 2:
        return this.validarImpacto();

      case 3:
        return this.validarDocumento();
      default:
        return true;
    }
  }

  private validarPerfil(): boolean {
    const campos = [
      'tipo_proponente',
      'nome_responsavel',
      'cpf',
      'telefone',
      'email',
      'cnpj',
      'nome_empreendimento',
      'cep',
      'cidade',
      'bairro',
      'rua',
      'numero',
    ];

    const camposValidos = this.validarCampos(campos);
    if (!this.responsavelEhSocio) {
      this.toastr.error(
        'O nome do responsável deve ser igual ao nome de um dos sócios do CNPJ.',
      );
      return false;
    }

    return camposValidos;
  }

  private validarImpacto(): boolean {
    const campos = [
      'cadastro_cadimpacto',
      'resumo_negocio',
    ];

    return this.validarCampos(campos);
  }

  private validarDocumento(): boolean {
    return this.f['aceite_termos'].valid;
  }

  private validarCampos(campos: string[]): boolean {
    return campos.every((campo) => this.f[campo].valid);
  }

  markFields(): void {
    Object.values(this.cadastroForm.controls)

      .forEach((control) => {
        control.markAsTouched();
        control.updateValueAndValidity();
      });
  }

  /*===================================
      UPLOAD RG
  ===================================*/

  uploadRg(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const arquivo = input.files[0];

    if (arquivo.size > this.MAX_RG) {
      alert('O RG deve possuir no máximo 2 MB.');
      input.value = '';
      return;
    }

    this.rgFile = arquivo;
    this.cadastroForm.patchValue({
      rg: arquivo.name,
    });
  }

  /*===================================
      UPLOAD CARTÃO CNPJ
  ===================================*/

  uploadCnpj(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const arquivo = input.files[0];

    if (arquivo.size > this.MAX_CNPJ) {
      alert('O Cartão CNPJ deve possuir no máximo 2 MB.');
      input.value = '';
      return;
    }

    this.cnpjFile = arquivo;
    this.cadastroForm.patchValue({
      cartaoCnpj: arquivo.name,
    });
  }

  /*===================================
      UPLOAD FOTOS
  ===================================*/

  uploadFotos(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    const arquivos = Array.from(input.files);

    const tamanhoTotal = arquivos.reduce((total, foto) => total + foto.size, 0);

    if (tamanhoTotal > this.MAX_FOTOS) {
      alert('O conjunto das fotos deve possuir no máximo 5 MB.');
      input.value = '';
      return;
    }

    this.fotos = arquivos;
    this.cadastroForm.patchValue({
      fotos: arquivos.map((f) => f.name).join(', '),
    });
  }

  /*===================================
      MODEL
  ===================================*/

  private montarCadastro(): Cadastro {
    return Object.assign(
      new Cadastro(),
      this.cadastro,
      this.cadastroForm.getRawValue(),
    );
  }

  /*===================================
      FORMDATA
  ===================================*/

  private criarFormData(cadastro: Cadastro): FormData {
    const formData = new FormData();

    // Cria uma cópia para remover os campos de arquivos
    const dados = { ...cadastro };

    delete dados.rg;
    delete dados.cartaoCnpj;
    delete dados.fotos;

    // Envia o objeto inteiro como JSON
    formData.append('dados', JSON.stringify(dados));

    // RG
    if (this.rgFile) {
      formData.append('rgFile', this.rgFile);
    }

    // Cartão CNPJ
    if (this.cnpjFile) {
      formData.append('cnpjFile', this.cnpjFile);
    }

    // Fotos
    this.fotos.forEach((foto) => {
      formData.append('fotos', foto);
    });

    return formData;
  }

  /*===================================
      ENVIAR
  ===================================*/

  submit(): void {
    if (!this.responsavelEhSocio) {
      this.toastr.error(
        'O nome do responsável deve ser igual ao nome de um dos sócios do CNPJ.',
      );
      return;
    }

    if (this.cadastroForm.invalid) {
      this.markFields();

      Swal.fire({
        icon: 'warning',
        title: 'Atenção!',
        text: 'Verifique os campos obrigatórios antes de enviar o cadastro.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#198754',
      });
      return;
    }

    this.loading = true;
    this.progress = 0;
    this.cadastro = this.montarCadastro();
    console.log('Cadastro montado:', this.cadastro);
    const formData = this.criarFormData(this.cadastro);

    this.cadastroService.salvar(formData).subscribe({
      next: (event) => {
        this.processarUpload(event);
      },

      error: (erro) => {
        console.error(erro);
        this.loading = false;
        // alert('Erro ao enviar cadastro.');
        Swal.fire({
          icon: 'error',
          title: 'Erro no cadastro!',
          text: 'Não foi possível realizar o cadastro. Verifique os dados e tente novamente.',
          confirmButtonText: 'Tentar novamente',
          confirmButtonColor: '#dc3545',
        });
      },
    });
  }

  /*===================================
      UPLOAD
  ===================================*/

  private processarUpload(event: HttpEvent<any>): void {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        if (event.total) {
          this.progress = Math.round((event.loaded * 100) / event.total);
        }

        break;

      case HttpEventType.Response:
        this.loading = false;
        this.progress = 100;
        // alert('Cadastro realizado com sucesso!');

        Swal.fire({
          icon: 'success',
          title: 'Cadastro realizado!',
          text: 'Seu cadastro foi realizado com sucesso.',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#198754',
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then(() => {
          this.resetFormulario();
        });
        break;
    }
  }

  /*===================================
      LIMPAR
  ===================================*/

  private resetFormulario(): void {
    this.step = 1;
    this.cadastro = new Cadastro();
    this.cadastroForm.reset();
    this.cadastroForm.patchValue({
      aceite_termos: false,
    });
    this.dados_empresas = [];
    this.empresaConsultada = false;
    this.empresaCarregando = false;
    this.erroConsultaEmpresa = '';

    this.rgFile = undefined;
    this.cnpjFile = undefined;
    this.fotos = [];
    this.router.navigate(['/login']);
  }

  /*===================================
      CONTADOR CARACTERE
  ===================================*/

  get resumoLength(): number {
    return this.f['resumo_negocio'].value?.length ?? 0;
  }
}
