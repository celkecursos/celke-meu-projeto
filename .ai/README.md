# `.ai/` — Artefatos de IA do projeto

Esta pasta é a **fonte única de verdade** para tudo que orienta ferramentas de IA
neste projeto. Os artefatos aqui são **agnósticos de ferramenta** — cada IA recebe
sua projeção via `scripts/setup-ai.mjs`.

A ideia: você escreve o artefato **uma vez** em `.ai/`, e o `npm run setup:ai`
materializa symlinks (com fallback de cópia) nas pastas que cada ferramenta espera
(`.claude/`). O conteúdo (versionado) fica desacoplado do formato de consumo de cada
IA (regenerável, gitignored).

## Estrutura

```
.ai/
├── README.md          ← este arquivo
├── rules/             ← regras do projeto (→ .claude/rules; `paths` escopam)
│   ├── architecture.md            — a ÁRVORE CANÔNICA de módulo + padrão de teste
│   ├── ui-guidelines.md           — Tailwind v4 + a API dos componentes de shared/
│   └── sdd-artefatos.md           — contrato das specs/tasks (escopada em .sdd/**)
├── skills/            ← skills (→ .claude/skills; cada uma = <nome>/SKILL.md)
│   ├── angular-docs/SKILL.md       — doc atual de Angular 21/CLI/Tailwind v4
│   └── write-specs/SKILL.md        — processo da Fase 1 do SDD (template de spec)
├── agents/            ← agentes do SDD (→ .claude/agents; .md flat)
│   ├── pm-spec-architect.md        — Fase 1: PERSONA do chat (NÃO se despacha)
│   ├── dev-lead.md                 — Fase 2: spec → tasks (sonnet)
│   ├── dev-pleno.md                — Fase 3: implementa padrão existente (sonnet)
│   └── dev-senior.md               — Fase 3: define padrão novo (sonnet)
└── workflows/         ← slash commands (→ .claude/commands; .md flat)
    ├── sdd.md                      — /sdd <ideia>          (Fase 1)
    ├── gerar-tasks.md              — /gerar-tasks <spec>   (Fase 2)
    ├── implementar-tasks.md        — /implementar-tasks …  (Fase 3)
    └── revisar-dod.md              — /revisar-dod          (varredura de DoD)
```

O **pipeline SDD**, os 3 portões e a hierarquia de verdade estão descritos em
`CLAUDE.md`, seção "Camada de IA" — **fonte canônica, não duplique aqui**. Este
arquivo cobre só o mecanismo de projeção `.ai/ → .claude/`.

## Por que os agentes têm `tools` e `skills` no frontmatter

Detalhe fácil de reintroduzir e que quebra o pipeline em silêncio: **`tools:` é uma
allowlist fechada**. Um agente com `tools: Read, Write, Edit, Glob, Grep, Bash` não
tem `WebFetch`, não tem `Skill` e **perde todas as ferramentas MCP** — então "use a
skill X" no corpo dele seria uma ordem impossível.

Por isso os implementadores declaram:

```yaml
skills: angular-docs    # injeta o conteúdo da skill no contexto ao nascer
```

Eles **não** têm `WebFetch`: a fonte da API dos componentes deste projeto é a rule
`ui-guidelines.md` (carregada por `paths`), não a web. Se um implementador precisar
de uma API que não consegue confirmar, a ordem é **escalar ao humano**, não inventar.

Ao criar um agente novo: se o corpo dele manda consultar alguma fonte externa,
confira que a ferramenta correspondente está na lista.

## Hierarquia de fontes de verdade

Conflitos se resolvem nesta ordem (a de cima vence):

1. **`CLAUDE.md`** (raiz) — a lei e o overview (carregado sempre).
2. **`.ai/rules/`** (→ `.claude/rules/`) — o detalhe profundo, sob demanda (`paths`).
3. **`.ai/skills/`** — busca de documentação (Angular, Tailwind), sob demanda.
4. **O código existente** — se já há módulo em `src/app/modules/`, ele é o espelho
   vivo (ver a "regra do espelho" em `architecture.md`): a rule vence no contrato
   (nomes/assinaturas), o código vence no estilo.

## Setup para ferramentas de IA

Após `git clone` (e após qualquer mudança em `.ai/`):

```bash
npm run setup:ai
```

| Ferramenta | Destino | Fonte | Formato |
|---|---|---|---|
| Claude Code | `.claude/rules/` | `.ai/rules/` | `.md` flat (`paths` opcional) |
| Claude Code | `.claude/skills/` | `.ai/skills/` | `<nome>/SKILL.md` |
| Claude Code | `.claude/commands/` | `.ai/workflows/` | `.md` flat |
| Claude Code | `.claude/agents/` | `.ai/agents/` | `.md` flat |

Os destinos (`.claude/*`) são **gitignored** — só `.ai/` e o script são versionados;
cada dev roda `npm run setup:ai` após o clone. O `postinstall` ajuda, mas não cobre
tudo (clone sem instalar, `npm ci --ignore-scripts`, instalação anterior ao script),
então **confirme** que a duplicação aconteceu:

```bash
ls .claude/commands   # gerar-tasks · implementar-tasks · revisar-dod · sdd
ls .claude/agents .claude/rules .claude/skills
```

**`Unknown command: /sdd`** (ou qualquer outro comando do pipeline) = `.claude/` não
foi gerado. Rode `npm run setup:ai` e **reinicie a sessão**: os slash commands são
varridos na inicialização, então uma sessão aberta não enxerga arquivos criados
depois. E como no Windows (sem privilégio de symlink) a projeção é **cópia**,
`.claude/` é um snapshot — editou `.ai/`? rode o script outra vez.

## Contribuindo

- **Rule**: `.ai/rules/<nome>.md` com frontmatter `paths` (opcional) + `description`.
- **Skill**: `.ai/skills/<nome>/SKILL.md` com `name` + `description`.
- **Agent**: `.ai/agents/<nome>.md` com `name`, `description`, `model`, `tools` —
  e `skills:` se o corpo mandar consultar alguma fonte (ver a seção acima; `tools` é
  allowlist e derruba MCP). A `description` é o gatilho de auto-delegação: se o agente
  NÃO deve ser despachado sozinho, diga isso nela.
- **Workflow**: `.ai/workflows/<nome>.md` com `description` + `argument-hint`.

Criou componente compartilhado novo? **documente-o em `ui-guidelines.md`** — é a
única fonte de API que os implementadores enxergam. Depois de editar, rode
`npm run setup:ai`.
