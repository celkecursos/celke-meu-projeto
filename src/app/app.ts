import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Root MAGRO: só o `<router-outlet>`. O layout institucional é o `EstruturaLayout`. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {}
