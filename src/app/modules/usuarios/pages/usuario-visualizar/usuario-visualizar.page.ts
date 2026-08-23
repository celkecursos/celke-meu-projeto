/**
 * `usuario-visualizar.page` — visualização somente leitura de um usuário
 * (spec `usuarios.spec.md`).
 *
 * Atende RF-22/RF-23 (tela dedicada, endereçável, com caminho para editar e para
 * voltar), RF-24/RF-25/RF-26 (inativar/reativar com confirmação explícita
 * identificando usuário e efeito) e RF-30 (nome de exibição via `nomeExibicao`,
 * nunca recomputado aqui).
 *
 * SMART: injeta `UsuarioFacade` e orquestra; nenhuma regra de domínio nova nasce
 * nesta página — `nomeExibicao` vem pronta de `usuario.models.ts`.
 */
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IUsuario, TSituacaoUsuario, nomeExibicao } from '../../data/usuario.models';
import { UsuarioFacade } from '../../data/usuario.facade';

@Component({
  selector: 'app-usuario-visualizar',
  imports: [RouterLink],
  templateUrl: './usuario-visualizar.page.html',
})
export class UsuarioVisualizarPage implements OnInit {
  /** Path param `:id` — rota sempre tem `id` nesta tela. */
  id = input.required<string>();

  #facade = inject(UsuarioFacade);

  /** Nome de exibição: RF-29/RF-30 — fonte única, nunca recomputada aqui. */
  protected readonly nomeExibicao = nomeExibicao;

  protected readonly usuario = signal<IUsuario | null>(null);
  protected readonly carregando = signal(true);
  /** Não encontrado / id malformado (Fluxo C/D) — não renderiza dados. */
  protected readonly erroCarregamento = signal(false);
  /** Falha ao efetivar inativar/reativar — a situação exibida permanece a anterior. */
  protected readonly erroSituacao = signal(false);

  ngOnInit(): void {
    this.#facade.obter(this.id()).subscribe({
      next: (usuario) => {
        this.usuario.set(usuario);
        this.carregando.set(false);
      },
      error: () => {
        this.erroCarregamento.set(true);
        this.carregando.set(false);
      },
    });
  }

  /** Rótulo por extenso da situação, sem duplicar a regra de exibição. */
  protected situacaoPorExtenso(usuario: IUsuario): string {
    return usuario.situacao === 'ativo' ? 'Ativo' : 'Inativo';
  }

  /** Formatação de apresentação da data de cadastro (pt-BR), não é regra de domínio. */
  protected dataCadastroFormatada(usuario: IUsuario): string {
    return new Date(usuario.dataCadastro).toLocaleDateString('pt-BR');
  }

  /** Rótulo do botão de situação, oposto ao estado atual (RF-24, RF-25). */
  protected rotuloAcaoSituacao(usuario: IUsuario): string {
    return usuario.situacao === 'ativo' ? 'Inativar' : 'Reativar';
  }

  /**
   * Confirmação explícita (RF-26) via diálogo nativo do browser (ver nota da task
   * USR-009 — não existe componente de modal documentado em `ui-guidelines.md`).
   * Cancelado ⇒ nada muda, nenhuma chamada à facade. Confirmado ⇒ chama
   * `alterarSituacao`; sucesso atualiza o signal local; falha mantém a situação
   * exibida e acende o banner de erro (sem otimismo).
   */
  protected alterarSituacao(): void {
    const usuarioAtual = this.usuario();
    if (!usuarioAtual) return;

    const novaSituacao: TSituacaoUsuario = usuarioAtual.situacao === 'ativo' ? 'inativo' : 'ativo';
    const acao = novaSituacao === 'inativo' ? 'inativar' : 'reativar';
    const efeito =
      novaSituacao === 'inativo'
        ? 'não poderá ser inscrito em campeonato novo, mas permanece no histórico'
        : 'volta a poder ser inscrito em campeonato novo';
    const mensagem = `Confirma ${acao} ${usuarioAtual.nomeCompleto} (${usuarioAtual.email})? Ele ${efeito}.`;

    if (!window.confirm(mensagem)) return;

    this.erroSituacao.set(false);
    this.#facade.alterarSituacao(usuarioAtual.id, novaSituacao).subscribe({
      next: (atualizado) => this.usuario.set(atualizado),
      error: () => this.erroSituacao.set(true),
    });
  }
}
