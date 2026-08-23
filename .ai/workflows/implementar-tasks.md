---
description: Fase 3 do SDD — implementa as tasks, despachando cada uma ao implementador conforme o Nível (Pleno/Sênior).
argument-hint: <tasks/…/README.md> <spec .sdd/specs/…spec.md>
---

Lista de tasks (README): **$1**
Spec (para resolver ambiguidades): **$2**

Você é o **orquestrador** da Fase 3. Você NÃO implementa — você despacha cada task
ao subagente certo e revisa o resultado.

## Protocolo de despacho

Leia `$1` para pegar a **ordem de execução** e o **grafo de dependências**. Para
cada task, na ordem e respeitando `Depende de:`:

1. Leia o `.md` da task em `.sdd/tasks/<slug>-v<versão>/`.
2. Leia o campo **`Nível:`**.
3. **Despache via Agent tool:**
   - `Nível: Pleno`  → `subagent_type: "dev-pleno"`
   - `Nível: Sênior` → `subagent_type: "dev-senior"`
4. No prompt do subagente, inclua: o **conteúdo integral** da task, o caminho da
   spec (`$2`) para consulta, o lembrete de ler `CLAUDE.md` + `.ai/rules/*`, e —
   quando for despacho paralelo — o aviso do parágrafo abaixo. (A skill
   `angular-docs` já vem pré-carregada nos implementadores; não precisa lembrar.)

## Paralelismo (e as duas armadilhas dele)

Tasks com `Depende de:` **vazio** rodam em **paralelo** — dispare vários subagentes
numa única mensagem. Tasks com dependências esperam as predecessoras concluírem.

Duas coisas quebram em silêncio quando há concorrência, e é você quem previne:

1. **Arquivo compartilhado = escrita perdida.** Antes de disparar uma leva paralela,
   compare a lista "Arquivos a criar/modificar" das tasks: se **dois caminhos se
   repetem**, elas NÃO podem ir juntas — serialize. `app.routes.ts` e
   `estrutura.layout.ts` são de responsabilidade exclusiva da task `*-fiacao`, que
   depende de todas e roda sozinha no fim; se alguma outra task listar esses
   arquivos, o `dev-lead` errou — corrija antes de despachar.
2. **Build concorrente corrompe o cache.** `ng build` de vários agentes ao mesmo
   tempo disputa `.angular/cache` e `dist/`, e o erro que aparece não tem relação com
   o código — o agente então "conserta" o que não estava quebrado. Portanto: **no
   prompt de cada agente de uma leva paralela, diga explicitamente que ele deve rodar
   `npm run lint` e `npm run test:ci` (baratos, sem estado compartilhado) e NÃO rodar
   `npm run build`** — você roda o `npm run check` uma vez quando a leva inteira
   voltar. Em despacho sequencial (uma task por vez), o implementador roda o
   `npm run check` completo normalmente.

## Após CADA task (ou cada leva paralela)

Reporte ao usuário: arquivos criados/modificados, resultado do **`npm run check`**
(o gate deste projeto = `npm run lint` + `npm run test:ci` + `npm run build`), e a
premissa que o implementador assumiu. **Se uma task falhar** (build ou teste
vermelho, conflito arquitetural, escalonamento do implementador), **PARE e consulte
o usuário** antes de seguir.

## Após TODAS as tasks (Portão 3)

- Rode `npm run check` na app inteira e confirme verde (lint + test + build).
- Rode `/revisar-dod` e reporte o que ele acusar (o `check` não vê valor arbitrário,
  hex em `.css`, `::ng-deep`, control flow legado nem camada trocada).
- Resuma: tasks concluídas, arquivos tocados, status do build.
- Aponte qualquer **drift** entre spec e implementação que tenha notado (cada arquivo
  deveria rastrear um `RF-NN`).
- **PARE** para a revisão humana do diff antes do merge. Não faça commit sem o ok.
