---
paths:
  - ".sdd/**"
description: Contrato dos artefatos do SDD (specs e tasks) — o que NÃO pode mudar de forma quando alguém edita uma spec ou uma task à mão. Carrega ao tocar .sdd/.
---

# Artefatos do SDD — o que é contrato e o que é texto livre

Os arquivos em `.sdd/` **não são documentação solta**: eles são lidos por agentes nas
fases seguintes. Editar um campo estruturado quebra o pipeline longe daqui, sem erro
visível na hora. Ao editar qualquer coisa sob `.sdd/`, preserve o que está abaixo.

## `.sdd/specs/<slug>.spec.md` — a spec (Fase 1)

- **Template fixo de 9 seções**, nesta ordem: Resumo Executivo · Atores e Papéis ·
  Requisitos Funcionais · Modelo de Domínio · Máquina de Estados/Fluxos · Contratos
  de Interface · Edge Cases · Premissas Validadas · Riscos. Não renumere, não funda,
  não remova seção — a Fase 2 procura por elas.
- **Requisitos numerados `RF-NN`** no formato "O sistema DEVE…". O `RF-NN` é a chave
  de rastreabilidade `spec → task → arquivo`: **nunca renumere um RF existente**
  (tasks e código já apontam para ele). RF novo entra no fim; RF morto vira
  "RF-NN — REMOVIDO em v<x>", não some.
- **Agnóstica de tecnologia**: sem linguagem, framework, componente, nome de arquivo,
  código, pseudocódigo ou SQL. Se você sentir vontade de escrever `app-tabela` ou
  `.facade.ts` aqui, é sinal de que a decisão pertence à Fase 2.
- **Frontmatter**: `feature`, `versao`, `status` (`rascunho` | `aprovada`), `data`,
  `autor`. Ao revisar uma spec **já aprovada**: incremente `versao`, volte `status`
  para `rascunho` e registre no changelog (mais recente no topo, entradas imutáveis).

## `.sdd/tasks/<slug>-v<versao>/` — as tasks (Fase 2)

- **`Nível:` é a chave de despacho da Fase 3.** Vale **exatamente** `Pleno` ou
  `Sênior` (com acento circunflexo). `Senior`, `Médio`, `Júnior` ou qualquer variação
  não casa com nada e a task não é despachada.
- **`Depende de:`** define ordem E paralelismo. Duas tasks sem dependência mútua podem
  rodar ao mesmo tempo — logo **não podem listar o mesmo arquivo** em "Arquivos a
  criar/modificar" (implementadores concorrentes se sobrescrevem em silêncio).
- **`core/config/app.routes.ts` e `core/estrutura/estrutura.layout.ts` pertencem só à
  task `*-fiacao`**, que depende de todas as outras. Se aparecerem em outra task, é
  bug — mova.
- **`Spec:` + `atende RF-NN`** em toda task: é o elo da rastreabilidade. Task sem RF
  é task que não deveria existir.
- **NO CODE IN TASKS**: o corpo descreve contratos em prosa e aponta o padrão exato a
  seguir (`.ai/rules/architecture.md`). Exceção única: `interface`/`type`/`enum` de
  domínio.
- Mudou o escopo? **gere uma pasta nova** `<slug>-v<nova-versao>/` em vez de reescrever
  tasks que já foram implementadas — o histórico é a rastreabilidade.

## O que NÃO fazer aqui

- Não implemente código a partir de uma spec sem passar por `/gerar-tasks`.
- Não marque uma spec como `aprovada` por conta própria: os 3 portões são humanos.
- Não apague spec/task antiga — `.sdd/` é versionado justamente para guardar o
  caminho `spec → task → arquivo → RF`.

Pipeline completo e os 3 portões: `CLAUDE.md`, seção "Camada de IA".
