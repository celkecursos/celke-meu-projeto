import { Routes } from '@angular/router';

import { EstruturaLayout } from '../estrutura/estrutura.layout';
import { authGuard } from '../auth/auth.guard';

/**
 * Rotas raiz do app.
 *
 * `/login` fica FORA do `EstruturaLayout` (sem nav, sem header) e é a única rota
 * pública. Tudo o mais pendura sob o `EstruturaLayout`, protegido por `authGuard` —
 * sem sessão, qualquer rota redireciona para `/login?redirectTo=<url original>`.
 *
 * Os módulos entram como rotas LAZY (`loadChildren` apontando para `<x>.routes.ts`)
 * — e quem escreve esse registro é a task `*-fiacao` do módulo, mais ninguém.
 */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('../../pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    component: EstruturaLayout,
    canActivate: [authGuard],
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
