// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PrincipalComponent } from './components/principal/principal.component';
import { OrderComponent } from './components/order/order.component';
import { AdminComponent } from './components/admin/admin.component';
import { GestionarProductosComponent } from './components/gestionar-productos/gestionar-productos.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'catalogo', component: PrincipalComponent },
  { path: 'orden', component: OrderComponent },

  // Página de panel (solo el menú)
  { path: 'admin', component: AdminComponent },

  // Páginas independientes (vista completa)

  { path: 'admin/productos', component: GestionarProductosComponent },

  { path: '**', redirectTo: '' },
];
