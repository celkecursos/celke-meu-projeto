/**
 * `auth.guard.ts` — protege as rotas do app contra acesso sem sessão.
 *
 * Guard funcional (padrão do Angular 15+, não `CanActivate` de classe). Redireciona
 * para `/login` preservando a URL de destino em `redirectTo`, para o login devolver
 * o operador para onde ele tentou ir — sem isso, todo login cairia sempre na home.
 */
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthFacade } from './auth.facade';

export const authGuard: CanActivateFn = (_route, state) => {
  const facade = inject(AuthFacade);
  const router = inject(Router);

  if (facade.autenticado()) return true;

  return router.createUrlTree(['/login'], { queryParams: { redirectTo: state.url } });
};
