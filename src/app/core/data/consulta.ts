/**
 * `consulta.ts` — a BASE COMPARTILHADA da listagem server-driven.
 *
 * Aqui moram três contratos que não se confundem:
 *
 * - `IConsulta`   — o PEDIDO (filtros + página + ordenação) que a facade guarda.
 * - `IPagina<T>`  — a RESPOSTA do servidor (itens da página + total).
 * - `IListagem<T>`— o ESTADO da UI (itens/carregando/erro/total/página juntos),
 *                   que a página entrega inteiro ao `<app-tabela>`.
 *
 * `IPagina<T>` ≠ `IListagem<T>`: o primeiro é o que chega do backend; o segundo é o
 * que a tela consome — e é ele que carrega `carregando`/`erro`, que servidor nenhum
 * devolve.
 *
 * Os helpers abaixo são FUNÇÕES PURAS (sem `inject`, sem HTTP): é o `<x>-api.service`
 * que as compõe para simular — e depois substituir — a semântica do backend. Por
 * serem puras, são o lugar de maior retorno em teste (ver `consulta.spec.ts`).
 */

/** Direção de ordenação. */
export type TDirecao = 'asc' | 'desc';

/** Ordenação por um campo. `campo` vazio = sem ordenação explícita. */
export interface IOrdenacao {
  campo: string;
  direcao: TDirecao;
}

/** O PEDIDO: filtros livres do domínio + paginação + ordenação. */
export interface IConsulta {
  /** Filtros do domínio (`I<X>Filtros`). Chave ausente/vazia = filtro inativo. */
  filtros: Record<string, unknown>;
  /** Página corrente, base 1. */
  pagina: number;
  /** Itens por página. */
  tamanho: number;
  ordenacao: IOrdenacao;
}

/** A RESPOSTA do servidor: a fatia pedida + o total de registros que casaram. */
export interface IPagina<T> {
  itens: T[];
  total: number;
}

/** O ESTADO da UI, empacotado — o que `<app-tabela>` e `<app-paginacao>` recebem. */
export interface IListagem<T> {
  itens: T[];
  total: number;
  pagina: number;
  tamanho: number;
  carregando: boolean;
  /** Mensagem de erro pronta para exibição; `null` quando não houve falha. */
  erro: string | null;
}

/** Ponto de partida de toda facade: página 1, sem filtro e sem ordenação. */
export const CONSULTA_INICIAL: IConsulta = {
  filtros: {},
  pagina: 1,
  tamanho: 10,
  ordenacao: { campo: '', direcao: 'asc' },
};

/** Listagem vazia em estado de carregamento — o primeiro render da tela. */
export function listagemVazia<T>(consulta: IConsulta = CONSULTA_INICIAL): IListagem<T> {
  return {
    itens: [],
    total: 0,
    pagina: consulta.pagina,
    tamanho: consulta.tamanho,
    carregando: true,
    erro: null,
  };
}

/**
 * Normaliza texto para comparação: sem acento, sem caixa e sem borda em branco.
 * É o que faz "São Paulo" casar com "sao paulo" — busca que ignora acento é
 * expectativa do usuário brasileiro, não refinamento.
 */
export function normalizarTexto(valor: unknown): string {
  if (valor === null || valor === undefined) return '';
  return String(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Casador de TEXTO (contém). Filtro vazio casa com tudo — é o que mantém a listagem
 * cheia enquanto o usuário ainda não digitou nada.
 */
export function casaTexto(valor: unknown, filtro: unknown): boolean {
  const alvo = normalizarTexto(filtro);
  if (alvo === '') return true;
  return normalizarTexto(valor).includes(alvo);
}

/**
 * Casador EXATO — para select/enum, onde "ativo" não pode casar com "inativo".
 * Filtro `null`/`undefined`/`''` significa "sem filtro" e casa com tudo.
 */
export function casaExato(valor: unknown, filtro: unknown): boolean {
  if (filtro === null || filtro === undefined || filtro === '') return true;
  return normalizarTexto(valor) === normalizarTexto(filtro);
}

/**
 * Casador de INTERVALO numérico (inclusivo nas duas pontas). Limite ausente = ponta
 * aberta. Valor não-numérico nunca casa — dado sujo não entra na fatia por acidente.
 */
export function casaIntervalo(valor: unknown, minimo?: number | null, maximo?: number | null): boolean {
  const numero = typeof valor === 'number' ? valor : Number(valor);
  if (Number.isNaN(numero)) return false;
  if (minimo !== null && minimo !== undefined && numero < minimo) return false;
  if (maximo !== null && maximo !== undefined && numero > maximo) return false;
  return true;
}

/**
 * Ordena por um campo, SEM mutar a origem (`toSorted` não está garantido no alvo do
 * projeto; a cópia é explícita). Campo vazio devolve a ordem natural — a do servidor.
 *
 * Texto compara com `localeCompare` pt-BR (acento e caixa fora do caminho); número e
 * data comparam por valor. Nulos vão para o fim, independentemente da direção: o
 * usuário procura o que TEM valor, não o buraco.
 */
export function ordenarPor<T>(itens: readonly T[], ordenacao: IOrdenacao): T[] {
  const copia = [...itens];
  const { campo, direcao } = ordenacao;
  if (!campo) return copia;

  const sinal = direcao === 'desc' ? -1 : 1;
  return copia.sort((a, b) => {
    const va = (a as Record<string, unknown>)[campo];
    const vb = (b as Record<string, unknown>)[campo];

    const aVazio = va === null || va === undefined || va === '';
    const bVazio = vb === null || vb === undefined || vb === '';
    if (aVazio && bVazio) return 0;
    if (aVazio) return 1;
    if (bVazio) return -1;

    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * sinal;
    if (va instanceof Date && vb instanceof Date) return (va.getTime() - vb.getTime()) * sinal;

    return String(va).localeCompare(String(vb), 'pt-BR', { sensitivity: 'base' }) * sinal;
  });
}

/**
 * Recorta a fatia da página (base 1) e devolve `IPagina<T>` com o TOTAL do conjunto
 * inteiro — não o tamanho da fatia. É esse total que alimenta a paginação; devolver
 * `itens.length` aqui faria a última página sumir.
 *
 * Página fora do intervalo devolve fatia vazia com o total preservado, para a UI
 * conseguir dizer "sem resultados nesta página" em vez de quebrar.
 */
export function paginar<T>(itens: readonly T[], pagina: number, tamanho: number): IPagina<T> {
  const total = itens.length;
  if (tamanho <= 0) return { itens: [], total };

  const paginaSegura = Math.max(1, Math.trunc(pagina) || 1);
  const inicio = (paginaSegura - 1) * tamanho;
  return { itens: itens.slice(inicio, inicio + tamanho), total };
}

/** Total de páginas para um total de registros — mínimo de 1 (lista vazia tem 1). */
export function totalDePaginas(total: number, tamanho: number): number {
  if (tamanho <= 0) return 1;
  return Math.max(1, Math.ceil(total / tamanho));
}

/**
 * Alterna a ordenação ao clicar num cabeçalho: campo novo começa `asc`; o MESMO
 * campo inverte a direção. É a semântica que `<app-tabela>` espera do `(ordenar)`.
 */
export function alternarOrdenacao(atual: IOrdenacao, campo: string): IOrdenacao {
  if (atual.campo !== campo) return { campo, direcao: 'asc' };
  return { campo, direcao: atual.direcao === 'asc' ? 'desc' : 'asc' };
}

/**
 * Empacota `IPagina<T>` + `IConsulta` no `IListagem<T>` que a UI consome.
 * É a única fábrica de estado "carregado" — evita cada facade montar o seu.
 */
export function paraListagem<T>(pagina: IPagina<T>, consulta: IConsulta): IListagem<T> {
  return {
    itens: pagina.itens,
    total: pagina.total,
    pagina: consulta.pagina,
    tamanho: consulta.tamanho,
    carregando: false,
    erro: null,
  };
}
