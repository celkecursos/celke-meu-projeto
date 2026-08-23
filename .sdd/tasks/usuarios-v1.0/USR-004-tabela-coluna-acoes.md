# USR-004 — Estender `<app-tabela>` com coluna de ações

**Spec:** `.sdd/specs/usuarios.spec.md` — atende **RF-33** (ações por registro na
relação) e habilita os Fluxos B, C e E a partir da listagem.

**Nível:** Sênior — modifica um **componente compartilhado** (`src/app/shared/
components/tabela/`), usado por qualquer módulo futuro que liste dados, e atualiza a
documentação que a rule exige (`.ai/rules/ui-guidelines.md`). Decisão que cruza
módulos, não só o de usuários.

**Depende de:** (nenhuma) — não toca em nenhum arquivo do módulo `usuarios`, corre em
paralelo com USR-001/002/003.

## Por que esta task existe

`<app-tabela>` projeta cada coluna como **texto** (`IColuna.formato`), o que é
suficiente para dado, mas não para **ação**: um botão por linha não é um valor
formatado. A relação precisa oferecer visualizar, editar e alternar situação em cada
registro, e a API atual do componente não permite isso.

Há ainda uma armadilha que só o componente compartilhado pode resolver: a **linha
inteira** emite `(selecionar)`, então um clique num botão dentro dela dispararia
também a navegação da linha. A célula de ações precisa interromper a propagação — se
cada módulo tentar resolver isso por conta, um vai esquecer.

Como o componente compartilhado só existe se documentado (`ui-guidelines.md`) e
nenhuma task pode inventar prop não documentada, a extensão precisa nascer aqui,
documentada, antes de qualquer módulo depender dela.

## Arquivos a modificar

- `src/app/shared/components/tabela/tabela.ts`
- `src/app/shared/components/tabela/tabela.html`
- `.ai/rules/ui-guidelines.md` (seção `<app-tabela>`)

## Contrato

- Adicione a `Tabela<T>` a captura de um template de conteúdo **opcional**:
  `contentChild<TemplateRef<{ $implicit: T }>>('appTabelaAcoes')`. Ausente ⇒ nenhuma
  coluna extra é renderizada e o componente se comporta exatamente como hoje
  (retrocompatível).
- Adicione `rotuloAcoes = input<string>('Ações')` — o cabeçalho da coluna.
- Exponha um derivado com o número total de colunas (as de dados **mais** a de ações
  quando houver): é ele que alimenta os `[attr.colspan]` dos estados vazio, erro e do
  aviso de carregamento, que hoje contam só `colunas().length` e passariam a subnotar.
- No template, quando o template de ações existir: um `<th>` ao fim do cabeçalho com
  `rotuloAcoes`; uma célula ao fim de cada linha de dados renderizando o template via
  `ngTemplateOutlet`, com o item da linha no contexto (`$implicit`); e uma célula
  correspondente no esqueleto de carregamento, para o layout não saltar.
- **A célula de ações deve interromper a propagação** de clique e de teclado, para
  que acionar uma ação não dispare o `(selecionar)` da linha.
- Não altere as assinaturas existentes (`listagem`, `colunas`, `selecionar`) nem o
  comportamento dos estados vazio/carregando/erro.
- Os `output()` das ações **não** pertencem a este componente: quem os declara é o
  wrapper de domínio (USR-005), que projeta o template. `<app-tabela>` continua
  genérico e sem conhecer domínio.

## Documentação (`ui-guidelines.md`)

Atualize o bloco de assinatura de `<app-tabela>` acrescentando a linha nova, no mesmo
estilo das existentes:

```ts
input<string>()                 rotuloAcoes // cabeçalho da coluna de ações (padrão 'Ações')
```

E, abaixo, um parágrafo curto explicando que a coluna é opcional, como projetá-la
(`<ng-template #appTabelaAcoes let-item>`), que a célula já interrompe a propagação,
e que os `output()` das ações são do wrapper de domínio — com um exemplo mínimo de
uso.

## Critérios de aceite

- Uso de `<app-tabela>` **sem** projetar o template continua idêntico visualmente e
  sem erro de tipo — nenhuma coluna a mais.
- Projetando `<ng-template #appTabelaAcoes let-item>`, nasce a última coluna com o
  cabeçalho `rotuloAcoes` e um botão por linha recebendo o item correto.
- Acionar um botão da coluna de ações **não** dispara o `(selecionar)` da linha.
- Os `colspan` dos estados vazio/erro/carregando cobrem a tabela inteira, incluindo a
  coluna de ações.
- `.ai/rules/ui-guidelines.md` reflete a API nova — é a única fonte que os
  implementadores de outros módulos vão ler.
- `npm run check` verde.
