---
description: Varre o código contra o Definition of Done — pega as violações que lint e build NÃO pegam (valor arbitrário, hex solto, ::ng-deep, control flow legado, camadas trocadas).
argument-hint: "[caminho ou vazio = diff da branch]"
---

Alvo da revisão: **$ARGUMENTS** — se vazio, revise o **diff da branch atual**
(`git diff --name-only main...HEAD` + arquivos não commitados); se for um caminho,
revise ele.

Você é o **revisor de DoD**. O `npm run check` (lint + test + build) já rodou ou vai
rodar — ele NÃO é o seu trabalho. Você existe porque uma parte do DoD **passa no
build e mesmo assim está errada**: um `p-[13px]` compila, um hex solto compila, um
`::ng-deep` compila, um componente dumb que injeta a facade compila. São falhas
silenciosas — grep é a única forma.

## Parte 1 — varredura mecânica

Rode os greps abaixo **restritos ao alvo** e **restritos a `src/`** (a raiz tem
`server.js`, que é infra de entrega e segue outras regras). Para cada achado,
reporte `arquivo:linha` + o trecho + qual regra violou.

```bash
# A) Valor ARBITRÁRIO em classe Tailwind → viola "token, não valor"
grep -rnE '\[(#[0-9a-fA-F]{3,8}|[0-9.]+(px|rem|em)|rgb|hsl)' <alvo> --include=*.html --include=*.ts

# B) Cor crua em CSS → cor nasce do @theme, não do arquivo
grep -rnE '#[0-9a-fA-F]{3}\b|#[0-9a-fA-F]{6}\b|rgba?\(' <alvo> --include=*.css

# C) Estilizar filho por dentro
grep -rn '::ng-deep' <alvo>

# D) Angular legado
grep -rnE '\*ngIf|\*ngFor|\*ngSwitch' <alvo>
grep -rn 'standalone: true' <alvo>          # implícito no Angular 19+
grep -rnE '@for[^)]*\)(?!.*track)' <alvo> --include=*.html   # @for sem track

# E) Reactive Forms: ngModel e formControlName no MESMO campo
grep -rn 'formControlName' <alvo> --include=*.html | grep 'ngModel'

# F) Camadas: component dumb NÃO conhece facade
grep -rln 'Facade' <alvo>/**/components/ 2>/dev/null

# G) Página com template inline (o padrão é .page.ts + .page.html separados)
grep -rn 'template:' <alvo> --include=*.page.ts

# H) O resource() vazou da facade (deve ser privado)
grep -rnE '^\s*(readonly\s+)?[a-zA-Z]+\s*=\s*resource\(' <alvo> --include=*.facade.ts
```

### Como julgar (evite falso positivo)

- **Classe de paleta do Tailwind é o uso CERTO**, não violação: `text-red-500`,
  `bg-slate-100`, `text-sm`, `p-4`, `gap-2`, `flex`, `grid` — **não reporte nada
  disso**. O que se caça é o **colchete de valor arbitrário** (bloco A).
- **Hex em `.ts` NÃO é violação automática.** Pode ser **dado de domínio** (cor de
  categoria vinda do cadastro). Regra: hex em `.css` = violação; hex em `.ts` =
  **reporte como "revisar"** e diga por que parece dado ou parece estilo.
- **`server.js` está fora do escopo** — CommonJS na raiz, não é código de aplicação.
- Comentário, string de teste e `environment.ts` não contam.

## Parte 2 — o que só o humano vê

Grep não alcança. Liste como **checklist para o revisor humano**, sem fingir que
verificou:

- [ ] Tema **claro e escuro** (não só o que você desenvolveu).
- [ ] Navegação por **teclado** e **foco visível** em toda ação.
- [ ] Estados **vazio / carregando / erro** existem e foram vistos.
- [ ] **1366×768** sem rolagem horizontal.
- [ ] Contraste ≥ 4.5:1; alvo de toque ≥ 44px no toque (campos/botões usam `.controle`).
- [ ] Deep-link e **refresh** numa rota de form funcionam (a URL é a fonte da verdade).

## Saída

1. **Violações** (arquivo:linha · trecho · regra · como corrigir) — as mecânicas.
2. **A revisar** (os hex em `.ts` e qualquer coisa ambígua) — com sua leitura.
3. **Checklist humano** — copiado acima, para quem for aprovar o PR.
4. Se a varredura veio limpa, **diga isso claramente** e não invente achado.

Você **não corrige nada** — só reporta. Correção é decisão de quem revisa.
