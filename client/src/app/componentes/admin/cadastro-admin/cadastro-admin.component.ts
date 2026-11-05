import { Component, OnInit } from '@angular/core';
import { Cidade } from '../../../model/cidade.model';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CadastroService } from '../../../services/cadastro.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Perfil } from '../../../model/perfil.model';
import { Agente } from '../../../model/agente.model';

@Component({
  selector: 'app-cadastro-admin',
  standalone: false,
  templateUrl: './cadastro-admin.component.html',
  styleUrl: './cadastro-admin.component.css',
})
export class CadastroAdminComponent implements OnInit {
  /*===================================
      FORMULÁRIO
  ===================================*/

  cadastroForm!: FormGroup;
  cadastro!: Agente;
  passwordPtn =
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&()_+\\-=\\[\\]{};:\'",.<>/?\\\\|`~#^]).{8,}$';

  /*===================================
      LISTAS
  ===================================*/

  city_list: Cidade[] = [];
  profile_list!: Perfil[];

  /*===================================
      CONTROLE
  ===================================*/

  loading: boolean = false;
  progress: number = 0;

  constructor(
    private fb: FormBuilder,
    private cadastroService: CadastroService,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.cadastro = new Agente();
    this.loadCities();
    this.loadProfile();
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

        nome: ['', [Validators.required, Validators.minLength(3)]],
        cpf: ['', Validators.required],
        telefone: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [Validators.required, Validators.pattern(this.passwordPtn)],
        ],
        confirm_password: ['', Validators.required],
        profile_id: ['', Validators.required],
        cep: ['', Validators.required],
        cidade: [null, Validators.required],
        bairro: ['', Validators.required],
        rua: ['', Validators.required],
        numero: ['', Validators.required],
        complemento: [''],
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
      CARREGAR PERFIL
  ===================================*/

  loadProfile(): void {
    this.cadastroService.getProfiles('pegarperfils').subscribe({
      next: (profiles: Perfil[]) => {
        this.profile_list = profiles;
      },
      error: (error) => {
        console.error('Erro ao carregar perfis:', error);
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
      VALIDAR FORMULÁRIO
  ===================================*/

  private validarFormulario(): boolean {
    return this.cadastroForm.valid;
  }

  /*===================================
      MODEL
  ===================================*/

  private montarCadastro(): Agente {
    return Object.assign(
      new Agente(),
      this.cadastro,
      this.cadastroForm.getRawValue(),
    );
  }

  /*===================================
      ENVIAR
  ===================================*/

  submit(): void {
    if (this.cadastroForm.invalid) {

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
    this.cadastroService.salvarAdmin(this.cadastro).subscribe({
      next: (res) => {
        this.loading = false;
        this.progress = 100;

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
      },

      error: (erro) => {
        console.error(erro);

        this.loading = false;

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
      LIMPAR
  ===================================*/

  private resetFormulario(): void {
    this.cadastro = new Agente();
    this.cadastroForm.reset();
  }
}
