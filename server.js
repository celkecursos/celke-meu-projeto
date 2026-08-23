/**
 * server.js — INFRA DE ENTREGA (não é código de aplicação).
 *
 * Serve o bundle estático gerado por `npm run build` e devolve `index.html` em
 * qualquer rota não-arquivo. Esse fallback é o que faz o REFRESH numa rota de SPA
 * (ex.: /produto/editar/3) funcionar em vez de dar 404.
 *
 * Produção (Hostinger, aplicação Node): `npm run serve:prod`.
 * Em desenvolvimento use `npm start` (ng serve) — este arquivo não participa.
 *
 * Agentes de IA: NÃO edite este arquivo em task de feature.
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Descobre `dist/<projeto>/browser` sozinho, em vez de cravar o nome do projeto.
 * É deliberado: o nome vive no `angular.json` e muda de projeto para projeto —
 * cravá-lo aqui produziria a pior falha possível (build verde, boot verde, 404 em
 * tudo, porque o Express procura uma pasta que o Angular não gerou).
 */
function encontrarDist() {
  const raizDist = path.join(__dirname, 'dist');
  if (!fs.existsSync(raizDist)) {
    throw new Error('Pasta `dist/` não existe. Rode `npm run build` antes de servir.');
  }
  const candidatos = fs
    .readdirSync(raizDist, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join(raizDist, e.name, 'browser'))
    .filter((p) => fs.existsSync(path.join(p, 'index.html')));

  if (candidatos.length === 0) {
    throw new Error('Nenhum `dist/<projeto>/browser/index.html` encontrado. Rode `npm run build`.');
  }
  if (candidatos.length > 1) {
    console.warn(`⚠ Mais de um build em dist/ — usando ${candidatos[0]}`);
  }
  return candidatos[0];
}

const DIST = encontrarDist();

// Assets com hash no nome podem ser cacheados com folga; o index.html, nunca.
app.use(
  express.static(DIST, {
    index: false,
    setHeaders(res, filePath) {
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }),
);

// Fallback de SPA: qualquer rota que não seja arquivo cai no index.html.
//
// Express 5 usa `path-to-regexp` v8, onde o curinga PRECISA ser nomeado (`/*rota`);
// o `'*'` do Express 4 lança "Missing parameter name" e o processo morre no boot.
// Como o gate (`npm run check`) não sobe o servidor, esse erro passaria despercebido
// até o deploy — build verde, boot morto, 404 em tudo.
// `/` entra na lista porque o `express.static` acima roda com `index: false` — sem
// isso a raiz do site não casa com nada e responde 404.
app.get(['/', '/*rota'], (_req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servindo ${DIST} em http://localhost:${PORT}`);
});
