# USR-001 — `usuario.models.ts` (+ teste)

**Spec:** `.sdd/specs/usuarios.spec.md` — atende **RF-11, RF-13, RF-14, RF-18, RF-28,
RF-29, RF-30** (e é a base de dados de domínio para todas as demais).

**Nível:** Sênior — este é o **primeiro modelo de domínio do projeto**: fixa nomes,
formas e regras puras que todas as tasks seguintes (e os módulos futuros que
consumirem usuários, ex. campeonato) vão importar. Divergir aqui propaga erro para
o resto do módulo.

**Depende de:** (nenhuma)

## Arquivos a criar/modificar

- `src/app/modules/usuarios/data/usuario.models.ts`
- `src/app/modules/usuarios/data/usuario.models.spec.ts`

## Padrão a seguir

`.ai/rules/architecture.md`, seção `data/<x>.models.ts`: interfaces `I<X>` e
`I<X>Filtros`, `<x>ParaRotulo()`, regras de domínio como **funções puras** (sem
`inject`, sem HTTP) — são elas que o teste cobre. Teste no estilo de
`core/data/consulta.spec.ts` (exemplar do projeto): um `describe` por função, nome do
caso descreve a regra em português, caso-limite explícito.

## Contrato — tipos de domínio

Os tipos abaixo são a única "exceção de código" permitida — o resto do contrato é em
prosa.

```ts
type TSituacaoUsuario = 'ativo' | 'inativo';

interface IUsuario {
  id: string;
  nomeCompleto: string;
  email: string;
  apelido: string;
  situacao: TSituacaoUsuario;
  dataCadastro: string; // ISO 8601, atribuída pelo sistema, imutável
}

interface IUsuarioFiltros {
  busca: string;               // '' = sem busca
  situacao: TSituacaoUsuario | ''; // '' = "todos" (mesma semântica de casaExato)
}

interface IUsuarioForm {
  nomeCompleto: string;
  email: string;
  apelido: string;
  situacao: TSituacaoUsuario;
}

interface IUsuarioRecusa {
  campo: 'nomeCompleto' | 'email' | 'apelido';
  motivo: string;
}
```

`IUsuarioFiltros.situacao` usa `''` para "todos" **de propósito**: é o mesmo
contrato que `casaExato` de `core/data/consulta.ts` já entende ("filtro `''`/`null`/
`undefined` casa com tudo") — não crie um terceiro valor tipo `'todos'`.

## Contrato — funções puras

- **`normalizarCampo(valor: string | null | undefined): string`** — despreza espaços
  nas extremidades; `null`/`undefined` viram `''`. É a normalização transversal da
  seção 6 da spec (nome completo, e-mail, apelido), reaproveitada por todas as
  funções abaixo.
- **`primeiroNome(nomeCompleto: string): string`** — normaliza e devolve o primeiro
  trecho não vazio separado por espaço. Nome com um único termo devolve o próprio
  termo (edge case 9); espaços múltiplos entre termos não geram trecho vazio (edge
  case 10).
- **`nomeExibicao(usuario: Pick<IUsuario, 'nomeCompleto' | 'apelido'>): string`** — o
  apelido normalizado, se não vazio após normalização; senão `primeiroNome`. Um
  apelido só de espaços conta como vazio (edge case 6) e cai no primeiro nome, assim
  como um apelido esvaziado na edição (edge case 11). **Esta função é a fonte única
  do RF-29** — nenhuma outra parte do código deriva nome de exibição por conta
  própria.
- **`usuarioParaRotulo(usuario: IUsuario): string`** — devolve `nomeExibicao(usuario)`.
  É a projeção que o RF-30 promete aos módulos consumidores (mesma função que
  `produtoParaRotulo` exemplifica na rule): quando o módulo de campeonato precisar
  rotular um usuário de forma abreviada, importa esta função, nunca reimplementa a
  regra.
- **`emailDisponivel(email: string, usuarios: readonly IUsuario[], idAtual?: string): boolean`**
  — normaliza `email` (trim + minúsculas) e compara contra o e-mail normalizado (trim
  + minúsculas) de cada item de `usuarios`, **ignorando o item cujo `id === idAtual`**
  (RF-18: a edição não conflita consigo mesma). Devolve `false` se algum outro usuário
  já tiver aquele e-mail — inclusive se esse outro estiver `inativo` (edge case 8: o
  e-mail continua ocupado por quem não foi excluído).
- **`apelidoDisponivel(apelido: string, usuarios: readonly IUsuario[], idAtual?: string): boolean`**
  — normaliza `apelido`; se o resultado for `''`, devolve `true` sempre (apelido vazio
  nunca colide — edge case 5, 6). Caso contrário, compara contra o apelido
  normalizado de cada item de `usuarios` cujo apelido normalizado também não seja
  `''`, ignorando `idAtual`, mesma lógica de `emailDisponivel`.

## Critérios de aceite

- `nomeExibicao` cobre: apelido preenchido vence; apelido vazio cai no primeiro nome;
  apelido só com espaços conta como vazio; nome com um único termo.
- `emailDisponivel`/`apelidoDisponivel` cobrem: duplicado idêntico; duplicado
  diferindo só na caixa; duplicado com espaços nas pontas; editar sem mudar o próprio
  valor não é conflito (`idAtual` exclui a si mesmo); e-mail ocupado por um usuário
  **inativo** ainda bloqueia; apelidos vazios nunca colidem entre si nem com um
  apelido preenchido igual ao primeiro nome de outro usuário.
- `npm run test:ci` verde para este arquivo.
- Nenhuma função aqui importa `HttpClient`, `inject` ou qualquer coisa do Angular —
  são funções puras, testáveis isoladas.
