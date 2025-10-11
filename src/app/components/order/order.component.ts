import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrdenService, Orden } from '../../services/orden.service'; 
import jsPDF from 'jspdf';

interface ProductoCarrito {
  producto: {
    id: number;
    nombre: string;
    precio: number;
  };
  cantidad: number;
}

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  listaCarrito: ProductoCarrito[] = [];
  subtotal: number = 0;
  envio: number = 10;
  total: number = 0;

  cliente = {
    nombre: '',
    correo: '',
    telefono: '',
    direccion: '',
    tarjeta: '',
    vencimiento: '',
    ccv: ''
  };

  constructor(private router: Router, private ordenService: OrdenService) {}
  

  ngOnInit(): void {
    const data = localStorage.getItem('carrito');
    if (data) {
      this.listaCarrito = JSON.parse(data);
      this.calcularTotal();
    }
  }

  calcularTotal() {
    this.subtotal = this.listaCarrito.reduce(
      (sum, item) => sum + item.producto.precio * item.cantidad,
      0
    );
    this.total = this.subtotal + this.envio;
  }

  generarBoletaPDF() {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('BOLETA DE COMPRA', 70, 15);
    doc.text('Esencia Fit', 80, 20);

    doc.setFontSize(12);
    doc.text(`Cliente: ${this.cliente.nombre}`, 10, 30);
    doc.text(`Correo: ${this.cliente.correo}`, 10, 40);
    doc.text(`Teléfono: ${this.cliente.telefono}`, 10, 50);
    doc.text(`Dirección: ${this.cliente.direccion}`, 10, 60);

  
    let y = 80;
    doc.text('Productos:', 10, y);
    y += 10;

    this.listaCarrito.forEach((item, index) => {
      doc.text(
        `${index + 1}. ${item.producto.nombre} x${item.cantidad} - S/. ${
          item.producto.precio * item.cantidad
        }`,
        10,
        y
      );
      y += 10;
    });

  
    y += 10;
    doc.text(`Subtotal: S/. ${this.subtotal}`, 10, y);
    y += 10;
    doc.text(`Envío: S/. ${this.envio}`, 10, y);
    y += 10;
    doc.text(`Total: S/. ${this.total}`, 10, y);

    doc.save('boleta.pdf');
  }

  finalizarCompra() {
    if (
      !this.cliente.nombre ||
      !this.cliente.correo ||
      !this.cliente.telefono ||
      !this.cliente.direccion ||
      !this.cliente.tarjeta ||
      !this.cliente.vencimiento ||
      !this.cliente.ccv
    ) {
      alert('Por favor completa todos los datos');
      return;
    }

    const orden: Orden = {
      nombre: this.cliente.nombre,
      direccion: this.cliente.direccion,
    correo: this.cliente.correo,
     telefono: this.cliente.telefono,   // 👈 agregado
     tarjeta: this.cliente.tarjeta,
      vencimiento: this.cliente.vencimiento,
      ccv: this.cliente.ccv,
      subtotal: this.subtotal,
      envio: this.envio,
      total: this.total,
      productos: JSON.stringify(this.listaCarrito)
    };


    

    this.ordenService.crearOrden(orden).subscribe({
      next: (res) => {
        console.log('Orden guardada:', res);
        this.generarBoletaPDF();
        alert('Compra realizada con éxito ✅');
        this.listaCarrito = [];
        this.subtotal = 0;
        this.total = 0;
        sessionStorage.removeItem('carrito');
        localStorage.removeItem('carrito');
        this.router.navigate(['/catalogo']);
      },
      error: (err) => {
        console.error('Error al guardar la orden:', err);
        alert('Hubo un error al procesar la orden ❌');
      }
    });
  }
}
