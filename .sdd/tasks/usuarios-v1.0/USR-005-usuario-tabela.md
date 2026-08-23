# USR-005 — `usuario-tabela` (componente dumb)

**Spec:** `.sdd/specs/usuarios.spec.md` — atende **RF-01, RF-09, RF-33**.

**Nível:** Pleno — wrapper de domínio sobre `<app-tabela>`, seguindo API já
documentada e já estendida por USR-004.

**Depende de:** USR-001 (tipos `IUsuario`), USR-004 (coluna de ações de
`<app-tabela>`).

## Arquivos a criar

- `src/app/modules/usuarios/components/usuario-tabela/usuario-tabela.ts`
- `src/app/modules/usuarios/components/usuario-tabela/usuario-tabela.html`

## Padrão a seguir

`.ai/rules/architecture.md`, seção `components/`: componente dumb, `input()`/
`output()`, zero facade, zero regra de domínio. `.ai/rules/ui-guidelines.md`, seção
`<app-tabela>`: "as colunas são conteúdo de DOMÍNIO: quem as define é o wrapper do
módulo, não a página" — é exatamente este componente.

## Contrato

Classe `UsuarioTabela`, seletor `app-usuario-tabela`.

- `listagem = input.required<IListagem<IUsuario>>()`.
- `selecionar = output<IUsuario>()` — repassa o evento de `<app-tabela
  (selecionar)>`.
- `visualizar`, `editar`, `alternarSituacao` — `output<IUsuario>()` cada, emitidos
  pelos botões da coluna de ações. Quem decide o que cada um faz é a página (USR-007);
  este componente continua dumb.

No template, monta um `<app-tabela [listagem]="listagem()" [colunas]="colunas"
(selecionar)="selecionar.emit($event)" />` e projeta dentro dele o
`<ng-template #appTabelaAcoes let-usuario>` com os botões da linha.

`colunas` (definidas no `.ts`, tipo `IColuna<IUsuario>[]` de
`shared/components/tabela/tabela.ts`) — exatamente estas cinco, na ordem do RF-01:

1. `campo: 'nomeCompleto'`, `rotulo: 'Nome completo'`.
2. `campo: 'email'`, `rotulo: 'E-mail'`.
3. `campo: 'apelido'`, `rotulo: 'Apelido'` — `formato` devolve o apelido, ou um
   travessão (`'—'`) quando vazio (o `<app-tabela>` já mostra `'—'` para
   `null`/`undefined`, mas `apelido` aqui é sempre string — trate a string vazia
   explicitamente no `formato` para não deixar a célula em branco).
4. `campo: 'situacao'`, `rotulo: 'Situação'`, `alinhamento: 'centro'` — `formato`
   devolve o rótulo textual **"Ativo"** ou **"Inativo"** (por extenso; a diferença
   textual em si já satisfaz o RF-09 — a distinção não depende só de cor).
5. `campo: 'dataCadastro'`, `rotulo: 'Data de cadastro'`, `alinhamento: 'direita'` —
   `formato` converte o ISO 8601 para data legível em pt-BR (ex.:
   `toLocaleDateString('pt-BR')`).

### Os botões da coluna de ações

Três por linha, **todos de CONTORNO** — mesma anatomia, só muda a cor (`.ai/rules/
ui-guidelines.md`, seção "Cor por tipo de ação"): `border-<cor> bg-white
text-<cor-escura> hover:bg-<cor-clara>`, e o par `dark:` correspondente. Nenhum
botão de linha é sólido — três preenchidos lado a lado competem entre si e nenhum
se destaca; sólido fica reservado para a ação principal de uma TELA, como o
"Salvar" de um formulário. Altura pela classe `.controle`, cursor de mão nos três.

1. **Visualizar** — contorno neutro (`slate`). Emite `visualizar`.
2. **Editar** — contorno em **`atencao`** (âmbar): borda `atencao-400` (o
   amarelo-ouro), texto `atencao-700`. **Não use `atencao-400` como cor do texto**:
   sobre fundo branco isso dá 1.89:1 de contraste, abaixo do 4.5:1 do DoD — o
   `-700` dá 4.88:1. No tema escuro o fundo passa a ser `slate-800` e a relação se
   inverte: lá o texto usa `atencao-400` (6.96:1). Emite `editar`.
3. **Inativar** ou **Reativar** — o rótulo e a aparência dependem de
   `usuario.situacao`: "Inativar" (contorno `perigo`) quando ativo, "Reativar"
   (contorno `marca`) quando inativo. Emite `alternarSituacao` nos dois casos —
   quem sabe para qual situação transitar é a página.

Cada botão precisa de `aria-label` incluindo o **nome do usuário**: numa relação com
várias linhas, três botões repetidos por linha são indistinguíveis para quem navega
por leitor de tela.

Use `@if/@else` sobre a situação para o terceiro botão, em vez de um ternário na
classe: o ternário substituiria a classe inteira do elemento e tornaria o estilo
frágil.

## Critérios de aceite

- Nenhuma lógica de domínio no componente além da formatação de exibição das colunas
  (que é exatamente o papel documentado de `formato`).
- Zero `inject` de facade/serviço — os três `output()` de ação apenas emitem.
- Acionar um botão da coluna de ações **não** dispara também o `(selecionar)` da
  linha (a célula do `<app-tabela>` já interrompe a propagação — USR-004).
- O terceiro botão mostra "Inativar" para usuário ativo e "Reativar" para inativo.
- `npm run check` verde.
