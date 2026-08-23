# USR-010 — `usuario.routes.ts`

**Spec:** `.sdd/specs/usuarios.spec.md` — atende **RF-08, RF-19, RF-22**.

**Nível:** Pleno — aplica literalmente a regra de rotas já prescrita em
`architecture.md`, sem decisão nova.

**Depende de:** USR-007 (`usuario-lista.page`), USR-008 (`usuario-form.page`),
USR-009 (`usuario-visualizar.page`).

## Arquivo a criar

- `src/app/modules/usuarios/usuario.routes.ts`

## Padrão a seguir

`.ai/rules/architecture.md`, seção "Rotas e formulário": "form de **PÁGINA** = rota
**IRMÃ** (fora de `children`) — a lista desmonta". A spec desta feature (premissa 13)
confirma: "formulário é tela própria, não sobreposição".

## Contrato

Exporte `rotas: Routes` com **quatro rotas, todas irmãs** no mesmo array (nenhuma
aninhada em `children` de outra):

1. `path: ''` → `UsuarioListaPage` — a listagem.
2. `path: 'novo'` → `UsuarioFormPage`, com `data: { modo: 'criar' }`.
3. `path: 'editar/:id'` → `UsuarioFormPage`, com `data: { modo: 'editar' }`.
4. `path: 'visualizar/:id'` → `UsuarioVisualizarPage`.

Por serem irmãs (não filhas da lista), navegar para qualquer uma delas desmonta a
listagem — é o comportamento de "página própria", não modal.

## Critérios de aceite

- As quatro rotas existem exatamente com esses paths e componentes.
- `editar/:id` e `visualizar/:id` não estão aninhadas sob `path: ''`.
- `data.modo` está presente em `novo` e `editar/:id`, ausente em `visualizar/:id` e
  em `''`.
- `npm run build` compila (import correto das três páginas).
