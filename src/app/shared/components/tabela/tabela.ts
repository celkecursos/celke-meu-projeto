import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, computed, contentChild, input, output } from '@angular/core';

import { IListagem } from '../../../core/data/consulta';

/** Alinhamento horizontal da coluna. Texto à esquerda, número à direita. */
export type TAlinhamento = 'esquerda' | 'centro' | 'direita';

/**
 * Definição de UMA coluna. Quem monta a lista de colunas é o wrapper de DOMÍNIO do
 * módulo (`<x>-tabela`) — nunca a página, e nunca este componente.
 */
export interface IColuna<T> {
  /** Chave do campo em `T`. */
  campo: string;
  rotulo: string;
  alinhamento?: TAlinhamento;
  /** Projeção do valor para exibição (data, moeda, rótulo de enum…). */
  formato?: (item: T) => string;
}

/**
 * `<app-tabela>` — listagem server-driven, DUMB.
 *
 * Recebe o ESTADO INTEIRO (`IListagem`) e deriva dele os estados vazio / carregando /
 * erro. A página NÃO reimplementa esses estados: entregar `[listagem]` inteiro é o
 * que impede a tela de se encher de `@if` repetido a cada módulo novo.
 */
@Component({
  selector: 'app-tabela',
  imports: [NgTemplateOutlet],
  templateUrl: './tabela.html',
})
export class Tabela<T> {
  /** O estado inteiro da listagem (itens/carregando/erro/total). */
  listagem = input.required<IListagem<T>>();
  /** As colunas — conteúdo de domínio, definido pelo wrapper do módulo. */
  colunas = input.required<IColuna<T>[]>();

  /** Linha escolhida pelo usuário (clique ou Enter/Espaço no teclado). */
  selecionar = output<T>();

  /**
   * Rótulo da coluna de ações. Só aparece quando há um `[appTabelaAcoes]` projetado.
   */
  rotuloAcoes = input<string>('Ações');

  /**
   * Template opcional da célula de ações, projetado pelo wrapper de DOMÍNIO:
   * `<ng-template appTabelaAcoes let-item>…</ng-template>`. Ausente ⇒ nenhuma
   * coluna extra é renderizada e a tabela se comporta como antes.
   */
  protected readonly acoes = contentChild<TemplateRef<{ $implicit: T }>>('appTabelaAcoes');

  /** Colunas + 1 quando há ações — usado nos `colspan` dos estados vazio/erro. */
  protected readonly totalColunas = computed(() => this.colunas().length + (this.acoes() ? 1 : 0));

  /** Estados derivados: a fonte é só a `listagem`, nunca um input paralelo. */
  protected readonly carregando = computed(() => this.listagem().carregando);
  protected readonly erro = computed(() => this.listagem().erro);
  protected readonly vazio = computed(
    () => !this.carregando() && !this.erro() && this.listagem().itens.length === 0,
  );
  protected readonly temItens = computed(
    () => !this.carregando() && !this.erro() && this.listagem().itens.length > 0,
  );

  /** Esqueleto de carregamento com a altura da página pedida (evita salto de layout). */
  protected readonly linhasEsqueleto = computed(() =>
    Array.from({ length: Math.min(this.listagem().tamanho || 5, 5) }, (_, i) => i),
  );

  protected valor(item: T, coluna: IColuna<T>): string {
    if (coluna.formato) return coluna.formato(item);
    const bruto = (item as Record<string, unknown>)[coluna.campo];
    return bruto === null || bruto === undefined ? '—' : String(bruto);
  }

  protected classeAlinhamento(coluna: IColuna<T>): string {
    switch (coluna.alinhamento) {
      case 'direita':
        return 'text-right';
      case 'centro':
        return 'text-center';
      default:
        return 'text-left';
    }
  }
}
