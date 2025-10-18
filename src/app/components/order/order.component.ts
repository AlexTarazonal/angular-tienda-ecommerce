import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrdenService } from '../../services/orden.service';
import { Orden } from '../../models/orden';
import { Detalle } from '../../models/detalle';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
})
export class OrderComponent implements OnInit {
  listaCarrito: Detalle[] = [];
  subtotal = 0;
  envio = 10;
  total = 0;

  cliente = {
    nombre: '',
    correo: '',
    telefono: '',
    direccion: '',
    tarjeta: '',
    vencimiento: '', // del <input type="month"> -> 'YYYY-MM'
    ccv: '',
  };

  constructor(private router: Router, private ordenService: OrdenService) {}

  ngOnInit(): void {
    // Tomamos primero sessionStorage (como en Principal), si no, localStorage
    const raw = sessionStorage.getItem('carrito') || localStorage.getItem('carrito');
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        this.listaCarrito = parsed
          .filter(x => x && x.producto && x.producto.idProducto && x.cantidad > 0)
          .map(x => ({ producto: x.producto, cantidad: Number(x.cantidad) })) as Detalle[];
      }
    } catch {
      this.listaCarrito = [];
    }
    this.calcularTotal();
  }

  /** Convierte 'YYYY-MM' a 'MM/AA' (p.ej. 2026-12 -> 12/26) */
  private vencimientoToMMYY(v: string): string {
    if (!v || !/^\d{4}-\d{2}$/.test(v)) return v || '';
    const [y, m] = v.split('-');
    return `${m}/${y.slice(-2)}`;
  }

  calcularTotal() {
    const sub = this.listaCarrito.reduce(
      (sum, item) => sum + Number(item.producto.precio || 0) * Number(item.cantidad || 0),
      0
    );
    this.subtotal = Math.round(sub * 100) / 100;
    this.total = Math.round((this.subtotal + this.envio) * 100) / 100;
  }

  generarBoletaPDF() {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('BOLETA DE COMPRA', 70, 15);
    doc.text('Esencia Fit', 80, 22);

    doc.setFontSize(12);
    doc.text(`Cliente: ${this.cliente.nombre}`, 10, 35);
    doc.text(`Correo: ${this.cliente.correo}`, 10, 43);
    doc.text(`Teléfono: ${this.cliente.telefono}`, 10, 51);
    doc.text(`Dirección: ${this.cliente.direccion}`, 10, 59);

    let y = 75;
    doc.setFontSize(13);
    doc.text('Productos:', 10, y);
    y += 8;
    doc.setFontSize(12);

    this.listaCarrito.forEach((item, idx) => {
      const totalItem = Math.round(item.producto.precio * item.cantidad * 100) / 100;
      doc.text(
        `${idx + 1}. ${item.producto.nombre}  x${item.cantidad}  -  S/. ${totalItem.toFixed(2)}`,
        10,
        y
      );
      y += 7;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    y += 6;
    doc.text(`Subtotal: S/. ${this.subtotal.toFixed(2)}`, 10, y); y += 6;
    doc.text(`Envío: S/. ${this.envio.toFixed(2)}`, 10, y); y += 6;
    doc.text(`Total: S/. ${this.total.toFixed(2)}`, 10, y);

    doc.save('boleta.pdf');
  }

  // Validaciones simples de cliente (opcional pero útil)
  private validoCliente(): boolean {
    const { nombre, correo, telefono, direccion, tarjeta, vencimiento, ccv } = this.cliente;
    if (!nombre || !correo || !telefono || !direccion || !tarjeta || !vencimiento || !ccv) return false;
    if (!/^\S+@\S+\.\S+$/.test(correo)) return false;
    if (!/^\d{9,15}$/.test(telefono)) return false;        // 9-15 dígitos
    if (!/^\d{13,19}$/.test(tarjeta.replace(/\s+/g, ''))) return false; // 13-19 dígitos (acepta distintas marcas)
    if (!/^\d{2}\/\d{2}$/.test(this.vencimientoToMMYY(vencimiento))) return false; // MM/AA
    if (!/^\d{3,4}$/.test(ccv)) return false;              // 3-4 dígitos
    return true;
  }

  finalizarCompra() {
    if (!this.validoCliente()) {
      alert('Por favor completa correctamente tus datos.');
      return;
    }
    if (!this.listaCarrito.length) {
      alert('Tu carrito está vacío.');
      return;
    }

    const orden: Orden = {
      nombre: this.cliente.nombre,
      correo: this.cliente.correo,
      telefono: this.cliente.telefono,
      direccion: this.cliente.direccion,
      tarjeta: this.cliente.tarjeta.replace(/\s+/g, ''),
      vencimiento: this.vencimientoToMMYY(this.cliente.vencimiento), // 'MM/AA'
      ccv: this.cliente.ccv,
      subtotal: this.subtotal,
      envio: this.envio,
      total: this.total,
      productos: this.listaCarrito, // 👈 el service hará JSON.stringify
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
      },
    });
  }
}
