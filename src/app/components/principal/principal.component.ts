import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto';
import { Detalle } from '../../models/detalle';

import { CatalogoComponent } from '../catalogo/catalogo.component';
import { CarritoComponent } from '../carrito/carrito.component';

@Component({
  selector: 'app-principal',
  standalone: true, 
  imports: [CommonModule, CatalogoComponent, CarritoComponent], 
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css'], 
})
export class PrincipalComponent implements OnInit {
  listaProductos: Producto[] = [];
  listaCarrito: Detalle[] = [];
  totalCarrito = 0;
  mostrarCarrito = false;

  constructor(private servicio: ProductoService, private router: Router) {}

  ngOnInit(): void {
    this.servicio.getProductos().subscribe({
      next: (data) => { this.listaProductos = data || []; },
      error: (err) => { console.error('Error al cargar productos:', err); }
    });

    this.listaCarrito = this.cargarCarrito();
    this.calcularTotal();
  }

  

  agregarCarrito(producto: Producto) {
    const existe = this.listaCarrito.find(i => i.producto.idProducto === producto.idProducto);

    if (existe) {
      this.listaCarrito = this.listaCarrito.map(i =>
        i.producto.idProducto === producto.idProducto
          ? { ...i, cantidad: i.cantidad + 1 }
          : i
      );
    } else {
      this.listaCarrito = [...this.listaCarrito, { producto: { ...producto }, cantidad: 1 }];
    }

    this.calcularTotal();
    this.guardarCarrito();
  }

  eliminarItemCarrito(id: number) {
    this.listaCarrito = this.listaCarrito.filter(i => i.producto.idProducto !== id);
    this.calcularTotal();
    this.guardarCarrito();
  }

  calcularTotal() {
    this.totalCarrito = this.listaCarrito.reduce(
      (acc, item) => acc + item.cantidad * Number(item.producto.precio || 0),
      0
    );
   
    this.totalCarrito = Math.round(this.totalCarrito * 100) / 100;
  }

  abrirCarrito() {
    this.mostrarCarrito = !this.mostrarCarrito;
  }

  irAOrden() {
    this.mostrarCarrito = false;
    this.router.navigate(['/orden']);
  }



  private cargarCarrito(): Detalle[] {
    try {
      const raw = sessionStorage.getItem('carrito') || localStorage.getItem('carrito');
      const parsed = raw ? JSON.parse(raw) : [];
      
      if (Array.isArray(parsed)) {
        return parsed
          .filter(x => x && x.producto && typeof x.cantidad === 'number' && x.cantidad > 0)
          .map(x => ({ producto: x.producto as Producto, cantidad: Number(x.cantidad) }));
      }
      return [];
    } catch {
      return [];
    }
  }

  private guardarCarrito() {
    const str = JSON.stringify(this.listaCarrito);
    sessionStorage.setItem('carrito', str);
    localStorage.setItem('carrito', str);
  }
}
