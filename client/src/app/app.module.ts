import { NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import localePt from '@angular/common/locales/pt';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './componentes/estrutura/header/header.component';
import { FooterComponent } from './componentes/estrutura/footer/footer.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './componentes/estrutura/home/home.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { EmptyLayoutComponent } from './layouts/empty-layout/empty-layout.component';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';
import { LoginComponent } from './componentes/sistema/login/login.component';
import { ResetSenhaComponent } from './componentes/sistema/reset-senha/reset-senha.component';
import { CpfOrEmailValidatorDirective } from './componentes/sistema/login/directives/cpf-or-email-validator.directive';
import { HeaderAdminComponent } from './layouts/menu-lateral/estrutura/header-admin/header-admin.component';
import { SidebarComponent } from './layouts/menu-lateral/estrutura/sidebar/sidebar.component';
import { MenuLateralComponent } from './layouts/menu-lateral/menu-lateral.component';
import { authInterceptor } from './services/interceptors/auth.interceptor';
import { DiretivasModule } from './directives/diretivas.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AcessibilidadeComponent } from './componentes/estrutura/acessibilidade/acessibilidade.component';

registerLocaleData(localePt, 'pt-BR');

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    HomeComponent,
    MainLayoutComponent,
    EmptyLayoutComponent,
    LoginComponent,
    ResetSenhaComponent,
    HeaderAdminComponent,
    SidebarComponent,
    MenuLateralComponent,
    AcessibilidadeComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    CpfOrEmailValidatorDirective
  ],
  providers: [provideHttpClient(withInterceptors([authInterceptor]))],
  bootstrap: [AppComponent],
})
export class AppModule {}
