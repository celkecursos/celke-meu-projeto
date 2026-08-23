/**
 * Ambiente de PRODUÇÃO (padrão do build).
 *
 * Regra da arquitetura: URL de backend só nasce de uma base declarada aqui, no
 * padrão `<serviço>ApiUrl`. O `<x>-api.service.ts` compõe o path sobre a base —
 * origem nova = +1 campo neste arquivo (e no `environment.development.ts`).
 */
export const environment = {
  producao: true,
  /** Base do serviço de catálogo. Hoje aponta para o mock de `public/data/`. */
  catalogoApiUrl: '/data',
  /** Base do serviço de usuários. Hoje aponta para o mock de `public/data/`. */
  usuariosApiUrl: '/data',
};
