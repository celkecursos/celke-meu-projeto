/**
 * `usuario-api.service.ts` — o "backend fiel" de Usuário (spec `usuarios.spec.md`).
 *
 * Atende RF-01/RF-02 (listagem paginada), RF-03/RF-04 (busca + filtro de situação),
 * RF-13/RF-14 (unicidade de e-mail/apelido), RF-15 (data de cadastro imutável),
 * RF-18 (mesmas regras na edição, ignorando o próprio registro), RF-24/RF-25/RF-27
 * (inativar/reativar sem tocar nos demais dados), RF-28 (situação como fonte de
 * verdade — aqui só o dado, a aplicação é dos módulos consumidores).
 *
 * Padrão de "banco em memória": a primeira operação que precisar dos dados carrega
 * o JSON do mock via `HttpClient` e guarda o array num campo privado; as operações
 * de escrita mutam esse array em memória — nunca o arquivo físico. É simulação de
 * SESSÃO, não persistência real (recarregar a página volta ao JSON original). Troca
 * de mock por endpoint real não muda o resto do módulo (`CLAUDE.md`, "APIs e
 * ambiente").
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { IConsulta, IPagina, casaExato, casaTexto, ordenarPor, paginar } from '../../../core/data/consulta';
import {
  IUsuario,
  IUsuarioFiltros,
  IUsuarioForm,
  IUsuarioRecusa,
  TSituacaoUsuario,
  apelidoDisponivel,
  emailDisponivel,
  normalizarCampo,
} from './usuario.models';

/** Formato mínimo de endereço de e-mail: texto antes e depois do `@`, domínio com ponto, sem espaços. */
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Predicado de filtro de usuário (RF-03, RF-04) — função pura, testável sem HTTP.
 * Combina, com E lógico: situação exata (`''` = todos) E busca por trecho em nome
 * completo OU e-mail.
 */
export function casaFiltrosUsuario(usuario: IUsuario, filtros: IUsuarioFiltros): boolean {
  const casaSituacao = casaExato(usuario.situacao, filtros.situacao);
  const casaBusca = casaTexto(usuario.nomeCompleto, filtros.busca) || casaTexto(usuario.email, filtros.busca);
  return casaSituacao && casaBusca;
}

@Injectable({ providedIn: 'root' })
export class UsuarioApiService {
  #http = inject(HttpClient);

  /** O "banco" em memória — `null` até a primeira operação carregar o mock. */
  #cache: IUsuario[] | null = null;

  listar(consulta: IConsulta): Observable<IPagina<IUsuario>> {
    return this.#carregarCache().pipe(
      map((usuarios) => {
        const filtros = consulta.filtros as unknown as IUsuarioFiltros;
        const filtrados = usuarios.filter((usuario) => casaFiltrosUsuario(usuario, filtros));
        const ordenados = ordenarPor(filtrados, consulta.ordenacao);
        return paginar(ordenados, consulta.pagina, consulta.tamanho);
      }),
    );
  }

  obter(id: string): Observable<IUsuario> {
    return this.#carregarCache().pipe(
      switchMap((usuarios) => {
        const usuario = usuarios.find((item) => item.id === id);
        if (!usuario) return throwError(() => new Error('Usuário não encontrado.'));
        return of(usuario);
      }),
    );
  }

  criar(dados: IUsuarioForm): Observable<IUsuario> {
    return this.#carregarCache().pipe(
      switchMap((usuarios) => {
        const recusa = this.#validar(dados, usuarios);
        if (recusa) return throwError(() => recusa);

        const usuario: IUsuario = {
          id: this.#gerarId(usuarios),
          nomeCompleto: normalizarCampo(dados.nomeCompleto),
          email: normalizarCampo(dados.email),
          apelido: normalizarCampo(dados.apelido),
          situacao: dados.situacao,
          dataCadastro: new Date().toISOString(),
        };
        usuarios.push(usuario);
        return of(usuario);
      }),
    );
  }

  atualizar(id: string, dados: IUsuarioForm): Observable<IUsuario> {
    return this.#carregarCache().pipe(
      switchMap((usuarios) => {
        const indice = usuarios.findIndex((item) => item.id === id);
        if (indice === -1) return throwError(() => new Error('Usuário não encontrado.'));

        const recusa = this.#validar(dados, usuarios, id);
        if (recusa) return throwError(() => recusa);

        const atualizado: IUsuario = {
          ...usuarios[indice],
          nomeCompleto: normalizarCampo(dados.nomeCompleto),
          email: normalizarCampo(dados.email),
          apelido: normalizarCampo(dados.apelido),
          situacao: dados.situacao,
        };
        usuarios[indice] = atualizado;
        return of(atualizado);
      }),
    );
  }

  alterarSituacao(id: string, situacao: TSituacaoUsuario): Observable<IUsuario> {
    return this.#carregarCache().pipe(
      switchMap((usuarios) => {
        const indice = usuarios.findIndex((item) => item.id === id);
        if (indice === -1) return throwError(() => new Error('Usuário não encontrado.'));

        const atualizado: IUsuario = { ...usuarios[indice], situacao };
        usuarios[indice] = atualizado;
        return of(atualizado);
      }),
    );
  }

  /**
   * Fluxo B da spec, passo 4 — nesta ordem, parando na primeira falha: obrigatórios
   * → formato de e-mail → e-mail disponível → apelido disponível (só se preenchido).
   * `idAtual` presente (edição) faz `emailDisponivel`/`apelidoDisponivel` ignorarem o
   * próprio registro (RF-18).
   */
  #validar(dados: IUsuarioForm, usuarios: readonly IUsuario[], idAtual?: string): IUsuarioRecusa | null {
    const nomeCompleto = normalizarCampo(dados.nomeCompleto);
    const email = normalizarCampo(dados.email);
    const apelido = normalizarCampo(dados.apelido);

    if (nomeCompleto === '') {
      return { campo: 'nomeCompleto', motivo: 'Campo obrigatório não preenchido.' };
    }
    if (email === '') {
      return { campo: 'email', motivo: 'Campo obrigatório não preenchido.' };
    }
    if (!EMAIL_VALIDO.test(email)) {
      return { campo: 'email', motivo: 'Formato de e-mail inválido.' };
    }
    if (!emailDisponivel(email, usuarios, idAtual)) {
      return { campo: 'email', motivo: 'E-mail já cadastrado.' };
    }
    if (apelido !== '' && !apelidoDisponivel(apelido, usuarios, idAtual)) {
      return { campo: 'apelido', motivo: 'Apelido já cadastrado.' };
    }
    return null;
  }

  /** Identificador novo e único — não colide com nenhum já presente no cache. */
  #gerarId(usuarios: readonly IUsuario[]): string {
    let id: string;
    do {
      id = crypto.randomUUID();
    } while (usuarios.some((usuario) => usuario.id === id));
    return id;
  }

  /** Carrega o mock uma única vez; chamadas seguintes reaproveitam o cache em memória. */
  #carregarCache(): Observable<IUsuario[]> {
    if (this.#cache) return of(this.#cache);
    return this.#http.get<IUsuario[]>(`${environment.usuariosApiUrl}/usuarios.json`).pipe(
      tap((usuarios) => {
        this.#cache = usuarios;
      }),
    );
  }
}
