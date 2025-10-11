import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  constructor(private router: Router) {}

  gestionarUsuarios() {
    this.router.navigate(['/admin/usuarios']);
  }

  gestionarProductos() {
    this.router.navigate(['/admin/productos']);
  }
}
