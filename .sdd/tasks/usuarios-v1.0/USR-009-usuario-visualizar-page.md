# USR-009 — `usuario-visualizar.page` (página smart, somente leitura)

**Spec:** `.sdd/specs/usuarios.spec.md` — atende **RF-22, RF-23, RF-24, RF-25,
RF-26, RF-30**.

**Nível:** Pleno — página de leitura + uma ação de escrita já modelada pela facade
(USR-003); confirmação via diálogo nativo do browser (ver nota abaixo).

**Depende de:** USR-001, USR-003.

## Arquivos a criar

- `src/app/modules/usuarios/pages/usuario-visualizar/usuario-visualizar.page.ts`
- `src/app/modules/usuarios/pages/usuario-visualizar/usuario-visualizar.page.html`

## Contrato — estrutura visual

Mesma anatomia de `usuario-form.page` (USR-008), `.ai/rules/ui-guidelines.md`,
seção "Anatomia de página" — visualizar e editar são telas irmãs, o operador não
deveria sentir que mudou de sistema ao ir de uma para outra:

- **Mesma largura da listagem** — sem `max-w-*`/`mx-auto` próprio; herda a coluna
  do `<main>`.
- Trilha de volta ("← Usuários", `routerLink="/usuarios"`) acima do `<h1>`, mas
  aqui o `<h1>` é o **nome completo do usuário** (não um título fixo como
  "Visualizar usuário") — é o dado mais relevante da tela, e repeti-lo como título
  reforça qual registro está sendo mostrado.
- Um cartão único (`rounded-lg border`): os dados em `<dl>` numa **grid de 2
  colunas** a partir de `sm` (`grid grid-cols-1 sm:grid-cols-2 gap-5`, mesma grid
  do formulário — cada par `<dt>`/`<dd>` ocupa uma célula), e um **rodapé de
  ações** com fundo próprio e borda superior (`bg-slate-50`/`dark:bg-slate-800`),
  botões à direita.
- **Não existe link "Voltar à listagem" separado no corpo da tela** — a trilha do
  topo já cobre essa saída; duplicá-la no rodapé é redundante.
- Enquanto `carregando()`, mostre o **esqueleto com a silhueta da tela** (blocos
  pulsantes na mesma grid de 2 colunas) — não um "Carregando…" solto.

## Nota sobre a confirmação (RF-26)

`ui-guidelines.md` não documenta nenhum componente de diálogo/modal em
`shared/components/`. Não invente um só para isto: use o diálogo nativo do browser
(`window.confirm`) para a confirmação explícita — ele já atende teclado e foco por
ser nativo, e cobre o requisito sem ampliar o escopo desta entrega para "criar e
documentar um componente de modal compartilhado".

## Contrato — input da rota

Classe `UsuarioVisualizarPage`, seletor `app-usuario-visualizar`.

- `id = input.required<string>()` — vem do path param `:id` (rota sempre tem `id`
  aqui, diferente do formulário).

## Contrato — carregamento

Em `ngOnInit`, chame `facade.obter(this.id())`. Sucesso → guarde o `IUsuario` num
signal local. Erro (não encontrado / id malformado) → **não** renderize os dados;
renderize "Usuário não encontrado." com link para `/usuarios` (mesmo padrão do
Fluxo C/D, igual USR-008).

## Contrato — conteúdo exibido (somente leitura)

Nome completo, e-mail, apelido (ou indicação de "sem apelido" quando vazio), **nome
de exibição** — calculado com `nomeExibicao(usuario)` de `usuario.models.ts`, nunca
recomputado à mão (RF-29/RF-30) —, situação (rótulo por extenso "Ativo"/"Inativo") e
data de cadastro formatada. Nenhum campo é editável nesta tela.

## Contrato — navegação

- A trilha de volta no topo da tela (estrutura visual, acima) É o caminho de
  voltar — cobre RF-23.
- Link "Editar" → `/usuarios/editar/{{ id() }}`, no rodapé de ações, na cor de
  ação `atencao` (`.ai/rules/ui-guidelines.md`, seção "Cor por tipo de ação"):
  contorno com borda `atencao-400` e texto `atencao-700` — mesma cor usada no
  botão "Editar" da coluna de ações da tabela (USR-005), para a ação ter uma
  identidade visual só no sistema, independente da tela em que aparece.

## Contrato — inativar/reativar (RF-24, RF-25, RF-26)

Um botão no rodapé de ações, cujo rótulo E cor dependem da `situacao` atual do
usuário carregado — mesma convenção da coluna de ações da tabela (USR-005): "Inativar"
(contorno `perigo`) quando `ativo`, "Reativar" (contorno `marca`) quando `inativo`.
Ao clicar:

1. Monte a mensagem de confirmação identificando o usuário pelo **nome completo e
   e-mail** e explicando o efeito: inativar → "não poderá ser inscrito em
   campeonato novo, mas permanece no histórico"; reativar → "volta a poder ser
   inscrito em campeonato novo".
2. Chame `window.confirm(mensagem)`. Cancelado (`false`) → nada acontece, nenhuma
   chamada à facade.
3. Confirmado (`true`) → chame `facade.alterarSituacao(id(), novaSituacao)` (a
   situação oposta à atual). Sucesso → atualize o signal local do usuário com o
   retorno (o rótulo do botão e da situação exibida mudam imediatamente). Falha →
   **mantenha** a situação exibida como estava antes (não otimista) e mostre um
   banner de erro avisando que a mudança não ocorreu.

Repetir a ação sobre um usuário que já está no estado alvo (ex.: inativar um já
inativo) não é um caso de erro — a facade/api-service já tratam isso como
idempotente (USR-002); esta página não precisa de nenhuma guarda extra para isso.

## Critérios de aceite

- Nome de exibição na tela é sempre o resultado de `nomeExibicao(usuario)` — nunca
  duplicado manualmente (ex.: nunca `usuario.apelido || usuario.nomeCompleto.split(' ')[0]`
  escrito de novo aqui).
- Cancelar a confirmação não altera nada, nem local nem via facade.
- Falha ao efetivar a mudança de situação não altera o que a tela mostra.
- A página **não** define `max-w-*`/`mx-auto` próprio — a largura é herdada do
  `<main>`, igual à listagem e ao formulário.
- O `<h1>` mostra o nome completo do usuário carregado, não um título fixo.
- O botão de situação alterna cor (`perigo`/`marca`) junto com o rótulo, conforme
  a `situacao` atual.
- `npm run check` verde.
