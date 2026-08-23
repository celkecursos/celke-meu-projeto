/**
 * `usuario.routes.ts` — rotas do módulo `usuarios` (spec `usuarios.spec.md`).
 *
 * Atende RF-08 (resultado da listagem recarregável de forma direta pela URL),
 * RF-19 (cadastro/edição são tela própria) e RF-22 (visualização é tela dedicada,
 * endereçável).
 *
 * Formulário de PÁGINA (não modal — decisão da spec, premissa 13): as quatro rotas
 * são IRMÃS no mesmo array, nenhuma aninhada em `children` de outra — navegar para
 * `novo`/`editar/:id`/`visualizar/:id` desmonta a listagem (`architecture.md`,
 * seção "Rotas e formulário").
 */
import { Routes } from '@angular/router';

import { UsuarioFormPage } from './pages/usuario-form/usuario-form.page';
import { UsuarioListaPage } from './pages/usuario-lista/usuario-lista.page';
import { UsuarioVisualizarPage } from './pages/usuario-visualizar/usuario-visualizar.page';

export const rotas: Routes = [
  { path: '', component: UsuarioListaPage },
  { path: 'novo', component: UsuarioFormPage, data: { modo: 'criar' } },
  { path: 'editar/:id', component: UsuarioFormPage, data: { modo: 'editar' } },
  { path: 'visualizar/:id', component: UsuarioVisualizarPage },
];
