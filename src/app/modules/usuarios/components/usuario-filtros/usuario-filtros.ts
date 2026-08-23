import { Component, computed, input, output } from '@angular/core';

import { TSituacaoUsuario } from '../../data/usuario.models';

/**
 * `usuario-filtros` — barra de filtros da listagem (RF-03, RF-04, RF-31).
 *
 * DUMB: só repassa `input()`/`output()` — não decide o que "todos" significa para
 * a consulta (`situacao: ''`), só o valor cru do `<select>`. Quem interpreta é o
 * `usuario-api.service.ts`.
 */
@Component({
  selector: 'app-usuario-filtros',
  templateUrl: './usuario-filtros.html',
})
export class UsuarioFiltros {
  /**
   * Valor corrente do campo de busca — a página é quem decide a fonte. Admite
   * `undefined` (a página pode derivá-lo de um query param ausente) e normaliza
   * para `''`: sem isso, o `[value]` do `<input>` renderiza o texto "undefined".
   */
  busca = input<string | undefined>('');
  /** Valor corrente do filtro de situação; `''` = todos. */
  situacao = input<TSituacaoUsuario | '' | undefined>('');

  buscar = output<string>();
  filtrarSituacao = output<TSituacaoUsuario | ''>();
  limpar = output<void>();

  /** Valores normalizados — é o que o template liga; nunca o signal cru. */
  protected readonly buscaValor = computed(() => this.busca() ?? '');
  protected readonly situacaoValor = computed(() => this.situacao() ?? '');

  /** RF-31: nada para limpar quando busca vazia e situação é "todos". */
  protected readonly semFiltroAtivo = computed(
    () => this.buscaValor() === '' && this.situacaoValor() === '',
  );

  protected digitouBusca(evento: Event): void {
    const alvo = evento.target as HTMLInputElement;
    this.buscar.emit(alvo.value);
  }

  protected trocouSituacao(evento: Event): void {
    const alvo = evento.target as HTMLSelectElement;
    this.filtrarSituacao.emit(alvo.value as TSituacaoUsuario | '');
  }
}
