/**
 * Ambiente de DESENVOLVIMENTO — trocado no build pelo `fileReplacements` do
 * `angular.json` (configuração `development`).
 */
export const environment = {
  producao: false,
  /** Base do serviço de catálogo. Hoje aponta para o mock de `public/data/`. */
  catalogoApiUrl: '/data',
  /** Base do serviço de usuários. Hoje aponta para o mock de `public/data/`. */
  usuariosApiUrl: '/data',
};
