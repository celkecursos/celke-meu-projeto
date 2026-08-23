# USR-007 — `usuario-lista.page` (página smart)

**Spec:** `.sdd/specs/usuarios.spec.md` — atende **RF-02, RF-03, RF-04, RF-07,
RF-08, RF-21, RF-31, RF-33** (edge cases 12, 13, 14, 15, 20, 25, 26).

**Nível:** Sênior — primeira página do projeto a sincronizar estado de listagem
(busca/filtro/página) com a URL via `withComponentInputBinding` (o
mecanismo já habilitado em `app.config.ts` para `id`/`modo` de formulário). O padrão
de sincronização definido aqui é o que as próximas listagens do projeto vão copiar.

**Depende de:** USR-003 (facade), USR-005 (`usuario-tabela`), USR-006
(`usuario-filtros`).

## Arquivos a criar

- `src/app/modules/usuarios/pages/usuario-lista/usuario-lista.page.ts`
- `src/app/modules/usuarios/pages/usuario-lista/usuario-lista.page.html`

## Padrão a seguir

`.ai/rules/architecture.md`: página smart injeta a facade, orquestra, navega;
`.page.ts` + `.page.html` sempre separados. "Nos dois [modal e página], a URL é a
fonte da verdade... a página lê da rota (`componentInputBinding`)" — mesma técnica,
aplicada aqui aos parâmetros de **query**, não de path.

`.ai/rules/ui-guidelines.md`, seção "Anatomia de página": a forma de **listagem**
que este template segue — cabeçalho fora do cartão, filtros e tabela DENTRO do
mesmo cartão. Nenhuma listagem futura do projeto deveria inventar arranjo novo.

## Contrato — inputs vindos da URL (query params)

Classe `UsuarioListaPage`, seletor `app-usuario-lista`. Declare, ligados por
`withComponentInputBinding` (já ativo em `app.config.ts`) aos **query params** de
mesmo nome:

- `busca = input<string | undefined>('')`
- `situacao = input<TSituacaoUsuario | '' | undefined>('')`
- `ordenacaoCampo = input<string>('dataCadastro')` e
  `ordenacaoDirecao = input<TDirecao>('desc')` — a ordem de RF-06. **Não há UI para
  trocá-la** (o cabeçalho da tabela não é clicável); os params existem para o
  resultado continuar endereçável (RF-08).
- `pagina = input<string | undefined>('1')`.

> **A armadilha desta task: param ausente chega como `undefined`.** Quando o query
> param não está na URL — o caso do **primeiro acesso a `/usuarios`** — o binding
> entrega `undefined` e **sobrepõe o valor padrão do `input`**. O default nunca
> chega a valer. Consumir o signal cru quebra em três lugares distintos, todos
> visíveis já no primeiro carregamento:
>
> - `Number(undefined)` é `NaN`, contamina a consulta e a paginação exibe
>   **"NaN–NaN de N"**;
> - `[value]="busca()"` faz o campo de busca exibir o texto **"undefined"**;
> - `busca() === ''` é `false` para `undefined`, então o estado vazio mostra "nenhum
>   resultado para os critérios atuais" mesmo sem critério algum.
>
> Portanto: **declare cada input admitindo `undefined` e leia-os só por derivados
> saneados** (`?? ''` para texto; para a página, um método que trate ausente,
> não-numérico, zero, negativo e decimal como **1**). Nenhum ponto da classe ou do
> template usa o signal cru — nem para comparar, nem para repassar a componente
> filho.

## Contrato — sincronização inicial (uma vez)

Em `ngOnInit`, restaure o estado da facade a partir dos inputs acima, **nesta
ordem** (a ordem importa: `filtrar`/`ordenar` resetam a página para `1` como efeito
colateral do RF-07 — `paginar` precisa vir por último para a página da URL
prevalecer):

1. `facade.filtrar({ busca: <busca saneada>, situacao: <situação saneada> })`.
2. `facade.ordenar(this.ordenacaoCampo(), this.ordenacaoDirecao())` — usando o
   parâmetro `direcaoForcada` da facade (USR-003) para aplicar exatamente
   campo+sentido, sem alternância.
3. `facade.paginar(<a página saneada>)` — nunca `Number(this.pagina())` cru.

## Contrato — interações do operador (URL como saída, facade como espelho)

Cada interação abaixo faz **duas coisas**: chama o comando de facade correspondente
(feedback imediato) **e** navega atualizando os query params (`Router.navigate([],
{ relativeTo: route, queryParams: {...}, queryParamsHandling: 'merge' })`) — é a
navegação que garante RF-08 (deep-link/recarregável) e o edge case 25 (refresh
reconstrói a mesma tela).

- **`(buscar)` de `<app-usuario-filtros>`** (termo: string) → `facade.filtrar({
  busca: termo, situacao: <situação saneada> })`; navega com `busca: termo || null,
  pagina: null` (RF-07: busca nova volta à página 1 — remover o param equivale a 1).
- **`(filtrarSituacao)` de `<app-usuario-filtros>`** → mesmo padrão, trocando
  `situacao`.
- **`(limpar)` de `<app-usuario-filtros>`** → `facade.limparCriterios()`; navega com
  `busca: null, situacao: null, pagina: null`.
- **`(pagina)` de `<app-paginacao>`** (número) → `facade.paginar(numero)`; navega só
  com `pagina: numero`, preservando o resto via `merge`.

As três ações de linha de `<app-usuario-tabela>` (USR-005) **não** mexem em query
param — elas navegam ou alteram dado:

- **`(visualizar)`** → navega para `/usuarios/visualizar/{id}` (mesmo destino do
  clique na linha).
- **`(editar)`** → navega para `/usuarios/editar/{id}`.
- **`(alternarSituacao)`** → **confirme antes** (Fluxo E, RF-26), com mensagem que
  identifica o usuário e explica o efeito; só então chame
  `facade.alterarSituacao(id, <situação oposta à atual>)`. No sucesso, recarregue a
  relação e mostre a confirmação; na falha, mostre um aviso de erro dispensável e
  **não** altere a relação. Não existe exclusão de usuário (RF-24): inativar é a
  única forma de tirar alguém de circulação, e é reversível.

## Contrato — estrutura visual da tela

Cabeçalho **fora** do cartão: `<h1>Usuários</h1>` mais uma linha de contagem viva
logo abaixo — "12 usuários cadastrados" (sem critério ativo) ou "3 usuários
encontrados" (com busca/filtro ativo) — e a ação principal da tela, "Novo usuário",
sólida, com ícone, alinhada à direita do título.

Um único `<section>` funciona como cartão e contém, nesta ordem, cada bloco
separado do seguinte por borda (`border-b`/`border-t`):

1. `<app-usuario-filtros>`, num `div` com `p-4`.
2. O **resultado** — ver "Contrato — o resultado" abaixo.
3. Rodapé: `<app-paginacao>` (quando há itens) ou o botão "Tentar novamente"
   (quando `erro` está preenchido) — nunca os dois ao mesmo tempo.

Ao ligar `<app-usuario-filtros [busca]="…" [situacao]="…">`, passe os **valores
saneados** — nunca os signals crus dos query params.

## Contrato — o resultado (RF-31)

Leia `facade.listagem()` e decida o que ocupa o bloco 2 do cartão:

- **`total === 0` e SEM filtro/busca ativos** (busca saneada `=== ''` e situação
  saneada `=== ''`) → **não** renderize `<app-usuario-tabela>`; renderize um bloco
  vazio centralizado (ícone + texto + saída): "Nenhum usuário cadastrado ainda" com
  um botão/link para `/usuarios/novo` (edge case 13).
- **`total === 0` e COM filtro/busca ativos** (busca saneada `!== ''` ou situação
  saneada `!== ''`) → bloco vazio distinto: "Nenhum usuário encontrado" com um
  botão que dispara o mesmo fluxo de `(limpar)` do item anterior (edge case 12).
- **Qualquer outro caso** (carregando, com erro, ou com itens) → **UMA ÚNICA**
  instância de `<app-usuario-tabela [listagem]="facade.listagem()"
  (selecionar)="..." (visualizar)="..." (editar)="..." (alternarSituacao)="..." />`.
  Ela já deriva os estados de esqueleto/erro/itens da própria `listagem` — **não**
  renderize a tabela de novo para cada estado: são `output()` repetidos em cada
  cópia, e esquecer um deles quebra a tela só naquele estado específico, que é
  justamente o que ninguém testa à mão.

`(selecionar)` de `<app-usuario-tabela>` navega para `/usuarios/visualizar/{{id}}`
(navegação absoluta). Com `erro` preenchido, o rodapé do cartão mostra "Tentar
novamente" chamando `facade.recarregar()` em vez da paginação.

## Contrato — mensagem de sucesso (RF-21)

Ao montar (`ngOnInit` ou `constructor`), leia `history.state?.['mensagemSucesso']`
(string opcional, ver USR-008 — é o formulário quem escreve esse `state` antes de
navegar de volta). Se presente, guarde num signal local e exiba um banner
dispensável (`role="status"`) acima da listagem. Não é preciso limpar o `history.state`
manualmente — ele não sobrevive a um recarregamento de página, o que é o
comportamento esperado para um feedback pontual.

## Contrato — "novo usuário"

Um botão/link `routerLink="/usuarios/novo"`, visível independente do estado da
listagem (inclusive nos blocos de vazio, onde ele é o CTA principal).

## Critérios de aceite

- Recarregar a página com `?busca=maria&situacao=ativo&pagina=2` reconstrói
  exatamente esse resultado (RF-08, edge case 25).
- **Abrir `/usuarios` sem nenhum query param** (o primeiro acesso) mostra a primeira
  página e o resumo correto — `1–10 de N`, **nunca `NaN–NaN de N`** —, o campo de
  busca **vazio** (nunca com o texto "undefined") e, se o cadastro estiver vazio, a
  mensagem de "nenhum usuário cadastrado", não a de "nenhum resultado para os
  critérios".
- Mudar a última página estando nela e o filtro reduzir o total → a página volta a 1
  (RF-07) via `filtrar`; entrar direto numa URL com `pagina` além do total → a facade
  (USR-003) corrige para a última válida (edge case 15), refletido aqui sem código
  extra.
- Acionar "Editar" numa linha abre a edição daquele registro e **não** dispara também
  a navegação de visualização da linha.
- Alternar a situação pede confirmação, e cancelar não altera nada.
- As três mensagens de estado vazio/erro/carregando são visualmente distintas entre
  si e do estado "cadastro vazio" vs "busca sem resultado".
- Filtros, tabela e paginação vivem dentro do **mesmo** `<section>`; a tabela
  aparece como **uma única** instância no template (não uma por estado).
- A contagem abaixo do título reflete o total corrente ("N usuários cadastrados" ou
  "N usuários encontrados", conforme haja critério ativo).
- `npm run check` verde.
