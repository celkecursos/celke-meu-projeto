# USR-008 — `usuario-form.page` (página smart — cadastro e edição)

**Spec:** `.sdd/specs/usuarios.spec.md` — atende **RF-10, RF-11, RF-12, RF-13,
RF-14, RF-15, RF-16, RF-17, RF-18, RF-19, RF-20, RF-21, RF-32**.

**Nível:** Pleno — Reactive Forms padrão sobre `<app-campo-texto>` (API já
documentada) e a facade já pronta (USR-003). **Decisão explícita desta task:
cadastro e edição compartilham a mesma página** (`usuario-form.page`), distinguidos
pela presença do parâmetro `id` da rota — não crie duas páginas separadas.

**Depende de:** USR-001, USR-003.

## Arquivos a criar

- `src/app/modules/usuarios/pages/usuario-form/usuario-form.page.ts`
- `src/app/modules/usuarios/pages/usuario-form/usuario-form.page.html`

## Padrão a seguir

`.ai/rules/ui-guidelines.md`: `<app-campo-texto>` — `[formGroup]` no `<form>` +
`formControlName`; `Validators.required` acende asterisco e mensagem; o campo lê o
próprio `NgControl` (não reencaminhe erro manualmente pelo template). `.ai/rules/
architecture.md`: "form de PÁGINA = rota IRMÃ... a página lê `id`/`modo` da rota
(`componentInputBinding`; `data.modo`)". `.ai/rules/ui-guidelines.md`, seção
"Anatomia de página": a forma de **formulário** que este template segue.

## Contrato — estrutura visual

**Mesma largura da listagem** — nenhum `max-w-*`/`mx-auto` próprio na página; ela
herda a coluna do `<main>` (definida em `estrutura.layout.html`). Um formulário mais
estreito que a lista faz o sistema parecer inconsistente ao navegar entre as telas.

No topo, uma trilha de volta ("← Usuários", `routerLink="/usuarios"`) acima do
`<h1>{{ titulo() }}</h1>` — o operador sai da tela sem depender só do "Cancelar" do
rodapé.

O `<form>` é um cartão único (`rounded-lg border`), dividido por `border-t` em:

1. **`<fieldset>` de identificação** (`legend` `sr-only`), em **grid de 2 colunas**
   a partir de `sm` (`grid grid-cols-1 sm:grid-cols-2 gap-5`): `nomeCompleto` ocupa
   a linha inteira (`sm:col-span-2` no wrapper do campo, é o mais lido); `email` e
   `apelido` dividem a linha seguinte. Abaixo de `sm`, tudo empilha em 1 coluna.
2. **`<fieldset>` de situação** (`legend` `sr-only`), mesma grid: o `<select>` ao
   lado da data de cadastro quando ela existe (`modo() === 'editar'`), em vez de
   sozinho ocupando a largura toda. Acrescente uma dica abaixo do `<select>`
   explicando a consequência: "Inativo permanece no histórico, mas sai de
   circulação."
3. **Rodapé de ações** com fundo próprio (`bg-slate-50`/`dark:bg-slate-800`) e
   borda superior, botões alinhados à direita (`justify-end`): "Cancelar" (contorno)
   e "Salvar" (sólido, texto vira "Salvando…" enquanto `salvando()` é `true`).

Enquanto `carregando()` é `true` (RF: buscar o registro para editar), mostre um
**esqueleto com a silhueta do formulário** (blocos pulsantes na mesma grid) — não um
"Carregando…" solto, que faz o layout saltar quando os campos reais aparecem.

## Contrato — inputs da rota

Classe `UsuarioFormPage`, seletor `app-usuario-form`.

- `id = input<string>()` — vem do path param `:id` (ausente na rota `novo`, presente
  em `editar/:id`).
- `modo = input.required<'criar' | 'editar'>()` — vem de `route.data.modo` (definido
  em USR-010). Declare o tipo `TModoFormulario = 'criar' | 'editar'` localmente
  neste arquivo (é o único arquivo que o usa).

## Contrato — formulário (Reactive Forms)

Um `FormGroup` com:

- `nomeCompleto` — `Validators.required`.
- `email` — `Validators.required`, `Validators.email` (cobre RF-12 via o próprio
  `<app-campo-texto>`, que já reconhece `erros['email']`).
- `apelido` — sem validador (opcional, RF-11).
- `situacao` — `Validators.required`; valor inicial `'ativo'` quando `modo() ===
  'criar'` (RF-16).

Campos `nomeCompleto`, `email`, `apelido` usam `<app-campo-texto formControlName="..."
rotulo="..." tipo="text|email|text">`. `situacao` usa um `<select
formControlName="situacao">` nativo (não existe componente de select documentado —
mesma decisão de USR-006, não invente um), com as opções "Ativo"/"Inativo", seguindo
a técnica de seta própria da USR-006 (`.ai/rules/ui-guidelines.md`, seção "`<select>`
— a seta nativa não respeita padding").

A **data de cadastro nunca é um `FormControl`** (RF-15): quando `modo() ===
'editar'`, exiba-a como texto informativo (não editável) a partir do usuário
carregado, fora do `formGroup`.

## Contrato — carregar para edição

Em `modo() === 'editar'`, no `ngOnInit`, chame `facade.obter(this.id()!)`. Sucesso →
preencha o `FormGroup` com os valores recebidos (`patchValue`) e guarde o usuário
carregado (para exibir a data de cadastro e, no `submit`, saber que é uma edição).
Erro (usuário não encontrado, ou id malformado) → **não** renderize o formulário;
renderize um bloco "Usuário não encontrado." com link para `/usuarios` (Fluxo C/D,
desvio — nunca tela em branco).

## Contrato — submissão

No `submit`, monte um `IUsuarioForm` a partir do `FormGroup.value` e chame:

- `modo() === 'criar'` → `facade.cadastrar(dados)`.
- `modo() === 'editar'` → `facade.editar(this.id()!, dados)`.

**Sucesso** → `Router.navigate(['/usuarios'], { state: { mensagemSucesso: modo() ===
'criar' ? 'Usuário cadastrado com sucesso.' : 'Usuário atualizado com sucesso.' } })`
(RF-21; a listagem lê esse `state`, ver USR-007).

**Falha** (`IUsuarioRecusa` de `usuario-api.service` ou erro de indisponibilidade):

- **Não** reseta nem limpa o formulário — os dados digitados permanecem (RF-32; o
  Reactive Forms já preserva por padrão, só não chame `reset()`).
- Se a falha for `IUsuarioRecusa` (`{ campo, motivo }`): exiba `motivo` como um
  banner de erro (`role="alert"`) próximo ao campo indicado, mencionando o nome do
  campo por extenso (ex.: "E-mail: {{ motivo }}"). **Não** tente usar
  `control.setErrors(...)` para isso — `<app-campo-texto>` só reconhece as chaves de
  erro do Angular (`required`, `email`, `minlength`, `maxlength`, `min`, `max`) e
  cairia num genérico "Valor inválido." que não identifica o motivo (RF-13/RF-14
  exigem mensagem clara apontando e-mail/apelido como motivo) — por isso o motivo é
  um bloco de texto da própria página, não um erro de `NgControl`.
- Se a falha for indisponibilidade (sem `campo`/`motivo` reconhecível): banner
  genérico de erro ao salvar, convidando a tentar de novo.

## Contrato — abandono (RF-20)

Um link/botão "Cancelar" com `routerLink="/usuarios"`, sem chamar nenhum método de
salvar — nenhuma alteração é registrada.

## Critérios de aceite

- Cadastro com nome/e-mail vazios não submete (mensagens do próprio
  `<app-campo-texto>`).
- E-mail com formato inválido é recusado com "Informe um e-mail válido." antes mesmo
  de chegar ao `facade.cadastrar`.
- E-mail/apelido duplicado (incluindo variação de caixa e espaços, e mesmo contra um
  usuário inativo) é recusado com mensagem que nomeia o campo — dados digitados
  continuam no formulário.
- Editar um usuário sem mudar e-mail/apelido salva normalmente (RF-18 via
  `idAtual`).
- Data de cadastro nunca aparece como campo editável, só como texto na edição.
- A página **não** define `max-w-*`/`mx-auto` próprio — a largura é herdada do
  `<main>`, igual à listagem.
- Nome completo ocupa a linha inteira da grid; e-mail e apelido dividem a linha
  seguinte a partir de `sm`; abaixo de `sm`, tudo empilha em 1 coluna.
- `npm run check` verde.
