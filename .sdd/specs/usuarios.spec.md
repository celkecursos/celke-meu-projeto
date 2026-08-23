---
feature: usuarios
versao: 1.0
status: aprovada
data: 2026-08-17
autor: pm-spec-architect
---

# Gestão de Usuários

## 1. Resumo Executivo

**Problema.** O sistema não tem um cadastro de pessoas. Sem ele, não há a quem
inscrever em campeonato, a quem atribuir resultado, nem a quem exibir em ranking.
Hoje não existe fonte de verdade sobre quem é participante e quem está em circulação.

**Valor de negócio.** Este módulo é a **base cadastral** do produto: cria a identidade
de cada pessoa (nome, e-mail, apelido de ranking) e o interruptor que decide se ela
pode ou não entrar em competições novas. Todo módulo futuro de campeonato pendura-se
nesse cadastro.

**Entra no escopo.**

- Listagem paginada de usuários, com busca e filtro por situação, em ordem fixa
  definida pelo sistema.
- Cadastro de usuário novo.
- Edição de usuário existente.
- Visualização dos dados de um usuário.
- Inativação e reativação de usuário.
- Regras de unicidade de e-mail e de apelido, com recusa explicada ao operador.

**Fica FORA do escopo.**

- Login, senha, autenticação, permissões e perfis de acesso.
- Upload de foto ou avatar.
- Notificação por e-mail (nenhuma mensagem é disparada para o usuário cadastrado).
- Exclusão física de usuário — não existe, por decisão de negócio.
- Inscrição em campeonato, ranking e histórico de participação: são consumidores
  futuros deste cadastro, especificados em entrega própria.

## 2. Atores e Papéis

| Ator | Descrição | O que pode fazer |
|---|---|---|
| **Operador** | Pessoa que administra o cadastro do sistema. É o único ator com acesso a este módulo nesta entrega. | Listar, buscar, filtrar, visualizar, cadastrar, editar, inativar e reativar usuários. |
| **Usuário cadastrado** | A pessoa registrada no sistema — a que, no futuro, disputa campeonatos. **Não é um ator deste módulo**: não acessa, não recebe aviso e não interage com o cadastro. É o *sujeito* dos dados, não o operador deles. | Nada nesta entrega. |
| **Módulos consumidores** (futuro) | Campeonatos, inscrições e rankings. Leem o cadastro para saber quem existe, quem está ativo e como exibir a pessoa. | Consultar. A decisão de recusar um inativo pertence a eles, com base na situação definida aqui. |

Não há distinção de permissão dentro do módulo: quem entra, faz tudo. Perfis de acesso
são explicitamente fora de escopo.

## 3. Requisitos Funcionais

**Listagem e consulta**

- **RF-01** — O sistema DEVE apresentar a relação de usuários cadastrados em formato
  tabular, exibindo por linha: nome completo, e-mail, apelido, situação e data de
  cadastro.
- **RF-02** — O sistema DEVE paginar a relação de usuários, informando ao operador a
  página corrente, o total de páginas e o total de registros que atendem aos critérios
  vigentes, e permitindo navegar entre páginas.
- **RF-03** — O sistema DEVE oferecer uma busca textual única que retorna os usuários
  cujo **nome completo OU e-mail** contenha o termo informado, em correspondência
  parcial e sem diferenciar maiúsculas de minúsculas.
- **RF-04** — O sistema DEVE oferecer filtro por situação com três opções: todos,
  somente ativos, somente inativos. O padrão ao abrir a listagem é **todos**.
- **RF-05** — O sistema DEVE apresentar a relação em uma ordem única e estável,
  definida pelo próprio sistema (RF-06), **sem oferecer ao operador controle de
  ordenação na tela**: os cabeçalhos das colunas são rótulos, não comandos. A ordem
  aplicada permanece endereçável pelo endereço do resultado (RF-08).
- **RF-06** — O sistema DEVE apresentar a relação ordenada por data de cadastro
  decrescente (mais recentes primeiro) — a ordem única a que RF-05 se refere.
- **RF-07** — O sistema DEVE aplicar busca e filtro de forma combinada (ambos
  simultaneamente ativos, sobre a ordem de RF-06) e DEVE retornar à primeira página
  sempre que a busca ou o filtro mudar.
- **RF-08** — O sistema DEVE permitir que o operador retorne a um mesmo resultado de
  listagem — mesma busca, filtro e página — de forma direta e recarregável, sem
  precisar refazer a sequência de cliques.
- **RF-09** — O sistema DEVE distinguir visualmente, na listagem, o usuário ativo do
  inativo, sem depender apenas de cor.
- **RF-33** — O sistema DEVE oferecer, em cada registro da relação, acesso direto às
  ações disponíveis para aquele usuário — visualizar, editar e mudar a situação —
  sem exigir que o operador abra a visualização antes. A ação de situação DEVE se
  apresentar conforme a situação vigente do registro (inativar quando ativo,
  reativar quando inativo) e permanece sujeita à confirmação de RF-26.

**Cadastro e edição**

- **RF-10** — O sistema DEVE permitir cadastrar um usuário informando nome completo,
  e-mail, apelido e situação.
- **RF-11** — O sistema DEVE exigir nome completo e e-mail preenchidos; apelido é
  opcional.
- **RF-12** — O sistema DEVE recusar e-mail cujo formato não seja o de um endereço de
  e-mail válido, com mensagem que identifique o campo.
- **RF-13** — O sistema DEVE recusar o cadastro e a edição quando o e-mail informado já
  pertencer a **outro** usuário, com mensagem clara indicando o e-mail como o motivo da
  recusa. A comparação ignora maiúsculas/minúsculas e espaços nas extremidades.
- **RF-14** — O sistema DEVE recusar o cadastro e a edição quando o apelido informado
  já pertencer a **outro** usuário, com mensagem clara indicando o apelido como o motivo
  da recusa. A comparação ignora maiúsculas/minúsculas e espaços nas extremidades.
  A regra **não** se aplica a apelidos vazios: qualquer número de usuários pode estar
  sem apelido.
- **RF-15** — O sistema DEVE atribuir a data de cadastro no instante em que o usuário é
  criado, e essa data NÃO DEVE ser editável em nenhum momento.
- **RF-16** — O sistema DEVE definir a situação **ativo** como padrão pré-selecionado no
  cadastro de um usuário novo, permitindo ao operador alterá-la antes de salvar.
- **RF-17** — O sistema DEVE permitir editar nome completo, e-mail, apelido e situação
  de um usuário existente, apresentando o formulário já preenchido com os valores
  atuais.
- **RF-18** — O sistema DEVE preservar as regras de obrigatoriedade e unicidade (RF-11 a
  RF-14) na edição, aplicadas identicamente ao cadastro.
- **RF-19** — O sistema DEVE apresentar o formulário de cadastro e o de edição como
  telas próprias, endereçáveis e recarregáveis de forma direta.
- **RF-20** — O sistema DEVE permitir ao operador abandonar o formulário sem salvar,
  retornando à listagem, e nesse caso nenhuma alteração é registrada.
- **RF-21** — O sistema DEVE, ao salvar com sucesso, retornar o operador à listagem e
  confirmar a operação com mensagem de sucesso.

**Visualização**

- **RF-22** — O sistema DEVE oferecer uma tela de visualização de um usuário, somente
  leitura, exibindo nome completo, e-mail, apelido, nome de exibição resultante,
  situação e data de cadastro, endereçável e recarregável de forma direta.
- **RF-23** — O sistema DEVE oferecer, a partir da visualização, o caminho para editar
  aquele mesmo usuário e para retornar à listagem.

**Situação (inativar / reativar)**

- **RF-24** — O sistema DEVE permitir inativar um usuário ativo, e essa é a **única**
  forma de tirar alguém de circulação: não existe exclusão de usuário em nenhum ponto
  do sistema.
- **RF-25** — O sistema DEVE permitir reativar um usuário inativo, devolvendo-o à
  condição de ativo sem qualquer alteração nos demais dados.
- **RF-26** — O sistema DEVE exigir confirmação explícita do operador antes de efetivar
  a mudança de situação, identificando na confirmação o usuário afetado e o efeito da
  mudança.
- **RF-27** — O sistema DEVE preservar integralmente os dados do usuário inativado —
  nome, e-mail, apelido e data de cadastro — e mantê-lo localizável pela listagem sob o
  filtro adequado.
- **RF-28** — O sistema DEVE tratar a situação do usuário como a fonte de verdade sobre
  a elegibilidade dele a competições novas: usuário inativo é inelegível para inscrição
  em campeonato novo, e usuário inativo permanece visível no histórico dos campeonatos
  que já disputou. A *aplicação* dessa regra pertence aos módulos de campeonato, fora
  do escopo desta entrega.

**Nome de exibição**

- **RF-29** — O sistema DEVE derivar um **nome de exibição** para cada usuário: o
  apelido, quando preenchido; o **primeiro nome** extraído do nome completo, quando o
  apelido estiver vazio.
- **RF-30** — O sistema DEVE usar o nome de exibição sempre que representar o usuário de
  forma abreviada, e disponibilizá-lo aos módulos consumidores (rankings de campeonato).

**Estados de tela**

- **RF-31** — O sistema DEVE comunicar ao operador os estados de carregamento, de erro
  na obtenção dos dados e de resultado vazio, distinguindo "nenhum usuário cadastrado"
  de "nenhum usuário atende aos critérios de busca/filtro", oferecendo neste último caso
  o caminho para limpar os critérios.
- **RF-32** — O sistema DEVE comunicar falha ao salvar sem descartar os dados que o
  operador digitou, permitindo corrigir e tentar de novo.

## 4. Modelo de Domínio

### Entidade: **Usuário**

A pessoa registrada no sistema. É a base cadastral de quem, futuramente, participa de
campeonatos.

| Atributo | Obrigatório | Descrição e regras |
|---|---|---|
| **Identificador** | sim | Chave estável e imutável, atribuída pelo sistema na criação. Serve para endereçar o usuário em telas e para os vínculos históricos dos módulos consumidores. Não é exibido como dado de negócio. |
| **Nome completo** | sim | O nome civil da pessoa, como ela é identificada formalmente no cadastro. Espaços nas extremidades são desprezados. |
| **E-mail** | sim | Endereço de e-mail da pessoa. **Único no sistema** e é o **identificador de negócio**: é por ele que um operador reconhece se a pessoa já está cadastrada. Comparado sem diferenciar maiúsculas/minúsculas. |
| **Apelido** | não | Como a pessoa aparece nos rankings de campeonato. Quando preenchido, é **único no sistema** (mesma comparação do e-mail). Quando vazio, não concorre com nenhum outro. |
| **Situação** | sim | `ativo` ou `inativo`. Governa a elegibilidade a competições novas. Nasce `ativo` por padrão. |
| **Data de cadastro** | sim | Instante em que o usuário passou a existir. Atribuída pelo sistema, imutável, nunca editável. |

**Atributo derivado (não armazenado)**

| Derivado | Regra |
|---|---|
| **Nome de exibição** | Apelido, se preenchido. Caso contrário, o primeiro nome do nome completo (o trecho até o primeiro espaço). É o rótulo curto da pessoa. |

### Relações

Nesta entrega, **Usuário não tem relação com nenhuma outra entidade** — não há outra
entidade no sistema. As relações futuras (inscrição em campeonato, resultado, ranking)
apontarão para o **identificador** do usuário, nunca para o e-mail ou o apelido, que são
editáveis. Essa é a razão pela qual o identificador existe separado do identificador de
negócio.

### Invariantes

1. Não existem dois usuários com o mesmo e-mail (comparação insensível a caixa).
2. Não existem dois usuários com o mesmo apelido preenchido (mesma comparação).
3. Todo usuário tem exatamente uma situação, `ativo` ou `inativo`.
4. Nenhum usuário deixa de existir: o conjunto de usuários só cresce.
5. A data de cadastro de um usuário nunca muda.

## 5. Máquina de Estados / Fluxos

### Máquina de estados do Usuário

```
             cadastro (situação escolhida no formulário)
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
      ┌────────┐   inativar   ┌──────────┐
      │ ATIVO  │ ───────────► │ INATIVO  │
      │        │ ◄─────────── │          │
      └────────┘   reativar   └──────────┘
```

| Estado | Significado | O que é permitido |
|---|---|---|
| **Ativo** | Em circulação. | Ser editado; ser inativado; ser inscrito em campeonato novo (regra dos módulos consumidores). |
| **Inativo** | Fora de circulação, mas presente. | Ser editado; ser reativado; **não** ser inscrito em campeonato novo; continuar aparecendo no histórico dos campeonatos já disputados. |

**Não existe estado terminal e não existe transição de saída do sistema.** A remoção de
um usuário não é um estado possível.

As transições `inativar` e `reativar` alteram **exclusivamente** a situação: nenhum
outro atributo é tocado, e a data de cadastro permanece a original.

### Fluxo A — Consultar a relação de usuários

1. O operador abre a listagem.
2. O sistema apresenta a primeira página, com filtro de situação em "todos" e a
   relação por data de cadastro decrescente (RF-06).
3. O operador, opcionalmente: digita um termo de busca; troca o filtro de situação;
   navega entre páginas.
4. A cada mudança de busca ou filtro, o sistema recompõe o resultado e volta à
   primeira página. Mudança de página preserva busca e filtro.
5. O sistema informa o total de registros que atendem aos critérios vigentes.
6. Em qualquer registro exibido, o operador pode acionar diretamente as ações
   daquele usuário (RF-33), entrando nos Fluxos B, C ou E sem passar pela
   visualização.

**Desvios.** Falha ao obter os dados → estado de erro com possibilidade de nova
tentativa. Nenhum usuário cadastrado → mensagem de cadastro vazio, com o caminho para
cadastrar o primeiro. Nenhum resultado para os critérios → mensagem distinta, com o
caminho para limpar busca e filtro.

### Fluxo B — Cadastrar usuário

1. O operador aciona "novo usuário" a partir da listagem.
2. O sistema apresenta o formulário vazio, com situação pré-selecionada em **ativo**.
3. O operador informa nome completo, e-mail e, opcionalmente, apelido; confirma ou
   altera a situação.
4. Ao salvar, o sistema valida, nesta ordem: campos obrigatórios preenchidos; formato do
   e-mail; e-mail não pertencente a outro usuário; apelido, se preenchido, não
   pertencente a outro usuário.
5. Validação bem-sucedida → o sistema cria o usuário, atribui identificador e data de
   cadastro, retorna à listagem e confirma o sucesso.
6. Qualquer validação falha → o sistema permanece no formulário, preserva o que foi
   digitado e aponta o campo e o motivo.

**Desvios.** Abandono do formulário → retorno à listagem, nada é registrado. Falha ao
salvar por indisponibilidade → mensagem de erro, dados preservados, nova tentativa
possível.

### Fluxo C — Editar usuário

1. O operador aciona "editar" a partir da listagem ou da visualização.
2. O sistema apresenta o formulário preenchido com os valores atuais; a data de cadastro
   é exibida como informação, nunca como campo editável.
3. O operador altera o que for necessário — inclusive o e-mail — e salva.
4. As validações são as do cadastro (Fluxo B, passo 4), com a diferença de que a
   unicidade desconsidera o próprio usuário editado: manter o e-mail ou o apelido
   inalterado nunca é conflito.
5. Sucesso → retorno à listagem com confirmação. Falha → permanência no formulário com
   os dados preservados e o motivo apontado.

**Desvios.** Usuário inexistente ou identificador inválido no endereço → mensagem de
"usuário não encontrado" com o caminho de volta para a listagem.

### Fluxo D — Visualizar usuário

1. O operador aciona "visualizar" a partir da listagem.
2. O sistema apresenta os dados em somente leitura, incluindo o nome de exibição
   resultante e a situação.
3. Dali, o operador pode ir para a edição do mesmo usuário ou voltar à listagem.

**Desvios.** Usuário inexistente → mesma mensagem do Fluxo C.

### Fluxo E — Inativar / Reativar usuário

1. O operador aciona a mudança de situação a partir da listagem ou da visualização. A
   ação oferecida depende da situação atual: "inativar" para ativo, "reativar" para
   inativo.
2. O sistema pede confirmação explícita, identificando o usuário pelo nome e pelo e-mail
   e explicando o efeito: inativado não pode ser inscrito em campeonato novo, mas
   permanece no histórico; reativado volta a poder ser inscrito.
3. Confirmado → o sistema altera apenas a situação, confirma o sucesso e atualiza a
   relação exibida, preservando busca, filtro e página.
4. Cancelado → nada muda.

**Desvios.** Falha ao efetivar → a situação exibida permanece a anterior e o operador é
avisado de que a mudança não ocorreu.

## 6. Contratos de Interface

Descritos em termos de domínio: quais informações cada operação recebe e devolve. Nomes
de campo são nomes de negócio.

### Operação: **Consultar relação de usuários**

*Recebe:* termo de busca (opcional, texto livre) · filtro de situação (todos | ativos |
inativos) · página desejada · tamanho da página. A ordem é a de RF-06 e não é
parâmetro de escolha do operador.

*Devolve:* a lista de usuários da página, cada um com identificador, nome completo,
e-mail, apelido, nome de exibição, situação e data de cadastro · o total de usuários que
atendem aos critérios · a página corrente · o tamanho da página · o total de páginas.

*Falhas possíveis:* indisponibilidade da fonte de dados.

### Operação: **Obter um usuário**

*Recebe:* identificador do usuário.

*Devolve:* identificador, nome completo, e-mail, apelido, nome de exibição, situação,
data de cadastro.

*Falhas possíveis:* usuário não encontrado; indisponibilidade da fonte de dados.

### Operação: **Cadastrar usuário**

*Recebe:* nome completo · e-mail · apelido (pode vir vazio) · situação.

*Devolve, em sucesso:* o usuário criado, já com identificador e data de cadastro.

*Devolve, em recusa:* a identificação do campo recusado (nome completo, e-mail ou
apelido) e o motivo — obrigatório não preenchido, formato de e-mail inválido, e-mail já
cadastrado, apelido já cadastrado.

### Operação: **Editar usuário**

*Recebe:* identificador do usuário · nome completo · e-mail · apelido (pode vir vazio) ·
situação.

*Devolve, em sucesso:* o usuário atualizado, com a data de cadastro original preservada.

*Devolve, em recusa:* as mesmas recusas do cadastro; adicionalmente, usuário não
encontrado.

### Operação: **Alterar situação do usuário**

*Recebe:* identificador do usuário · situação desejada (ativo | inativo).

*Devolve, em sucesso:* o usuário com a nova situação e os demais atributos intactos.

*Devolve, em recusa:* usuário não encontrado; indisponibilidade da fonte de dados.

### Regra transversal de normalização

Antes de qualquer validação ou comparação, o sistema despreza espaços nas extremidades
de nome completo, e-mail e apelido. Um apelido composto apenas de espaços equivale a
apelido vazio.

## 7. Edge Cases

**Unicidade e identidade**

1. **E-mail duplicado diferindo só na caixa** (`Joao@x.com` vs `joao@x.com`) → recusado
   como duplicado.
2. **E-mail duplicado com espaços nas pontas** → recusado como duplicado (a normalização
   ocorre antes da comparação).
3. **Editar um usuário sem mudar o e-mail** → não é conflito consigo mesmo; salva
   normalmente.
4. **Apelido duplicado diferindo só na caixa** → recusado como duplicado.
5. **Vários usuários sem apelido** → permitido; a unicidade não alcança o vazio.
6. **Apelido preenchido apenas com espaços** → tratado como vazio: não é recusado por
   duplicidade e o nome de exibição cai no primeiro nome.
7. **Apelido igual ao primeiro nome de outro usuário** → permitido; a unicidade é entre
   apelidos, não entre nome de exibição resultante. Dois nomes de exibição iguais podem
   coexistir e são desambiguados pelo cadastro.
8. **E-mail já usado por um usuário INATIVO** → recusado como duplicado. Inativo continua
   ocupando o e-mail — é a consequência direta de não haver exclusão física.

**Nome de exibição**

9. **Nome completo com um único termo** ("Madonna") → o primeiro nome é o próprio nome.
10. **Nome completo com espaços múltiplos entre termos** → o primeiro nome é o primeiro
    trecho não vazio.
11. **Apelido removido na edição** (campo esvaziado) → o nome de exibição volta a ser o
    primeiro nome, imediatamente.

**Listagem**

12. **Busca sem resultado** → mensagem distinta de "cadastro vazio", com o caminho para
    limpar os critérios.
13. **Cadastro totalmente vazio** → mensagem convidando a cadastrar o primeiro usuário.
14. **Estar na última página e o resultado encolher** (por mudança de filtro ou busca) →
    o sistema volta à primeira página em vez de exibir página inexistente.
15. **Endereço apontando para página além do total** → o sistema apresenta a última
    página válida, sem erro.
16. **Empate na data de cadastro** → registros com a mesma data mantêm entre si uma
    ordem estável e previsível, nunca alternando de forma aleatória entre um
    carregamento e outro.
17. **Termo de busca com acentuação divergente** → fora do escopo desta entrega; a busca
    compara os caracteres como digitados, sem normalizar acentos. Registrado como risco.
18. **Volume de cadastro grande** → a paginação é a única defesa; nenhuma tela carrega o
    cadastro inteiro.

**Situação**

19. **Inativar um usuário já inativo** (ação disparada duas vezes) → o resultado final é
    o mesmo estado; a operação não produz erro nem efeito adicional.
20. **Mudar a situação enquanto um filtro de situação está ativo** → o usuário pode sair
    do resultado exibido; o sistema mantém busca, filtro e página e reflete a
    relação resultante, sem parecer que o registro desapareceu do cadastro.
21. **Inativar não desfaz vínculo histórico** → nenhum dado do usuário é apagado ou
    anonimizado.

**Endereçamento e concorrência**

22. **Endereço de edição/visualização com identificador inexistente ou malformado** →
    "usuário não encontrado", com caminho de volta para a listagem; nunca tela em branco.
23. **Dois operadores editando o mesmo usuário simultaneamente** → o último a salvar
    prevalece. Não há trava nem aviso de conflito nesta entrega; registrado como risco.
24. **Um operador salva um e-mail que outro acabou de cadastrar** → a recusa por
    duplicidade acontece no momento do salvamento, não apenas ao digitar; a validação
    final é sempre a do salvamento.
25. **Recarregar qualquer tela do módulo** → a tela é reconstruída no mesmo ponto, sem
    perda de contexto de listagem.
26. **Abrir a listagem sem nenhum critério no endereço** (o primeiro acesso, o caso
    mais comum de todos) → o sistema assume os padrões — nenhuma busca, situação
    "todos", primeira página — e apresenta a relação normalmente. Nenhum campo da
    barra de filtros pode exibir marca de valor ausente, e o resumo de paginação
    mostra a faixa real de registros. Ausência de critério é o estado inicial
    legítimo, nunca um valor inválido a ser exibido.

## 8. Premissas Validadas

1. **Reativação existe.** Inativar é reversível: um usuário inativo pode voltar a ativo e
   volta a ser elegível a campeonatos novos. *(Confirmado pelo usuário.)*
2. **E-mail é editável.** Apesar de ser o identificador de negócio, pode ser alterado na
   edição, sujeito à mesma checagem de duplicidade do cadastro — para corrigir digitação
   ou acompanhar troca de endereço. *(Confirmado pelo usuário.)*
3. **Apelido é único.** Apelido duplicado é recusado com mensagem clara, no cadastro e na
   edição, com o mesmo peso da regra do e-mail. *(Confirmado pelo usuário.)*
4. **Filtro padrão é "todos".** A listagem abre mostrando ativos e inativos; o filtro
   restringe. Nada do cadastro fica escondido do operador por padrão. *(Confirmado pelo
   usuário.)*
5. **Unicidade de apelido convive com apelido opcional.** A regra de duplicidade só vale
   entre apelidos preenchidos; qualquer número de usuários pode não ter apelido.
   *(Assumido — consequência lógica de 3 + "apelido é opcional".)*
6. **Busca é um campo único.** Um só campo de busca casa nome completo **ou** e-mail, por
   trecho e sem diferenciar caixa — em vez de dois campos separados. *(Assumido.)*
7. **A ordem é fixa — data de cadastro decrescente** (não há controle de ordenação na
   tela), e a página tem **10 registros**. *(Assumido.)*
8. **Data de cadastro é do sistema.** Gerada na criação, nunca editável, nunca informada
   pelo operador. *(Assumido.)*
9. **Situação é escolhível no cadastro**, com "ativo" pré-selecionado — cobre o caso de
   registrar alguém que já entra fora de circulação. *(Assumido.)*
10. **Campeonato está fora desta entrega.** Aqui, a situação é a fonte de verdade sobre
    elegibilidade; recusar a inscrição do inativo e preservar o histórico são
    responsabilidades do módulo de campeonato, quando ele existir. Este módulo apenas
    garante que a informação exista e seja estável. *(Assumido.)*
11. **O identificador do usuário é distinto do e-mail.** Como o e-mail é editável, os
    vínculos futuros precisam de uma chave imutável. *(Assumido — consequência lógica
    de 2.)*
12. **Não há perfis de acesso.** Quem alcança o módulo tem todas as ações disponíveis;
    autenticação e permissão são fora de escopo. *(Declarado pelo usuário.)*
13. **Formulário é tela própria, não sobreposição.** Cadastro e edição são telas
    endereçáveis. *(Declarado pelo usuário.)*
14. **Nenhuma mensagem é enviada ao usuário cadastrado.** Notificação por e-mail é fora
    de escopo — cadastrar, inativar ou reativar alguém não dispara comunicação alguma.
    *(Declarado pelo usuário.)*

## 9. Riscos

| # | Risco | Impacto | Mitigação |
|---|---|---|---|
| **R-01** | **Unicidade de apelido gera atrito no cadastro em lote.** Apelidos curtos e comuns ("Zé", "Junior") colidem rápido; o operador é bloqueado por um campo que é opcional. | Médio — cadastro mais lento, operador tentado a inventar apelidos artificiais. | Mensagem de recusa que diga qual apelido está tomado, e deixar claro que o campo pode ficar vazio. Se o atrito aparecer na prática, reavaliar a regra em versão futura da spec. |
| **R-02** | **E-mail editável quebra vínculos que assumam o e-mail como chave.** Um módulo futuro que guarde o e-mail no histórico verá o dado envelhecer. | Alto se acontecer — histórico de campeonato inconsistente. | Invariante já cravada: vínculos apontam para o identificador imutável, nunca para o e-mail. Precisa ser respeitada pelos módulos consumidores. |
| **R-03** | **Ausência de exclusão física trava e-mails para sempre.** Um cadastro feito por engano ocupa o e-mail permanentemente; recadastrar a mesma pessoa é impossível. | Médio — é o preço explícito da decisão de negócio. | O caminho correto é **editar** o registro errado, não criar outro. A edição de e-mail (premissa 2) é justamente o que torna isso viável. |
| **R-04** | **Busca não normaliza acentos.** Procurar "Joao" não encontra "João". | Médio — operador conclui que a pessoa não está cadastrada e a cadastra de novo, batendo na unicidade do e-mail. | A recusa por e-mail duplicado (RF-13) funciona como rede de segurança e revela a duplicata. Normalização de acentos é candidata a versão futura. |
| **R-05** | **Concorrência sem trava: último a salvar vence.** Dois operadores editando o mesmo usuário perdem a alteração de um deles em silêncio. | Baixo no cenário atual (poucos operadores), alto se a operação crescer. | Aceito nesta versão. Se o número de operadores crescer, especificar detecção de conflito. |
| **R-06** | **A regra "inativo não entra em campeonato novo" não é aplicada por ninguém agora.** Ela vive na spec, não em comportamento verificável. | Alto se esquecida — o módulo de campeonato pode simplesmente ignorar a situação. | RF-28 registra a regra explicitamente como contrato para os consumidores; a spec de campeonato deve referenciá-la e implementá-la. |
| **R-07** | **"Situação" no cadastro pode confundir.** Oferecer inativo já na criação é pouco intuitivo e pode gerar cadastros nascidos fora de circulação por engano. | Baixo. | Padrão pré-selecionado em "ativo" (RF-16); a mudança exige ação deliberada. |
| **R-08** | **Sem paginação eficiente, cadastro grande degrada a listagem.** | Médio, e só a partir de certo volume. | RF-02 torna a paginação obrigatória desde o início; nenhuma tela carrega o cadastro inteiro. |
