import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css'], // 👈 plural
})
export class CatalogoComponent implements OnInit {
  @Input() listaProductos: Producto[] = [];
  @Input() autoLoad = false; // si true, carga del backend
  @Output() productoEnvia = new EventEmitter<Producto>();

  loading = false;
  errorMsg: string | null = null;

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    // Si el padre NO pasa productos y activas autoLoad, los traemos del backend.
    if (this.autoLoad && (!this.listaProductos || this.listaProductos.length === 0)) {
      this.cargarProductos();
    }
  }

  private cargarProductos() {
    this.loading = true;
    this.errorMsg = null;
    this.productoService.getProductos().subscribe({
      next: (data) => {
        this.listaProductos = data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.errorMsg = 'No se pudieron cargar los productos';
        this.loading = false;
      },
    });
  }

  agregarCarrito(producto: Producto) {
    this.productoEnvia.emit(producto);
  }

  trackById = (_: number, item: Producto) => item.idProducto ?? item.nombre;
}
