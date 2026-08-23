import { Component, computed, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, NgControl, ValidatorFn } from '@angular/forms';

/** Contador de instâncias — gera id único para ligar `<label for>` ao `<input>`. */
let sequencia = 0;

/**
 * `<app-campo-texto>` — campo de formulário, usado com REACTIVE FORMS.
 *
 * Uso: `[formGroup]` no `<form>` + `formControlName` no campo. O componente lê o
 * estado do PRÓPRIO `NgControl` (inválido + tocado ⇒ mensagem) — a página não
 * re-encaminha erro à mão pelo template.
 *
 * O `NgControl` é injetado com `self: true` e o `valueAccessor` é atribuído no
 * construtor: é o jeito de ser um CVA sem cair no ciclo de DI que
 * `NG_VALUE_ACCESSOR` + `forwardRef` criam.
 *
 * NUNCA misture `[(ngModel)]` com `formControlName` no mesmo campo.
 */
@Component({
  selector: 'app-campo-texto',
  templateUrl: './campo-texto.html',
})
export class CampoTexto implements ControlValueAccessor {
  rotulo = input.required<string>();
  /** text | number | email | password */
  tipo = input<string>('text');
  /** Texto de apoio abaixo do campo; some quando há mensagem de erro. */
  dica = input<string>('');

  protected readonly id = `campo-texto-${++sequencia}`;
  protected readonly ngControl = inject(NgControl, { self: true, optional: true });

  protected readonly valor = signal<string>('');
  protected readonly desabilitado = signal(false);
  protected readonly tocado = signal(false);

  constructor() {
    // Auto-registro como ValueAccessor do controle que o hospeda.
    if (this.ngControl) this.ngControl.valueAccessor = this;
  }

  /** Asterisco de obrigatório: lido do validador do controle, não de input manual. */
  protected readonly obrigatorio = computed(() => {
    const controle = this.ngControl?.control;
    if (!controle) return false;
    const validador = controle.validator as ValidatorFn | null;
    return validador ? validador({ value: null } as never)?.['required'] === true : false;
  });

  /** Mensagem só aparece quando o campo é inválido E já foi tocado. */
  protected get invalido(): boolean {
    const controle = this.ngControl?.control;
    return !!controle && controle.invalid && (controle.touched || this.tocado());
  }

  protected get mensagemErro(): string {
    const erros = this.ngControl?.control?.errors;
    if (!erros) return '';
    if (erros['required']) return `${this.rotulo()} é obrigatório.`;
    if (erros['email']) return 'Informe um e-mail válido.';
    if (erros['minlength']) {
      return `Mínimo de ${erros['minlength'].requiredLength} caracteres.`;
    }
    if (erros['maxlength']) {
      return `Máximo de ${erros['maxlength'].requiredLength} caracteres.`;
    }
    if (erros['min']) return `Valor mínimo: ${erros['min'].min}.`;
    if (erros['max']) return `Valor máximo: ${erros['max'].max}.`;
    return 'Valor inválido.';
  }

  // ---- ControlValueAccessor ----
  private aoMudar: (valor: string) => void = () => undefined;
  private aoTocar: () => void = () => undefined;

  writeValue(valor: string | number | null): void {
    this.valor.set(valor === null || valor === undefined ? '' : String(valor));
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.aoMudar = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.aoTocar = fn;
  }

  setDisabledState(desabilitado: boolean): void {
    this.desabilitado.set(desabilitado);
  }

  protected digitou(evento: Event): void {
    const alvo = evento.target as HTMLInputElement;
    this.valor.set(alvo.value);
    this.aoMudar(alvo.value);
  }

  protected saiu(): void {
    this.tocado.set(true);
    this.aoTocar();
  }
}
