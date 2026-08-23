/**
 * `usuario-form.page` — cadastro E edição de usuário (spec `usuarios.spec.md`).
 *
 * Atende RF-10 a RF-21 (fluxo completo de cadastro/edição) e RF-32 (falha ao salvar
 * não descarta o que foi digitado). Decisão desta task: cadastro e edição
 * compartilham a mesma página, distinguidos pelo parâmetro `modo` da rota — não há
 * `usuario-cadastro.page` / `usuario-edicao.page` separadas.
 *
 * SMART: injeta `UsuarioFacade` (nunca `UsuarioApiService` direto) e orquestra
 * carregamento, submissão e navegação. `<app-campo-texto>` cobre nome/e-mail/apelido;
 * "situação" usa `<select>` nativo (não existe componente de select documentado,
 * mesma decisão de USR-006).
 */
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CampoTexto } from '../../../../shared/components/campo-texto/campo-texto';
import { IUsuario, IUsuarioForm, IUsuarioRecusa, TSituacaoUsuario } from '../../data/usuario.models';
import { UsuarioFacade } from '../../data/usuario.facade';

/** Modo do formulário — vem de `route.data.modo` (fiação em USR-010). Único uso, por isso local. */
type TModoFormulario = 'criar' | 'editar';

/** Nome por extenso de cada campo — usado na mensagem de recusa (RF-13/RF-14). */
const ROTULO_CAMPO: Record<IUsuarioRecusa['campo'], string> = {
  nomeCompleto: 'Nome completo',
  email: 'E-mail',
  apelido: 'Apelido',
};

/**
 * Distingue uma recusa de validação (`IUsuarioRecusa`, com `campo`/`motivo`) de um
 * erro de indisponibilidade (`Error` genérico) — os dois chegam pelo `error` do
 * `Observable`, sem tipagem em tempo de execução.
 */
function ehRecusa(erro: unknown): erro is IUsuarioRecusa {
  return typeof erro === 'object' && erro !== null && 'campo' in erro && 'motivo' in erro;
}

@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule, RouterLink, CampoTexto],
  templateUrl: './usuario-form.page.html',
})
export class UsuarioFormPage implements OnInit {
  id = input<string>();
  modo = input.required<TModoFormulario>();

  #facade = inject(UsuarioFacade);
  #router = inject(Router);
  #fb = inject(FormBuilder);

  protected readonly formulario = this.#fb.nonNullable.group({
    nomeCompleto: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    apelido: [''],
    situacao: ['ativo' as TSituacaoUsuario, Validators.required],
  });

  /** Usuário carregado na edição — fonte da data de cadastro (RF-15) e do estado "carregando". */
  protected readonly usuarioCarregado = signal<IUsuario | null>(null);
  /** `true` quando a edição falhou em carregar (id inexistente/malformado) — Fluxo C, desvio. */
  protected readonly naoEncontrado = signal(false);
  protected readonly salvando = signal(false);
  protected readonly recusa = signal<IUsuarioRecusa | null>(null);
  protected readonly erroIndisponibilidade = signal(false);

  protected readonly titulo = computed(() => (this.modo() === 'criar' ? 'Novo usuário' : 'Editar usuário'));

  /** Editar ainda não resolveu (nem sucesso nem "não encontrado") ⇒ formulário não renderiza. */
  protected readonly carregando = computed(
    () => this.modo() === 'editar' && !this.usuarioCarregado() && !this.naoEncontrado(),
  );

  protected readonly dataCadastroFormatada = computed(() => {
    const usuario = this.usuarioCarregado();
    return usuario ? new Date(usuario.dataCadastro).toLocaleDateString('pt-BR') : '';
  });

  protected readonly mensagemRecusa = computed(() => {
    const atual = this.recusa();
    if (!atual) return '';
    return `${ROTULO_CAMPO[atual.campo]}: ${atual.motivo}`;
  });

  ngOnInit(): void {
    if (this.modo() !== 'editar') return;

    const id = this.id();
    if (!id) {
      this.naoEncontrado.set(true);
      return;
    }

    this.#facade.obter(id).subscribe({
      next: (usuario) => {
        this.usuarioCarregado.set(usuario);
        this.formulario.patchValue({
          nomeCompleto: usuario.nomeCompleto,
          email: usuario.email,
          apelido: usuario.apelido,
          situacao: usuario.situacao,
        });
      },
      error: () => this.naoEncontrado.set(true),
    });
  }

  protected submit(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.recusa.set(null);
    this.erroIndisponibilidade.set(false);
    this.salvando.set(true);

    const dados: IUsuarioForm = this.formulario.getRawValue();
    const modo = this.modo();
    const operacao = modo === 'criar' ? this.#facade.cadastrar(dados) : this.#facade.editar(this.id()!, dados);

    operacao.subscribe({
      next: () => {
        this.#router.navigate(['/usuarios'], {
          state: {
            mensagemSucesso: modo === 'criar' ? 'Usuário cadastrado com sucesso.' : 'Usuário atualizado com sucesso.',
          },
        });
      },
      // RF-32: não reseta o formulário — os dados digitados permanecem.
      error: (erro: unknown) => {
        this.salvando.set(false);
        if (ehRecusa(erro)) {
          this.recusa.set(erro);
        } else {
          this.erroIndisponibilidade.set(true);
        }
      },
    });
  }
}
