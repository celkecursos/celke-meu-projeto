---
name: write-specs
description: Use ao transformar uma ideia crua de feature/módulo numa especificação técnica rigorosa e AGNÓSTICA de tecnologia — descoberta socrática, validação de premissas, template de 9 seções em .sdd/specs/, e parada obrigatória para aprovação humana antes de virar tasks ou código. É a Fase 1 do SDD (comando /sdd).
---

# Skill: Escrever Especificações (Fase 1 do SDD)

Seu objetivo é transformar a ideia crua do usuário numa **especificação técnica
rigorosa e agnóstica de tecnologia**, e **parar para aprovação**. A spec é o
CONTRATO que governa as fases seguintes — decisão errada custa muito menos aqui do
que em código.

## Regras de operação

- **Agnosticismo radical.** A spec descreve o QUÊ e o PORQUÊ (atores, regras,
  estados, contratos, edge cases) — **nunca** o COMO técnico. Não cite linguagem,
  framework, componente, biblioteca ou nome de arquivo. **Zero código/pseudocódigo/SQL.**
- **Onde salvar:** `.sdd/specs/<feature-slug>.spec.md` (kebab-case, ex.:
  `cadastro-relatorios.spec.md`).
- **Portão de aprovação:** você DEVE pausar e perguntar explicitamente se o usuário
  aprova, antes de qualquer avanço.
- **Retrabalho iterativo:** se o usuário comentar inline na spec ou pedir mudanças,
  releia o documento, aplique e peça aprovação de novo.

## Instruções (nesta ordem)

1. **Analise** a ideia inicial em profundidade.
2. **Descoberta socrática:** faça **até 5 perguntas cirúrgicas por rodada** para
   mapear o desconhecido — o "porquê" de negócio, o "e se" de edge case, conflitos
   lógicos, escala. Desafie complexidade (**YAGNI**: se a solução parece complexa
   demais, proponha simplificar).
3. **Valide Premissas e Riscos:** apresente uma lista de premissas/riscos para o
   usuário **confirmar ANTES** de redigir a spec final.
4. **Redija** no template canônico de 9 seções (abaixo).
5. **Salve** em `.sdd/specs/<slug>.spec.md`.
6. **Pare** e pergunte, literalmente: _"Esta é a especificação baseada na nossa
   conversa. Revise cada seção (comente inline ou peça alterações). Você aprova?"_
   Só avance para `/gerar-tasks` após um **"Sim"** explícito.

## Template canônico (9 seções)

```markdown
---
feature: <slug>
versao: 1.0
status: rascunho | aprovada
data: <AAAA-MM-DD>
autor: pm-spec-architect
---

# <Nome da feature>

## 1. Resumo Executivo
O problema, o valor de negócio e o escopo (o que ENTRA e o que fica FORA).

## 2. Atores e Papéis
Quem usa/é afetado, e o que cada papel pode fazer.

## 3. Requisitos Funcionais
Lista numerada `RF-01`, `RF-02`… no formato "O sistema DEVE…". Verificáveis,
sem ambiguidade. Cada arquivo criado na implementação rastreia para um RF.

## 4. Modelo de Domínio
As entidades, seus atributos e relações (em linguagem de negócio, não de banco).

## 5. Máquina de Estados / Fluxos
Estados de cada entidade e as transições; o passo-a-passo dos fluxos principais.

## 6. Contratos de Interface
As trocas de dados esperadas (entradas/saídas por operação) descritas em termos de
domínio — nomes de campo e significado, não tipos de linguagem.

## 7. Edge Cases
Erros, concorrência, vazios, limites, permissões — o que costuma quebrar.

## 8. Premissas Validadas
O que assumimos (e o usuário confirmou) para poder especificar.

## 9. Riscos
O que pode dar errado no negócio/na entrega, e a mitigação.
```

## Log de mudanças

Ao revisar uma spec já aprovada, incremente `versao`, mude `status` e registre a
mudança num bloco de changelog (mais recente no topo, imutável) — a rastreabilidade
depende disso.
