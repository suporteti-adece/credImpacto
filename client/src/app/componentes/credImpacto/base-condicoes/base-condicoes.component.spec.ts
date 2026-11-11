import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseCondicoesComponent } from './base-condicoes.component';

describe('BaseCondicoesComponent', () => {
  let component: BaseCondicoesComponent;
  let fixture: ComponentFixture<BaseCondicoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseCondicoesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseCondicoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
