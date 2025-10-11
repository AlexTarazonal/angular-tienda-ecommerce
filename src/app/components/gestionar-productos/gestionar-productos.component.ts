import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto } from '../../services/producto.service';

@Component({
  selector: 'app-gestionar-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-productos.component.html',
  styleUrls: ['./gestionar-productos.component.css']
})
export class GestionarProductosComponent implements OnInit {

  productos: Producto[] = [];
  nuevoProducto: Producto = { nombre: '', descripcion: '', precio: 0, stock: 0, idEstadoProducto: 1, imagen: '' };
  editProducto: Producto | null = null;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.getProductos().subscribe(res => this.productos = res);
  }

  agregarProducto() {
    this.productoService.agregarProducto(this.nuevoProducto).subscribe(() => {
      this.cargarProductos();
      this.nuevoProducto = { nombre: '', descripcion: '', precio: 0, stock: 0, idEstadoProducto: 1, imagen: '' };
    });
  }

  editarProducto(producto: Producto) {
    this.editProducto = { ...producto };
  }

  actualizarProducto() {
    if (!this.editProducto) return;
    this.productoService.actualizarProducto(this.editProducto).subscribe(() => {
      this.cargarProductos();
      this.editProducto = null;
    });
  }

  eliminarProducto(id: number) {
    if (!confirm('¿Deseas eliminar este producto?')) return;
    this.productoService.eliminarProducto(id).subscribe(() => this.cargarProductos());
  }
}
