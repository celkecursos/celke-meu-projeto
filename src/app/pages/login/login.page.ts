/**
 * `login.page` — autenticação MOCADA (sem backend).
 *
 * SMART: injeta `AuthFacade` e orquesta o formulário; a validação de negócio
 * (o que conta como e-mail/senha válidos) mora na facade — a página só monta o
 * `FormGroup`, lê `redirectTo` da URL e navega no sucesso.
 *
 * Fora do padrão de módulo de `.ai/rules/architecture.md` de propósito: login não
 * é um domínio de negócio com `data/`/`pages/`/`components/` — é infraestrutura de
 * acesso ao app inteiro, por isso mora em `src/app/pages/`, ao lado de `app.ts`.
 */
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CampoTexto } from '../../shared/components/campo-texto/campo-texto';
import { AuthFacade } from '../../core/auth/auth.facade';
import { CREDENCIAL_DEMO } from '../../core/auth/auth.models';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CampoTexto],
  templateUrl: './login.page.html',
})
export class LoginPage {
  #facade = inject(AuthFacade);
  #router = inject(Router);
  #route = inject(ActivatedRoute);

  /** Exibida na tela como instrução de teste — fonte única em auth.models.ts. */
  protected readonly credencialDemo = CREDENCIAL_DEMO;

  protected readonly formulario = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    senha: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  /** Recusa da última tentativa — mensagem única, sem apontar campo (mock de segurança). */
  protected readonly recusa = signal<string | null>(null);

  protected submit(): void {
    this.recusa.set(null);
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { email, senha } = this.formulario.getRawValue();
    const resultado = this.#facade.entrar(email, senha);

    if (!resultado.sucesso) {
      this.recusa.set(resultado.recusa?.motivo ?? 'Não foi possível entrar.');
      return;
    }

    const redirectTo = this.#route.snapshot.queryParamMap.get('redirectTo');
    this.#router.navigateByUrl(redirectTo && redirectTo.startsWith('/') ? redirectTo : '/usuarios');
  }
}
