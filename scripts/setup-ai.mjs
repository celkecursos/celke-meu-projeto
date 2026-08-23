#!/usr/bin/env node
/**
 * setup-ai.mjs — Projeção de `.ai/` para os diretórios que cada ferramenta de IA
 * descobre automaticamente.
 *
 * Fonte única de verdade: `.ai/`
 * Destinos (Claude Code):
 *   - `.claude/rules`    ← `.ai/rules`      (regras nativas; `paths` escopam)
 *   - `.claude/skills`   ← `.ai/skills`     (cada skill = `<nome>/SKILL.md`)
 *   - `.claude/commands` ← `.ai/workflows`  (fase 2 — SDD; pula se ausente)
 *   - `.claude/agents`   ← `.ai/agents`     (fase 2 — SDD; pula se ausente)
 *
 * Estratégia: symlink (POSIX/Windows-dev) com fallback para cópia recursiva.
 * Idempotente. Os destinos são gitignored; só `.ai/` + este script são versionados.
 *
 * Uso: `npm run setup:ai` ou `node scripts/setup-ai.mjs`
 */

import { promises as fs } from 'node:fs';
import { existsSync, lstatSync } from 'node:fs';
import { join, relative, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const AI_DIR = join(ROOT, '.ai');

/** Projeções de diretório inteiro: destino ← fonte. */
const dirLinks = [
  { source: '.ai/rules', dest: '.claude/rules' },
  { source: '.ai/skills', dest: '.claude/skills' },
  // Fase 2 (SDD) — ativam sozinhas quando as pastas existirem:
  { source: '.ai/workflows', dest: '.claude/commands' },
  { source: '.ai/agents', dest: '.claude/agents' },
];

// ---------- helpers ----------

async function isSymlink(p) {
  try {
    return lstatSync(p).isSymbolicLink();
  } catch {
    return false;
  }
}

async function removeIfExists(p) {
  if (!existsSync(p) && !(await isSymlink(p))) return;
  if (await isSymlink(p)) {
    await fs.unlink(p);
    return;
  }
  const stat = lstatSync(p);
  if (stat.isDirectory()) {
    await fs.rm(p, { recursive: true, force: true });
  } else {
    await fs.unlink(p);
  }
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

/** Symlink de `dest` → `source`; fallback para cópia (Windows sem privilégio). */
async function linkOrCopy(absSource, absDest) {
  await removeIfExists(absDest);
  await ensureDir(dirname(absDest));
  const relSource = relative(dirname(absDest), absSource);
  try {
    await fs.symlink(relSource, absDest, 'dir');
    return 'symlink';
  } catch (err) {
    if (err.code === 'EPERM' || err.code === 'EACCES' || err.code === 'ENOENT') {
      await fs.cp(absSource, absDest, { recursive: true, force: true });
      return 'copy';
    }
    throw err;
  }
}

// ---------- execução ----------

async function main() {
  if (!existsSync(AI_DIR)) {
    // Sem `.ai/` não há o que projetar. Não é erro (ex.: postinstall num
    // checkout antigo) — avisa e sai limpo para não quebrar o `npm install`.
    console.warn('ℹ Sem `.ai/` — nada a projetar.');
    return;
  }

  let symlinks = 0;
  let copies = 0;
  let skipped = 0;

  for (const { source, dest } of dirLinks) {
    const absSource = join(ROOT, source);
    const absDest = join(ROOT, dest);

    if (!existsSync(absSource)) {
      console.warn(`  [skip] fonte ausente: ${source}`);
      skipped++;
      continue;
    }

    const result = await linkOrCopy(absSource, absDest);
    if (result === 'symlink') {
      console.log(`  [link] ${dest} → ${source}`);
      symlinks++;
    } else {
      console.log(`  [copy] ${dest} ← ${source}`);
      copies++;
    }
  }

  console.log('');
  console.log(`✓ Setup de IA concluído. symlinks: ${symlinks}, cópias: ${copies}, ignorados: ${skipped}`);

  if (copies > 0 && symlinks === 0) {
    console.log('');
    console.log('ℹ Artefatos copiados (symlinks indisponíveis). Rode `npm run setup:ai` de novo após mudar `.ai/`.');
  }
}

main().catch((err) => {
  console.error('✗ Falha no setup de IA:', err);
  process.exit(1);
});
