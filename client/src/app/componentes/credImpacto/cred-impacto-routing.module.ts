import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WhatIsComponent } from './what-is/what-is.component';
import { FluxoCapacitacaoComponent } from './fluxo-capacitacao/fluxo-capacitacao.component';
import { MonitoramentoComponent } from './monitoramento/monitoramento.component';
import { NegociosImpactoComponent } from './negocios-impacto/negocios-impacto.component';
import { FaqComponent } from './faq/faq.component';
import { FaleConoscoComponent } from './fale-conosco/fale-conosco.component';
import { CadastroComponent } from './cadastro/cadastro.component';
import { EditarDadosComponent } from './editar-dados/editar-dados.component';
import { BaseCondicoesComponent } from './base-condicoes/base-condicoes.component';

const routes: Routes = [
  {
    path: 'what-is',
    component: WhatIsComponent
  },

  {
    path: 'fluxo',
    component: FluxoCapacitacaoComponent
  },
  {
    path: 'monitoramento',
    component: MonitoramentoComponent
  },
  {
    path: 'negocios',
    component: NegociosImpactoComponent
  },
  {
    path: 'faq',
    component: FaqComponent
  },
  {
    path: 'faleconosco',
    component: FaleConoscoComponent
  },
  {
    path: 'cadastro',
    component: CadastroComponent
  },
  {
    path: 'editdados',
    component: EditarDadosComponent
  },
  {
    path: 'basecondicoes',
    component: BaseCondicoesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CredImpactoRoutingModule { }
