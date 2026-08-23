/**
 * `usuario.facade.ts` — a fachada de Usuário (spec `usuarios.spec.md`).
 *
 * Atende RF-02 (paginação), RF-03/RF-04 (busca + filtro de situação), RF-05
 * (ordenação por coluna), RF-06 (ordenação padrão: `dataCadastro` decrescente),
 * RF-07 (busca/filtro/ordenação combinados e voltam à página 1), RF-24/RF-25
 * (inativar/reativar refletem na listagem vigente), RF-31 (carregando/erro/vazio
 * comunicados à UI, com caminho de limpar critérios e de tentar de novo).
 *
 * Edge cases cobertos aqui:
 * - 14 (filtro reduz o total e a página armazenada ficaria vazia) — coberto pelo
 *   reset a página 1 em `filtrar`/`ordenar`.
 * - 15 (página armazenada fica além do total, ex.: exclusão) — coberto pelo efeito
 *   de clamp abaixo.
 * - 19/20 (alterar situação reflete na listagem preservando busca/filtro/ordenação/
 *   página) — coberto por `recarregar()` reaproveitar o `#consulta` vigente.
 *
 * `#recurso` (o `resource()`) NUNCA vaza — a página só consome `listagem()`
 * (`.ai/rules/architecture.md`, seção `data/<x>.facade.ts`).
 */
import { Injectable, computed, effect, inject, resource, signal } from '@angular/core';
import { Observable, firstValueFrom, tap } from 'rxjs';

import {
  CONSULTA_INICIAL,
  IConsulta,
  IListagem,
  TDirecao,
  alternarOrdenacao,
  listagemVazia,
  paraListagem,
  totalDePaginas,
} from '../../../core/data/consulta';
import { IUsuario, IUsuarioFiltros, IUsuarioForm, TSituacaoUsuario } from './usuario.models';
import { UsuarioApiService } from './usuario-api.service';

/** Consulta inicial do módulo: todos (RF-04), página 1, `dataCadastro` desc (RF-06). */
const CONSULTA_INICIAL_USUARIO: IConsulta = {
  ...CONSULTA_INICIAL,
  filtros: { busca: '', situacao: '' } satisfies IUsuarioFiltros,
  ordenacao: { campo: 'dataCadastro', direcao: 'desc' },
};

/** Mensagem pronta para exibição quando o `resource` cai em erro (RF-31). */
const MENSAGEM_ERRO_LISTAGEM = 'Não foi possível carregar a relação de usuários.';

@Injectable({ providedIn: 'root' })
export class UsuarioFacade {
  #api = inject(UsuarioApiService);

  /** Estado privado: filtros + página + ordenação vigentes. */
  #consulta = signal<IConsulta>(CONSULTA_INICIAL_USUARIO);

  /** O `resource()` — NUNCA exposto fora da facade; a página consome `listagem()`. */
  #recurso = resource({
    params: () => this.#consulta(),
    loader: ({ params }) => firstValueFrom(this.#api.listar(params)),
  });

  /**
   * O ESTADO da UI — única fonte que `<app-usuario-tabela>` e `<app-paginacao>`
   * recebem. Carregando/sem valor ⇒ `listagemVazia`; resolvido ⇒ `paraListagem`;
   * erro ⇒ `listagemVazia` com `erro` preenchido (nunca lança para a página).
   */
  listagem = computed<IListagem<IUsuario>>(() => {
    const consulta = this.#consulta();

    if (this.#recurso.error()) {
      return { ...listagemVazia(consulta), carregando: false, erro: MENSAGEM_ERRO_LISTAGEM };
    }
    if (this.#recurso.isLoading() || !this.#recurso.hasValue()) {
      return listagemVazia(consulta);
    }
    return paraListagem(this.#recurso.value(), consulta);
  });

  /**
   * Clamp de página (edge case 15): quando o total vigente é maior que zero e a
   * página armazenada excede `totalDePaginas`, corrige `#consulta` para a última
   * página válida. A correção dispara sozinha um novo carregamento — a UI nunca
   * fica pedindo uma página que não existe.
   */
  constructor() {
    effect(() => {
      if (this.#recurso.error() || !this.#recurso.hasValue()) return;

      const { total } = this.#recurso.value();
      if (total <= 0) return;

      const consulta = this.#consulta();
      const ultimaPagina = totalDePaginas(total, consulta.tamanho);
      if (consulta.pagina > ultimaPagina) {
        this.#consulta.update((atual) => ({ ...atual, pagina: ultimaPagina }));
      }
    });
  }

  /** Substitui busca + situação numa única chamada e volta à página 1 (RF-07). */
  filtrar(filtros: IUsuarioFiltros): void {
    this.#consulta.update((atual) => ({ ...atual, filtros: filtros as unknown as Record<string, unknown>, pagina: 1 }));
  }

  /**
   * Ordena por `campo` (RF-05). Sem `direcaoForcada`: alterna via `alternarOrdenacao`
   * (clique em cabeçalho de coluna). Com `direcaoForcada`: define a ordenação
   * diretamente, sem alternância (uso exclusivo de restauração de estado a partir
   * da URL). Nos dois casos, volta à página 1 (RF-07).
   */
  ordenar(campo: string, direcaoForcada?: TDirecao): void {
    this.#consulta.update((atual) => ({
      ...atual,
      ordenacao: direcaoForcada ? { campo, direcao: direcaoForcada } : alternarOrdenacao(atual.ordenacao, campo),
      pagina: 1,
    }));
  }

  /** Muda só a página corrente — preserva filtros e ordenação (Fluxo A, passo 4). */
  paginar(pagina: number): void {
    this.#consulta.update((atual) => ({ ...atual, pagina }));
  }

  /** Limpa busca e filtro de situação (RF-31 — caminho para limpar critérios). */
  limparCriterios(): void {
    this.filtrar({ busca: '', situacao: '' });
  }

  /** Repete a última consulta sem alterá-la — o "tentar de novo" do erro (RF-31). */
  recarregar(): void {
    this.#recurso.reload();
  }

  /** Repassa direto ao api-service; a página de formulário/visualização consome sozinha. */
  obter(id: string): Observable<IUsuario> {
    return this.#api.obter(id);
  }

  /**
   * Cadastra e recarrega a listagem ANTES de emitir para quem assinou — a facade é
   * singleton (`providedIn: 'root'`) e o `resource()` não refaz sozinho ao remontar
   * a página de listagem.
   */
  cadastrar(dados: IUsuarioForm): Observable<IUsuario> {
    return this.#api.criar(dados).pipe(tap(() => this.recarregar()));
  }

  /** Edita e recarrega a listagem antes de emitir, mesma razão de `cadastrar`. */
  editar(id: string, dados: IUsuarioForm): Observable<IUsuario> {
    return this.#api.atualizar(id, dados).pipe(tap(() => this.recarregar()));
  }

  /**
   * Inativa/reativa (RF-24, RF-25) e recarrega antes de emitir. O `reload` reaproveita
   * o `#consulta` vigente — busca/filtro/ordenação/página ficam preservados ao
   * refletir a mudança (edge case 19, 20), sem código extra para isso.
   */
  alterarSituacao(id: string, situacao: TSituacaoUsuario): Observable<IUsuario> {
    return this.#api.alterarSituacao(id, situacao).pipe(tap(() => this.recarregar()));
  }
}
