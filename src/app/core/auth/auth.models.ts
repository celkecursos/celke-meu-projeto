/**
 * `auth.models.ts` — tipos da autenticação MOCADA (sem backend).
 *
 * Login de demonstração: não há usuário/senha reais, nem token — só um contrato
 * simples de "quem está logado agora", persistido em `localStorage`.
 */

/** A sessão do operador logado. */
export interface ISessao {
  nomeCompleto: string;
  email: string;
}

/** Recusa de login — mensagem única, sem apontar qual campo está errado. */
export interface ILoginRecusa {
  motivo: string;
}

/**
 * A credencial de demonstração — a ÚNICA que autentica. Exportada para a tela de
 * login exibi-la como instrução ("use este e-mail e esta senha"), em vez de
 * duplicar os valores em dois arquivos que podem divergir.
 */
export const CREDENCIAL_DEMO = {
  email: 'demo@celke.com',
  senha: 'demo1234',
} as const;

/**
 * Valida a COMBINAÇÃO de e-mail e senha contra `CREDENCIAL_DEMO` — nunca cada campo
 * isoladamente (RF-02). O e-mail é normalizado (trim + caixa) antes de comparar,
 * coerente com a normalização já usada no cadastro de usuários; a senha é comparada
 * exatamente como recebida, sem nenhuma normalização.
 */
export function credencialValida(email: string, senha: string): boolean {
  const emailNormalizado = email.trim().toLowerCase();
  return emailNormalizado === CREDENCIAL_DEMO.email && senha === CREDENCIAL_DEMO.senha;
}
