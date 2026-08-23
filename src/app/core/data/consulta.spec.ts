/**
 * EXEMPLAR DE TESTE do projeto — todo módulo espelha o estilo daqui.
 *
 * O que se testa: LÓGICA DE DOMÍNIO em função pura (casadores de filtro, ordenação,
 * paginação). O que NÃO se testa: render de template/TestBed sem motivo forte, nem
 * fiação trivial de facade.
 *
 * Estilo: um `describe` por função · nome do caso descreve a REGRA em português ·
 * caso-limite explícito (é o caso-limite que pega a regressão de verdade).
 */
import { describe, expect, it } from 'vitest';

import {
  CONSULTA_INICIAL,
  alternarOrdenacao,
  casaExato,
  casaIntervalo,
  casaTexto,
  listagemVazia,
  normalizarTexto,
  ordenarPor,
  paginar,
  paraListagem,
  totalDePaginas,
} from './consulta';

describe('normalizarTexto', () => {
  it('remove acento, caixa e espaço da borda para permitir comparação', () => {
    expect(normalizarTexto('  Ação ')).toBe('acao');
  });

  it('trata nulo e indefinido como texto vazio em vez de quebrar', () => {
    expect(normalizarTexto(null)).toBe('');
    expect(normalizarTexto(undefined)).toBe('');
  });

  it('converte número para texto comparável', () => {
    expect(normalizarTexto(42)).toBe('42');
  });
});

describe('casaTexto', () => {
  it('casa por trecho contido, ignorando acento e caixa', () => {
    expect(casaTexto('São Paulo', 'sao pau')).toBe(true);
  });

  it('não casa quando o trecho não existe no valor', () => {
    expect(casaTexto('São Paulo', 'rio')).toBe(false);
  });

  it('LIMITE: filtro vazio casa com tudo — lista cheia antes de o usuário digitar', () => {
    expect(casaTexto('qualquer', '')).toBe(true);
    expect(casaTexto('qualquer', '   ')).toBe(true);
    expect(casaTexto('qualquer', null)).toBe(true);
  });
});

describe('casaExato', () => {
  it('exige igualdade integral — "ativo" não casa com "inativo"', () => {
    expect(casaExato('inativo', 'ativo')).toBe(false);
    expect(casaExato('ativo', 'ativo')).toBe(true);
  });

  it('ignora acento e caixa na comparação exata', () => {
    expect(casaExato('Órgão', 'orgao')).toBe(true);
  });

  it('LIMITE: filtro ausente casa com tudo', () => {
    expect(casaExato('ativo', null)).toBe(true);
    expect(casaExato('ativo', undefined)).toBe(true);
    expect(casaExato('ativo', '')).toBe(true);
  });
});

describe('casaIntervalo', () => {
  it('inclui os dois extremos do intervalo', () => {
    expect(casaIntervalo(10, 10, 20)).toBe(true);
    expect(casaIntervalo(20, 10, 20)).toBe(true);
  });

  it('rejeita valor fora do intervalo', () => {
    expect(casaIntervalo(9, 10, 20)).toBe(false);
    expect(casaIntervalo(21, 10, 20)).toBe(false);
  });

  it('aceita ponta aberta quando um dos limites falta', () => {
    expect(casaIntervalo(1000, 10, null)).toBe(true);
    expect(casaIntervalo(1, null, 20)).toBe(true);
  });

  it('LIMITE: valor não-numérico nunca casa — dado sujo fica fora da fatia', () => {
    expect(casaIntervalo('abc', 0, 100)).toBe(false);
  });
});

describe('ordenarPor', () => {
  const itens = [{ nome: 'banana' }, { nome: 'Abacaxi' }, { nome: 'cereja' }];

  it('ordena texto em pt-BR ignorando caixa', () => {
    const ordenado = ordenarPor(itens, { campo: 'nome', direcao: 'asc' });
    expect(ordenado.map((i) => i.nome)).toEqual(['Abacaxi', 'banana', 'cereja']);
  });

  it('inverte a ordem quando a direção é desc', () => {
    const ordenado = ordenarPor(itens, { campo: 'nome', direcao: 'desc' });
    expect(ordenado.map((i) => i.nome)).toEqual(['cereja', 'banana', 'Abacaxi']);
  });

  it('compara número por valor, não por texto (10 vem depois de 9)', () => {
    const numeros = [{ preco: 10 }, { preco: 9 }, { preco: 100 }];
    const ordenado = ordenarPor(numeros, { campo: 'preco', direcao: 'asc' });
    expect(ordenado.map((i) => i.preco)).toEqual([9, 10, 100]);
  });

  it('NÃO muta o array de origem', () => {
    const original = [{ nome: 'b' }, { nome: 'a' }];
    ordenarPor(original, { campo: 'nome', direcao: 'asc' });
    expect(original.map((i) => i.nome)).toEqual(['b', 'a']);
  });

  it('LIMITE: campo vazio preserva a ordem natural do servidor', () => {
    const ordenado = ordenarPor(itens, { campo: '', direcao: 'asc' });
    expect(ordenado.map((i) => i.nome)).toEqual(['banana', 'Abacaxi', 'cereja']);
  });

  it('LIMITE: nulos vão para o fim mesmo na ordem decrescente', () => {
    const comNulo = [{ nome: null }, { nome: 'a' }, { nome: 'z' }];
    const asc = ordenarPor(comNulo, { campo: 'nome', direcao: 'asc' });
    const desc = ordenarPor(comNulo, { campo: 'nome', direcao: 'desc' });
    expect(asc.map((i) => i.nome)).toEqual(['a', 'z', null]);
    expect(desc.map((i) => i.nome)).toEqual(['z', 'a', null]);
  });
});

describe('paginar', () => {
  const itens = [1, 2, 3, 4, 5, 6, 7];

  it('recorta a fatia da página pedida (base 1)', () => {
    expect(paginar(itens, 2, 3).itens).toEqual([4, 5, 6]);
  });

  it('devolve o total do CONJUNTO, não o tamanho da fatia', () => {
    const pagina = paginar(itens, 1, 3);
    expect(pagina.itens).toHaveLength(3);
    expect(pagina.total).toBe(7);
  });

  it('devolve fatia parcial na última página', () => {
    expect(paginar(itens, 3, 3).itens).toEqual([7]);
  });

  it('LIMITE: página além do fim devolve fatia vazia preservando o total', () => {
    const pagina = paginar(itens, 99, 3);
    expect(pagina.itens).toEqual([]);
    expect(pagina.total).toBe(7);
  });

  it('LIMITE: página zero ou negativa é tratada como a primeira', () => {
    expect(paginar(itens, 0, 3).itens).toEqual([1, 2, 3]);
    expect(paginar(itens, -5, 3).itens).toEqual([1, 2, 3]);
  });
});

describe('totalDePaginas', () => {
  it('arredonda para cima a divisão do total pelo tamanho', () => {
    expect(totalDePaginas(7, 3)).toBe(3);
    expect(totalDePaginas(6, 3)).toBe(2);
  });

  it('LIMITE: lista vazia ainda tem uma página', () => {
    expect(totalDePaginas(0, 10)).toBe(1);
  });
});

describe('alternarOrdenacao', () => {
  it('campo novo começa em ascendente', () => {
    const atual = { campo: 'nome', direcao: 'asc' as const };
    expect(alternarOrdenacao(atual, 'preco')).toEqual({ campo: 'preco', direcao: 'asc' });
  });

  it('o mesmo campo inverte a direção a cada clique', () => {
    const asc = { campo: 'nome', direcao: 'asc' as const };
    const desc = alternarOrdenacao(asc, 'nome');
    expect(desc).toEqual({ campo: 'nome', direcao: 'desc' });
    expect(alternarOrdenacao(desc, 'nome')).toEqual({ campo: 'nome', direcao: 'asc' });
  });
});

describe('listagemVazia', () => {
  it('nasce carregando, sem itens e sem erro — o primeiro render da tela', () => {
    const listagem = listagemVazia(CONSULTA_INICIAL);
    expect(listagem.itens).toEqual([]);
    expect(listagem.carregando).toBe(true);
    expect(listagem.erro).toBeNull();
  });
});

describe('paraListagem', () => {
  it('empacota a resposta do servidor com a página corrente da consulta', () => {
    const consulta = { ...CONSULTA_INICIAL, pagina: 2, tamanho: 5 };
    const listagem = paraListagem({ itens: ['a', 'b'], total: 12 }, consulta);
    expect(listagem).toEqual({
      itens: ['a', 'b'],
      total: 12,
      pagina: 2,
      tamanho: 5,
      carregando: false,
      erro: null,
    });
  });
});
