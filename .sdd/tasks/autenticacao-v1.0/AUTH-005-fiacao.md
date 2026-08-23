# AUTH-005 — Fiação: proteger o app e identificar o operador

**Spec:** `.sdd/specs/autenticacao.spec.md` — atende **RF-01, RF-07, RF-08, RF-09,
RF-12** (torna a barreira efetiva e a sessão visível).

**Nível:** Pleno — wiring de rota e de layout, sem regra de negócio nova: toda a
decisão já mora na facade (AUTH-002) e no guard (AUTH-003).

**Depende de:** AUTH-001, AUTH-002, AUTH-003, AUTH-004 (todas as anteriores).

## Arquivos a modificar (exclusivos desta task)

- `src/app/core/config/app.routes.ts`
- `src/app/core/estrutura/estrutura.layout.ts`
- `src/app/core/estrutura/estrutura.layout.html`

**Nenhuma outra task deste pacote toca esses arquivos.** Esta é a última task da leva
de execução.

## Contrato — `app.routes.ts`

A forma da tabela de rotas é o que faz a barreira valer para **toda tela, inclusive
as que ainda não existem** — é o ponto mais importante desta task.

- A tela de acesso entra como rota **pública** e **fora** do `EstruturaLayout`: sem
  barra de navegação, sem cabeçalho, sem guard (RF-01). É a única rota nessa
  condição.
- Todo o resto pendura como **filho de uma única rota-pai** que usa o
  `EstruturaLayout` como componente e o `authGuard` (AUTH-003) em `canActivate`. É
  daí que sai RF-09: qualquer módulo registrado depois nasce protegido por
  construção, sem que a task de fiação dele precise lembrar de nada.
- **Não** repita o guard em cada rota filha — a proteção é do pai. Espalhar o guard
  pelas filhas é como uma rota nova acaba desprotegida por esquecimento.
- Carregue a tela de acesso de forma **lazy**, como as demais.
- Deixe no arquivo o comentário que indica onde as tasks `*-fiacao` de cada módulo
  registram a rota lazy do módulo delas — este arquivo é compartilhado por todo
  módulo futuro e o lugar certo precisa estar óbvio.

## Contrato — `estrutura.layout.ts`

O layout institucional é a moldura de **toda tela protegida** — é o que torna a
identificação e a saída disponíveis "de qualquer tela" (RF-07, RF-12) sem cada página
repetir nada.

- Injete a `AuthFacade` e exponha a sessão vigente para o template. O layout é o
  layout raiz do app, não um componente dumb: injetar a facade aqui é a camada
  correta.
- Exponha uma ação de encerrar sessão que chama `sair()` da facade **e** navega para
  a tela de acesso (RF-08). A navegação mora aqui, não na facade — a facade de sessão
  não conhece rota.
- Não introduza confirmação: encerrar a sessão é imediato e não pode falhar (Fluxo B
  da spec).

## Contrato — `estrutura.layout.html`

- Exiba o **nome de exibição** do operador na barra superior, visível em qualquer
  tela protegida (RF-12).
- Ofereça o botão de encerrar sessão na mesma barra (RF-07).
- Os dois só aparecem quando há sessão — use control flow `@if` sobre a sessão. Sem
  sessão o operador está na tela de acesso, que não usa este layout, mas a guarda no
  template evita o estado intermediário piscar durante a navegação de saída.
- Sem valor arbitrário Tailwind, sem hex: escalas do tema (`.ai/rules/ui-guidelines.md`).

## Critérios de aceite

- Sem sessão, alcançar qualquer endereço protegido — inclusive digitando a URL ou por
  favorito — cai na tela de acesso (RF-09, RF-10); a tela de acesso em si abre normal.
- Com sessão, o nome do operador aparece na barra superior em qualquer tela protegida
  (RF-12), e o botão de sair está disponível na mesma barra (RF-07).
- Encerrar a sessão devolve à tela de acesso na hora, e o endereço protegido anterior
  deixa de abrir imediatamente (RF-08).
- Um módulo registrado depois como rota filha do pai protegido nasce bloqueado sem
  configuração extra.
- Claro e escuro; teclado com foco visível; 1366×768 sem rolagem horizontal (DoD).
- `npm run check` verde (lint + test:ci + build) — **gate final desta entrega**.
- `/revisar-dod` roda limpo sobre a feature inteira.
