# celke-meu-projeto

Aplicação **Angular 21** (SPA) com um padrão de módulo único e repetível, onde cada
feature nasce de uma **especificação aprovada** — o pipeline **SDD** (Spec-Driven
Development) já vem montado.

> A **lei do projeto** está no [`CLAUDE.md`](./CLAUDE.md); o detalhe profundo
> (árvore canônica de módulo, assinaturas, padrão de teste) está em
> [`.ai/rules/`](./.ai/rules/). Em caso de conflito, o `CLAUDE.md` vence.

## Stack

| | |
|---|---|
| Framework | Angular 21 — standalone, signals, `@if/@for/@switch`, `resource()` |
| Linguagem | TypeScript 5.9 |
| Estilo | Tailwind v4 (CSS-first, `@theme` em `src/styles.css` — não há `tailwind.config.js`) |
| Testes | vitest (builder `@angular/build:unit-test`) |
| Lint | ESLint + angular-eslint |
| Produção | Express (`server.js`) servindo o bundle estático |

## Começando

```bash
npm install          # o postinstall roda o setup:ai (duplica .ai/ → .claude/)
npm run setup:ai     # rode explicitamente — o postinstall pode não ter disparado
ls .claude/commands  # confirme: gerar-tasks · implementar-tasks · revisar-dod · sdd
npm start            # http://localhost:4200
```

> Sem `.claude/commands/` os slash commands do pipeline não existem e o Claude Code
> responde `Unknown command: /sdd`. Depois de gerar a pasta, **reinicie a sessão** —
> os comandos são varridos na inicialização.

## Comandos

| Comando | O que faz |
|---|---|
| `npm start` | servidor de desenvolvimento |
| `npm run build` | build de produção em `dist/celke-meu-projeto/browser` |
| `npm test` | testes em **watch** |
| `npm run test:ci` | testes uma vez (`--watch=false`) — use em CI e em agente |
| `npm run lint` | ESLint |
| **`npm run check`** | **o gate: lint + test:ci + build** |
| `npm run setup:ai` | projeta `.ai/` → `.claude/` (rode após editar `.ai/`) |
| `npm run serve:prod` | sobe o Express sobre o `dist/` já buildado |

## Estrutura

```
src/app/
  app.ts                     # root magro: <router-outlet>
  core/                      # singletons do app
    config/app.routes.ts     #   rotas raiz (módulos entram lazy aqui)
    data/consulta.ts         #   contrato server-driven + helpers puros
    data/consulta.spec.ts    #   o EXEMPLAR de teste do projeto
    estrutura/               #   estrutura.layout.ts — nav superior + <router-outlet>
  modules/<dominio>/         # UM por domínio (ainda vazio — ver abaixo)
  shared/components/         # reuso dumb ENTRE módulos: tabela · paginacao · campo-texto
src/environments/            # bases <serviço>ApiUrl por ambiente
public/data/                 # JSON de mock (contrato server-driven)
server.js                    # Express: serve dist/ + fallback de SPA
```

### Componentes compartilhados

A API deles é documentada em [`.ai/rules/ui-guidelines.md`](./.ai/rules/ui-guidelines.md)
— **essa rule é a única fonte de API** que os implementadores enxergam. Criou um
componente novo em `shared/`? documente lá.

```ts
<app-tabela      [listagem] [colunas] (selecionar) (ordenar) />
<app-paginacao   [listagem] (pagina) />
<app-campo-texto [rotulo] [tipo] [dica] formControlName="…" />
```

## O primeiro módulo nasce do SDD

`src/app/modules/` está **vazio de propósito**: nenhum módulo de domínio foi criado no
bootstrap. O primeiro sai do pipeline, e é ele que vira o "espelho vivo" dos próximos.

```
/sdd <ideia>                          → .sdd/specs/<slug>.spec.md       ⛔ APROVAR
/gerar-tasks <spec>                   → .sdd/tasks/<slug>-v<versão>/    ⛔ REVISAR
/implementar-tasks <readme> <spec>    → código                          ⛔ REVISAR
/revisar-dod                          → varredura do Definition of Done
```

Os 3 ⛔ são **portões humanos** — nada avança sozinho.

## Camada de IA

Você escreve em `.ai/` (versionado, agnóstico de ferramenta) e o `npm run setup:ai`
**duplica** para `.claude/` (tenta symlink; no Windows sem privilégio cai para cópia).
O `postinstall` ajuda, mas **não dependa só dele**: os destinos são gitignored, então
um clone novo — ou um `npm install` que rodou antes de o script existir, ou um
`npm ci --ignore-scripts` — deixa o projeto **sem `.claude/` e sem comandos**.

| Destino | Fonte |
|---|---|
| `.claude/rules/` | `.ai/rules/` |
| `.claude/skills/` | `.ai/skills/` |
| `.claude/commands/` | `.ai/workflows/` |
| `.claude/agents/` | `.ai/agents/` |

**Regra prática**: fez `git clone` ou editou algo em `.ai/`? rode `npm run setup:ai`
e confira com `ls .claude/commands`. Como a projeção no Windows é **cópia**,
`.claude/` é um snapshot — sem rodar o script de novo, o agente lê a versão antiga.

**Sintoma de que faltou rodar**: `Unknown command: /sdd` (ou `/gerar-tasks`,
`/implementar-tasks`, `/revisar-dod`). Rode `npm run setup:ai` e **reinicie a sessão**.

## Deploy (GitHub → Hostinger, aplicação Node)

- HOSTINGER COM UM DESCONTÃO!
- Cupom: CELKE
- https://celke.com.br/page/hostinger

```
git push (GitHub)  →  auto-deploy sincroniza o repositório
                   →  npm install --include=dev   ← devDependencies buildam (ng, typescript…)
                   →  npm run build               ← acionado por você via SSH/hPanel
                   →  npm run serve:prod
```

- **Versão do Node na hospedagem**: o Angular 21 exige `^20.19.0 || ^22.12.0 ||
  >=24.0.0`. Confira no hPanel qual versão a aplicação Node está usando — abaixo
  disso o `ng build` recusa a rodar com "requires a minimum Node.js version", e a
  centena de avisos `EBADENGINE` do `npm install` é só ruído: o erro real é a última
  linha. Subir a major do Angular sem antes conferir esse número quebra o deploy.
- **`npm install --include=dev`**: sem as devDependencies, `ng build` falha com
  `ng: not found`.
- **Memória**: o build pede ~1–2 GB; em plano compartilhado use
  `NODE_OPTIONS=--max-old-space-size=1024 npm run build`.
- **`/dist` é gitignored** — o bundle nasce na hospedagem.
- O `server.js` descobre `dist/<projeto>/browser` sozinho e faz o fallback de rota
  (é ele que faz **refresh em `/produto/editar/3`** funcionar em vez de 404).
- **Hospedagem só de arquivo estático** (a maioria dos planos compartilhados, sem
  processo Node de verdade)? o `server.js` não roda, então quem precisa do
  fallback é o **`public/.htaccess`** (copiado para `dist/.../browser/` a cada
  build). Sintoma sem ele: acessar uma rota direto pela URL, ou dar refresh nela,
  dá 404 — mas navegar pelo menu funciona normal (é só JS no navegador, nunca bate
  no servidor). Ver `CLAUDE.md`, "Deploy alternativo: hospedagem ESTÁTICA".

## Definition of Done (todo PR)

- [ ] Sem valor arbitrário (`p-[13px]`), sem hex em `.css`, sem `::ng-deep`
- [ ] Claro e escuro · teclado + foco visível · estados vazio/carregando/erro
- [ ] 1366×768 sem rolagem horizontal · deep-link e refresh funcionam
- [ ] Teste para a lógica de domínio nova (função pura)
- [ ] `npm run check` verde e `/revisar-dod` limpo

## Autor

Desenvolvido por [Cesar Szpak](https://celke.com.br) — [Celke
Cursos](https://github.com/celkecursos).

## Licença

MIT — veja o arquivo [LICENSE](LICENSE.txt) para detalhes.