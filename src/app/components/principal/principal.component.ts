import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductoService, Producto } from '../../services/producto.service';
import { CatalogoComponent } from "../catalogo/catalogo.component";
import { CarritoComponent } from "../carrito/carrito.component";
import { Detalle } from '../../models/detalle';


@Component({
  selector: 'app-principal',
  imports: [CatalogoComponent, CarritoComponent],
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.css'
})
export class PrincipalComponent implements OnInit{

  listaProductos:Producto[] = []
  listaCarrito:Detalle[] = []
  totalCarrito:number = 0
  mostrarCarrito:boolean = false

  constructor(private servicio:ProductoService, private router:Router){}
  


  ngOnInit(): void {
    this.servicio.getProductos().subscribe({
      next: (data: Producto[]) => {
        this.listaProductos = data;
      },
      error: (err) => {
        console.error("Error al cargar productos:", err);
      }
    });

  
    this.listaCarrito = JSON.parse(sessionStorage.getItem("carrito")!) || [];
    this.calcularTotal();
  }

  agregarCarrito(producto: Producto) {
  const existeItem = this.listaCarrito.find(item => item.producto.idProducto === producto.idProducto);

  if (existeItem) {
    this.listaCarrito = this.listaCarrito.map(item => {
      if (item.producto.idProducto === producto.idProducto) {
        return { ...item, cantidad: item.cantidad + 1 }
      }
      return item;
    });
  } else {
    this.listaCarrito = [
      ...this.listaCarrito,
      { producto: { ...producto }, cantidad: 1 }
    ];
  }

  this.calcularTotal();
  this.guardarSession();
}

  eliminarItemCarrito(id:number){
    this.listaCarrito = this.listaCarrito.filter(item => item.producto.idProducto !== id)
    this.calcularTotal()
    this.guardarSession()
  }

  calcularTotal(){
    this.totalCarrito = this.listaCarrito.reduce(
      (acumulador, item) => acumulador + item.cantidad * item.producto.precio, 0
    )
  }

  guardarSession(){
    sessionStorage.setItem("carrito", JSON.stringify(this.listaCarrito))
    localStorage.setItem('carrito', JSON.stringify(this.listaCarrito));
  }

  abrirCarrito(){
    this.mostrarCarrito = !this.mostrarCarrito
  }

  irAOrden() {
    this.mostrarCarrito = false;

    this.router.navigate(['/orden']);
  }
}
