/**
 * `usuario.models.ts` — o domínio de Usuário (spec `usuarios.spec.md`).
 *
 * Atende RF-11 (obrigatoriedade), RF-13/RF-14 (unicidade de e-mail/apelido),
 * RF-18 (as mesmas regras valem na edição, ignorando o próprio registro),
 * RF-28 (situação como fonte de verdade sobre elegibilidade — os módulos
 * consumidores é que aplicam a regra, aqui só existe o dado), RF-29 (nome de
 * exibição) e RF-30 (a projeção que os módulos consumidores importam).
 *
 * Todas as funções abaixo são PURAS (sem `inject`, sem HTTP) — é o
 * `usuario-api.service.ts` que as compõe para simular a semântica do backend.
 */

/** Situação do usuário — governa a elegibilidade a competições novas (RF-28). */
export type TSituacaoUsuario = 'ativo' | 'inativo';

/** O registro de Usuário. */
export interface IUsuario {
  id: string;
  nomeCompleto: string;
  email: string;
  apelido: string;
  situacao: TSituacaoUsuario;
  /** ISO 8601. Atribuída pelo sistema na criação; nunca editável (RF-15). */
  dataCadastro: string;
}

/**
 * Filtros da listagem. `situacao: ''` significa "todos" — mesma semântica de
 * `casaExato` em `core/data/consulta.ts` (filtro vazio casa com tudo); não existe
 * um terceiro valor tipo `'todos'`.
 */
export interface IUsuarioFiltros {
  busca: string;
  situacao: TSituacaoUsuario | '';
}

/** Dados editáveis do formulário de cadastro/edição. */
export interface IUsuarioForm {
  nomeCompleto: string;
  email: string;
  apelido: string;
  situacao: TSituacaoUsuario;
}

/** Recusa de cadastro/edição: qual campo e por quê (RF-13, RF-14). */
export interface IUsuarioRecusa {
  campo: 'nomeCompleto' | 'email' | 'apelido';
  motivo: string;
}

/**
 * Normalização transversal (seção 6 da spec): despreza espaços nas extremidades;
 * `null`/`undefined` viram texto vazio. Base de `primeiroNome`, `nomeExibicao`,
 * `emailDisponivel` e `apelidoDisponivel` — nome completo, e-mail e apelido passam
 * todos por aqui antes de qualquer validação ou comparação.
 */
export function normalizarCampo(valor: string | null | undefined): string {
  if (valor === null || valor === undefined) return '';
  return valor.trim();
}

/**
 * Primeiro trecho não vazio do nome completo, separado por espaço. Nome com um
 * único termo devolve o próprio termo (edge case 9); espaços múltiplos entre
 * termos não geram trecho vazio (edge case 10).
 */
export function primeiroNome(nomeCompleto: string): string {
  const normalizado = normalizarCampo(nomeCompleto);
  const trechos = normalizado.split(/\s+/).filter((trecho) => trecho !== '');
  return trechos[0] ?? '';
}

/**
 * Nome de exibição (RF-29) — fonte ÚNICA da regra: nenhuma outra parte do código
 * deriva nome de exibição por conta própria. Apelido normalizado, se não vazio;
 * senão, primeiro nome. Um apelido só de espaços conta como vazio (edge case 6) e
 * cai no primeiro nome, assim como um apelido esvaziado na edição (edge case 11).
 */
export function nomeExibicao(usuario: Pick<IUsuario, 'nomeCompleto' | 'apelido'>): string {
  const apelido = normalizarCampo(usuario.apelido);
  if (apelido !== '') return apelido;
  return primeiroNome(usuario.nomeCompleto);
}

/**
 * Projeção do usuário para rótulo abreviado (RF-30) — a função que os módulos
 * consumidores (ex.: campeonato) importam para rotular um usuário; nunca
 * reimplementam a regra.
 */
export function usuarioParaRotulo(usuario: IUsuario): string {
  return nomeExibicao(usuario);
}

/** Normalização para comparação de unicidade: `normalizarCampo` + caixa baixa. */
function normalizarParaComparacao(valor: string | null | undefined): string {
  return normalizarCampo(valor).toLowerCase();
}

/**
 * Disponibilidade de e-mail (RF-13, RF-18). Compara o e-mail normalizado (trim +
 * minúsculas) contra o de cada usuário, ignorando o item cujo `id === idAtual` (a
 * edição não conflita consigo mesma). Um e-mail ocupado por um usuário INATIVO
 * continua bloqueando (edge case 8) — não há exclusão física.
 */
export function emailDisponivel(email: string, usuarios: readonly IUsuario[], idAtual?: string): boolean {
  const alvo = normalizarParaComparacao(email);
  return !usuarios.some((usuario) => usuario.id !== idAtual && normalizarParaComparacao(usuario.email) === alvo);
}

/**
 * Disponibilidade de apelido (RF-14, RF-18). Apelido vazio após normalização
 * nunca colide (edge case 5, 6) — a unicidade só vale entre apelidos preenchidos.
 * Caso contrário, mesma lógica de `emailDisponivel`: compara normalizado,
 * ignorando `idAtual`.
 */
export function apelidoDisponivel(apelido: string, usuarios: readonly IUsuario[], idAtual?: string): boolean {
  const alvo = normalizarParaComparacao(apelido);
  if (alvo === '') return true;
  return !usuarios.some((usuario) => usuario.id !== idAtual && normalizarParaComparacao(usuario.apelido) === alvo);
}
