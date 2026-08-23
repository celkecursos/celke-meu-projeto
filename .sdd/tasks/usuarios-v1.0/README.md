# Tasks — Gestão de Usuários (v1.0)

**Spec:** `.sdd/specs/usuarios.spec.md` (feature `usuarios`, versão `1.0`, status `aprovada`)

Este é o **primeiro módulo de domínio** do projeto (`src/app/modules/` estava vazio).
As tasks abaixo produzem exatamente a árvore canônica de `.ai/rules/architecture.md`
e o resultado vira o **espelho vivo** para os módulos seguintes — por isso o peso
maior em `Nível: Sênior` nas peças que fixam o padrão (models, api-service, facade,
extensão de componente compartilhado, sincronização de URL da listagem).

## Contagem por nível

| Nível | Tasks | Total |
|---|---|---|
| **Sênior** | USR-001, USR-002, USR-003, USR-004, USR-007 | 5 |
| **Pleno** | USR-005, USR-006, USR-008, USR-009, USR-010, USR-011 | 6 |

## Grafo de dependências

```
USR-001 (usuario.models.ts)              USR-004 (extensão <app-tabela> — ações)
    │                                          │
    ├──────────────┬───────────────┬───────────┤
    ▼              ▼               ▼           ▼
USR-002        USR-006         USR-008     USR-005 (usuario-tabela)
(api-service)  (usuario-filtros)(form.page)     │
    │                                (também dep. USR-003)
    ▼                                           │
USR-003 (facade) ──────────────┬────────────────┤
    │                          ▼                ▼
    │                     USR-009            USR-007 (lista.page)
    │                   (visualizar.page)   (dep. USR-003, USR-005, USR-006)
    │                          │                │
    └──────────────────────────┴────────────────┤
                                                  ▼
                                        USR-010 (usuario.routes.ts)
                                        (dep. USR-007, USR-008, USR-009)
                                                  │
                                                  ▼
                                        USR-011 (fiação — app.routes.ts +
                                                  estrutura.layout.ts)
                                        (dep. TODAS as anteriores)
```

## Ordem de execução (levas)

1. **Leva 1** (paralelo) — `USR-001` (usuario.models.ts) · `USR-004` (estende
   `<app-tabela>` com a coluna de ações — não toca em nenhum arquivo do módulo
   `usuarios`, corre independente).
2. **Leva 2** — `USR-002` (usuario-api.service.ts + mock JSON + environment).
   Depende só de USR-001.
3. **Leva 3** — `USR-003` (usuario.facade.ts). Depende de USR-001 e USR-002.
4. **Leva 4** (paralelo) — `USR-005` (usuario-tabela, dep. USR-001+USR-004) ·
   `USR-006` (usuario-filtros, dep. USR-001) · `USR-008` (usuario-form.page, dep.
   USR-001+USR-003) · `USR-009` (usuario-visualizar.page, dep. USR-001+USR-003).
   Nenhuma dessas quatro compartilha arquivo — podem rodar juntas.
5. **Leva 5** — `USR-007` (usuario-lista.page). Depende de USR-003, USR-005, USR-006.
6. **Leva 6** — `USR-010` (usuario.routes.ts). Depende de USR-007, USR-008, USR-009.
7. **Leva 7** — `USR-011` (fiação: `core/config/app.routes.ts` +
   `core/estrutura/estrutura.layout.ts`). Depende de todas as anteriores. **Só ela**
   toca esses dois arquivos.

> Em qualquer leva paralela, só o orquestrador roda `npm run build`/`npm run check`
> ao final da leva — os implementadores não rodam build concorrente entre si
> (regra de concorrência da Fase 3, `CLAUDE.md`).

## Cobertura de RF por task

| RF | Task(s) |
|---|---|
| RF-01 | USR-002, USR-005 |
| RF-02 | USR-002, USR-003, USR-007 |
| RF-03 | USR-002, USR-003, USR-006, USR-007 |
| RF-04 | USR-002, USR-003, USR-006, USR-007 |
| RF-05 | USR-005, USR-007 |
| RF-06 | USR-003 |
| RF-07 | USR-003, USR-007 |
| RF-08 | USR-007, USR-010 |
| RF-09 | USR-005 |
| RF-10 | USR-008 |
| RF-11 | USR-001, USR-008 |
| RF-12 | USR-008 |
| RF-13 | USR-001, USR-002, USR-008 |
| RF-14 | USR-001, USR-002, USR-008 |
| RF-15 | USR-002, USR-008 |
| RF-16 | USR-008 |
| RF-17 | USR-008 |
| RF-18 | USR-001, USR-002 |
| RF-19 | USR-008, USR-010 |
| RF-20 | USR-008 |
| RF-21 | USR-007, USR-008 |
| RF-22 | USR-009, USR-010 |
| RF-23 | USR-009 |
| RF-24 | USR-002, USR-003, USR-009 |
| RF-25 | USR-002, USR-003, USR-009 |
| RF-26 | USR-009 |
| RF-27 | USR-002 |
| RF-28 | USR-001, USR-002 (só a parte cabível a este módulo: situação como campo exposto — a aplicação da regra é de módulo futuro de campeonato, fora de escopo) |
| RF-29 | USR-001 |
| RF-30 | USR-001, USR-009 |
| RF-31 | USR-003, USR-005 (via `<app-tabela>`), USR-007 |
| RF-32 | USR-008 |
| RF-33 | USR-004, USR-005, USR-007 |

## Arquivos que a fiação (USR-011) reserva com exclusividade

- `src/app/core/config/app.routes.ts`
- `src/app/core/estrutura/estrutura.layout.ts`

Nenhuma outra task lista esses dois arquivos.
