import { LoginComponent } from './login.component';
import { UserService } from '../../../services/user.service';
import { ToastrService } from 'ngx-toastr';

describe('LoginComponent', () => {
  let component: LoginComponent;

  beforeEach(() => {
    component = new LoginComponent(
      jasmine.createSpyObj<UserService>('UserService', ['login', 'resetPin']),
      jasmine.createSpyObj<ToastrService>('ToastrService', ['error', 'success']),
    );
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('formats numeric input as a CPF while typing', () => {
    component.atualizarIdentificador('12345678901');

    expect(component.loginUsers.email).toBe('123.456.789-01');
  });

  it('keeps email input unformatted', () => {
    component.atualizarIdentificador('usuario@example.com');

    expect(component.loginUsers.email).toBe('usuario@example.com');
  });

  it('removes CPF mask punctuation when numeric input becomes an email', () => {
    component.atualizarIdentificador('1234');
    component.atualizarIdentificador('1.234@exemplo.com');

    expect(component.loginUsers.email).toBe('1234@exemplo.com');
  });
});
