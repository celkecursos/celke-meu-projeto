---
paths:
  - "src/**/*.html"
  - "src/**/*.ts"
  - "src/**/*.css"
  - "src/styles.css"
description: Padrão visual (Tailwind v4) e a API dos componentes compartilhados de shared/. Carrega ao tocar template/componente/estilo.
---

# UI — Tailwind v4 e os componentes compartilhados

Este projeto **não usa Design System de terceiros**. A UI é Tailwind v4 CSS-first
mais um punhado de componentes próprios em `src/app/shared/components/`.

> **Esta rule É a documentação desses componentes.** Não invente `input()`/`output()`
> que não estejam listados aqui — se faltar algo, abra o componente e leia, ou
> reporte. Prop inventada compila e falha em silêncio.

## Token, não valor

- **Cor, espaçamento e tipografia saem das escalas do Tailwind** (`text-slate-700`,
  `p-4`, `text-sm`) ou dos tokens declarados em `@theme` no `src/styles.css`.
- **Proibido valor arbitrário de cor/medida**: `text-[#ff0000]`, `p-[13px]`,
  `w-[437px]`. Se a escala não tem o valor de que você precisa, **o token novo entra
  no `@theme`** — não se crava no template.
- **Proibido hex/rgb solto em `.css`**. Cor nasce de `@theme` (`--color-*`).
- **Claro e escuro**: toda superfície com cor declara o par (`bg-white dark:bg-slate-900`).
  Nunca entregue tela que só existe no claro.

## Os componentes de `shared/components/`

### `<app-tabela>` — listagem server-driven

```ts
input.required<IListagem<T>>()  listagem   // o estado inteiro (itens/carregando/erro/total)
input.required<IColuna<T>[]>()  colunas    // { campo, rotulo, alinhamento?, formato? }
input<string>()                 rotuloAcoes // cabeçalho da coluna de ações (padrão 'Ações')
output<T>()                     selecionar
```

- Renderiza sozinha os estados **vazio / carregando / erro** a partir da `listagem` —
  não os reimplemente na página.
- As colunas são conteúdo de DOMÍNIO: quem as define é o wrapper do módulo
  (`<x>-tabela`), não a página.
- **O cabeçalho não é interativo**: a tabela exibe os rótulos, sem clique de
  ordenação. A ordem vem da consulta (a facade decide o padrão do módulo).
- **Coluna de ações (opcional)**: projete um `<ng-template #appTabelaAcoes let-item>`
  como conteúdo da tabela. Presente ⇒ nasce uma última coluna alinhada à direita, com
  o cabeçalho `rotuloAcoes`; ausente ⇒ nenhuma coluna extra (comportamento padrão).
  A célula já faz `stopPropagation`, então um botão de ação **não** dispara o
  `(selecionar)` da linha — mas os `output()` das ações são do wrapper de domínio,
  não desta tabela:

  ```html
  <app-tabela [listagem]="listagem()" [colunas]="colunas">
    <ng-template #appTabelaAcoes let-usuario>
      <button type="button" (click)="editar.emit(usuario)">Editar</button>
    </ng-template>
  </app-tabela>
  ```

### `<app-paginacao>`

```ts
input.required<IListagem<unknown>>()  listagem
output<number>()                      pagina
```

### `<app-campo-texto>` — campo de formulário

```ts
input.required<string>()  rotulo
input<string>()           tipo = 'text'      // text | number | email | password
input<string>()           dica
// usa formControlName — Reactive Forms
```

- **FORMULÁRIO = Reactive Forms**: `[formGroup]` no `<form>` + `formControlName` no
  campo. `Validators.required` acende o asterisco e a mensagem de erro.
- O campo lê o estado do próprio `NgControl` (inválido + tocado ⇒ mensagem). **Não
  re-encaminhe erro à mão** pelo template.
- **Nunca** misture `[(ngModel)]` com `formControlName` no mesmo campo.

## Angular — o que não se escreve mais

- Control flow **`@if` / `@for` / `@switch`** — nunca `*ngIf` / `*ngFor`.
  Todo `@for` tem `track`.
- Standalone é **implícito** (Angular 19+): não escreva `standalone: true`.
- Estado em **signals** (`signal`/`computed`/`resource`), `input()`/`output()`,
  `inject()` em vez de constructor injection.
- **Nunca `::ng-deep`.** Precisa estilizar filho? passe a classe por `input()`.

## Largura da página

O conteúdo vive numa **coluna de largura máxima centralizada** (`max-w-7xl`), e a
barra de navegação superior usa **a mesma coluna**: só a borda e o fundo do
cabeçalho atravessam a tela inteira. Sem isso, em monitor largo a marca e o menu
encostam nas bordas enquanto o conteúdo fica no meio — e a página parece desmontada.
O padding horizontal é o mesmo nos dois (`px-4`, `md:px-6`), senão o alinhamento
vertical não fecha.

## Anatomia de página

Duas formas se repetem em todo módulo — siga-as em vez de inventar arranjo novo:

**Listagem** — cabeçalho fora do cartão; filtros e resultado DENTRO do mesmo cartão:

```
<div class="flex flex-col gap-6">
  cabeçalho: <h1> + contagem ("12 usuários") + ação principal (sólido, com ícone)
  avisos dispensáveis (sucesso / erro)
  <section> cartão:
    filtros            ← p-4, separado por border-b
    tabela             ← UMA instância; ela deriva vazio/carregando/erro da listagem
    paginação          ← border-t
</div>
```

O estado **vazio** substitui a tabela por um bloco centralizado (ícone + frase +
saída), e o texto muda conforme haja critério ativo: "nenhum cadastrado ainda" com
convite a cadastrar, ou "nenhum encontrado" com botão de limpar critérios.

> **Renderize a tabela UMA vez.** Repeti-la em cada ramo do `@if` (um para
> carregando, outro para erro, outro para itens) multiplica a manutenção: cada
> `output()` novo precisa ser ligado em todas as cópias, e esquecer uma quebra a
> tela só naquele estado — que é justamente o que ninguém testa à mão.

**Formulário** — **mesma largura da listagem**, sem `max-w` próprio: a página
herda a coluna do `<main>` (`max-w-7xl`, definida em `estrutura.layout.html`). Um
formulário mais estreito que a lista faz o sistema parecer inconsistente ao navegar
entre as duas telas — **nunca** reintroduza `mx-auto max-w-*` numa página de módulo.

Campos agrupados em `<fieldset>` por assunto, em **grid de colunas** a partir de
`sm` — não uma coluna única empilhada, que desperdiça a largura disponível:

```
trilha de volta ("← Usuários") + <h1>
avisos de erro do salvamento
<form> cartão:
  <fieldset class="grid grid-cols-1 sm:grid-cols-2 gap-5">   ← identificação
    campo que merece a linha inteira → sm:col-span-2 no wrapper do campo
    os demais dividem as colunas naturalmente
  <fieldset> situação            ← border-t; dica explicando a consequência
  rodapé: Cancelar · Salvar      ← border-t, bg-slate-50, justify-end
```

Critério para decidir o que ocupa a linha inteira: o campo mais lido/mais longo
(nome completo, descrição) fica sozinho (`sm:col-span-2`); os demais (e-mail,
apelido, situação, datas) dividem a grid duas a duas. Em telas estreitas tudo
empilha em 1 coluna — a grid só entra a partir de `sm`.

O botão primário fica **à direita** no rodapé, e o texto reflete o progresso
(`Salvando…` enquanto salva). Enquanto o registro carrega, mostre **esqueleto com a
silhueta do formulário** — não um "Carregando…" solto, que faz o layout saltar
quando os campos aparecem.

## Cor por tipo de ação

Ação de linha e de rodapé seguem uma convenção fixa — a cor comunica a consequência,
e trocá-la de módulo para módulo faz o sistema parecer de autores diferentes:

| Ação | Papel | Token |
|---|---|---|
| Visualizar, Voltar, Cancelar | secundária, sem efeito colateral | `slate` |
| Salvar, Cadastrar, Confirmar | ação principal da tela | `marca` (sólido) |
| **Editar** | altera dado existente | **`atencao`** (âmbar) |
| Inativar, Reativar, Excluir | muda situação / destrutiva | `perigo` · `marca` |

**Ação de linha é sempre de CONTORNO**, com a mesma anatomia — muda só a cor:

```
border-<cor>  bg-white  text-<cor-escura>  hover:bg-<cor-clara>
dark:border-<cor>  dark:bg-slate-800  dark:text-<cor>  dark:hover:bg-<cor-escura>
```

Sólido fica reservado para a ação principal de uma tela (o "Salvar" de um
formulário), nunca para a coluna de ações: três botões preenchidos na mesma linha
competem entre si e nenhum se destaca.

**Sobre o âmbar**, onde o contraste engana: a **borda** usa o amarelo-ouro vivo
(`atencao-400`), mas o **texto** precisa do tom escuro (`atencao-700`). Sobre fundo
branco, o `-400` como texto dá apenas **1.89:1** — reprova os 4.5:1 do DoD, ainda
que pareça legível; o `-700` dá 4.88:1. No tema escuro a relação se inverte: o
fundo é `slate-800`, e aí o `-400` é que funciona (6.96:1). Amarelo é a família
onde esse erro é mais fácil de cometer — se for mexer no tom, **calcule o
contraste** em vez de confiar no olho.

## `<select>` — a seta nativa não respeita padding

A seta que o navegador desenha num `<select>` fica **colada na borda direita** e
ignora o `padding-right` do elemento — aumentar o padding não a afasta. Quando o
`<select>` convive com campos que têm ação interna (o "X" de um `input[type=search]`,
por exemplo), a diferença de folga fica evidente.

O padrão do projeto é desligar a seta nativa e desenhar a própria:

```html
<div class="relative">
  <select class="controle w-full cursor-pointer appearance-none rounded-md border … py-1.5 pl-3 pr-10">…</select>
  <svg class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 …" aria-hidden="true">…</svg>
</div>
```

Três detalhes que fazem funcionar: **`appearance-none`** remove a seta do navegador ·
**`pointer-events-none`** no SVG deixa o clique passar para o `<select>` ·
**`aria-hidden="true"`** mantém a seta fora da árvore de acessibilidade (é
decoração; quem anuncia o controle é o `<label>`).

## Altura de campo e botão — a classe `.controle`

Todo campo e todo botão usa **`.controle`** (definida em `src/styles.css`), nunca uma
altura solta no template. Ela resolve o conflito entre densidade e acessibilidade
condicionando ao **apontador**: 44px onde o ponteiro é grosso (dedo), 36px onde é
fino (mouse/trackpad). O requisito de alvo de toque continua valendo exatamente onde
ele existe para valer.

**Todo controle clicável leva `cursor-pointer`** — `<button>` e `<select>`, sem
exceção: botão de ação, de paginação, de fechar aviso, alternador de tema, item de
menu. O navegador não dá cursor de mão a `<button>` por padrão, então um botão sem a
classe não se anuncia como clicável, e uma tela com alguns botões acertando e outros
não fica visivelmente inconsistente. O `disabled:cursor-not-allowed` continua sendo
responsabilidade de quem desabilita.

## Definition of Done visual

Claro **e** escuro · teclado e foco visível em toda ação · contraste ≥ 4.5:1 ·
estados vazio/carregando/erro existem e foram vistos · 1366×768 sem rolagem
horizontal · alvo de toque ≥ 44px **onde o apontador é grosso** (ver `.controle`).
