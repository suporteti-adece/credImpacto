import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CadastroService } from '../../../services/cadastro.service';
import { Cidade } from '../../../model/cidade.model';
import { Perfil } from '../../../model/perfil.model';

@Component({
  selector: 'app-view-admin',
  standalone: false,
  templateUrl: './view-admin.component.html',
  styleUrl: './view-admin.component.css',
})
export class ViewAdminComponent implements OnInit {
  agentes: any[] = [];
  agentesFiltradas: any[] = [];
  paginatedAgentes: any[] = [];
  anexos: any[] = [];
  agenteSelecionada: any = null;
  agenteForm!: FormGroup;
  filtro = '';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  sortField = 'nome';
  sortDirection: 'asc' | 'desc' = 'asc';
  modalDetalhesAberto = false;
  carregando = false;
  salvando = false;
  mensagem = '';
  buscandoCep = false;
  erroCep = '';

  /*===================================
        LISTAS
  ===================================*/

  city_list: Cidade[] = [];
  perfis: Perfil[] = [];

  constructor(
    private cadastroService: CadastroService,
    private fb: FormBuilder,
  ) {
    this.agenteForm = this.fb.group({
      nome: ['', Validators.required],
      cpf: [
        '',
        [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(12),
        ],
      ],
      telefone: [''],
      email: ['', [Validators.required, Validators.email]],
      cep: [''],
      cidade: ['', Validators.required],
      bairro: [''],
      rua: [''],
      numero: [''],
      complemento: [''],
      profile_id: ['', Validators.required],
      user_active: [true],
    });
  }

  ngOnInit(): void {
    this.carregarAgentes();
    this.loadCities();
    this.loadProfile();
  }

  // ============================================================
  // CARREGAR DADOS
  // ============================================================

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

  loadProfile(): void {
    this.cadastroService.getProfiles('allprofiles').subscribe({
      next: (perfis: Perfil[]) => {
        this.perfis = perfis;
      },
      error: (error) => {
        console.error('Erro ao carregar perfis:', error);
      },
    });
  }

  carregarAgentes(): void {
    this.carregando = true;
    this.mensagem = '';
    this.cadastroService.listarAgentes().subscribe({
      next: (response: any[]) => {
        this.agentes = Array.isArray(response) ? response : [];
        this.aplicarFiltro();
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar agentes:', error);
        this.mensagem = 'Não foi possível carregar as empresas.';
        this.carregando = false;
      },
    });
  }

  // ============================================================
  // FILTRO
  // ============================================================

  aplicarFiltro(): void {
    const termo = this.filtro.trim().toLowerCase();

    this.agentesFiltradas = this.agentes.filter((agente) => {
      const responsavel = agente.nome ?? '';
      const cpf = agente.cpf ?? '';
      const email = agente.email ?? '';
      const cidade = agente.ass_agente_cidade?.nome_municipio ?? '';
      const regiao =
        agente.ass_agente_cidade?.ass_municipio_regiao?.nome ?? '';
      const perfil = agente.ass_agente_profile?.perfil ?? '';
      const status = agente.user_active ? 'ativo' : 'inativo';

      return (
        !termo ||
        responsavel.toLowerCase().includes(termo) ||
        cpf.toLowerCase().includes(termo) ||
        email.toLowerCase().includes(termo) ||
        cidade.toLowerCase().includes(termo) ||
        regiao.toLowerCase().includes(termo) ||
        perfil.toLowerCase().includes(termo) ||
        status.includes(termo)
      );
    });

    this.ordenarAgentes();
    this.totalPages = Math.max(
      1,
      Math.ceil(this.agentesFiltradas.length / this.pageSize),
    );
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    this.atualizarPagina();
  }

  // ============================================================
  // ORDENAÇÃO
  // ============================================================

  ordenarAgentes(): void {
    this.agentesFiltradas.sort((a, b) => {
      const valorA = this.getValorCampoOrdenacao(a, this.sortField);
      const valorB = this.getValorCampoOrdenacao(b, this.sortField);
      const comparacao = String(valorA).localeCompare(String(valorB), 'pt-BR', {
        numeric: true,
        sensitivity: 'base',
      });

      return this.sortDirection === 'asc' ? comparacao : -comparacao;
    });
  }

  getValorCampoOrdenacao(agente: any, campo: string): string {
    switch (campo) {
      case 'cpf':
        return agente.cpf ?? '';
      case 'nome':
        return agente.nome ?? '';
      case 'municipio':
        return agente.ass_agente_cidade?.nome_municipio ?? '';
      case 'regiao':
        return agente.ass_agente_cidade?.ass_municipio_regiao?.nome ?? '';
      case 'perfil':
        return agente.ass_agente_profile?.perfil ?? '';
      case 'status':
        return agente.user_active ? 'Ativo' : 'Ínativo';
      default:
        return '';
    }
  }

  ordenarPor(campo: string): void {
    if (this.sortField === campo) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = campo;
      this.sortDirection = 'asc';
    }

    this.ordenarAgentes();
    this.atualizarPagina();
  }

  getOrdenacaoIcone(campo: string): string {
    if (this.sortField !== campo) {
      return 'fa-arrows-up-down';
    }

    return this.sortDirection === 'asc'
      ? 'fa-arrow-up-short-wide'
      : 'fa-arrow-down-short-wide';
  }

  // ============================================================
  // PAGINAÇÃO
  // ============================================================

  atualizarPagina(): void {
    const inicio = (this.currentPage - 1) * this.pageSize;
    const fim = inicio + this.pageSize;
    this.paginatedAgentes = this.agentesFiltradas.slice(inicio, fim);
  }

  formatarCpf(cpf: string | null | undefined): string {
    const digitos = String(cpf ?? '').replace(/\D/g, '');

    if (digitos.length !== 11) {
      return cpf ?? '';
    }

    return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  mudarPagina(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.atualizarPagina();
  }

  // ============================================================
  // ABRIR AGENTE
  // ============================================================

  abrirAgente(id: number): void {
    this.carregando = true;

    this.cadastroService.agentId(id).subscribe({
      next: (agente) => {
        this.agenteSelecionada = agente;

        const cidadeId = agente.ass_agente_cidade?.id ?? agente.cidade ?? '';

        const profileId =
          agente.profile_id ?? agente.ass_agente_profile?.id ?? '';

        this.agenteForm.patchValue({
          nome: agente.nome ?? '',
          cpf: agente.cpf ?? '',
          telefone: agente.telefone ?? '',
          email: agente.email ?? '',
          cep: agente.cep ?? '',
          cidade: cidadeId,
          bairro: agente.bairro ?? '',
          rua: agente.rua ?? '',
          numero: agente.numero ?? '',
          complemento: agente.complemento ?? '',
          profile_id: profileId,
          user_active: agente.user_active ?? false,
        });

        this.erroCep = '';
        this.modalDetalhesAberto = true;
        this.carregando = false;
      },

      error: (error) => {
        console.error('Erro ao carregar agente:', error);
        this.mensagem = 'Não foi possível abrir os dados do agente.';
        this.carregando = false;
      },
    });
  }

  // ============================================================
  // CEP
  // ============================================================

  buscarCep(event: Event): void {
    const input = event.target as HTMLInputElement;

    let cep = input.value.replace(/\D/g, '');

    // Limita a 8 números
    cep = cep.substring(0, 8);

    // Formata 00000-000
    if (cep.length > 5) {
      cep = cep.replace(/^(\d{5})(\d)/, '$1-$2');
    }

    this.agenteForm.patchValue(
      {
        cep: cep,
      },
      {
        emitEvent: false,
      },
    );

    // Só consulta quando tiver 8 números
    const cepNumerico = cep.replace(/\D/g, '');

    if (cepNumerico.length !== 8) {
      this.erroCep = '';
      return;
    }

    this.buscarEnderecoPorCep(cepNumerico);
  }

  buscarEnderecoPorCep(cep: string): void {
    this.buscandoCep = true;
    this.erroCep = '';

    this.cadastroService.getAddressByCEP(cep).subscribe({
      next: (endereco) => {
        this.buscandoCep = false;

        // CEP inexistente
        if (endereco.erro) {
          this.erroCep = 'CEP não encontrado.';
          return;
        }

        this.preencherEndereco(endereco);
      },

      error: (error) => {
        console.error('Erro ao consultar CEP:', error);

        this.buscandoCep = false;
        this.erroCep = 'Não foi possível consultar o CEP.';
      },
    });
  }

  preencherEndereco(endereco: any): void {
    this.agenteForm.patchValue({
      rua: endereco.logradouro ?? '',
      bairro: endereco.bairro ?? '',
      complemento: endereco.complemento ?? '',
    });

    /*
     * O ViaCEP retorna o nome da cidade.
     * Como o seu formulário utiliza o ID da cidade,
     * precisamos encontrar a cidade correspondente
     * dentro de city_list.
     */
    if (endereco.localidade) {
      const cidadeEncontrada = this.city_list.find(
        (cidade) =>
          cidade.nome_municipio?.trim().toLowerCase() ===
          endereco.localidade?.trim().toLowerCase(),
      );

      if (cidadeEncontrada) {
        this.agenteForm.patchValue({
          cidade: cidadeEncontrada.id,
        });
      } else {
        this.erroCep = `O município "${endereco.localidade}" não foi encontrado na lista.`;
      }
    }
  }

  // ============================================================
  // SALVAR
  // ============================================================

  salvarAgente(): void {
    if (!this.agenteSelecionada || this.agenteForm.invalid) {
      this.agenteForm.markAllAsTouched();
      return;
    }

    this.salvando = true;

    const payload = {
      ...this.agenteForm.value,
      cidade: Number(this.agenteForm.value.cidade),
      profile_id: Number(this.agenteForm.value.profile_id),
    };

    this.cadastroService
      .atualizarAgente(this.agenteSelecionada.id, payload)
      .subscribe({
        next: () => {
          this.mensagem = 'Agente atualizada com sucesso.';
          this.salvando = false;
          this.modalDetalhesAberto = false;
          this.carregarAgentes();
        },

        error: (error) => {
          console.error('Erro ao atualizar agente:', error);
          this.mensagem = 'Não foi possível salvar as alterações.';
          this.salvando = false;
        },
      });
  }

  // ============================================================
  // FECHAR MODAL
  // ============================================================

  fecharModais(): void {
    if (this.salvando) {
      return;
    }
    this.modalDetalhesAberto = false;
    this.agenteSelecionada = null;
    this.agenteForm.reset({ user_active: true });
  }

  // ============================================================
  // GETTERS
  // ============================================================

  get nomeResponsavelControl() {
    return this.agenteForm.get('nome');
  }

  get cpfControl() {
    return this.agenteForm.get('cpf');
  }

  get emailControl() {
    return this.agenteForm.get('email');
  }
  get cidadeControl() {
    return this.agenteForm.get('cidade');
  }

  get profileControl() {
    return this.agenteForm.get('profile_id');
  }
}
