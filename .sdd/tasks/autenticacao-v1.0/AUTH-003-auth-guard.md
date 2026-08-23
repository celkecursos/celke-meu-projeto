# AUTH-003 — `auth.guard.ts` (bloqueio das telas protegidas)

**Spec:** `.sdd/specs/autenticacao.spec.md` — atende **RF-08, RF-09, RF-10, RF-11**
(Fluxo C; edge cases 8 e 9).

**Nível:** Sênior — um guard é ponto de controle transversal: decide o alcance de
**toda** rota do app, presente e futura, e define o contrato de "para onde o
visitante volta e como o destino original sobrevive". Está explicitamente na alçada
Sênior por `CLAUDE.md` (interceptors/providers/guards).

**Depende de:** AUTH-002.

## Arquivos a criar

- `src/app/core/auth/auth.guard.ts`

## Padrão a seguir

Guard **funcional** (`CanActivateFn`, padrão do Angular 15+), com `inject()` no corpo
— não `CanActivate` de classe. Consulte a skill `angular-docs` se precisar confirmar
a assinatura atual em vez de confiar em memória.

## Contrato — a decisão

- Consulte `autenticado` da `AuthFacade` (AUTH-002). Com sessão, libera; sem sessão,
  bloqueia (RF-09).
- O guard **não lê `ISessao`** nem qualquer campo dela: a decisão é binária, e
  depender da forma da sessão aqui acoplaria o controle de acesso ao modelo de
  domínio sem necessidade.
- O bloqueio vale **independentemente de como o visitante chegou ao endereço** — link
  direto, favorito, endereço digitado, botão "voltar" do navegador (RF-09, edge case
  9). Isso sai de graça de o guard rodar a cada tentativa de alcance de rota, e não
  uma vez só na primeira visita: **não** guarde em variável nem em flag o resultado
  de uma checagem anterior.

## Contrato — o redirecionamento

- Ao bloquear, devolva o visitante à tela de acesso (RF-10) retornando uma **árvore
  de URL** construída pelo `Router` — não navegue imperativamente e não retorne
  `false` seco. Retornar `false` sem destino deixaria o visitante numa tela em branco;
  navegar por efeito colateral concorre com a navegação que o próprio guard está
  cancelando.
- Preserve o **destino pretendido** na URL da tela de acesso, como parâmetro de
  consulta (RF-11). Sem isso, todo acesso bem-sucedido cairia sempre no mesmo lugar e
  o operador teria de navegar de novo até onde queria ir. Use a URL completa que o
  visitante tentou alcançar, tal como o `Router` a entrega ao guard — não só o
  primeiro segmento.
- **Fixe o nome desse parâmetro nesta task**: é contrato entre o guard e a tela de
  acesso (AUTH-004), que vai lê-lo de volta. Documente-o no cabeçalho do arquivo.

## Critérios de aceite

- Sem sessão, alcançar qualquer endereço protegido (inclusive uma sub-rota profunda,
  com parâmetro de rota) devolve à tela de acesso com o destino original preservado
  no parâmetro de consulta.
- Com sessão, o mesmo endereço abre normalmente.
- Recarregar a página numa tela protegida **sem** sessão devolve à tela de acesso
  (edge case 8); **com** sessão, permanece na tela (edge case 7, garantido pela
  persistência de AUTH-002).
- Depois de encerrar a sessão, o botão "voltar" do navegador **não** devolve o acesso
  à tela protegida — o guard roda de novo e bloqueia (edge case 9).
- O guard não injeta nada além da facade e do `Router`, e não contém regra de
  negócio.
- `npm run build` verde.
