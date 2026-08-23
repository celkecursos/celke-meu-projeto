import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

/** Item da navegação superior. A task `*-fiacao` de cada módulo acrescenta o seu. */
interface IItemNav {
  rotulo: string;
  rota: string;
}

/**
 * `EstruturaLayout` — o layout institucional: navegação superior + `<router-outlet>`.
 *
 * É o arquivo que a task `*-fiacao` edita para registrar o item de nav de um módulo
 * novo (junto com `core/config/app.routes.ts`). Fora da fiação, não se mexe aqui:
 * duas tasks paralelas editando este arquivo se sobrescrevem em silêncio.
 */
@Component({
  selector: 'app-estrutura',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './estrutura.layout.html',
})
export class EstruturaLayout {
  /**
   * Itens da navegação. VAZIO por enquanto — o primeiro módulo nasce do pipeline SDD
   * e a task de fiação dele acrescenta a entrada aqui.
   */
  protected readonly itens = signal<IItemNav[]>([{ rotulo: 'Usuários', rota: '/usuarios' }]);

  /** Menu aberto no mobile (no desktop a navegação fica sempre visível na barra). */
  protected readonly menuAberto = signal(false);

  /** Tema escuro por classe no `<html>` — o par claro/escuro é requisito de DoD. */
  protected readonly escuro = signal(false);

  protected alternarMenu(): void {
    this.menuAberto.update((aberto) => !aberto);
  }

  /** Fecha o menu ao navegar no mobile — o painel cobre o conteúdo. */
  protected fecharMenu(): void {
    this.menuAberto.set(false);
  }

  protected alternarTema(): void {
    this.escuro.update((atual) => !atual);
    document.documentElement.classList.toggle('dark', this.escuro());
  }
}
