/**
 * Teste do predicado de filtro de `usuario-api.service.ts` — a semântica de busca
 * (RF-03) e filtro de situação (RF-04) que o "backend fiel" aplica antes de ordenar
 * e paginar. Função pura, sem `HttpClient`.
 *
 * Estilo: um `describe` por função · nome do caso descreve a REGRA em português ·
 * caso-limite explícito.
 */
import { describe, expect, it } from 'vitest';

import { casaFiltrosUsuario } from './usuario-api.service';
import { IUsuario, IUsuarioFiltros } from './usuario.models';

function criarUsuario(dados: Partial<IUsuario>): IUsuario {
  return {
    id: '1',
    nomeCompleto: 'Usuário Padrão',
    email: 'padrao@exemplo.com',
    apelido: '',
    situacao: 'ativo',
    dataCadastro: '2026-01-01T00:00:00.000Z',
    ...dados,
  };
}

function criarFiltros(dados: Partial<IUsuarioFiltros> = {}): IUsuarioFiltros {
  return { busca: '', situacao: '', ...dados };
}

describe('casaFiltrosUsuario', () => {
  it('casa por trecho contido no nome completo, sem diferenciar caixa (RF-03)', () => {
    const usuario = criarUsuario({ nomeCompleto: 'João da Silva' });
    expect(casaFiltrosUsuario(usuario, criarFiltros({ busca: 'joão da' }))).toBe(true);
  });

  it('casa por trecho contido no e-mail (RF-03)', () => {
    const usuario = criarUsuario({ email: 'joao.silva@exemplo.com' });
    expect(casaFiltrosUsuario(usuario, criarFiltros({ busca: 'silva@exemplo' }))).toBe(true);
  });

  it('não casa quando o trecho não existe nem no nome nem no e-mail', () => {
    const usuario = criarUsuario({ nomeCompleto: 'João da Silva', email: 'joao@exemplo.com' });
    expect(casaFiltrosUsuario(usuario, criarFiltros({ busca: 'maria' }))).toBe(false);
  });

  it('LIMITE: busca vazia casa com tudo — lista cheia antes de o operador digitar', () => {
    const usuario = criarUsuario({});
    expect(casaFiltrosUsuario(usuario, criarFiltros({ busca: '' }))).toBe(true);
  });

  it('filtro de situação restringe ao valor exato (RF-04)', () => {
    const inativo = criarUsuario({ situacao: 'inativo' });
    expect(casaFiltrosUsuario(inativo, criarFiltros({ situacao: 'ativo' }))).toBe(false);
    expect(casaFiltrosUsuario(inativo, criarFiltros({ situacao: 'inativo' }))).toBe(true);
  });

  it('LIMITE: filtro de situação "" (todos) não restringe nada', () => {
    const ativo = criarUsuario({ situacao: 'ativo' });
    const inativo = criarUsuario({ situacao: 'inativo' });
    expect(casaFiltrosUsuario(ativo, criarFiltros({ situacao: '' }))).toBe(true);
    expect(casaFiltrosUsuario(inativo, criarFiltros({ situacao: '' }))).toBe(true);
  });

  it('combina busca e situação com E lógico (RF-07)', () => {
    const usuario = criarUsuario({ nomeCompleto: 'João da Silva', situacao: 'ativo' });
    expect(casaFiltrosUsuario(usuario, criarFiltros({ busca: 'joão', situacao: 'ativo' }))).toBe(true);
    expect(casaFiltrosUsuario(usuario, criarFiltros({ busca: 'joão', situacao: 'inativo' }))).toBe(false);
    expect(casaFiltrosUsuario(usuario, criarFiltros({ busca: 'maria', situacao: 'ativo' }))).toBe(false);
  });
});
