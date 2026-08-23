import { Routes } from '@angular/router';

import { EstruturaLayout } from '../estrutura/estrutura.layout';

/**
 * Rotas raiz do app.
 *
 * Tudo pendura sob o `EstruturaLayout` (nav + outlet). Os módulos entram aqui como
 * rotas LAZY (`loadChildren` apontando para `<x>.routes.ts`) — e quem escreve esse
 * registro é a task `*-fiacao` do módulo, mais ninguém.
 *
 * Está vazio de propósito: o primeiro módulo nasce do pipeline SDD.
 */
export const routes: Routes = [
  {
    path: '',
    component: EstruturaLayout,
    children: [
      // A task `*-fiacao` registra aqui a rota lazy de cada módulo, por exemplo:
      // {
      //   path: 'produto',
      //   loadChildren: () => import('../../modules/produto/produto.routes').then((m) => m.rotas),
      // },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('../../modules/usuarios/usuario.routes').then((m) => m.rotas),
      },
    ],
  },
];
