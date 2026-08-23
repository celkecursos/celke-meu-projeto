import { Component, computed, input, output } from '@angular/core';

import { IListagem, totalDePaginas } from '../../../core/data/consulta';

/**
 * `<app-paginacao>` — navegação de páginas, DUMB.
 *
 * Como a `<app-tabela>`, consome o ESTADO INTEIRO da listagem: total e página
 * corrente saem dela, não de inputs soltos que a página teria de manter em sincronia.
 */
@Component({
  selector: 'app-paginacao',
  templateUrl: './paginacao.html',
})
export class Paginacao {
  listagem = input.required<IListagem<unknown>>();

  /** Página escolhida (base 1). */
  pagina = output<number>();

  protected readonly totalPaginas = computed(() =>
    totalDePaginas(this.listagem().total, this.listagem().tamanho),
  );
  protected readonly atual = computed(() => this.listagem().pagina);
  protected readonly temAnterior = computed(() => this.atual() > 1);
  protected readonly temProxima = computed(() => this.atual() < this.totalPaginas());

  /** Primeiro e último registro exibidos — o "1–10 de 42" que orienta o usuário. */
  protected readonly primeiroItem = computed(() =>
    this.listagem().total === 0 ? 0 : (this.atual() - 1) * this.listagem().tamanho + 1,
  );
  protected readonly ultimoItem = computed(() =>
    Math.min(this.atual() * this.listagem().tamanho, this.listagem().total),
  );

  protected irPara(destino: number): void {
    if (destino < 1 || destino > this.totalPaginas() || destino === this.atual()) return;
    this.pagina.emit(destino);
  }
}
