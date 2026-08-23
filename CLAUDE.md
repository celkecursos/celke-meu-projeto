# celke-meu-projeto — guia do projeto (para devs e para o Claude Code)

> Projeto criado a partir do kit `celke-seed-angular` (bootstrap concluído: Fase 0
> pronta, `npm run check` verde). O kit não é mais necessário — o trabalho acontece
> **aqui dentro**.

> **Descreva o seu domínio neste arquivo.** Ele é o guia do sistema e a primeira
> fonte de verdade; as "Regras de ouro" abaixo são resumo das rules em `.ai/rules/`.

## O que é SEU para editar (fronteira de edição)

Este `CLAUDE.md` é o **guia do sistema** — edite à vontade (renomeie, descreva seu
domínio, troque exemplos). As "Regras de ouro" abaixo são RESUMO — a fonte que os
agentes carregam sozinhos são as **rules** em `.ai/rules/`, então a lei sobrevive
mesmo a uma reescrita deste arquivo.

## Missão

Construir um sistema Angular com um padrão de módulo **único e repetível**, onde
cada feature nasce de uma **especificação aprovada** — não de código improvisado.

## Stack (fixa)

- **Angular 21** — standalone, signals, `@if/@for/@switch`, `inject()`,
  `input()/output()`, `resource()`.
- **TypeScript 5.9** · **vitest** (testes) · **ESLint** (angular-eslint).
- **Angular CLI** (NÃO é Nx). Comandos: `npm start` · `npm run build` · `npm test` ·
  `npm run lint`. **Nunca `npx nx ...`**.
- **Tailwind v4 CSS-first** — configuração por `@theme` no `src/styles.css`
  (não existe `tailwind.config.js`).
- **SPA** — o app roda 100% no cliente; em produção um Express mínimo (`server.js`)
  serve o bundle e faz o fallback de rota.

## Regras de ouro

1. **A rule É o padrão.** O padrão de módulo está descrito de forma prescritiva em
   `.ai/rules/architecture.md` (árvore, nomes, assinaturas). Não invente estrutura
   nova — siga-a. Já existe módulo em `src/app/modules/`? ele é o **espelho vivo**.
2. **Token, não valor.** Cor/espaço/tamanho saem das escalas do Tailwind ou do
   `@theme`. **Sem valor arbitrário** (`p-[13px]`, `text-[#f00]`), sem hex em `.css`,
   sem `::ng-deep`.
3. **page = smart, component = dumb.** Página injeta a facade e orquestra; componente
   recebe `input()`/emite `output()`. Toda lógica de domínio no módulo; nada de regra
   em template. `.page.ts` e `.page.html` sempre separados.
4. **Componente compartilhado só existe se estiver documentado** em
   `.ai/rules/ui-guidelines.md`. Criou um? documente — é a única fonte de API que os
   implementadores enxergam.

## Estrutura (padrão do time — siga em todo módulo)

```
src/app/
  app.ts                     # root magro: <router-outlet>
  core/                      # singletons do app
    config/                  #   app.config.ts, app.routes.ts
    data/                    #   consulta.ts (contrato server-driven) + consulta.spec.ts
    estrutura/               #   estrutura.layout.ts — o layout institucional (nav + outlet)
  modules/<dominio>/         # UM por domínio (ver a árvore canônica na rule)
    data/                    #   <x>.models.ts · <x>-api.service.ts · <x>.facade.ts
    pages/<nome>/            #   páginas SMART — <x>.page.ts + <x>.page.html
    components/<nome>/       #   componentes DUMB — 1 pasta cada
  shared/components/         # reuso ENTRE módulos (dumb): tabela · paginacao · campo-texto
src/environments/            # bases de API por ambiente (padrão <serviço>ApiUrl)
public/data/                 # JSON de mock (contrato server-driven)
server.js                    # Express: serve dist/ em produção + fallback de SPA
```

O detalhe profundo (assinaturas da facade, do api-service, regra do espelho, padrão
de teste) está em **`.ai/rules/architecture.md`** — a fonte canônica.

## Criar um módulo novo

1. Liste `src/app/modules/`. Existe módulo? **siga-o**. Vazio? siga a árvore canônica
   de `.ai/rules/architecture.md` (o exemplo lá é `produto`).
2. Crie `data/` (models + api-service + facade), `pages/` e `components/`.
3. `<x>.routes.ts` com a lista + form (rota-FILHA se modal; rota IRMÃ se página).
4. Registre a rota lazy em `core/config/app.routes.ts` e o item de nav em
   `core/estrutura/estrutura.layout.ts` — **isso é a task de fiação**, feita por
   último e por ela só.

## APIs e ambiente

- **`src/environments/`**: bases `<serviço>ApiUrl` por ambiente; dev via
  `fileReplacements`.
- **URL de backend só nasce de uma base do `environment`** (o `*-api.service.ts`
  compõe sobre ela). Origem nova = +1 campo no environment.
- Enquanto não há backend, os dados vêm de **JSON em `public/data/` via HttpClient** —
  trocar a `url` por endpoint real **não mexe em tela**.

## Operação

- **Dev**: `npm start` → http://localhost:4200.
- **Build**: `npm run build` → `dist/<nome-do-projeto>/browser` (o nome vem do
  `angular.json`; o `server.js` descobre essa pasta sozinho).
  **Lint**: `npm run lint` · **Testes**: `npm test` (entra em **watch**) ·
  `npm run test:ci` (`--watch=false` — use este em CI e em agente).
  **Gate completo**: `npm run check` (lint + test:ci + build).
- **Teste é obrigatório desde o início** — testa-se **lógica de domínio** (função
  pura): regras de `<x>.models.ts`, o predicado de filtro do api-service, helpers de
  `core/data/consulta.ts`. **Não** se testa template/TestBed sem motivo forte.
  Exemplar: `core/data/consulta.spec.ts`.
- **Revisão de DoD**: `/revisar-dod` varre o que lint e build NÃO pegam (valor
  arbitrário, hex em `.css`, `::ng-deep`, `*ngIf`, `@for` sem `track`, camada trocada).

### Deploy (GitHub → Hostinger, aplicação Node)

O fluxo, em ordem:

```
git push (GitHub)  →  auto-deploy sincroniza o repositório na Hostinger
                   →  npm install --include=dev     ← devDependencies são
                                                       necessárias para buildar
                   →  npm run build                 ← acionado por você (SSH/hPanel);
                                                       o auto-deploy NÃO builda sozinho
                   →  npm run serve:prod            ← processo Node persistente
```

- **`server.js`** é um Express mínimo que **descobre `dist/<projeto>/browser`
  sozinho** (o nome do projeto NÃO está cravado nele) e devolve `index.html` em
  qualquer rota. **É esse fallback que faz o refresh em `/produto/editar/3`
  funcionar** — sem ele, SPA dá 404 ao recarregar.
- **`express` vai em `dependencies`** (não dev). `/dist` fica no `.gitignore` — o
  bundle nasce na hospedagem, não no repositório.
- **Atenção à memória**: build de Angular pede ~1–2 GB. Em plano compartilhado o
  processo pode ser morto sem mensagem clara; o contorno é
  `NODE_OPTIONS=--max-old-space-size=1024 npm run build`.
- **Versão do Node na hospedagem**: o Angular 21 exige `^20.19.0 || ^22.12.0 ||
  >=24.0.0`. Confira no hPanel qual versão a aplicação Node está usando — abaixo
  disso o `ng build` recusa a rodar com "requires a minimum Node.js version", e a
  centena de avisos `EBADENGINE` do `npm install` é só ruído: o erro real é a última
  linha. Subir a major do Angular sem antes conferir esse número quebra o deploy.

### Deploy alternativo: hospedagem ESTÁTICA (sem processo Node)

Se a hospedagem só publica arquivos (não roda `npm run serve:prod` de verdade —
sinal disso: `curl -I` no domínio devolve cabeçalhos de CDN/Apache, não do Express,
e uma rota como `/usuarios` dá **404 da hospedagem**, não do Angular, mesmo com o
menu funcionando), o fallback de SPA precisa vir de **`public/.htaccess`** em vez
do `server.js` — ele é copiado para `dist/<projeto>/browser/.htaccess` a cada
build (regra do Angular: tudo em `public/` vai para o bundle). Sem ele, acessar uma
rota do Angular direto pela URL (ou dar refresh nela) cai no 404 genérico do
servidor, porque não existe arquivo físico chamado `usuarios`.

Sintoma característico: **funciona clicando no menu, falha acessando a URL
direto** — a navegação pelo menu é só JavaScript no navegador (o Angular Router já
carregado intercepta), nunca bate no servidor; o acesso direto É uma requisição
nova, e aí falta o fallback.

- **`server.js` é infra de entrega** — não é código de aplicação e **não se edita em
  task de feature**.

## Camada de IA (`.ai/`) — regras e docs para os agentes

Este projeto tem uma **camada de IA versionada** em `.ai/` (fonte única), **duplicada**
para o `.claude/` por `npm run setup:ai`. O `postinstall` roda após `npm install`, mas
não dependa só dele: `.claude/{rules,skills,commands,agents}` são gitignored e não vêm
no clone.

```bash
npm run setup:ai     # .ai/{rules,skills,workflows,agents} → .claude/{rules,skills,commands,agents}
ls .claude/commands  # confirme: gerar-tasks · implementar-tasks · revisar-dod · sdd
```

Comando respondeu **`Unknown command: /sdd`** (ou `/gerar-tasks`, `/implementar-tasks`,
`/revisar-dod`)? A projeção não rodou. Execute o `setup:ai` acima e **reinicie a
sessão** — os slash commands são varridos na inicialização.

- **Hierarquia de verdade:** este `CLAUDE.md` > `.ai/rules/` > `.ai/skills/` > o
  **código existente** (o módulo que já existe é o espelho vivo — a rule vence no
  contrato, o código vence no estilo).
- **Rules** (carregam sozinhas via `.claude/rules`, escopadas por `paths`):
  `architecture` (a árvore canônica de módulo + padrão de teste) ·
  `ui-guidelines` (Tailwind v4 + API dos componentes de `shared/`) ·
  `sdd-artefatos` (contrato das specs/tasks em `.sdd/`).
- **Skills** — USE, não confie no training data: `angular-docs` (Angular 21/CLI/
  Tailwind v4) · `write-specs` (Fase 1 do SDD).
- **Pipeline SDD** (spec-driven, 3 portões humanos): `/sdd <ideia>` → spec ⛔ →
  `/gerar-tasks <spec>` → tasks ⛔ → `/implementar-tasks <readme> <spec>` → código ⛔.
  Output commitado em `.sdd/` (rastreabilidade spec→task→arquivo→RF). Verificação =
  `npm run check` + `/revisar-dod`.
  - **Fase 1 roda NO CHAT** (a inquisição socrática precisa do usuário) —
    `pm-spec-architect.md` é a **persona** dela, não um subagente para despachar.
    Fases 2 e 3 delegam: `dev-lead`; `dev-pleno`/`dev-senior` conforme o `Nível:`.
  - **Fase 3, concorrência**: tasks paralelas não podem compartilhar arquivo;
    `app.routes.ts` e `estrutura.layout.ts` são exclusivos da task `*-fiacao`
    (última, depende de todas); em leva paralela só o orquestrador roda o `build`.
- **Comandos**: `/sdd` · `/gerar-tasks` · `/implementar-tasks` · `/revisar-dod`.
- Editou algo em `.ai/`? rode `npm run setup:ai` — no Windows a projeção é **cópia**,
  não symlink, então sem rodar de novo o agente continua lendo a versão antiga.

## Definition of Done (todo PR)

- [ ] Sem valor arbitrário / hex em `.css` / `::ng-deep`.  [ ] Claro e escuro.
- [ ] Teclado + foco visível.  [ ] Estados vazio/carregando/erro.
- [ ] 1366×768 sem rolagem horizontal.  [ ] Deep-link e refresh funcionam na rota.
- [ ] Teste para a lógica de domínio nova (função pura).
- [ ] `npm run check` verde (`lint` + `test:ci` + `build`) e `/revisar-dod` limpo.
