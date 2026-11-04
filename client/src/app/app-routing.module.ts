import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './componentes/estrutura/home/home.component';
import { EmptyLayoutComponent } from './layouts/empty-layout/empty-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginComponent } from './componentes/sistema/login/login.component';
import { ResetSenhaComponent } from './componentes/sistema/reset-senha/reset-senha.component';
import { MenuLateralComponent } from './layouts/menu-lateral/menu-lateral.component';

const routes: Routes = [
  // Layout sem Header/Footer
  {
    path: '',
    component: EmptyLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'resetsenha',
        component: ResetSenhaComponent,
      },
    ],
  },

  // Layout com Header/Footer
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'credimpacto',
        loadChildren: () =>
          import('./componentes/credImpacto/cred-impacto.module').then(
            (m) => m.CredImpactoModule,
          ),
      },

      {
        path: 'credimpacto/questionario',
        loadChildren: () =>
          import('./componentes/questionario/questionario.module').then(
            (m) => m.QuestionarioModule,
          ),
      },
    ],
  },

  // Layout com Menu Lateral
  {
    path: '',
    component: MenuLateralComponent,
    children: [
      {
        path: 'admin',
        loadChildren: () =>
          import('./componentes/admin/admin.module').then(
            (ml) => ml.AdminModule,
          ),
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'home',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
