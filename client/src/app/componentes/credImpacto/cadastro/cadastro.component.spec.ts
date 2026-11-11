import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { CadastroService } from '../../../services/cadastro.service';
import { CadastroComponent } from './cadastro.component';

describe('CadastroComponent', () => {
  let component: CadastroComponent;

  beforeEach(() => {
    const cadastroService = jasmine.createSpyObj<CadastroService>(
      'CadastroService',
      ['getCitys'],
    );
    cadastroService.getCitys.and.returnValue(of([]));

    component = new CadastroComponent(
      new FormBuilder(),
      cadastroService,
      jasmine.createSpyObj<ToastrService>('ToastrService', ['error']),
      jasmine.createSpyObj<Router>('Router', ['navigate']),
    );
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate the CPF as it is entered', () => {
    const cpfControl = component.f['cpf'];

    cpfControl.setValue('529.982.247');
    expect(cpfControl.errors).toEqual({ cpfIncomplete: true });

    cpfControl.setValue('529.982.247-24');
    expect(cpfControl.errors).toEqual({ cpfInvalid: true });

    cpfControl.setValue('529.982.247-25');
    expect(cpfControl.valid).toBeTrue();
  });

  it('should advance from impact to documents when visible fields are filled', () => {
    spyOn(window, 'scroll');
    component.step = 2;
    component.cadastroForm.patchValue({
      cadastro_cadimpacto: 'SIM',
      resumo_negocio: 'Resumo do negócio',
    });

    component.nextStep();

    expect(component.step).toBe(3);
    expect(component.cadastroForm.contains('status_atual')).toBeFalse();
    expect(component.cadastroForm.contains('area_atuacao')).toBeFalse();
  });
});
