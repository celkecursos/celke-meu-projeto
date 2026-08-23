# AUTH-001 — `auth.models.ts` (+ teste)

**Spec:** `.sdd/specs/autenticacao.spec.md` — atende **RF-02, RF-03, RF-04** (edge
cases 1, 2, 3, 4 do Acesso) e é a base de tipos para todas as demais tasks.

**Nível:** Pleno — segue o padrão de `<x>.models.ts` já fixado no projeto (regra de
domínio como função pura, testada em `<x>.models.spec.ts`, conforme
`.ai/rules/architecture.md`, seção `data/<x>.models.ts`). Não define arquitetura
nova.

**Depende de:** (nenhuma)

## Arquivos a criar

- `src/app/core/auth/auth.models.ts`
- `src/app/core/auth/auth.models.spec.ts`

## Padrão a seguir

`.ai/rules/architecture.md`, seção `data/<x>.models.ts`: interfaces `I<X>` e regras
de domínio como **funções puras** (sem `inject`, sem HTTP) — são elas que o teste
cobre. Teste no estilo de `core/data/consulta.spec.ts` (exemplar do projeto): um
`describe` por função, nome do caso descreve a regra em português, caso-limite
explícito.

Este arquivo mora em `core/auth/`, não em `modules/`: a sessão é infraestrutura
transversal, consumida por qualquer tela do app, não um domínio de negócio.

## Contrato — tipos de domínio

Os tipos abaixo são a única "exceção de código" permitida — o resto do contrato é em
prosa.

```ts
interface ISessao {
  nomeCompleto: string;
  email: string;
}

interface ILoginRecusa {
  motivo: string;
}
```

`ISessao` é o modelo de domínio da seção 4 da spec: a identificação do operador
(`email`) e o nome de exibição (`nomeCompleto`), os dois obrigatórios. **Não existe
tipo `IOperador`, `IPerfil` ou `IPermissao` nesta entrega** — modelar isso simularia
um alcance que a spec não tem (seção 4, e risco R-01).

`ILoginRecusa` carrega **um único campo textual** (`motivo`), de propósito: um campo
`campo: 'email' | 'senha'` ao lado dele já entregaria por eliminação qual das duas
credenciais está errada, exatamente o que RF-03 proíbe. A forma do tipo é o que
impede a violação de acontecer distraidamente.

## Contrato — a credencial aceita

- **`CREDENCIAL_DEMO`** — constante exportada com dois campos textuais: a
  identificação e o segredo que concedem sessão nesta entrega. É a **única**
  combinação aceita (RF-02) e é um FATO de domínio, não uma preocupação de facade ou
  de tela — por isso nasce aqui.
- Ela é exportada porque a tela de acesso precisa **exibi-la** ao visitante (RF-04):
  a credencial é pública por decisão de escopo (premissa 2 da spec), e uma fonte
  única evita que a tela e a regra de validação divirjam em dois arquivos.
- Declare-a como constante literal (`as const`) — ninguém deve conseguir reatribuir
  a credencial em tempo de execução.

## Contrato — função pura de validação

- **`credencialValida(email: string, senha: string): boolean`** — devolve `true`
  somente quando a COMBINAÇÃO recebida corresponde a `CREDENCIAL_DEMO` (RF-02: a
  validação é da combinação, nunca de cada campo isoladamente — edge case 2). A
  comparação da identificação (`email`) despreza espaços nas extremidades e ignora
  diferença de maiúsculas/minúsculas antes de comparar (edge case 3), coerente com a
  normalização de e-mail que o cadastro de usuários já usa; a comparação do segredo
  (`senha`) é feita exatamente como recebida, **sem qualquer normalização** — nem
  trim, nem mudança de caixa (edge case 4). Uma identificação tecnicamente bem
  formada mas diferente da aceita devolve `false`, sem nenhum tratamento especial
  (edge case 1) — é a mesma recusa de qualquer outra combinação errada.
- Esta é a **fonte única** da regra de validação de credencial: nenhum outro arquivo
  do projeto reimplementa essa comparação. Quem precisa validar credencial importa
  esta função.
- A função não conhece mensagem de erro nenhuma — ela responde `true`/`false`. Quem
  traduz a recusa em texto para o operador é a facade (AUTH-002).

## Critérios de aceite (o que `auth.models.spec.ts` precisa cobrir)

- Combinação correta (mesma identificação e mesmo segredo de `CREDENCIAL_DEMO`) →
  `true`.
- Identificação com caixa diferente da aceita, segredo correto → `true` (edge case 3).
- Identificação com espaços nas extremidades, segredo correto → `true` (edge case 3).
- Segredo com caixa diferente do aceito, identificação correta → `false` (edge case 4).
- Segredo com espaços nas extremidades, identificação correta → `false` (edge case 4
  — o segredo não é normalizado).
- Identificação correta com segredo errado, e o inverso (segredo correto com
  identificação errada) → `false` nos dois casos (edge case 2 — a validação é da
  combinação).
- Identificação tecnicamente válida (formato de e-mail bem formado) mas diferente da
  aceita → `false`, mesma recusa de qualquer outra combinação errada (edge case 1).
- Identificação ou segredo vazio (string `''`) → `false` (a regra pura não depende da
  validação de campo obrigatório feita na tela — vazio é só mais uma combinação que
  não bate).
- `npm run test:ci` verde para este arquivo.
- `credencialValida` não importa `HttpClient`, `inject`, nem qualquer símbolo do
  Angular — é função pura, testável isolada.
