/**
 * `usuario-lista.page` — listagem de usuários, o Fluxo A da spec (`usuarios.spec.md`).
 *
 * Atende RF-02 (paginação), RF-03/RF-04 (busca + filtro de situação),
 * RF-07 (busca/filtro combinados voltam à página
 * 1), RF-08 (resultado recarregável de forma direta), RF-21 (confirmação de sucesso
 * ao voltar do formulário) e RF-31 (carregando/erro/vazio distintos, com caminho de
 * limpar critérios e de tentar de novo). Edge cases 12, 13, 14, 15, 20, 25.
 *
 * SMART: injeta `UsuarioFacade` e orquestra; a URL (query params) é a fonte de
 * verdade do estado de listagem — cada interação do operador chama o comando de
 * facade correspondente (feedback imediato) e navega atualizando os query params
 * (RF-08, edge case 25). Este é o PADRÃO de sincronização URL↔listagem do projeto:
 * as próximas listagens copiam esta técnica.
 */
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TDirecao } from '../../../../core/data/consulta';
import { Paginacao } from '../../../../shared/components/paginacao/paginacao';
import { UsuarioFiltros } from '../../components/usuario-filtros/usuario-filtros';
import { UsuarioTabela } from '../../components/usuario-tabela/usuario-tabela';
import { IUsuario, TSituacaoUsuario } from '../../data/usuario.models';
import { UsuarioFacade } from '../../data/usuario.facade';

@Component({
  selector: 'app-usuario-lista',
  imports: [RouterLink, UsuarioFiltros, UsuarioTabela, Paginacao],
  templateUrl: './usuario-lista.page.html',
})
export class UsuarioListaPage implements OnInit {
  /**
   * Query params — ligados por `withComponentInputBinding` (`app.config.ts`).
   *
   * TODOS admitem `undefined`: quando o param está ausente da URL, o binding entrega
   * `undefined` e **sobrepõe o valor padrão do `input`**. Por isso cada um é lido
   * por um derivado saneado (`buscaAtual`, `situacaoAtual`, `paginaValida`) — usar o
   * signal cru vaza `undefined` para a tela (o campo de busca chega a exibir o texto
   * "undefined") e para a consulta.
   */
  busca = input<string | undefined>('');
  situacao = input<TSituacaoUsuario | '' | undefined>('');
  /**
   * Ordenação da listagem. Não há UI para trocá-la (o cabeçalho não é clicável):
   * vale o padrão — mais recentes primeiro — e a URL segue aceitando os params para
   * um resultado endereçável (RF-08).
   */
  ordenacaoCampo = input<string>('dataCadastro');
  ordenacaoDirecao = input<TDirecao>('desc');
  /**
   * Query param chega sempre como string — e chega `undefined` quando ausente da
   * URL (o binding sobrepõe o default do `input`). Por isso a conversão é feita por
   * `paginaValida()`, que trata ausente/NaN/fora de faixa como página 1.
   */
  pagina = input<string | undefined>('1');

  /** Busca saneada: ausente ⇒ `''`. É o que a tela e a consulta consomem. */
  protected readonly buscaAtual = computed(() => this.busca() ?? '');
  /** Situação saneada: ausente ⇒ `''` (todos). */
  protected readonly situacaoAtual = computed<TSituacaoUsuario | ''>(() => this.situacao() ?? '');

  #facade = inject(UsuarioFacade);
  #router = inject(Router);
  #route = inject(ActivatedRoute);

  protected readonly listagem = computed(() => this.#facade.listagem());

  /**
   * Página da URL saneada: ausente, não-numérica ou < 1 ⇒ 1. Sem isso, um
   * `Number(undefined)` vira `NaN`, contamina a consulta e a paginação exibe
   * "NaN–NaN de N" no primeiro carregamento.
   */
  protected paginaValida(): number {
    const numero = Number(this.pagina());
    return Number.isInteger(numero) && numero >= 1 ? numero : 1;
  }

  /** RF-31: nenhum critério ativo — distingue "cadastro vazio" de "busca sem resultado". */
  protected readonly semCriterioAtivo = computed(
    () => this.buscaAtual() === '' && this.situacaoAtual() === '',
  );

  /** RF-21: mensagem que o formulário deixou em `history.state` antes de voltar. */
  protected readonly mensagemSucesso = signal<string | null>(null);

  /** Falha de uma ação de linha (inativar/reativar) — some ao repetir com sucesso. */
  protected readonly erroAcao = signal<string | null>(null);

  ngOnInit(): void {
    // Ordem importa (RF-07): `filtrar`/`ordenar` resetam a página para 1 como efeito
    // colateral — `paginar` vem por último para a página da URL prevalecer.
    this.#facade.filtrar({ busca: this.buscaAtual(), situacao: this.situacaoAtual() });
    this.#facade.ordenar(this.ordenacaoCampo(), this.ordenacaoDirecao());
    this.#facade.paginar(this.paginaValida());

    const estado = history.state as Record<string, unknown> | undefined;
    const mensagem = estado?.['mensagemSucesso'];
    if (typeof mensagem === 'string' && mensagem !== '') {
      this.mensagemSucesso.set(mensagem);
    }
  }

  protected fecharMensagemSucesso(): void {
    this.mensagemSucesso.set(null);
  }

  protected fecharErroAcao(): void {
    this.erroAcao.set(null);
  }

  /** RF-07: busca nova volta à página 1 — remover o param equivale a 1. */
  protected buscar(termo: string): void {
    this.#facade.filtrar({ busca: termo, situacao: this.situacaoAtual() });
    this.#navegar({ busca: termo || null, pagina: null });
  }

  protected filtrarSituacao(situacao: TSituacaoUsuario | ''): void {
    this.#facade.filtrar({ busca: this.buscaAtual(), situacao });
    this.#navegar({ situacao: situacao || null, pagina: null });
  }

  protected limpar(): void {
    this.#facade.limparCriterios();
    this.#navegar({ busca: null, situacao: null, pagina: null });
  }

  protected paginar(pagina: number): void {
    this.#facade.paginar(pagina);
    this.#navegar({ pagina });
  }

  protected selecionar(usuario: IUsuario): void {
    this.#router.navigate(['/usuarios/visualizar', usuario.id]);
  }

  /** Ação "Visualizar" da linha — mesmo destino do clique na linha (RF-22). */
  protected visualizar(usuario: IUsuario): void {
    this.#router.navigate(['/usuarios/visualizar', usuario.id]);
  }

  /** Ação "Editar" da linha — tela própria de edição (RF-19). */
  protected editar(usuario: IUsuario): void {
    this.#router.navigate(['/usuarios/editar', usuario.id]);
  }

  /**
   * Ação "Inativar"/"Reativar" (Fluxo E, RF-24/RF-25/RF-26). Confirma antes, porque
   * a spec exige confirmação explicando o efeito — e porque a ação muda o que o
   * usuário inativado pode fazer no sistema.
   *
   * NÃO existe exclusão de usuário (RF-24, risco R-03): inativar é a única forma de
   * tirar alguém de circulação, e é reversível.
   */
  protected alternarSituacao(usuario: IUsuario): void {
    const inativando = usuario.situacao === 'ativo';
    const mensagem = inativando
      ? `Inativar ${usuario.nomeCompleto}? A pessoa deixa de ser inscrita em campeonato novo; os dados e o histórico são preservados, e a ação pode ser desfeita.`
      : `Reativar ${usuario.nomeCompleto}? A pessoa volta a circular normalmente.`;

    if (!confirm(mensagem)) return;

    this.#facade.alterarSituacao(usuario.id, inativando ? 'inativo' : 'ativo').subscribe({
      next: () => {
        this.#facade.recarregar();
        this.mensagemSucesso.set(
          inativando ? 'Usuário inativado com sucesso.' : 'Usuário reativado com sucesso.',
        );
      },
      error: () => {
        this.mensagemSucesso.set(null);
        this.erroAcao.set('Não foi possível alterar a situação do usuário. Tente de novo.');
      },
    });
  }

  protected recarregar(): void {
    this.#facade.recarregar();
  }

  /** Navega mantendo os demais query params (`merge`) — a URL é o espelho de saída. */
  #navegar(queryParams: Record<string, string | number | null>): void {
    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
}
