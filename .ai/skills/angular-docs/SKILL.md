---
name: angular-docs
description: Use ao trabalhar com APIs do Angular 21 ou do Angular CLI (signals, control flow @if/@for/@switch, Reactive Forms, router, DI, resource(), zoneless) e com Tailwind v4 CSS-first. Busca doc atual — não confie no training data.
---

# Documentação do Angular 21 / Angular CLI / Tailwind v4

Este projeto é **Angular 21 standalone, signals, zoneless-ready** (Angular CLI puro:
`npm start` / `npm run build` / `npm test`), com **Tailwind v4 CSS-first**. Ao mexer
em API do Angular, do CLI ou do Tailwind, **busque a doc atual** — o training data
pode não refletir a versão 22 / v4.

## Como buscar (preferência)

1. **Context7 (MCP) — preferencial QUANDO DISPONÍVEL**: `resolve-library-id` com
   "angular" (ou "tailwindcss") → `query-docs` com a pergunta completa (ex.:
   "Angular 21 resource() signal", "control flow @for track", "Reactive Forms typed",
   "Tailwind v4 @theme"). Use IDs versionados quando o assunto for específico de versão.
2. **WebFetch `https://angular.dev/llms.txt`** (e `https://tailwindcss.com/docs`) e
   siga o índice; WebSearch para subtópicos. Este caminho é **igualmente legítimo**,
   não um plano B degradado — subagente com `tools:` restrito não enxerga ferramenta
   MCP nenhuma, então em muitos contextos ele é o único disponível. Não desista da
   busca por não ter Context7.

> **Se você não tem `WebFetch` nem MCP** (é o caso dos implementadores, cujo `tools:`
> é fechado): não invente API. Trabalhe com o que a LEI e o código vizinho já fixam,
> e **escale ao humano** se precisar de uma API que não consegue confirmar.

## Diretrizes de resposta

- Standalone é **implícito** (Angular 19+); não escreva `standalone: true`.
- Estado = **signals** (`signal`/`computed`/`effect`/`resource`); `input()`/
  `output()`; `inject()` em vez de constructor injection. RxJS só onde faz sentido
  (HTTP/router). Control flow `@if/@for/@switch` (nunca `*ngIf/*ngFor`), `@for` com
  `track` obrigatório.
- **Angular CLI**: comandos são `npm start` / `npm run build` / `npm test`.
- **Tailwind v4 é CSS-first**: configuração por `@theme` no `src/styles.css`, não por
  `tailwind.config.js`.
- Cite a fonte consultada. Inclua imports completos nos exemplos.

> Para a API dos componentes compartilhados deste projeto (`app-tabela`,
> `app-paginacao`, `app-campo-texto`), a fonte é **`.ai/rules/ui-guidelines.md`** —
> não a doc do Angular.
