---
feature: autenticacao
versao: 1.0
status: aprovada
data: 2026-08-21
autor: pm-spec-architect
---

# Autenticação (Acesso ao Sistema)

## 1. Resumo Executivo

**Problema.** O sistema hoje é aberto: qualquer pessoa que alcance o endereço de
qualquer tela vê e opera o cadastro inteiro. Não existe barreira nenhuma entre "ter
o link" e "usar o sistema".

**Valor de negócio.** Esta entrega estabelece o **portão de entrada** do produto: uma
tela de acesso e uma sessão que precisa existir para qualquer outra tela ser
alcançada. É a base sobre a qual perfis, permissões e autenticação real (fora de
escopo aqui) se apoiariam no futuro — mas nesta entrega o valor é **apenas** a
barreira em si, não quem tem direito a quê.

**Entra no escopo.**

- Uma tela de acesso, isolada de todo o resto do sistema.
- Uma sessão que existe ou não existe — sem papéis, sem permissões diferenciadas
  dentro dela.
- Bloqueio de qualquer outra tela do sistema para quem não tem sessão.
- Encerramento da sessão pelo próprio usuário, a qualquer momento.
- A sessão sobrevive a um recarregamento da página (não é perdida ao atualizar o
  navegador).

**Fica FORA do escopo.**

- Cadastro de novos operadores, recuperação de senha, troca de senha.
- Perfis de acesso, papéis, permissões diferenciadas entre operadores logados —
  nesta entrega, quem tem sessão pode tudo que o sistema hoje oferece.
- Expiração de sessão por tempo, limite de tentativas, bloqueio por tentativa
  malsucedida repetida.
- Qualquer verificação contra uma base de operadores reais — nesta entrega a
  identidade de quem acessa não é validada contra um cadastro; **é uma
  demonstração**, não um mecanismo de segurança de produção. Ver Riscos, R-01.
- Autenticação de terceiros (redes sociais, provedores externos).

## 2. Atores e Papéis

| Ator | Descrição | O que pode fazer |
|---|---|---|
| **Visitante** | Qualquer pessoa que alcance um endereço do sistema sem sessão ativa. | Só acessar a tela de acesso. Qualquer outro endereço a devolve para lá. |
| **Operador** | A mesma pessoa, depois de obter sessão. É o único papel autenticado — não há distinção de nível dentro dele. | Tudo que o sistema hoje oferece às telas protegidas; encerrar a própria sessão a qualquer momento. |

Não há hierarquia entre operadores nesta entrega: uma vez com sessão, o alcance é o
mesmo para qualquer um. Diferenciação de papel é explicitamente fora de escopo.

## 3. Requisitos Funcionais

**Acesso**

- **RF-01** — O sistema DEVE oferecer uma tela de acesso, endereçável diretamente,
  onde o visitante informa duas credenciais para obter sessão.
- **RF-02** — O sistema DEVE aceitar apenas UMA combinação de credenciais como
  válida nesta entrega — não qualquer identificação bem formada. Qualquer outra
  combinação, incluindo uma tecnicamente bem formada, é recusada.
- **RF-03** — O sistema DEVE recusar uma tentativa de acesso com uma única mensagem
  genérica, que **não distingue** qual das duas credenciais está incorreta. Confirmar
  qual delas está errada ajudaria alguém a descobrir a outra por eliminação.
- **RF-04** — O sistema DEVE exibir, na própria tela de acesso, a credencial que
  concede sessão nesta entrega — é uma demonstração aberta, não um segredo a
  descobrir (ver Riscos, R-01).

**Sessão**

- **RF-05** — O sistema DEVE conceder sessão imediatamente após uma tentativa de
  acesso bem-sucedida, sem etapa intermediária.
- **RF-06** — O sistema DEVE preservar a sessão através de um recarregamento da
  página — o operador não perde o acesso por atualizar o navegador.
- **RF-07** — O sistema DEVE permitir ao operador encerrar a própria sessão a
  qualquer momento, a partir de qualquer tela protegida.
- **RF-08** — O sistema DEVE, ao encerrar a sessão, devolver o visitante à tela de
  acesso e impedir imediatamente o alcance de qualquer tela protegida.

**Proteção de telas**

- **RF-09** — O sistema DEVE impedir o alcance de qualquer tela do sistema, exceto a
  própria tela de acesso, a quem não tem sessão — independentemente de como o
  visitante chegou ao endereço (link direto, favorito, endereço digitado).
- **RF-10** — O sistema DEVE, ao impedir o alcance de uma tela por falta de sessão,
  devolver o visitante à tela de acesso.
- **RF-11** — O sistema DEVE, depois de uma tentativa de acesso bem-sucedida
  originada de um bloqueio (RF-09/RF-10), levar o operador à tela que ele
  originalmente tentou alcançar — não a um destino fixo. Sem isso, todo acesso
  levaria sempre ao mesmo lugar, obrigando o operador a navegar de novo até onde
  queria ir.

**Identificação do operador**

- **RF-12** — O sistema DEVE identificar o operador logado de forma visível em
  qualquer tela protegida, para que ele saiba de quem é a sessão vigente.

## 4. Modelo de Domínio

### Entidade: **Sessão**

O estado de "há alguém logado agora". Não existe uma entidade "Operador" cadastrada
em lugar nenhum nesta entrega — a sessão nasce da própria tentativa de acesso bem
-sucedida, sem consultar um cadastro de pessoas autorizadas.

| Atributo | Obrigatório | Descrição e regras |
|---|---|---|
| **Identificação do operador** | sim | O identificador de quem está com a sessão — o que RF-12 exibe. Nesta entrega, é sempre o mesmo, porque só existe uma credencial válida (RF-02). |
| **Nome de exibição** | sim | O nome pelo qual o operador é identificado nas telas (RF-12). |

**Não existe** entidade "Credencial cadastrada", "Perfil" ou "Permissão" nesta
entrega — a validação de acesso (RF-02) é contra um único par fixo, não contra uma
coleção. Modelar uma entidade de credenciais múltiplas seria simular um alcance que
esta entrega não tem (ver Riscos, R-01).

### Relações

**Sessão não tem relação com nenhuma outra entidade do sistema** — inclusive com
**Usuário** (a entidade do módulo de cadastro de pessoas, spec própria): a sessão de
acesso ao sistema e o cadastro de pessoas geridas pelo sistema são coisas
independentes nesta entrega. Um operador logado não corresponde a nenhum registro
de Usuário; **Usuário** é o que o operador logado administra, não quem ele é.

## 5. Máquina de Estados / Fluxos

### Máquina de estados da Sessão

```
                    tentativa de acesso bem-sucedida (RF-05)
                              │
                              ▼
   ┌───────────────┐                       ┌───────────────┐
   │  SEM SESSÃO   │                       │  COM SESSÃO   │
   │  (visitante)  │ ◄──────────────────── │  (operador)   │
   └───────────────┘   encerrar sessão     └───────────────┘
                              (RF-07/RF-08)
```

| Estado | Significado | O que é permitido |
|---|---|---|
| **Sem sessão** | Visitante. | Só a tela de acesso (RF-09). Qualquer outro endereço devolve para cá (RF-10). |
| **Com sessão** | Operador. | Todas as telas hoje protegidas pelo sistema; encerrar a própria sessão (RF-07). |

Não existe estado intermediário (ex.: "sessão pendente de confirmação") nem estado
terminal diferente de "sem sessão" — encerrar a sessão volta exatamente ao estado
inicial, não a um terceiro estado.

### Fluxo A — Acessar o sistema

1. O visitante chega à tela de acesso — diretamente, ou por ter sido devolvido para
   lá ao tentar alcançar uma tela protegida (Fluxo C).
2. O visitante informa as duas credenciais.
3. O sistema valida a combinação contra a única credencial aceita nesta entrega
   (RF-02).
4. Válida → o sistema concede sessão (RF-05) e leva o operador ao destino original,
   se houver (RF-11), ou a um destino padrão do sistema.
5. Inválida → o sistema recusa com a mensagem única (RF-03); o visitante permanece
   na tela de acesso e pode tentar de novo.

**Desvios.** Nenhum — não há limite de tentativas nem bloqueio nesta entrega
(registrado como fora de escopo).

### Fluxo B — Encerrar a sessão

1. O operador aciona o encerramento de sessão, disponível em qualquer tela
   protegida.
2. O sistema encerra a sessão imediatamente e devolve o operador à tela de acesso
   (RF-08).
3. Qualquer tentativa seguinte de alcançar uma tela protegida volta ao Fluxo C.

**Desvios.** Nenhum — encerrar sessão não tem confirmação nem pode falhar nesta
entrega.

### Fluxo C — Tentar alcançar uma tela protegida sem sessão

1. O visitante chega a um endereço do sistema que não é a tela de acesso — por link
   direto, favorito, ou digitação — sem ter sessão.
2. O sistema impede o alcance (RF-09) e devolve o visitante à tela de acesso
   (RF-10), preservando qual era o destino pretendido.
3. Se o visitante completar o Fluxo A a partir daí, é levado ao destino original
   (RF-11) em vez de a um destino fixo.

**Desvios.** Nenhum.

## 6. Contratos de Interface

Descritos em termos de domínio: quais informações cada operação recebe e devolve.

### Operação: **Tentar acesso**

*Recebe:* identificação do visitante · segredo do visitante.

*Devolve, em sucesso:* uma sessão concedida, com a identificação do operador e o
nome de exibição.

*Devolve, em recusa:* uma única mensagem genérica de credenciais incorretas — sem
indicar qual das duas está errada (RF-03).

### Operação: **Consultar sessão vigente**

*Recebe:* nada (consulta o estado corrente).

*Devolve:* a sessão vigente (identificação + nome de exibição do operador), ou a
ausência de sessão.

### Operação: **Encerrar sessão**

*Recebe:* nada — a operação age sobre a sessão vigente.

*Devolve:* confirmação de que não há mais sessão.

## 7. Edge Cases

**Acesso**

1. **Identificação tecnicamente válida mas não é a credencial aceita** → recusado
   com a mesma mensagem genérica de qualquer outra combinação errada (RF-02/RF-03)
   — não há distinção entre "não existe" e "existe mas a senha está errada".
2. **Segredo correto com identificação errada** (ou vice-versa) → recusado; a
   validação é da COMBINAÇÃO, não de cada campo isoladamente.
3. **Diferença de maiúsculas/minúsculas na identificação** → aceita — a comparação
   da identificação ignora caixa, coerente com o padrão do restante do sistema para
   campos desse tipo.
4. **Diferença de maiúsculas/minúsculas no segredo** → recusada — o segredo é
   comparado exatamente como informado, sem normalização.
5. **Campo vazio em qualquer um dos dois** → recusado antes mesmo de comparar
   contra a credencial válida; a tela indica que o campo é obrigatório.
6. **Tentativas repetidas, corretas ou não** → nenhuma delas é limitada, bloqueada
   ou registrada nesta entrega (fora de escopo, R-01).

**Sessão e navegação**

7. **Recarregar a página com sessão ativa** → a sessão persiste; o operador
   continua vendo a tela em que estava, sem ser devolvido à tela de acesso (RF-06).
8. **Recarregar a página sem sessão, numa tela protegida** → o sistema trata como
   uma nova tentativa de alcance sem sessão (Fluxo C) — devolve à tela de acesso.
9. **Encerrar a sessão e usar o botão "voltar" do navegador** → o sistema não
   depende do histórico do navegador para proteger a tela: o retorno cai de novo no
   bloqueio (RF-09), porque a checagem de sessão é feita a cada alcance de tela, não
   uma vez só na primeira visita.
10. **Alcançar a tela de acesso já COM sessão ativa** → comportamento não travado
    por esta entrega; registrado como risco (R-02), não como falha.
11. **Dois separadores/abas do mesmo navegador, uma delas encerra a sessão** →
    comportamento não sincronizado entre abas nesta entrega; registrado como risco
    (R-03).

## 8. Premissas Validadas

1. **Existe exatamente UMA credencial válida nesta entrega.** Não há cadastro de
   múltiplos operadores nem verificação contra uma base de identidades reais — é
   deliberadamente uma demonstração do MECANISMO de acesso (a barreira e a sessão),
   não uma implementação de autenticação real. *(Declarado pelo usuário — decisão de
   escopo desta entrega.)*
2. **A credencial válida é exibida na própria tela de acesso.** Consequência direta
   da premissa 1: sem um cadastro de operadores reais para consultar, esconder a
   única credencial que funciona não protegeria nada — só tornaria a demonstração
   inutilizável para quem chega ao sistema pela primeira vez. *(Declarado pelo
   usuário.)*
3. **Não há distinção de papel entre operadores logados.** Todo operador com sessão
   tem o mesmo alcance; perfis e permissões diferenciadas ficam para entrega futura,
   quando (e se) existir mais de uma credencial. *(Declarado pelo usuário.)*
4. **A sessão sobrevive a um recarregamento da página.** Sem persistência, cada
   atualização do navegador devolveria o operador à tela de acesso — o que
   atrapalharia o uso normal do sistema mais do que protegeria algo. *(Confirmado
   pelo usuário.)*
5. **Não há expiração de sessão por tempo, nem limite de tentativas de acesso.**
   Consequência da premissa 1: mecanismos de proteção contra abuso fazem sentido
   quando há algo real a proteger; nesta demonstração, o próprio segredo é público
   (premissa 2). *(Assumido — consequência lógica de 1 e 2.)*
6. **A recusa de acesso não distingue qual credencial está errada.** É a postura
   correta mesmo quando o segredo é conhecido (premissa 2): a regra do mecanismo é
   generalizável para quando a credencial deixar de ser pública, se a entrega
   evoluir. *(Declarado pelo usuário.)*
7. **Sessão e o cadastro de pessoas (módulo próprio, spec `usuarios`) são
   independentes.** O operador que acessa o sistema não corresponde a nenhum
   registro de Usuário — são conceitos que, nesta entrega, não se cruzam.
   *(Assumido — consequência do escopo desta entrega ser só o mecanismo de acesso.)*

## 9. Riscos

| # | Risco | Impacto | Mitigação |
|---|---|---|---|
| **R-01** | **A credencial pública não é proteção de verdade.** Qualquer pessoa que abra a tela de acesso vê exatamente o que precisa digitar para entrar — não há barreira real contra quem chega ao sistema. | Alto se este sistema for exposto como se fosse produção real; nulo enquanto for reconhecidamente uma demonstração. | Registrado explicitamente como demonstração em toda a documentação do sistema. Se este mecanismo evoluir para proteger algo real, a premissa 1 inteira precisa ser revista antes — não é um ajuste incremental. |
| **R-02** | **Alcançar a tela de acesso já logado tem comportamento indefinido por esta spec.** Pode reexibir o formulário sem necessidade, ou permitir logar por cima da sessão vigente sem aviso. | Baixo — não impede nem corrompe o uso do sistema, só é uma experiência não especificada. | Aceito nesta versão. Se incomodar na prática, especificar em revisão futura (redirecionar quem já tem sessão para longe da tela de acesso). |
| **R-03** | **Sessão não é sincronizada entre abas/janelas do mesmo navegador.** Encerrar a sessão numa aba não avisa outra aba aberta na mesma tela protegida; ela só descobre no próximo alcance de tela (ex.: navegar, recarregar). | Baixo — o operador precisaria ter duas abas abertas deliberadamente para notar. | Aceito nesta versão. Sincronização entre abas (ex.: reagir a mudança no armazenamento local) é candidata a versão futura, não crítica para o mecanismo funcionar. |
| **R-04** | **Uma única credencial não permite auditar QUEM fez o quê.** Toda ação no sistema é atribuída ao mesmo operador, sempre — não há como distinguir duas pessoas diferentes usando a mesma credencial pública. | Médio, se o sistema crescer para precisar de rastreabilidade de ações por pessoa. | Aceito nesta versão (consequência direta da premissa 1). Rastreabilidade por pessoa exige a evolução para múltiplas credenciais reais — fora de escopo aqui. |
</content>
