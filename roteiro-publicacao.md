# Roteiro de publicação — título, abertura, descrição, capítulos e thumbnail

Complemento de `prompts-tutorial.md`. Lá está **o que fazer na frente da câmera**;
aqui está **o que vai no ar junto com o vídeo**.

Baseado no estado real do projeto: Angular 21, pipeline SDD com 4 comandos e 3
portões humanos, `npm run check` como gate, e deploy GitHub → Hostinger via
aplicação Node (`server.js` + `npm run serve:prod`).

---

## 1. Título

**Escolhido:**

```
Criei um projeto Angular do ZERO usando SDD (Spec + Task) — e coloquei no ar em 10 minutos
```

Ordem deliberada: `Angular` e `do ZERO` capturam a busca; `SDD (Spec + Task)`
entrega o diferencial; `coloquei no ar` fecha como consequência, não como anúncio.

**Reservas para teste A/B de thumbnail:**

| # | Título | Quando usar |
|---|--------|-------------|
| 2 | Angular + SDD: o método de Spec e Task que mudou como eu programo (com deploy real no final) | público mais técnico |
| 3 | Pare de programar sem Spec: criando um projeto Angular com SDD, Task por Task | público iniciante em SDD |
| 4 | Do Spec ao site no ar: Angular com SDD do início ao deploy | canal com audiência já fiel |

---

## 2. Abertura (primeiros 15 segundos)

### Teaser (0:00–0:05) — grave por último

Mostre o site **já publicado**, acessível pelo domínio, navegando na listagem de
usuários. Fale por cima:

> "Esse projeto aqui não existia há uma hora."

### Fala de abertura (0:05–0:20)

> "A maioria dos devs abre o editor e já começa a codar — e é exatamente por isso
> que o projeto trava na metade. Hoje eu vou fazer diferente: eu vou escrever a
> **spec**, quebrar em **tasks**, e só depois deixar o **Angular** ser construído.
> No final desse vídeo, o projeto não vai estar rodando no localhost… ele vai estar
> **no ar, com domínio, funcionando pra qualquer pessoa acessar**. Do zero ao
> deploy, em um vídeo só."

**Variação curta**, se o teaser já tiver gasto 8 segundos:

> "Nesse vídeo eu crio um projeto Angular inteiro sem escrever uma linha de código
> antes da spec. Spec → task → implementação → e o site no ar. Se você nunca ouviu
> falar de SDD, os próximos minutos vão mudar como você começa qualquer projeto."

### Promessa de retenção (0:20–0:30)

Diga explicitamente onde está a recompensa — é o que segura até o fim:

> "Fica até o final, porque o deploy eu não vou cortar: você vai ver o build
> rodando no servidor e o site respondendo no domínio, erro por erro, do jeito que
> acontece de verdade."

---

## 3. Capítulos (timestamps)

Ajuste os minutos depois da edição; a **ordem** é o que importa.

```
00:00  O erro que trava 90% dos projetos
00:30  O que é SDD (Spec-Driven Development) em 1 minuto
01:40  O projeto que vamos criar
02:30  Setup: Angular 21 + o pipeline de 4 comandos
04:00  FASE 1 — Escrevendo a spec com /sdd
07:30  ⛔ Portão 1: aprovando a spec (e por que a IA para aqui)
09:00  FASE 2 — /gerar-tasks: quebrando a spec em tasks
11:30  ⛔ Portão 2: lendo o grafo de dependências
13:00  FASE 3 — /implementar-tasks: o código nasce
17:00  ⛔ Portão 3: revisando o diff
18:30  /revisar-dod + npm run check (o gate)
20:00  Segundo módulo: a regra do espelho na prática
25:00  🎁 BÔNUS: colocando o projeto no ar (deploy)
26:00  Build no servidor e os 3 erros que todo mundo toma
29:00  O site no ar, com domínio
30:30  Rastreabilidade: do RF até o arquivo gerado
```

O capítulo do deploy leva o emoji e a palavra **BÔNUS** — é o que faz ele ser lido
como presente, e não como propaganda.

---

## 4. Descrição do vídeo

```
Eu criei um projeto Angular inteiro sem escrever uma linha de código antes da
spec — e no final coloquei ele no ar, com domínio, funcionando.

Esse é o método SDD (Spec-Driven Development): você escreve a ESPECIFICAÇÃO do que
o sistema faz, quebra em TASKS pequenas e rastreáveis, e só então o código é
implementado. Entre cada fase existe um portão humano: nada avança sem a sua
aprovação.

Neste tutorial você vai ver, do zero e sem cortes:

✅ O que é SDD e por que ele resolve o "projeto que trava na metade"
✅ Escrevendo uma spec de verdade (agnóstica de tecnologia)
✅ Quebrando a spec em tasks com grafo de dependências
✅ A implementação em Angular 21 saindo das tasks
✅ Os 3 portões de aprovação — onde você mantém o controle
✅ Definition of Done e o gate automatizado (lint + testes + build)
✅ Rastreabilidade: do requisito RF-01 até o arquivo que nasceu dele

🎁 BÔNUS — DEPLOY: no final eu não paro no localhost. Eu coloco o projeto no ar de
verdade: build no servidor, aplicação Node configurada, e o site respondendo no
domínio. Inclusive os erros que aparecem no caminho (versão de Node, devDependencies
faltando, rota que dá 404 no refresh) — porque é isso que acontece quando você
publica pela primeira vez.

⏱ CAPÍTULOS
[colar os capítulos da seção 3]

🔗 LINKS
Projeto no GitHub: [link]
Hospedagem usada no deploy: [link de afiliado Hostinger]
Cupom de desconto: [cupom]

🛠 STACK
Angular 21 · TypeScript · Tailwind · Vitest · ESLint · Node/Express
Pipeline SDD: /sdd → /gerar-tasks → /implementar-tasks → /revisar-dod

💬 Ficou com dúvida em alguma fase? Comenta aqui embaixo qual — eu respondo todos.

#angular #sdd #specdriven #desenvolvimento #deploy #programacao
```

> **Marcação de patrocínio:** se houver contrato ou link de afiliado, marque
> "contém promoção paga" no YouTube Studio e mantenha a divulgação do link na
> descrição. Marcar não reduz alcance; deixar de marcar é risco de monetização.

---

## 5. Thumbnail

Máximo **4 palavras**, legíveis em 120px de largura.

| Opção | Texto | Visual |
|-------|-------|--------|
| A ✅ | `SPEC → TASK → NO AR` | 3 blocos com seta, o último verde/aceso |
| B | `SEM SPEC, SEM CÓDIGO` | editor riscado em vermelho ao lado do doc da spec |
| C | `DO ZERO AO AR` | split: terminal à esquerda, site no domínio à direita |

Elementos que ajudam nas três: o logo do Angular reconhecível, e um selo pequeno
`BÔNUS: DEPLOY` num canto — reforça o valor extra sem virar o assunto principal.

---

## 6. Fixar no comentário (logo após publicar)

```
📌 A sequência exata dos comandos está no README do repositório: [link]

Ordem do pipeline:
/sdd <ideia>  →  ⛔ aprovar spec
/gerar-tasks <spec>  →  ⛔ revisar tasks
/implementar-tasks <tasks> <spec>  →  ⛔ revisar diff
/revisar-dod  +  npm run check

E sim, o deploy do final funciona igual em qualquer hospedagem com Node — o que
muda é só onde você configura a versão do Node e o comando de start.
```

Essa última frase é importante: ela deixa o conteúdo **honesto e reaproveitável**,
o que aumenta a credibilidade — e, na prática, converte mais do que exclusividade
forçada.
```
