import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private router: Router) {}

  irCatalogo() {
    this.router.navigate(['/catalogo']);
  }

  irAdministrador() {
    this.router.navigate(['/admin']);
  }
}
