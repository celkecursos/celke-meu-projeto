---
description: Fase 2 do SDD — decompõe uma spec APROVADA em tasks de implementação (delega ao dev-lead).
argument-hint: <caminho da spec .sdd/specs/…spec.md>
---

Spec aprovada a decompor: **$1**

Antes de tudo, confirme que a spec em `$1` está **aprovada** (status/aprovação do
usuário). Se não estiver, pare e volte para `/sdd`.

## Faça

**Delegue ao subagente `dev-lead`** (Agent tool, `subagent_type: "dev-lead"`),
passando no prompt:

- O **conteúdo integral** da spec (`$1`).
- A instrução: gerar as tasks de implementação em `.sdd/tasks/<slug>-v<versão>/`,
  com um `README.md` (ordem de execução + grafo de dependências + níveis) e uma task
  por arquivo `<FEAT>-NNN-*.md`, no formato do agente. Só tasks de **implementação**,
  **NO CODE IN TASKS**, cada task classificada `Nível: Pleno` ou `Nível: Sênior` e
  com `Depende de:` preenchido.

O `dev-lead` já lê a LEI (`CLAUDE.md` + `.ai/rules/*`), onde está descrita a
**árvore canônica de módulo** que ele deve fazer as tasks produzirem.

## Ao voltar

Apresente ao usuário o `README.md` das tasks (ordem, grafo, contagem por nível) e
**PARE no Portão 2**: peça a revisão humana das tasks antes de implementar. Quando
aprovado, informe:
`/implementar-tasks .sdd/tasks/<slug>-v<versão>/README.md $1`
