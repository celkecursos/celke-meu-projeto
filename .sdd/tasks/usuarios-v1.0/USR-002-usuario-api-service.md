# USR-002 — `usuario-api.service.ts` (+ teste, mock JSON, environment)

**Spec:** `.sdd/specs/usuarios.spec.md` — atende **RF-01, RF-02, RF-03, RF-04, RF-13,
RF-14, RF-15, RF-18, RF-24, RF-25, RF-27, RF-28**.

**Nível:** Sênior — define o padrão de "backend fiel" simulando **leitura E escrita**
sobre um JSON estático (o `produto` de exemplo em `architecture.md` só documenta
leitura). Esse padrão de cache em memória + mutação será copiado pelos módulos
futuros que precisarem escrever sem backend real — precisa ficar certo aqui.

**Depende de:** USR-001.

## Arquivos a criar/modificar

- `src/app/modules/usuarios/data/usuario-api.service.ts`
- `src/app/modules/usuarios/data/usuario-api.service.spec.ts`
- `public/data/usuarios.json` (mock)
- `src/environments/environment.ts` (+ campo `usuariosApiUrl`)
- `src/environments/environment.development.ts` (+ campo `usuariosApiUrl`)

## Padrão a seguir

`.ai/rules/architecture.md`, seção `data/<x>-api.service.ts`: `@Injectable({
providedIn: 'root' })`, injeta `HttpClient`; URL só nasce de uma base do
`environment` (padrão `<serviço>ApiUrl`); o predicado de filtro é explícito e compõe
`core/data/consulta.ts`. Mock: `CLAUDE.md`, "APIs e ambiente" — dados vêm de JSON em
`public/data/` via `HttpClient`, mesmo padrão de `catalogoApiUrl: '/data'` já em
`src/environments/environment.ts`.

## Environment

Adicione, ao lado de `catalogoApiUrl`, o campo `usuariosApiUrl: '/data'` em
`environment.ts` **e** em `environment.development.ts` (mesmo valor nos dois — os
dados de usuários também vêm do mock em `public/data/` por enquanto). O
`usuario-api.service.ts` compõe a URL como `` `${environment.usuariosApiUrl}/usuarios.json` ``
— nunca a URL literal espalhada pelo serviço.

## Mock — `public/data/usuarios.json`

Um array de pelo menos **12 objetos** no formato `IUsuario` (de `usuario.models.ts`).
Requisitos do conjunto, para o mock já nascer consistente com as invariantes da
spec (seção 4) e permitir demonstrar paginação/ordenação/filtro de verdade:

- `id` único por item (string).
- Mistura de situação `ativo` e `inativo` (pelo menos 3 de cada).
- Pelo menos 3 usuários **sem** apelido (`apelido: ''`) e pelo menos 3 **com**
  apelido preenchido.
- Nenhum e-mail duplicado entre os itens (comparação sem caixa); nenhum apelido
  preenchido duplicado entre os itens.
- `dataCadastro` em ISO 8601, com pelo menos 12 valores **distintos** espalhados por
  datas diferentes — é o que torna a ordenação padrão (RF-06) e a paginação (RF-02,
  10 itens por página) visíveis de fato.
- Nomes completos com pelo menos um caso de nome de um único termo e um caso de
  espaços múltiplos entre termos (cobre os edge cases 9/10 também no dado de
  demonstração, não só no teste unitário).

## Contrato — predicado de filtro (função pura, testável)

**`casaFiltrosUsuario(usuario: IUsuario, filtros: IUsuarioFiltros): boolean`** —
exportada, módulo-nível, sem `inject`/HTTP. Combina, com **E** lógico:

- `casaExato(usuario.situacao, filtros.situacao)` de `core/data/consulta.ts` (filtro
  `''` = "todos", casa com tudo — RF-04).
- **OU** entre `casaTexto(usuario.nomeCompleto, filtros.busca)` e
  `casaTexto(usuario.email, filtros.busca)` de `core/data/consulta.ts` (RF-03: nome
  completo **OU** e-mail, parcial, sem diferenciar caixa).

Nota: `casaTexto`/`normalizarTexto` de `core/data/consulta.ts` já ignoram acento
além de caixa e espaço — mais permissivo que o mínimo exigido pelo RF-03. Isso **não
contraria** o edge case 17/risco R-04 da spec ("normalização de acento fora de
escopo"): a spec não promete acento-insensibilidade, mas também não a proíbe.
Reaproveite o helper como está — não crie um segundo casador que ignore acento.

Não é preciso escrever um comparador de ordenação próprio: reaproveite
`ordenarPor` de `core/data/consulta.ts` (já trata campo vazio/nulo indo para o fim,
o que resolve sozinho o edge case 16 — apelidos vazios sempre agrupados no fim,
independente da direção). `dataCadastro` é string ISO 8601: a comparação por
`localeCompare` de `ordenarPor` já ordena cronologicamente sem tratamento especial.

## Contrato — "banco" em memória (a simulação do backend)

O serviço mantém, em um campo privado, o array de `IUsuario` carregado do JSON. Na
primeira operação que precisar dos dados (`listar`, `obter`, `criar`, `atualizar` ou
`alterarSituacao`), se o cache ainda não existe, faça o `HttpClient.get` no JSON do
mock, guarde o resultado no campo privado e use-o dali em diante — **as operações de
escrita (`criar`/`atualizar`/`alterarSituacao`) mutam esse array em memória**, não o
arquivo físico. Isso é uma simulação de sessão, não persistência real: um recarregar
de página perde as mutações e volta ao JSON original — comportamento aceito
enquanto não há backend (é exatamente o que o `CLAUDE.md` descreve: "trocar a `url`
por endpoint real não mexe em tela" — quando o backend real chegar, este cache some e
os métodos passam a ser chamadas HTTP diretas, sem o resto do módulo mudar).

## Contrato — assinaturas

```ts
listar(consulta: IConsulta): Observable<IPagina<IUsuario>>
obter(id: string): Observable<IUsuario>
criar(dados: IUsuarioForm): Observable<IUsuario>
atualizar(id: string, dados: IUsuarioForm): Observable<IUsuario>
alterarSituacao(id: string, situacao: TSituacaoUsuario): Observable<IUsuario>
```

- **`listar`** — carrega o cache; filtra com `casaFiltrosUsuario(item, consulta.filtros as IUsuarioFiltros)`;
  ordena com `ordenarPor(filtrados, consulta.ordenacao)`; pagina com
  `paginar(ordenados, consulta.pagina, consulta.tamanho)` de `core/data/consulta.ts`;
  emite o `IPagina<IUsuario>` resultante.
- **`obter`** — carrega o cache; procura por `id`. Encontrado → emite o `IUsuario`.
  Não encontrado → o Observable emite **erro** (ex.: `throwError`) com uma mensagem
  identificável como "usuário não encontrado" (a página trata esse erro
  distintamente de indisponibilidade genérica).
- **`criar`** — normaliza `nomeCompleto`/`email`/`apelido` com `normalizarCampo`;
  valida **nesta ordem** (Fluxo B da spec, passo 4), parando na primeira falha, e
  rejeitando o Observable com um `IUsuarioRecusa` (`{ campo, motivo }`):
  1. `nomeCompleto` vazio ou `email` vazio após normalizar → `campo` correspondente,
     motivo "obrigatório não preenchido".
  2. `email` normalizado sem formato de endereço válido (contém `@`, texto antes e
     depois, domínio com pelo menos um ponto, sem espaços) → `campo: 'email'`,
     motivo de formato inválido.
  3. `!emailDisponivel(email, cache)` → `campo: 'email'`, motivo de e-mail já
     cadastrado.
  4. Se `apelido` normalizado não for vazio e `!apelidoDisponivel(apelido, cache)` →
     `campo: 'apelido'`, motivo de apelido já cadastrado.
  Passando todas: gera `id` novo e único, atribui `dataCadastro` = instante atual em
  ISO 8601, adiciona ao cache, emite o `IUsuario` criado.
- **`atualizar`** — carrega o cache; se `id` não existir → erro "usuário não
  encontrado". Existindo: mesmas validações de `criar`, mas `emailDisponivel`/
  `apelidoDisponivel` recebem `idAtual: id` (RF-18 — não conflita consigo mesmo).
  Passando: substitui `nomeCompleto`/`email`/`apelido`/`situacao` no item do cache,
  **preserva `id` e `dataCadastro` originais** (RF-15), emite o `IUsuario`
  atualizado.
- **`alterarSituacao`** — carrega o cache; se `id` não existir → erro "usuário não
  encontrado". Existindo: troca **só** `situacao` no item do cache (RF-27: nome,
  e-mail, apelido, data de cadastro intocados); emite o `IUsuario` atualizado.
  Chamar duas vezes com a mesma situação é inofensivo — não há checagem de "já está
  nesse estado" nem erro por isso (edge case 19).

## Critérios de aceite

- `casaFiltrosUsuario` tem `usuario-api.service.spec.ts` cobrindo: busca por trecho
  do nome; busca por trecho do e-mail; busca vazia casa com tudo; filtro de situação
  restringe; filtro `''` (todos) não restringe; combinação busca+situação (E lógico).
- Nenhum teste automatizado é exigido para `listar`/`obter`/`criar`/`atualizar`/
  `alterarSituacao` em si (tocam `HttpClient`/cache — fora do escopo de teste do
  projeto per `architecture.md`); a correção deles é validada na integração com a
  facade e as páginas.
- `npm run test:ci` verde.
