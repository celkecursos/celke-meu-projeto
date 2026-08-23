# AUTH-004 — `login.page` (tela de acesso)

**Spec:** `.sdd/specs/autenticacao.spec.md` — atende **RF-01, RF-03, RF-04, RF-11**
(Fluxo A; edge case 5).

**Nível:** Pleno — página SMART que injeta uma facade e orquestra um `FormGroup`,
reaproveitando o componente compartilhado `<app-campo-texto>`. É execução do padrão
de página já fixado no projeto, não decisão de arquitetura.

**Depende de:** AUTH-001, AUTH-002.

## Arquivos a criar

- `src/app/pages/login/login.page.ts`
- `src/app/pages/login/login.page.html`

**Localização, de propósito fora de `modules/`:** login não é um domínio de negócio
com `data/`/`pages/`/`components/` — é a porta de entrada do app inteiro. Por isso
mora em `src/app/pages/`, ao lado de `app.ts`, e não replica a árvore canônica de
módulo. Registre isso no cabeçalho do arquivo para quem vier depois não "corrigir" a
pasta.

## Padrão a seguir

`.ai/rules/architecture.md`, seção `pages/`: página é SMART (injeta a facade,
orquestra), `.page.ts` e `.page.html` **sempre separados**, control flow `@if`/`@for`
com `track`. `.ai/rules/ui-guidelines.md` para a API de `<app-campo-texto>` e para as
escalas do tema — **sem valor arbitrário Tailwind, sem hex, sem `::ng-deep`**.

Nenhuma lógica de domínio no template: a página não decide o que é credencial
válida, só coleta, chama a facade e reage ao resultado.

## Contrato — o formulário

- Reactive Forms, com dois controles textuais: identificação e segredo (RF-01).
- **Os dois são obrigatórios**, e a tela indica isso ao operador. Um campo vazio é
  barrado **antes** de qualquer comparação com a credencial aceita (edge case 5) —
  o envio nem chega à facade; marque os controles como tocados para as mensagens de
  obrigatório aparecerem.
- Os controles usam `<app-campo-texto>` do `shared/`, com os tipos de campo
  adequados: a identificação como campo de e-mail e o segredo como campo de senha
  (o segredo **não** pode aparecer em texto legível na tela).
- Controles não anuláveis (`nonNullable`) — a facade recebe texto, nunca `null`.

## Contrato — a recusa (RF-03)

- Guarde a recusa da última tentativa em signal local e exiba **uma única mensagem**,
  a que a facade devolveu, num bloco com papel de alerta acessível.
- A mensagem **não** é ancorada a nenhum dos dois campos — não a coloque como erro do
  campo de identificação nem do de segredo. Amarrá-la a um campo entregaria por
  eliminação qual dos dois está errado, exatamente o que RF-03 proíbe.
- Limpe a recusa ao iniciar uma nova tentativa — a mensagem antiga não pode ficar na
  tela enquanto o operador tenta de novo.
- Não há limite de tentativas, bloqueio, nem contador (edge case 6, fora de escopo).

## Contrato — a credencial exibida (RF-04)

- A tela exibe a credencial que concede sessão, apresentada como instrução de teste
  ("use este e-mail e esta senha"), num bloco visualmente distinto do formulário.
- Os valores vêm de `CREDENCIAL_DEMO` (AUTH-001), lidos por uma propriedade do
  componente — **nunca digitados de novo no template**. Duas cópias divergem no
  primeiro dia em que alguém mudar a credencial.

## Contrato — o destino após o acesso (RF-11)

- Em sucesso, leia o parâmetro de consulta com o destino original que o guard
  (AUTH-003) deixou na URL e navegue para ele.
- **Valide antes de navegar**: só aceite um caminho interno do próprio app. Se o
  parâmetro estiver ausente ou não for um caminho interno, navegue para um destino
  padrão do sistema. Navegar cegamente para o que veio na URL é como uma tela de
  login vira trampolim para um endereço externo.
- Em recusa, permanece na tela e o operador pode tentar de novo (Fluxo A, passo 5) —
  não navegue, não limpe os campos.

## Contrato — a moldura visual

Esta é a **única tela do app fora do layout institucional** (sem barra de navegação,
sem cabeçalho): AUTH-005 a registra fora dele. Como aqui não existe a coluna do
`<main>` para herdar, a página traz a própria centralização e a própria largura
máxima — um formulário de acesso esticado na largura inteira da tela fica errado.
Use as escalas do tema para isso, não medida arbitrária.

## Critérios de aceite

- A tela é alcançável direto pela URL e funciona no refresh (RF-01).
- Enviar com qualquer um dos dois campos vazio mostra a indicação de obrigatório e
  **não** chama a facade (edge case 5).
- A credencial aceita entra e leva ao destino original quando ele veio na URL, ou ao
  destino padrão quando não veio (RF-11).
- Qualquer outra combinação mostra a mesma mensagem única, sem indicar campo (RF-03).
- A credencial de demonstração aparece na tela, vinda da constante (RF-04).
- Claro e escuro; navegação por teclado com foco visível; 1366×768 sem rolagem
  horizontal (DoD).
- `npm run lint` e `npm run build` verdes; `/revisar-dod` limpo sobre os dois
  arquivos.
