# AUTH-002 — `auth.facade.ts` (estado da sessão)

**Spec:** `.sdd/specs/autenticacao.spec.md` — atende **RF-02, RF-03, RF-05, RF-06,
RF-07, RF-08, RF-12** (edge cases 7 e 8).

**Nível:** Sênior — é o **singleton de sessão do app inteiro**: define o contrato que
o guard, o layout institucional e a tela de acesso consomem, escolhe a forma do
estado (signal) e a estratégia de persistência. Errar a forma aqui propaga para toda
tela protegida, presente e futura. Decisão transversal, não execução de padrão
existente.

**Depende de:** AUTH-001.

## Arquivos a criar

- `src/app/core/auth/auth.facade.ts`

## Padrão a seguir

`.ai/rules/architecture.md`, seção `data/<x>.facade.ts`: estado exposto por signal
readonly, a facade **consome** as regras puras de `<x>.models.ts` e não as
reimplementa. `@Injectable({ providedIn: 'root' })` — a sessão é uma só no app
inteiro.

Sem `resource()` e sem `HttpClient` nesta task: não existe backend de autenticação
nesta entrega (seção 1 da spec — verificação contra base real está fora de escopo),
então a operação de acesso é **síncrona**. Introduzir assincronismo aqui inventaria
uma etapa intermediária que RF-05 proíbe.

## Contrato — estado exposto

- **`sessao`** — signal readonly (via `computed`) com a `ISessao` vigente ou `null`
  quando não há sessão. É o que o layout lê para identificar o operador (RF-12) e o
  que a operação "Consultar sessão vigente" (seção 6 da spec) devolve.
- **`autenticado`** — signal readonly derivado: `true` quando existe sessão. É o que
  o guard consulta (AUTH-003) — o guard não deve precisar saber a forma de `ISessao`
  para decidir se libera a rota.
- O signal de escrita fica **privado** (campo privado da classe). Quem consome a
  facade lê; só a própria facade escreve.

## Contrato — persistência (RF-06)

- A sessão é gravada em `localStorage` sob uma chave própria do app (constante
  privada do arquivo, com prefixo do projeto para não colidir com outra aplicação no
  mesmo domínio).
- O signal é **inicializado lendo o que estiver persistido** — é isso, e só isso, que
  faz a sessão sobreviver a um recarregamento (RF-06, edge case 7). Sem essa leitura
  na inicialização, todo F5 devolveria o operador à tela de acesso.
- Toda leitura e escrita de `localStorage` é protegida contra falha: em modo privado
  restrito, com quota estourada, ou com conteúdo corrompido, a facade trata como
  "sem sessão" em vez de quebrar o boot do app. Uma falha ao **gravar** não invalida
  a sessão em memória — o operador continua logado naquela aba.

## Contrato — `entrar(email, senha)`

- Delega a validação a `credencialValida()` de `auth.models.ts` (AUTH-001) — **não
  compare credencial aqui dentro**, nem normalize e-mail aqui: essa regra tem uma
  fonte única.
- Em recusa: devolve a mensagem **única e genérica** de credenciais incorretas
  (RF-03), sem nenhum ramo que distinga qual dos dois campos errou. Não abra exceção
  "só para facilitar o teste" — a postura vale mesmo com a credencial pública
  (premissa 6 da spec).
- Em sucesso: monta a `ISessao` a partir de `CREDENCIAL_DEMO` mais um nome de
  exibição, grava no signal e persiste, **na mesma chamada** — sem etapa
  intermediária, sem estado "pendente" (RF-05; a máquina de estados da seção 5 tem
  exatamente dois estados).
- **Formato de retorno:** um objeto **plano** com um booleano de sucesso e um campo
  de recusa que é sempre `ILoginRecusa | null` (nunca opcional, nunca união
  discriminada inline do tipo `{ sucesso: true } | { sucesso: false; recusa: X }`).
  O esbuild do `@angular/build` não estreita de forma confiável uniões inline
  retornadas de método de classe — dá `TS2339` falso no build mesmo com o `tsc` puro
  validando o mesmo código sem erro. O formato plano evita a categoria inteira do
  problema. Declare esse tipo de retorno **neste arquivo**: é o formato de saída de
  uma operação de facade, não uma regra de domínio (por isso não vai em
  `auth.models.ts`).

## Contrato — `sair()`

- Limpa o signal e remove a sessão persistida (RF-07). Não pede confirmação e não
  pode falhar do ponto de vista de quem chama — se o storage recusar a remoção, o
  estado em memória já mudou e o operador já está sem sessão.
- **Não navega.** Redirecionar é responsabilidade de quem aciona (o layout, em
  AUTH-005): uma facade em `core/` que injeta `Router` e navega por conta própria
  amarra a regra de sessão a uma rota específica.

## Critérios de aceite

- `sessao` e `autenticado` são readonly para quem consome — não existe forma de um
  componente setar sessão direto.
- Uma tentativa com a credencial aceita concede sessão de forma síncrona e persiste
  (RF-05, RF-06); recarregar a página mantém o operador logado (edge case 7).
- Uma tentativa recusada devolve sempre a mesma mensagem, qualquer que seja o campo
  errado (RF-03) — não há mais de uma string de recusa no arquivo.
- `sair()` zera sessão em memória e persistida; depois dela, `autenticado` é `false`
  (RF-08).
- A facade não reimplementa a comparação de credencial nem a normalização do e-mail —
  a única fonte é `credencialValida()` de AUTH-001.
- A facade não injeta `Router`.
- `npm run test:ci` e `npm run build` verdes.
