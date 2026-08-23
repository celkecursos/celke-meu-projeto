# USR-011 — Fiação: registrar o módulo `usuarios`

**Spec:** `.sdd/specs/usuarios.spec.md` — atende **RF-08, RF-19, RF-22** (torna o
módulo alcançável).

**Nível:** Pleno — wiring mecânico, exatamente o exemplo já comentado nos dois
arquivos.

**Depende de:** USR-001, USR-002, USR-003, USR-004, USR-005, USR-006, USR-007,
USR-008, USR-009, USR-010 (todas as anteriores).

## Arquivos a modificar (exclusivos desta task)

- `src/app/core/config/app.routes.ts`
- `src/app/core/estrutura/estrutura.layout.ts`

**Nenhuma outra task deste pacote toca esses dois arquivos.** Esta é a última task da
leva de execução.

## Contrato — `app.routes.ts`

Dentro de `children` da rota `''` (`EstruturaLayout`), acrescente uma entrada de rota
lazy:

- `path: 'usuarios'`
- `loadChildren: () => import('../../modules/usuarios/usuario.routes').then((m) => m.rotas)`

(É exatamente o exemplo já comentado no arquivo — só descomentar o padrão trocando
`produto` por `usuarios` e `rotas` mantendo o nome exportado por USR-010.)

## Contrato — `estrutura.layout.ts`

No `signal<IItemNav[]>([])` de `itens`, acrescente o item `{ rotulo: 'Usuários',
rota: '/usuarios' }`.

## Critérios de aceite

- Navegar para `/usuarios` carrega a listagem (lazy, sem erro no console).
- O item "Usuários" aparece na navegação superior (a barra do topo) e fica ativo
  (`RouterLinkActive`) em qualquer sub-rota do módulo (`/usuarios/novo`,
  `/usuarios/editar/…`, etc.), tanto no menu do desktop quanto no painel mobile.
- `npm run check` verde (lint + test:ci + build) — **gate final desta entrega**.
- `/revisar-dod` roda limpo sobre o módulo inteiro.
