import { describe, expect, it } from 'vitest';

import { CREDENCIAL_DEMO, credencialValida } from './auth.models';

describe('credencialValida', () => {
  it('aceita a combinação correta de e-mail e senha', () => {
    expect(credencialValida(CREDENCIAL_DEMO.email, CREDENCIAL_DEMO.senha)).toBe(true);
  });

  it('ignora diferença de caixa no e-mail (edge case 3)', () => {
    expect(credencialValida('DEMO@CELKE.COM', CREDENCIAL_DEMO.senha)).toBe(true);
  });

  it('ignora espaços nas extremidades do e-mail (edge case 3)', () => {
    expect(credencialValida('  demo@celke.com  ', CREDENCIAL_DEMO.senha)).toBe(true);
  });

  it('NÃO normaliza a senha — caixa diferente da aceita é recusada (edge case 4)', () => {
    expect(credencialValida(CREDENCIAL_DEMO.email, 'DEMO1234')).toBe(false);
  });

  it('NÃO normaliza a senha — espaços nas extremidades são recusados (edge case 4)', () => {
    expect(credencialValida(CREDENCIAL_DEMO.email, '  demo1234  ')).toBe(false);
  });

  it('recusa quando só o e-mail está correto e a senha está errada (edge case 2)', () => {
    expect(credencialValida(CREDENCIAL_DEMO.email, 'outrasenha')).toBe(false);
  });

  it('recusa quando só a senha está correta e o e-mail está errado (edge case 2)', () => {
    expect(credencialValida('outro@email.com', CREDENCIAL_DEMO.senha)).toBe(false);
  });

  it('LIMITE: e-mail bem formado mas diferente do aceito recebe a mesma recusa (edge case 1)', () => {
    expect(credencialValida('visitante@empresa.com', CREDENCIAL_DEMO.senha)).toBe(false);
  });

  it('LIMITE: e-mail ou senha vazios não bloqueiam a função — só mais uma combinação que não bate', () => {
    expect(credencialValida('', CREDENCIAL_DEMO.senha)).toBe(false);
    expect(credencialValida(CREDENCIAL_DEMO.email, '')).toBe(false);
    expect(credencialValida('', '')).toBe(false);
  });
});
