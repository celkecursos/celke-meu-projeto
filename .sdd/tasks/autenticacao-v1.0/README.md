# Tasks — Autenticação (v1.0)

**Spec:** `.sdd/specs/autenticacao.spec.md` (feature `autenticacao`, versão `1.0`, status `aprovada`)

Esta entrega é o **portão de entrada do app**: a tela de acesso, a sessão e o
bloqueio de tudo o mais. Diferente de um módulo de domínio, ela **não** nasce em
`src/app/modules/` — a sessão é infraestrutura transversal, consumida por qualquer
tela, então mora em `src/app/core/auth/` (ao lado de `core/data/` e
`core/estrutura/`) e a tela de acesso em `src/app/pages/login/`, fora da árvore de
módulos. Login não é um domínio de negócio com `data/`/`pages/`/`components/`; é o
que protege os domínios.

Por isso o peso maior em `Nível: Sênior` nas peças transversais (a facade de sessão
e o guard), que definem contrato consumido por todo módulo presente e futuro.

## Contagem por nível

| Nível | Tasks | Total |
|---|---|---|
| **Sênior** | AUTH-002, AUTH-003 | 2 |
| **Pleno** | AUTH-001, AUTH-004, AUTH-005 | 3 |

## Grafo de dependências

```
AUTH-001 (auth.models.ts + auth.models.spec.ts)
    │  tipos da sessão · credencial aceita · regra pura de validação
    ▼
AUTH-002 (auth.facade.ts)
    │  estado da sessão em signal · persistência · entrar() · sair()
    ├──────────────────────────────┐
    ▼                              ▼
AUTH-003 (auth.guard.ts)      AUTH-004 (login.page.ts + .html)
    │  bloqueia e devolve          │  formulário · recusa · destino original
    │  ao login com redirectTo     │
    └──────────────┬───────────────┘
                   ▼
         AUTH-005 (fiação — app.routes.ts +
                   estrutura.layout.ts + .html)
         (dep. TODAS as anteriores)
```

## Ordem de execução (levas)

1. **Leva 1** — `AUTH-001` (`core/auth/auth.models.ts` + `core/auth/auth.models.spec.ts`).
   Sem dependência.
2. **Leva 2** — `AUTH-002` (`core/auth/auth.facade.ts`). Depende de AUTH-001.
3. **Leva 3** (paralelo) — `AUTH-003` (`core/auth/auth.guard.ts`) ·
   `AUTH-004` (`pages/login/login.page.ts` + `.html`). As duas dependem de AUTH-002 e
   **não compartilham arquivo** — podem rodar juntas.
4. **Leva 4** — `AUTH-005` (fiação: `core/config/app.routes.ts` +
   `core/estrutura/estrutura.layout.ts` + `.html`). Depende de todas as anteriores.
   **Só ela** toca esses arquivos.

> Na leva paralela, só o orquestrador roda `npm run build`/`npm run check` ao final
> da leva — os implementadores não rodam build concorrente entre si (regra de
> concorrência da Fase 3, `CLAUDE.md`).

## Cobertura de RF por task

| RF | Task(s) |
|---|---|
| RF-01 | AUTH-004, AUTH-005 |
| RF-02 | AUTH-001, AUTH-002 |
| RF-03 | AUTH-001, AUTH-002, AUTH-004 |
| RF-04 | AUTH-001, AUTH-004 |
| RF-05 | AUTH-002 |
| RF-06 | AUTH-002 |
| RF-07 | AUTH-002, AUTH-005 |
| RF-08 | AUTH-002, AUTH-003, AUTH-005 |
| RF-09 | AUTH-003, AUTH-005 |
| RF-10 | AUTH-003 |
| RF-11 | AUTH-003, AUTH-004 |
| RF-12 | AUTH-002, AUTH-005 |

## Cobertura de edge cases

| Edge case (spec, seção 7) | Task |
|---|---|
| 1 a 4 — combinação de credencial, caixa do e-mail, caixa da senha | AUTH-001 (regra pura + teste) |
| 5 — campo vazio barrado antes de comparar | AUTH-004 (validação de obrigatório no formulário) |
| 6 — tentativas repetidas sem limite | nenhuma — fora de escopo por decisão da spec |
| 7 e 8 — recarregar com e sem sessão | AUTH-002 (persistência) + AUTH-003 (checagem a cada alcance) |
| 9 — "voltar" do navegador após encerrar sessão | AUTH-003 (guard roda em toda navegação) |
| 10 e 11 — login já logado, sessão entre abas | nenhuma — riscos aceitos pela spec (R-02, R-03) |

## Arquivos que a fiação (AUTH-005) reserva com exclusividade

- `src/app/core/config/app.routes.ts`
- `src/app/core/estrutura/estrutura.layout.ts`
- `src/app/core/estrutura/estrutura.layout.html`

Nenhuma outra task deste pacote toca esses arquivos.
