# Prompts do tutorial — do zero ao CRUD pelo pipeline SDD

Roteiro de gravação. São **dois módulos**, gravados em sequência: primeiro
**usuários**, depois **campeonatos** (que reusa usuários no pódio).

> **Antes de começar**: abra o Claude Code **dentro do projeto** (`cd celke-meu-projeto`
> e abra lá). Os comandos `/sdd`, `/gerar-tasks`, `/implementar-tasks` e `/revisar-dod`
> só carregam a partir da raiz do projeto.

## Passo 0 — garantir que os comandos existem (faça isto antes de gravar)

Os comandos são escritos em `.ai/workflows/` (versionado), mas o Claude Code só lê
**`.claude/commands/`** — uma **cópia** gerada por `npm run setup:ai`. Essa pasta é
**gitignored**: em clone novo, ou se o `postinstall` não rodou, ela simplesmente não
existe e **todo comando do pipeline falha** com `Unknown command: /sdd`.

```bash
npm run setup:ai        # duplica .ai/ → .claude/ (rules, skills, commands, agents)
ls .claude/commands     # tem que listar: gerar-tasks · implementar-tasks · revisar-dod · sdd
```

Se a pasta acabou de ser criada, **reinicie o Claude Code** (`/exit` e abrir de novo):
os slash commands são varridos na inicialização, então a sessão já aberta continua
sem enxergar os arquivos novos.

> No Windows a projeção é **cópia**, não symlink — `.claude/` é um *snapshot*. Editou
> algo em `.ai/`? rode `npm run setup:ai` de novo, senão o agente segue lendo a versão
> antiga.

Cada módulo passa por 3 fases e **3 portões humanos** (⛔) — nada avança sozinho:

```
/sdd <ideia>                        → .sdd/specs/<slug>.spec.md      ⛔ APROVAR a spec
/gerar-tasks <spec>                 → .sdd/tasks/<slug>-v<versão>/   ⛔ REVISAR as tasks
/implementar-tasks <readme> <spec>  → código                         ⛔ REVISAR o diff
/revisar-dod                        → varredura do Definition of Done
```

> ## ⚠ Leia antes de colar os comandos das Fases 2 e 3
>
> **Só o prompt do `/sdd` é para colar cru.** Os comandos `/gerar-tasks` e
> `/implementar-tasks` recebem **caminhos de arquivo que ainda não existem** quando
> você começa a gravar:
>
> - o **slug da spec** é escolhido pela IA na Fase 1 (`usuarios.spec.md`,
>   `gerenciar-usuarios.spec.md`, `cadastro-usuarios.spec.md`…);
> - a **versão** da pasta de tasks vem do frontmatter da spec (`v1.0`, `v1`…).
>
> Os caminhos escritos abaixo são o palpite mais provável, **não uma garantia**.
> Antes de colar, confirme o caminho real — é um comando só, e evita um erro de
> "arquivo não encontrado" na frente da câmera:
>
> ```bash
> ls .sdd/specs/          # antes do /gerar-tasks
> ls .sdd/tasks/          # antes do /implementar-tasks
> ```
>
> Use o que aparecer na tela. A IA também informa o caminho ao salvar a spec — no
> take, vale ler em voz alta e conferir.

---

# MÓDULO 1 — Usuários

## Prompt 1.1 — gerar a spec (Fase 1)

> Cole isto no chat. A IA vai confirmar premissas e escrever a spec.

```
/sdd CRUD para gerenciar usuários do sistema — a base de quem depois vai participar
dos campeonatos.

Já decidi o seguinte, use como ponto de partida e me pergunte só o que ainda estiver
de fato em aberto (1 rodada de perguntas, no máximo 5):

ESCOPO
- Listar usuários com busca por nome e por e-mail e filtro por situação.
- A listagem NÃO tem ordenação por coluna: a ordem é fixa, definida pelo sistema
  (data de cadastro decrescente, mais recentes primeiro).
- Cadastrar, editar, visualizar e inativar usuário.
- A listagem é paginada.

DADOS DO USUÁRIO
- Nome completo, e-mail, apelido (como ele aparece nos rankings de campeonato),
  situação (ativo ou inativo) e data de cadastro.
- O e-mail é único no sistema e é o identificador de negócio.
- O apelido é opcional; quando vazio, o sistema mostra o primeiro nome.

REGRAS
- Não existe exclusão física: inativar é a única forma de tirar alguém de circulação.
- Usuário inativo não pode ser inscrito em campeonato novo, mas continua aparecendo
  no histórico dos campeonatos que já disputou.
- E-mail duplicado é recusado com mensagem clara, tanto no cadastro quanto na edição.

FORA DO ESCOPO (não especifique isto)
- Login, senha, autenticação, permissões e perfis de acesso.
- Upload de foto/avatar.
- Notificação por e-mail.

O formulário deve abrir como PÁGINA (não modal).
```

**⛔ Portão 1** — a IA para e pergunta se você aprova. Leia as 9 seções na tela
(é o momento de mostrar os `RF-NN`, que são a rastreabilidade do pipeline) e responda
**"Sim, aprovo"**.

## Prompt 1.2 — gerar as tasks (Fase 2)

**Antes**, confirme o nome real da spec que acabou de ser aprovada:

```bash
ls .sdd/specs/
```

Agora chame a Fase 2 com **o caminho que apareceu** (o abaixo é o palpite provável):

```
/gerar-tasks .sdd/specs/usuarios.spec.md
```

**⛔ Portão 2** — revise o `README.md` das tasks: ordem de execução, grafo de
dependências e o `Nível:` de cada uma. Mostre na gravação que a task de **fiação** é
a última e é a única que mexe em `app.routes.ts` e `estrutura.layout.ts`.

## Prompt 1.3 — implementar (Fase 3)

**Antes**, confirme o nome real da pasta de tasks (o `-v<versão>` sai da spec):

```bash
ls .sdd/tasks/
```

A Fase 3 recebe **dois** caminhos — o `README.md` das tasks **e** a spec:

```
/implementar-tasks .sdd/tasks/usuarios-v1.0/README.md .sdd/specs/usuarios.spec.md
```

**⛔ Portão 3** — revise o diff. Depois feche o ciclo:

```
/revisar-dod
```

E rode o gate:

```
npm run check
```

---

# MÓDULO 2 — Campeonatos

> Grave este bloco **depois** que o módulo de usuários existir. É aqui que aparece a
> **regra do espelho**: com `src/app/modules/usuarios/` no lugar, ele vira o espelho
> vivo e o novo módulo segue o estilo dele.

## Prompt 2.1 — gerar a spec (Fase 1)

```
/sdd CRUD para administrar campeonatos, os usuários que participaram de cada
campeonato e quem ficou em primeiro, segundo e terceiro lugar.

Já decidi o seguinte, use como ponto de partida e me pergunte só o que ainda estiver
de fato em aberto (1 rodada de perguntas, no máximo 5):

ESCOPO
- Listar campeonatos com busca por nome, filtro por situação e por ano, ordenação
  pelas colunas e paginação.
- Cadastrar, editar e visualizar campeonato.
- Dentro de um campeonato: inscrever participantes (usuários já cadastrados),
  remover participante e definir o pódio.

DADOS DO CAMPEONATO
- Nome, descrição, data de início, data de término, local e situação.
- Situação do campeonato: planejado, em andamento, encerrado ou cancelado.

PARTICIPANTES
- Participante é sempre um usuário já cadastrado — não se digita nome solto.
- O mesmo usuário não pode ser inscrito duas vezes no mesmo campeonato.
- Usuário inativo não pode ser inscrito, mas quem já estava inscrito antes de ser
  inativado permanece no histórico do campeonato.
- Dá para remover um participante enquanto o campeonato não estiver encerrado.

PÓDIO (a regra central deste módulo)
- O pódio tem exatamente três posições: primeiro, segundo e terceiro lugar.
- Só quem está inscrito no campeonato pode ocupar uma posição do pódio.
- O mesmo usuário não pode ocupar duas posições ao mesmo tempo.
- O pódio só pode ser definido quando o campeonato é encerrado.
- Campeonato cancelado não tem pódio.
- Campeonato com menos de três participantes pode ter pódio incompleto (por exemplo,
  só primeiro e segundo) — o sistema não deve travar por causa disso.
- Depois de encerrado, alterar o pódio é possível, mas deve ser uma ação consciente.

REGRAS DE SITUAÇÃO
- Campeonato encerrado não aceita inscrição nova.
- Campeonato cancelado não aceita inscrição nem pódio.
- A listagem de campeonatos mostra o campeão de cada campeonato já encerrado.

FORA DO ESCOPO (não especifique isto)
- Chaveamento, rodadas, partidas, placar e pontuação corrida.
- Premiação em dinheiro, pagamento e inscrição paga.
- Regulamento em anexo e upload de arquivo.

O formulário do campeonato deve abrir como PÁGINA. A tela de participantes e pódio
faz parte do campeonato, não é um módulo separado.
```

**⛔ Portão 1** — aprove a spec.

## Prompt 2.2 — gerar as tasks (Fase 2)

Confirme o nome real da spec (agora há **duas** em `.sdd/specs/` — pegue a de
campeonatos):

```bash
ls .sdd/specs/
```

```
/gerar-tasks .sdd/specs/campeonatos.spec.md
```

**⛔ Portão 2** — revise as tasks.

## Prompt 2.3 — implementar (Fase 3)

```bash
ls .sdd/tasks/
```

```
/implementar-tasks .sdd/tasks/campeonatos-v1.0/README.md .sdd/specs/campeonatos.spec.md
```

**⛔ Portão 3** — revise o diff, depois:

```
/revisar-dod
npm run check
```

---

# Colas para a gravação

**Se a IA começar a falar de Angular, componente ou nome de arquivo na Fase 1:**

```
Pare — estamos na Fase 1. A spec é agnóstica de tecnologia: só domínio (atores,
regras, estados, contratos, edge cases). Nada de framework, componente ou arquivo.
```

**Se ela pular o portão e quiser implementar direto:**

```
Não avance. Estamos no portão de aprovação — quero revisar antes de qualquer código.
```

**Se você colar um caminho que não existe (o erro mais provável da gravação):**

```
O caminho que passei não existe. Liste .sdd/specs/ e .sdd/tasks/, me diga o caminho
correto e siga a partir dele.
```

**Se um comando responder `Unknown command: /implementar-tasks` (ou qualquer outro):**

Não é erro de argumento — é o `.claude/` que não foi gerado. No terminal:

```bash
npm run setup:ai
ls .claude/commands
```

Reabra o Claude Code e repita o comando. Nada se perde: `.sdd/` (specs e tasks) é
versionado; `.claude/` é só a cópia de `.ai/`.

**Se você quiser mudar algo depois da spec pronta (mostra o retrabalho iterativo):**

```
Ajuste a spec: <o que mudar>. Depois me mostre de novo para aprovação.
```

**Para mostrar a rastreabilidade na tela (bom momento de fechar o vídeo):**

```
Me mostre o caminho de rastreabilidade de um requisito: escolha um RF da spec de
campeonatos e liste a task que o atende e os arquivos que a task gerou.
```
