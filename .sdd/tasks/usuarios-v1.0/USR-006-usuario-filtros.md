# USR-006 — `usuario-filtros` (componente dumb)

**Spec:** `.sdd/specs/usuarios.spec.md` — atende **RF-03, RF-04, RF-31** (o "caminho
para limpar critérios") e o edge case 26 (abrir a listagem sem critério no endereço).

**Nível:** Pleno — componente dumb padrão, sem componente compartilhado novo (usa
`<select>` nativo, já que não existe componente de select documentado em
`ui-guidelines.md` — não invente um; ver nota abaixo).

**Depende de:** USR-001 (tipo `TSituacaoUsuario`).

## Arquivos a criar

- `src/app/modules/usuarios/components/usuario-filtros/usuario-filtros.ts`
- `src/app/modules/usuarios/components/usuario-filtros/usuario-filtros.html`

## Padrão a seguir

`.ai/rules/architecture.md`, seção `components/`: dumb, `input()`/`output()`, zero
regra de domínio. `.ai/rules/ui-guidelines.md`: Tailwind por token (nada de valor
arbitrário), par claro/escuro em toda superfície, e **altura de campo e botão pela
classe `.controle`** — nunca uma altura cravada no template.

**Nota sobre o campo de situação:** `ui-guidelines.md` não documenta um componente de
`<select>` compartilhado (só `<app-tabela>`, `<app-paginacao>`, `<app-campo-texto>` —
este último é para `text`/`number`/`email`/`password`, não serve para select). Use
um `<select>` nativo estilizado com as mesmas classes de token/contraste dos outros
campos (borda, fundo, foco visível, par claro/escuro) — **não** crie nem documente um
novo componente compartilhado só para este filtro; é escopo desnecessário para esta
entrega.

## Contrato

Classe `UsuarioFiltros`, seletor `app-usuario-filtros`.

- `busca = input<string | undefined>('')` — valor corrente do campo de busca (a
  página é quem decide a fonte — ver USR-007).
- `situacao = input<TSituacaoUsuario | '' | undefined>('')` — valor corrente do
  filtro (`''` = todos).

> **Os dois inputs admitem `undefined` e precisam ser normalizados** antes de chegar
> ao template. A página deriva esses valores de query params, e um param ausente
> chega como `undefined` — ligar o signal cru a `[value]` faz o `<input>` **exibir o
> texto "undefined"** na tela. Exponha derivados normalizados (`?? ''`) e ligue o
> template neles; o componente não deve depender de quem o chama ter saneado antes.
- `buscar = output<string>()` — emite o termo a cada mudança do campo de busca
  (debatido pelo componente ou não — livre ao implementador; não é requisito de
  domínio).
- `filtrarSituacao = output<TSituacaoUsuario | ''>()` — emite ao trocar o `<select>`.
- `limpar = output<void>()` — emite ao clicar em "Limpar filtros" (RF-31). Esse botão
  fica **desabilitado** quando a busca está vazia e a situação é `''` (nada para
  limpar) — compare os valores **normalizados**, não os signals crus: `undefined`
  não é igual a `''` e o botão apareceria habilitado sem nada a limpar.

Template: um campo de busca (`<input type="search">`, rótulo "Buscar por nome ou
e-mail"), um `<select>` com três opções — "Todos" (`value=''`), "Ativos"
(`value='ativo'`), "Inativos" (`value='inativo'`) — e o botão "Limpar filtros". Sem
`formGroup`/Reactive Forms aqui: são inputs/outputs simples de filtro, não um
formulário de cadastro.

Três detalhes de acabamento que fazem a barra parecer terminada:

- **A seta do `<select>` precisa ser desenhada à mão** (`.ai/rules/ui-guidelines.md`,
  seção "`<select>` — a seta nativa não respeita padding"). A seta que o navegador
  desenha fica colada na borda direita e **ignora o `padding-right`** — aumentar o
  padding sozinho NÃO resolve, por mais folga que você dê. A técnica correta:
  `appearance-none` no `<select>` (desliga a seta nativa) + um `<svg>` próprio
  posicionado em `absolute right-3 top-1/2 -translate-y-1/2` com
  `pointer-events-none` (para o clique atravessar até o `<select>`) e
  `aria-hidden="true"` (é decoração; quem anuncia o controle é o `<label>`). O
  `<select>` precisa então de `pr-10` para o texto não ficar sob a seta desenhada, e
  do wrapper `<div class="relative">` envolvendo os dois.
- O `<select>` e o botão "Limpar filtros" levam **`cursor-pointer`**: sem ele o
  ponteiro fica de seta e o controle não se anuncia como clicável (a paginação já
  usa mão nos seus botões — a barra de filtros deve casar).
- O botão mantém `disabled:cursor-not-allowed` para o estado sem nada a limpar.

## Critérios de aceite

- Nenhum valor arbitrário Tailwind; par claro/escuro em toda superfície com cor;
  campos e botão usando `.controle` (nenhuma altura cravada no template).
- **Passar `undefined` em `busca`/`situacao` deixa o campo VAZIO** — nunca com o
  texto "undefined" — e mantém "Limpar filtros" desabilitado.
- O `<select>` usa `appearance-none` + `<svg>` próprio (não a seta nativa do
  navegador); `<select>` e botão mostram cursor de mão.
- Zero lógica de domínio — o componente não decide o que "todos" significa para a
  consulta, só repassa `''` como o valor do `<select>`.
- `npm run check` verde.
