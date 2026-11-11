import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { LoginUser } from '../../../model/login-user.model';
import { UserService } from '../../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { cpfOrEmailValidator } from './validators/cpf-email.validators';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  @ViewChild("formLogin") formLogin!: NgForm;
  @ViewChild('formReset') formReset!: NgForm;
  loginUsers!: LoginUser;
  private identificadorComoCpf = false;

  constructor(
    private serviceUser: UserService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loginUsers = new LoginUser()
  }

  atualizarIdentificador(valor: string): void {
    if (!valor) {
      this.identificadorComoCpf = false;
      this.loginUsers.email = valor;
      return;
    }

    if (/[a-z@]/i.test(valor)) {
      if (this.identificadorComoCpf) {
        const separadorEmail = valor.indexOf('@');
        this.loginUsers.email =
          separadorEmail === -1
            ? valor.replace(/[.-]/g, '')
            : `${valor.slice(0, separadorEmail).replace(/[.-]/g, '')}${valor.slice(separadorEmail)}`;
      } else {
        this.loginUsers.email = valor;
      }
      this.identificadorComoCpf = false;
      return;
    }

    const digitos = valor.replace(/\D/g, '').slice(0, 11);
    this.loginUsers.email = this.formatarCpf(digitos);
    this.identificadorComoCpf = true;
  }

  private formatarCpf(cpf: string): string {
    if (cpf.length <= 3) {
      return cpf;
    }

    if (cpf.length <= 6) {
      return cpf.replace(/^(\d{3})(\d+)/, '$1.$2');
    }

    if (cpf.length <= 9) {
      return cpf.replace(/^(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    }

    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }

  login(): void {
    // this.loginUsers.password = this.serviceUser.CriptografarMD5(this.loginUsers.password)
    console.log('loginUser', this.loginUsers)
    this.serviceUser.login(this.loginUsers).subscribe({
      next: (res) => res,
      error: (e) => (this.toastr.error(e.error.message), this.formLogin.reset())
    })

  }

  gerarPin(){
    this.serviceUser.resetPin(this.loginUsers).subscribe(
      () =>{
        this.toastr.success('Verifique seu Email');
        this.formReset.reset();
      },
      (error) => {
        this.toastr.error('Erro durante o processo', error.error.message);
        this.formReset.reset();
      }
    );

  }

}
