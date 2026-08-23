# `.sdd/` — artefatos do Spec-Driven Development

Esta pasta guarda o **output do pipeline SDD**: as especificações e as tasks de cada
feature. **São versionadas (commitadas)** — fazem parte da rastreabilidade
`spec → task → arquivo → RF`.

> O pipeline, os 3 portões humanos e a hierarquia de verdade estão descritos em **um
> lugar só**: `CLAUDE.md`, seção "Camada de IA" — não os duplique aqui. O **contrato**
> destes arquivos (template de 9 seções, valores válidos de `Nível:`, regra de
> renumeração de `RF-NN`) está em `.ai/rules/sdd-artefatos.md`, que carrega sozinha
> ao tocar `.sdd/`.

## Estrutura

```
.sdd/
├── specs/
│   └── <feature-slug>.spec.md          ← Fase 1; template de 9 seções, agnóstico
└── tasks/
    └── <feature-slug>-v<versão>/       ← Fase 2 (dev-lead)
        ├── README.md                    ← ordem de execução + grafo + níveis
        ├── <FEAT>-NNN-<titulo>.md       ← uma task por arquivo (Pleno | Sênior)
        └── <FEAT>-NNN-fiacao.md         ← última: registra rota e nav (exclusiva)
```

## Regras que doem se você esquecer

- **Não renumere um `RF-NN`** já existente: tasks e código apontam para ele.
- **`Nível:`** vale exatamente `Pleno` ou `Sênior` — é a chave do despacho da Fase 3.
- **Tasks paralelas não compartilham arquivo.** `core/config/app.routes.ts` e
  `core/estrutura/estrutura.layout.ts` são exclusivos da task `*-fiacao`.
- **Mudou o escopo?** gere `<slug>-v<nova-versão>/` em vez de reescrever tasks já
  implementadas. O histórico É a rastreabilidade.
- **Nada aqui é apagado** — nem spec antiga, nem task concluída.
