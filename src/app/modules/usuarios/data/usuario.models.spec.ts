/**
 * Teste da lógica de domínio de `usuario.models.ts` — o primeiro exemplar de teste
 * de módulo do projeto (espelha o estilo de `core/data/consulta.spec.ts`).
 *
 * Estilo: um `describe` por função · nome do caso descreve a REGRA em português ·
 * caso-limite explícito.
 */
import { describe, expect, it } from 'vitest';

import {
  IUsuario,
  apelidoDisponivel,
  emailDisponivel,
  nomeExibicao,
  normalizarCampo,
  primeiroNome,
  usuarioParaRotulo,
} from './usuario.models';

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

describe('normalizarCampo', () => {
  it('despreza espaços nas extremidades', () => {
    expect(normalizarCampo('  João Silva  ')).toBe('João Silva');
  });

  it('trata nulo e indefinido como texto vazio em vez de quebrar', () => {
    expect(normalizarCampo(null)).toBe('');
    expect(normalizarCampo(undefined)).toBe('');
  });
});

describe('primeiroNome', () => {
  it('extrai o primeiro trecho não vazio do nome completo', () => {
    expect(primeiroNome('João da Silva')).toBe('João');
  });

  it('despreza espaços nas extremidades antes de extrair', () => {
    expect(primeiroNome('  Maria Souza')).toBe('Maria');
  });

  it('LIMITE: nome com um único termo devolve o próprio termo (edge case 9)', () => {
    expect(primeiroNome('Madonna')).toBe('Madonna');
  });

  it('LIMITE: espaços múltiplos entre termos não geram trecho vazio (edge case 10)', () => {
    expect(primeiroNome('Ana    Paula   Ribeiro')).toBe('Ana');
  });
});

describe('nomeExibicao', () => {
  it('usa o apelido quando preenchido — apelido vence', () => {
    expect(nomeExibicao({ nomeCompleto: 'João da Silva', apelido: 'Jotinha' })).toBe('Jotinha');
  });

  it('cai no primeiro nome quando o apelido está vazio', () => {
    expect(nomeExibicao({ nomeCompleto: 'João da Silva', apelido: '' })).toBe('João');
  });

  it('LIMITE: apelido só com espaços conta como vazio e cai no primeiro nome (edge case 6)', () => {
    expect(nomeExibicao({ nomeCompleto: 'João da Silva', apelido: '   ' })).toBe('João');
  });

  it('LIMITE: nome completo com um único termo (edge case 9)', () => {
    expect(nomeExibicao({ nomeCompleto: 'Madonna', apelido: '' })).toBe('Madonna');
  });

  it('LIMITE: apelido esvaziado na edição volta imediatamente ao primeiro nome (edge case 11)', () => {
    const antes = nomeExibicao({ nomeCompleto: 'João da Silva', apelido: 'Jotinha' });
    const depois = nomeExibicao({ nomeCompleto: 'João da Silva', apelido: '' });
    expect(antes).toBe('Jotinha');
    expect(depois).toBe('João');
  });
});

describe('usuarioParaRotulo', () => {
  it('é a mesma projeção de nomeExibicao — fonte única do RF-30', () => {
    const usuario = criarUsuario({ nomeCompleto: 'João da Silva', apelido: 'Jotinha' });
    expect(usuarioParaRotulo(usuario)).toBe(nomeExibicao(usuario));
  });
});

describe('emailDisponivel', () => {
  it('recusa e-mail duplicado idêntico', () => {
    const usuarios = [criarUsuario({ id: '1', email: 'joao@exemplo.com' })];
    expect(emailDisponivel('joao@exemplo.com', usuarios)).toBe(false);
  });

  it('recusa e-mail duplicado diferindo só na caixa (edge case 1)', () => {
    const usuarios = [criarUsuario({ id: '1', email: 'Joao@x.com' })];
    expect(emailDisponivel('joao@x.com', usuarios)).toBe(false);
  });

  it('recusa e-mail duplicado com espaços nas pontas (edge case 2)', () => {
    const usuarios = [criarUsuario({ id: '1', email: 'joao@x.com' })];
    expect(emailDisponivel('  joao@x.com  ', usuarios)).toBe(false);
  });

  it('aceita e-mail que não pertence a ninguém', () => {
    const usuarios = [criarUsuario({ id: '1', email: 'joao@x.com' })];
    expect(emailDisponivel('maria@x.com', usuarios)).toBe(true);
  });

  it('LIMITE: editar sem mudar o próprio e-mail não é conflito consigo mesmo (edge case 3, RF-18)', () => {
    const usuarios = [criarUsuario({ id: '1', email: 'joao@x.com' })];
    expect(emailDisponivel('joao@x.com', usuarios, '1')).toBe(true);
  });

  it('LIMITE: e-mail ocupado por um usuário INATIVO ainda bloqueia (edge case 8)', () => {
    const usuarios = [criarUsuario({ id: '1', email: 'joao@x.com', situacao: 'inativo' })];
    expect(emailDisponivel('joao@x.com', usuarios)).toBe(false);
  });
});

describe('apelidoDisponivel', () => {
  it('recusa apelido duplicado idêntico', () => {
    const usuarios = [criarUsuario({ id: '1', apelido: 'Jotinha' })];
    expect(apelidoDisponivel('Jotinha', usuarios)).toBe(false);
  });

  it('recusa apelido duplicado diferindo só na caixa (edge case 4)', () => {
    const usuarios = [criarUsuario({ id: '1', apelido: 'Jotinha' })];
    expect(apelidoDisponivel('jotinha', usuarios)).toBe(false);
  });

  it('recusa apelido duplicado com espaços nas pontas', () => {
    const usuarios = [criarUsuario({ id: '1', apelido: 'Jotinha' })];
    expect(apelidoDisponivel('  Jotinha  ', usuarios)).toBe(false);
  });

  it('LIMITE: editar sem mudar o próprio apelido não é conflito consigo mesmo (RF-18)', () => {
    const usuarios = [criarUsuario({ id: '1', apelido: 'Jotinha' })];
    expect(apelidoDisponivel('Jotinha', usuarios, '1')).toBe(true);
  });

  it('LIMITE: apelidos vazios nunca colidem entre si (edge case 5)', () => {
    const usuarios = [
      criarUsuario({ id: '1', apelido: '' }),
      criarUsuario({ id: '2', apelido: '   ' }),
    ];
    expect(apelidoDisponivel('', usuarios)).toBe(true);
    expect(apelidoDisponivel('   ', usuarios)).toBe(true);
  });

  it('LIMITE: apelido preenchido igual ao primeiro nome de outro usuário é permitido (edge case 7)', () => {
    const usuarios = [criarUsuario({ id: '1', nomeCompleto: 'João da Silva', apelido: '' })];
    expect(apelidoDisponivel('João', usuarios)).toBe(true);
  });
});
