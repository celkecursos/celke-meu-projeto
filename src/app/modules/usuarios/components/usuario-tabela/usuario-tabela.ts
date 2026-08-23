import { Component, input, output } from '@angular/core';

import { IListagem } from '../../../../core/data/consulta';
import { IColuna, Tabela } from '../../../../shared/components/tabela/tabela';
import { IUsuario } from '../../data/usuario.models';

/**
 * `usuario-tabela` — wrapper de DOMÍNIO sobre `<app-tabela>` (RF-01, RF-09).
 *
 * DUMB: só define as colunas de exibição e repassa `input()`/`output()` — nenhuma
 * regra de domínio, nenhum `inject` de facade/serviço.
 */
@Component({
  selector: 'app-usuario-tabela',
  imports: [Tabela],
  templateUrl: './usuario-tabela.html',
})
export class UsuarioTabela {
  listagem = input.required<IListagem<IUsuario>>();

  selecionar = output<IUsuario>();

  /** Ações de linha (RF-09, Fluxo E). A página decide o que cada uma faz. */
  visualizar = output<IUsuario>();
  editar = output<IUsuario>();
  /**
   * Alternar situação — "Inativar" para ativo, "Reativar" para inativo (RF-24/RF-25).
   * Não existe exclusão de usuário: inativar é a única forma de tirar de circulação.
   */
  alternarSituacao = output<IUsuario>();

  protected readonly colunas: IColuna<IUsuario>[] = [
    { campo: 'nomeCompleto', rotulo: 'Nome completo' },
    { campo: 'email', rotulo: 'E-mail' },
    {
      campo: 'apelido',
      rotulo: 'Apelido',
      formato: (usuario) => (usuario.apelido === '' ? '—' : usuario.apelido),
    },
    {
      campo: 'situacao',
      rotulo: 'Situação',
      alinhamento: 'centro',
      formato: (usuario) => (usuario.situacao === 'ativo' ? 'Ativo' : 'Inativo'),
    },
    {
      campo: 'dataCadastro',
      rotulo: 'Data de cadastro',
      alinhamento: 'direita',
      formato: (usuario) => new Date(usuario.dataCadastro).toLocaleDateString('pt-BR'),
    },
  ];
}
