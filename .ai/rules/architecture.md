---
paths:
  - "src/app/modules/**"
  - "src/app/core/**"
  - "src/app/shared/**"
  - "src/app/*.ts"
  - "src/environments/**"
description: O padrão de módulo do projeto (data/pages/components + facade/signals/resource) descrito de forma PRESCRITIVA. Carrega ao tocar a estrutura do app.
---

# Arquitetura — o padrão de módulo

> **Esta rule É o padrão.** Não existe "módulo exemplar" a copiar às cegas: a árvore,
> os nomes e as assinaturas abaixo são o contrato. Siga-os **literalmente**.

## Regra do espelho (leia antes de criar módulo)

Antes de criar um módulo novo, **liste `src/app/modules/`**:

- **Já existe módulo?** Ele é o **espelho**: abra-o e siga o que ele faz de fato
  (nomes, ordem dos membros, estilo de teste). Divergiu desta rule? A rule vence no
  contrato (nomes/assinaturas); o espelho vence no estilo.
- **Está vazio?** Você está criando o **primeiro** módulo — a árvore abaixo é a
  fonte, e o que você escrever vira o espelho dos próximos. Capriche.

## Camadas (dependência em sentido único)

```
pages (smart) → facade (signals + resource) → api-service (backend fiel) → HttpClient
components (dumb) ← input()/output() ←──────────── page orquestra
```

- **page = smart**: injeta a facade, orquestra, navega. `.page.ts` + `.page.html`
  **sempre separados** (nunca `template:` inline).
- **component = dumb**: `input()`/`output()`, zero facade, zero regra de domínio.
  **1 componente = 1 pasta.**

## A árvore canônica (exemplo: módulo `produto`)

Ao criar `<x>`, produza exatamente esta estrutura — trocando `produto`/`Produto`
pelo seu domínio:

```
src/app/modules/produto/
  data/
    produto.models.ts         IProduto · IProdutoFiltros · produtoParaRotulo()
                              + regras puras (ex.: severidadePorEstoque())
    produto.models.spec.ts     ← teste das regras puras (obrigatório)
    produto-api.service.ts    ProdutoApiService — papel de "backend fiel"
    produto.facade.ts         ProdutoFacade — signals + resource()
  pages/
    produto-lista/            produto-lista.page.ts + produto-lista.page.html
    produto-form/             produto-form.page.ts  + produto-form.page.html
  components/
    produto-tabela/           produto-tabela.ts + produto-tabela.html
    produto-filtros/          produto-filtros.ts + produto-filtros.html
  produto.routes.ts
```

### `data/<x>.models.ts`

- Interfaces `I<X>` (o registro) e `I<X>Filtros` (os filtros da listagem).
- `<x>ParaRotulo(item): string` — projeção do registro para uma linha de busca.
- **Regras de domínio como funções PURAS** (sem `inject`, sem HTTP). São elas que
  o teste cobre. No `produto`: `severidadePorEstoque(produto)` devolvendo
  `'ok' | 'alerta' | 'critico'`.

### `data/<x>-api.service.ts` — o "backend fiel"

`@Injectable({ providedIn: 'root' })`, injeta `HttpClient`. Assinaturas fixas:

```ts
listar(consulta: IConsulta): Observable<IPagina<IProduto>>
obter(id: string): Observable<IProduto>
buscar(termo: string): Observable<IProduto[]>
opcoesFiltros(): Observable<IProdutoOpcoes>
```

- **URL de backend só nasce de uma base do `environment`** (`<serviço>ApiUrl`); o
  path é de quem consome. Origem nova = +1 campo no environment.
- O predicado de filtro é **explícito** e compõe `core/data/consulta.ts` — ele É a
  semântica do backend, e por isso é o lugar de maior retorno em teste.

### `data/<x>.facade.ts`

`@Injectable({ providedIn: 'root' })`. O contrato que não muda:

```ts
#consulta = signal<IConsulta>(CONSULTA_INICIAL);   // privado
#recurso = resource({ ... });                       // privado — NUNCA vaza
listagem = computed<IListagem<IProduto>>(...);      // readonly, exposto
filtrar(filtros) · paginar(pagina) · ordenar(campo) // comandos
```

- Estado privado em **signals**; exposição só por `computed` readonly.
- **O `resource()` NUNCA vaza da facade** — a página consome `listagem()`, não o
  recurso.

### `pages/` e `components/`

- A página injeta a facade e passa **`[listagem]="facade.listagem()"`** ao wrapper
  dumb — nunca ~8 parâmetros campo a campo.
- O componente dumb recebe `input()` e emite `output()`; ele não conhece a facade.
  A API dos componentes compartilhados (`shared/`) está em `ui-guidelines.md`.

## Listagem server-driven

- `core/data/consulta.ts` é a **base compartilhada**: `IConsulta` (filtros + página
  + ordenação), `IPagina<T>` (a RESPOSTA do servidor) e `IListagem<T>` (o ESTADO da
  UI: itens/carregando/erro/total/página empacotados). `IPagina<T>` ≠ `IListagem<T>`.
- A mesma `listagem()` alimenta tabela e qualquer outra apresentação.

## Rotas e formulário

- **Rotas lazy por módulo** (`<x>.routes.ts` + `loadChildren`); o registro em
  `core/config/app.routes.ts` e o item de nav em `core/estrutura/estrutura.layout.ts`
  são feitos **só pela task de fiação**.
- **A rota do form BIFURCA por modo** (mesmos paths `novo` · `editar/:id` ·
  `visualizar/:id`): form **MODAL** = rota-FILHA da lista (`children` — a lista fica
  montada sob o backdrop) · form de **PÁGINA** = rota **IRMÃ** (fora de `children` —
  a lista desmonta). Nos dois, **a URL é a fonte da verdade** (deep-link e refresh
  funcionam): a página lê `id`/`modo` da rota (`componentInputBinding`; `data.modo`),
  busca pela facade (`obter(id)`) e navega de volta ao fechar.

## Dados

- Vêm de **JSON em `public/data/` via HttpClient** (contrato server-driven) —
  trocar a `url` por endpoint real **não mexe em tela**.
- Lookup cruzado consome a API pública do outro módulo (`<x>ApiService.buscar` +
  `<x>ParaRotulo`), nunca a facade alheia.

## Testes (ligados desde o início)

Gate = `npm run check` (`lint` + `test:ci` + `build`). Teste faz parte da entrega.

- **Testa-se lógica de DOMÍNIO — função pura**: as regras de `<x>.models.ts`, o
  predicado de filtro do `<x>-api.service.ts`, e `computed` de facade com regra
  não-trivial. O exemplar de base é `core/data/consulta.spec.ts` (casadores,
  ordenação e paginação — a semântica usada por todos os módulos).
- **NÃO se testa** renderização de template/TestBed sem motivo forte, nem fiação
  trivial de facade.
- Estilo: `import { describe, expect, it } from 'vitest'`; um `describe` por função;
  nome do caso descreve a REGRA em português; caso-limite explícito.
- `npm test` entra em **watch** — no gate e para agentes use `npm run test:ci`.

## Fora do padrão de módulo

- **`server.js`** (raiz) é **infra de entrega** — Express servindo `dist/` em
  produção. Não é código de aplicação: **não o edite em task de feature**.
- `core/` guarda singletons (config, rotas, layout, `data/consulta.ts`);
  `shared/components/` guarda o reuso dumb ENTRE módulos.

## Regra que blinda a composição

Toda lógica reutilizável (validação, máscara, formatação) mora na BASE
(`core/`/`shared/`) — **nunca** trancada num componente de tela.
