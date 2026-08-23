/**
 * `auth.facade.ts` — sessão MOCADA, sem backend.
 *
 * Login de demonstração: uma ÚNICA credencial fixa (`CREDENCIAL_DEMO`) autentica —
 * não é "qualquer e-mail bem formado", é exatamente aquele e-mail/senha. Existe uma
 * credencial fixa (em vez de aceitar qualquer formato) para a tela de login poder
 * exibi-la como instrução de teste ("use este e-mail e esta senha"), o que um mock
 * de "qualquer e-mail entra" não permite mostrar de forma concreta. Não é segurança
 * real — é o suficiente para o pipeline SDD ter uma tela com estado de sessão para
 * proteger (guard) e demonstrar, sem abrir o escopo de um backend de autenticação
 * de verdade.
 *
 * A sessão persiste em `localStorage` (chave `CHAVE_SESSAO`) para sobreviver a
 * F5 — sem isso, cada recarregamento da página deslogaria o operador, o que
 * atrapalharia tanto a gravação do tutorial quanto o uso normal do app.
 */
import { Injectable, computed, signal } from '@angular/core';

import { CREDENCIAL_DEMO, ILoginRecusa, ISessao, credencialValida } from './auth.models';

const CHAVE_SESSAO = 'celke:sessao';

/**
 * Resultado de `entrar()`. `recusa` é sempre `ILoginRecusa | null` (nunca opcional
 * via união discriminada) — o esbuild do `@angular/build` não estreita de forma
 * confiável uniões inline `{ sucesso: true } | { sucesso: false; recusa: X }`
 * retornadas de método de classe (falso `TS2339` mesmo com o `tsc` puro validando
 * o mesmo código sem erro). Formato plano evita a categoria inteira do problema.
 */
export interface IResultadoLogin {
  readonly sucesso: boolean;
  readonly recusa: ILoginRecusa | null;
}

function lerSessaoPersistida(): ISessao | null {
  try {
    const bruto = localStorage.getItem(CHAVE_SESSAO);
    return bruto ? (JSON.parse(bruto) as ISessao) : null;
  } catch {
    // localStorage indisponível (modo privado restrito, quota) ou JSON corrompido —
    // trata como deslogado em vez de quebrar o boot do app.
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  readonly #sessao = signal<ISessao | null>(lerSessaoPersistida());

  /** A sessão vigente, ou `null` quando deslogado. Readonly para quem consome. */
  readonly sessao = computed(() => this.#sessao());

  /** `true` quando há operador logado — é o que o guard consulta. */
  readonly autenticado = computed(() => this.#sessao() !== null);

  /**
   * Login mocado — a validação da credencial (normalização de e-mail incluída) é
   * inteiramente de `credencialValida()` (`auth.models.ts`); a facade não a
   * reimplementa. Qualquer combinação recusada — incluindo um e-mail válido mas
   * não cadastrado — devolve a MESMA mensagem genérica: não confirmar se o e-mail
   * existe é postura de segurança correta mesmo num mock, e não vale abrir exceção
   * "só para facilitar".
   */
  entrar(email: string, senha: string): IResultadoLogin {
    if (!credencialValida(email, senha)) {
      return { sucesso: false, recusa: { motivo: 'E-mail ou senha incorretos.' } };
    }

    const sessao: ISessao = {
      email: CREDENCIAL_DEMO.email,
      nomeCompleto: 'Operador Demo',
    };
    this.#sessao.set(sessao);
    try {
      localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
    } catch {
      // Sessão local em memória continua válida mesmo se persistir falhar.
    }
    return { sucesso: true, recusa: null };
  }

  /** Encerra a sessão — local e persistida. */
  sair(): void {
    this.#sessao.set(null);
    try {
      localStorage.removeItem(CHAVE_SESSAO);
    } catch {
      // Nada a fazer se o storage não deixar remover; o estado em memória já mudou.
    }
  }
}
