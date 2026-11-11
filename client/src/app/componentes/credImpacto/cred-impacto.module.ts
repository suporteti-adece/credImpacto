import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CredImpactoRoutingModule } from './cred-impacto-routing.module';
import { FluxoCapacitacaoComponent } from './fluxo-capacitacao/fluxo-capacitacao.component';
import { WhatIsComponent } from './what-is/what-is.component';
import { MonitoramentoComponent } from './monitoramento/monitoramento.component';
import { NegociosImpactoComponent } from './negocios-impacto/negocios-impacto.component';
import { FaqComponent } from './faq/faq.component';
import { FaleConoscoComponent } from './fale-conosco/fale-conosco.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CadastroComponent } from './cadastro/cadastro.component';
import { ToastrModule } from 'ngx-toastr';
import { EditarDadosComponent } from './editar-dados/editar-dados.component';
import { DiretivasModule } from '../../directives/diretivas.module';
import { BaseCondicoesComponent } from './base-condicoes/base-condicoes.component';

@NgModule({
  declarations: [
    WhatIsComponent,
    FluxoCapacitacaoComponent,
    MonitoramentoComponent,
    NegociosImpactoComponent,
    FaqComponent,
    FaleConoscoComponent,
    CadastroComponent,
    EditarDadosComponent,
    BaseCondicoesComponent
  ],
  imports: [
    CommonModule,
    CredImpactoRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    DiretivasModule
  ]
})
export class CredImpactoModule { }
