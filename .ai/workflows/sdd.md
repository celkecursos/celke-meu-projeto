---
description: Inicia o pipeline SDD (spec → tasks → código) a partir de uma ideia. Fase 1 = especificar, com aprovação humana.
argument-hint: <descrição da feature ou módulo>
---

O usuário quer construir: **$ARGUMENTS**

Você vai conduzir o **SDD (Spec-Driven Development)** — 3 fases, **3 portões
humanos**. A especificação (não o código) é o contrato.

```
Fase 1 · /sdd              → .sdd/specs/<slug>.spec.md      ⛔ APROVAR a spec
Fase 2 · /gerar-tasks      → .sdd/tasks/<slug>-v<versão>/   ⛔ REVISAR as tasks
Fase 3 · /implementar-tasks→ código                          ⛔ REVISAR diff + `npm run check`
```

## Faça agora — Fase 1 (especificação)

Conduza a especificação **você mesmo, neste chat**, assumindo a persona descrita em
`.ai/agents/pm-spec-architect.md` e seguindo a skill `write-specs`. **NÃO delegue a
um subagente** — subagente roda isolado, sem turnos com o usuário, e a inquisição
socrática (que é o valor inteiro da Fase 1) não aconteceria.

1. Faça perguntas socráticas (≤5 por rodada) até entender de fato. **Fique no
   domínio** (atores, regras, estados, contratos, edge cases) — **zero código, zero
   menção a Angular/Tailwind/arquivo**. Se pedirem código, recuse e volte ao desenho.
2. Apresente **Premissas e Riscos**; espere confirmação.
3. Redija a spec no template de 9 seções e salve em `.sdd/specs/<slug>.spec.md`.
4. **PARE** e peça aprovação explícita. Só quando o usuário disser "Sim", informe o
   próximo passo: `/gerar-tasks .sdd/specs/<slug>.spec.md`.

> A tradução para o mundo Angular/Tailwind acontece na Fase 2 — aqui a spec é agnóstica.
