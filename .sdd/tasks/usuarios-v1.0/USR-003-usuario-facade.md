# USR-003 — `usuario.facade.ts`

**Spec:** `.sdd/specs/usuarios.spec.md` — atende **RF-02, RF-03, RF-04, RF-06,
RF-07, RF-24, RF-25, RF-31** (edge cases 14, 15, 19, 20 inclusos).

**Nível:** Sênior — primeira facade do projeto com `resource()` **e** operações de
escrita (CRUD) por cima dele; define como comandos de listagem convivem com
restauração de estado vindo da URL (consumida por USR-007) sem abrir mão do
`filtrar`/`paginar`/`ordenar` prescrito pela rule.

**Depende de:** USR-001, USR-002.

## Arquivo a criar

- `src/app/modules/usuarios/data/usuario.facade.ts`

## Padrão a seguir

`.ai/rules/architecture.md`, seção `data/<x>.facade.ts`: `@Injectable({ providedIn:
'root' })`; estado privado em signals; `#recurso = resource(...)` **nunca vaza** —
a página só consome `listagem()`; comandos expostos `filtrar(filtros)`,
`paginar(pagina)`, `ordenar(campo)`.

## Contrato — estado privado

- `#api = inject(UsuarioApiService)`.
- `#consulta = signal<IConsulta>(...)` — estado inicial: `filtros: { busca: '',
  situacao: '' }` (todos, RF-04), `pagina: 1`, `tamanho: 10`, `ordenacao: { campo:
  'dataCadastro', direcao: 'desc' }` (RF-06 — **não** use o `CONSULTA_INICIAL`
  genérico de `core/data/consulta.ts` sem sobrescrever `ordenacao`, ele nasce sem
  ordenação).
- `#recurso = resource({ request: () => this.#consulta(), loader: (...) =>
  this.#api.listar(request) })` — o `loader` converte o `Observable` do
  `usuario-api.service` para o formato que `resource()` espera (ex.: via
  `firstValueFrom`). **Nunca exposto fora da facade.**

## Contrato — estado exposto

- **`listagem = computed<IListagem<IUsuario>>(...)`** — deriva de
  `#recurso.value()`/`#recurso.isLoading()`/`#recurso.error()`, usando
  `listagemVazia(consulta)` enquanto carrega/sem valor, `paraListagem(pagina,
  consulta)` quando o loader resolve, e um `IListagem` com `erro` preenchido
  (mensagem pronta para exibição) quando o `resource` cai em erro — sem lançar
  exceção para a página. **Esta é a única fonte que `<app-usuario-tabela>` e
  `<app-paginacao>` recebem.**

## Contrato — clamp de página (edge case 15)

Registre um `effect()` que observa o resultado corrente do `#recurso`: sempre que
houver um total de registros maior que zero e a página armazenada em `#consulta`
exceder `totalDePaginas(total, tamanho)` (de `core/data/consulta.ts`), corrija
`#consulta` para a última página válida. Isso dispara sozinho um novo carregamento
(o `resource` reage à mudança do signal de entrada) — a UI nunca fica pedindo uma
página que não existe (edge case 15) nem trava numa página vazia quando um filtro
reduz o total (edge case 14, que já é coberto pelo reset a página 1 dos comandos
abaixo).

## Contrato — comandos de consulta

- **`filtrar(filtros: IUsuarioFiltros): void`** — substitui `#consulta().filtros`
  pelo valor recebido **e** reseta `pagina` para `1` (RF-07). Cobre busca **e**
  situação em uma única chamada — é o comando que tanto a busca textual quanto o
  filtro de situação usam (a página decide quando chamar).
- **`ordenar(campo: string, direcaoForcada?: TDirecao): void`** — quando
  `direcaoForcada` é passado, define `{ campo, direcao: direcaoForcada }`
  diretamente, sem alternância: é assim que a página de listagem aplica a ordem de
  RF-06 a partir da URL. Sem `direcaoForcada`, alterna com
  `alternarOrdenacao(consulta().ordenacao, campo)` de `core/data/consulta.ts` — a
  facade oferece a alternância para uso futuro, ainda que a listagem desta entrega
  não exponha controle de ordenação na tela (RF-05). Nos dois casos, reseta `pagina`
  para `1` (RF-07).
- **`paginar(pagina: number): void`** — define `#consulta().pagina = pagina`, sem
  tocar em filtros/ordenação (mudança de página preserva o resto — Fluxo A, passo 4).
- **`limparCriterios(): void`** — equivale a `filtrar({ busca: '', situacao: '' })`
  (RF-31 — caminho para limpar busca e filtro).
- **`recarregar(): void`** — repete a última consulta sem mudar nada nela (ex.:
  `#recurso.reload()`). É o "tentar de novo" do estado de erro (RF-31).

## Contrato — operações de escrita

- **`obter(id: string): Observable<IUsuario>`** — repassa `#api.obter(id)`
  diretamente (sem signal próprio; a página de formulário/visualização consome o
  `Observable` sozinha).
- **`cadastrar(dados: IUsuarioForm): Observable<IUsuario>`** — repassa
  `#api.criar(dados)`; em caso de sucesso, chama `recarregar()` **antes** de emitir
  para quem assinou (ex.: via `tap`). É obrigatório: a facade é `providedIn: 'root'`
  — o `resource()` é um singleton que **não** refaz sozinho ao remontar a página de
  listagem, então sem esse `reload` explícito a lista voltaria desatualizada depois
  de um cadastro.
- **`editar(id: string, dados: IUsuarioForm): Observable<IUsuario>`** — repassa
  `#api.atualizar(id, dados)`; mesmo `reload` em caso de sucesso.
- **`alterarSituacao(id: string, situacao: TSituacaoUsuario): Observable<IUsuario>`**
  — repassa `#api.alterarSituacao(id, situacao)`; mesmo `reload` em caso de sucesso.
  Como o `reload` usa o `#consulta` já vigente, busca/filtro/ordenação/página ficam
  preservados ao refletir a mudança (edge case 20) — nada de código extra para isso.

## Critérios de aceite

- Nenhum teste automatizado dedicado exigido para este arquivo (fiação de facade —
  fora do que `architecture.md` pede para testar); a correção é validada pelas
  páginas que a consomem.
- `#recurso` não é exposto por nenhum getter/computed público — só `listagem()`.
- `npm run build` compila sem erro de tipo (Observable vs signal bem tipados).
