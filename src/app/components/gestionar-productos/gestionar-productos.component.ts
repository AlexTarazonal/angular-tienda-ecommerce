import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto';

type Estado = 1 | 2 | 3; // 1=Activo, 2=Inactivo, 3=Agotado

@Component({
  selector: 'app-gestionar-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionar-productos.component.html',
  styleUrls: ['./gestionar-productos.component.css']
})
export class GestionarProductosComponent implements OnInit {

  productos: Producto[] = [];

  nuevoProducto: Producto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    idEstadoProducto: 1,
    imagen: ''
  };

  editProducto: Producto | null = null;

  // UI feedback
  loading = false;
  errorMsg: string | null = null;
  confirmMsg: string | null = null;

  // Activa o desactiva el chequeo de accesibilidad de imágenes (opcional)
  private readonly CHECK_IMG_REACHABLE = true;

  estados = [
    { id: 1 as Estado, label: 'Activo' },
    { id: 2 as Estado, label: 'Inactivo' },
    { id: 3 as Estado, label: 'Agotado' },
  ];

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  // ------------------- helpers -------------------

  private normalizeSpaces(v: string) {
    return v.replace(/\s+/g, ' ').trim();
  }

  /** Normaliza precio a string con punto decimal (acepta coma) */
  private precioNumRaw(v: number | string): string {
    return String(v ?? '').trim().replace(',', '.');
  }

  /** true si tiene más de 2 decimales (y es forma numérica válida) */
  private tieneMasDeDosDecimales(s: string): boolean {
    const m = s.match(/^\d+(?:\.(\d+))?$/);
    if (!m) return false; // si no es numérico, se valida aparte
    const dec = m[1];
    return dec ? dec.length > 2 : false;
  }

  /** Convierte a número SIN redondear silenciosamente */
  private precioNum(v: number | string): number {
    const s = this.precioNumRaw(v);
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  }

  private isUrlImgOk(url: string) {
    if (!url || !url.trim()) return false;
    if (url.length > 2048) return false;                // ← límite de longitud
    if (!/^https?:\/\//i.test(url)) return false;
    if (/\s/.test(url)) return false;
    const lower = url.toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.svg'].some(ext => lower.endsWith(ext));
  }

  /** Chequea si la imagen carga (opcional). Timeout corto para no trabar la UI. */
  private checkImagenAccesible(url: string, timeoutMs = 2500): Promise<boolean> {
    return new Promise(resolve => {
      const img = new Image();
      let done = false;
      const finish = (ok: boolean) => { if (!done) { done = true; resolve(ok); } };
      const to = setTimeout(() => finish(false), timeoutMs);
      img.onload = () => { clearTimeout(to); finish(true); };
      img.onerror = () => { clearTimeout(to); finish(false); };
      img.src = url;
    });
  }

  private isEnteroNoNegativo(v: any) {
    const n = Number(v);
    return Number.isInteger(n) && n >= 0;
  }

  private nombreCanonico(nombre: string) {
    return this.normalizeSpaces(nombre).toLowerCase();
  }

  private existeDuplicado(nombre: string, excluirId?: number) {
    const canon = this.nombreCanonico(nombre);
    return this.productos.some(p => {
      if (excluirId && p.idProducto === excluirId) return false;
      return this.nombreCanonico(p.nombre) === canon;
    });
  }

  private validaProducto(p: Producto, isEdit = false): string | null {
    const nombre = this.normalizeSpaces(p.nombre);
    const descripcion = this.normalizeSpaces(p.descripcion);
    const precioStr = this.precioNumRaw(p.precio);
    const precio = this.precioNum(p.precio);
    const stockOK = this.isEnteroNoNegativo(p.stock);
    const estadoOK = [1, 2, 3].includes(Number(p.idEstadoProducto));
    const imgOK = this.isUrlImgOk(p.imagen);

    // Nombre
    if (!nombre) return 'Nombre vacío o solo espacios';
    if (nombre.length < 3) return 'Nombre muy corto (min 3)';
    if (nombre.length > 100) return 'Nombre demasiado largo (max 100)';
    if (/^[0-9]+$/.test(nombre)) return 'El nombre no puede ser solo números';
    if (!/\p{L}/u.test(nombre)) return 'El nombre debe tener al menos una letra';

    // Descripción
    if (!descripcion) return 'Descripción vacía o solo espacios';
    if (descripcion.length < 10) return 'Descripción muy corta (min 10)';
    if (/^\d+$/.test(descripcion)) return 'La descripción no puede ser solo números'; // ← nuevo

    // Precio
    if (precioStr === '') return 'Precio vacío';
    if (!/^\d+(\.\d+)?$/.test(precioStr)) return 'Precio no numérico';
    if (/\s/.test(String(p.precio))) return 'Precio con espacio';
    if (this.tieneMasDeDosDecimales(precioStr)) return 'Precio con más de dos decimales'; // ← nuevo
    if (!Number.isFinite(precio) || precio < 0.5) return 'Precio inválido (min 0.5)';

    // Stock
    if (String(p.stock).trim() === '') return 'Stock vacío'; // agregar/editar
    if (!stockOK) return 'Stock inválido (entero ≥ 0)';

    // Estado
    if (!estadoOK) return 'Estado inválido (1 Activo, 2 Inactivo, 3 Agotado)';

    // Imagen (forma)
    if (!imgOK) return 'URL de imagen inválida';

    // Duplicados
    if (!isEdit && this.existeDuplicado(nombre)) return 'Nombre duplicado';
    if (isEdit && this.existeDuplicado(nombre, p.idProducto)) return 'Nombre duplicado';

    return null;
  }

  // ------------------- acciones -------------------

  cargarProductos() {
    this.loading = true;
    this.errorMsg = null;
    this.productoService.getProductos().subscribe({
      next: (res) => { this.productos = res || []; this.loading = false; },
      error: (e) => { this.loading = false; this.errorMsg = 'Error cargando productos'; console.error(e); }
    });
  }

  async agregarProducto() {
    this.confirmMsg = null; this.errorMsg = null;

    // normaliza antes de enviar
    const payload: Producto = {
      ...this.nuevoProducto,
      nombre: this.normalizeSpaces(this.nuevoProducto.nombre),
      descripcion: this.normalizeSpaces(this.nuevoProducto.descripcion),
      precio: this.precioNum(this.nuevoProducto.precio),        // sin redondeo silencioso
      stock: Number(this.nuevoProducto.stock),
      idEstadoProducto: Number(this.nuevoProducto.idEstadoProducto) as Estado,
      imagen: String(this.nuevoProducto.imagen),
    };

    const err = this.validaProducto(payload, false);
    if (err) { this.errorMsg = err; return; }

    if (this.CHECK_IMG_REACHABLE) {
      const ok = await this.checkImagenAccesible(payload.imagen);
      if (!ok) { this.errorMsg = 'URL de imagen no accesible'; return; }
    }

    this.productoService.agregarProducto(payload).subscribe({
      next: () => {
        this.confirmMsg = '✅ Producto agregado con éxito';
        this.cargarProductos();
        this.nuevoProducto = { nombre: '', descripcion: '', precio: 0, stock: 0, idEstadoProducto: 1, imagen: '' };
      },
      error: (e) => { this.errorMsg = e?.error?.error || 'Error al agregar'; console.error(e); }
    });
  }

  editarProducto(producto: Producto) {
    this.editProducto = { ...producto };
    this.confirmMsg = null; this.errorMsg = null;
  }

  async actualizarProducto() {
    if (!this.editProducto) return;
    this.confirmMsg = null; this.errorMsg = null;

    const payload: Producto = {
      ...this.editProducto,
      nombre: this.normalizeSpaces(this.editProducto.nombre),
      descripcion: this.normalizeSpaces(this.editProducto.descripcion),
      precio: this.precioNum(this.editProducto.precio),         // sin redondeo silencioso
      stock: Number(this.editProducto.stock),
      idEstadoProducto: Number(this.editProducto.idEstadoProducto) as Estado,
      imagen: String(this.editProducto.imagen),
    };

    const err = this.validaProducto(payload, true);
    if (err) { this.errorMsg = err; return; }

    if (this.CHECK_IMG_REACHABLE) {
      const ok = await this.checkImagenAccesible(payload.imagen);
      if (!ok) { this.errorMsg = 'URL de imagen no accesible'; return; }
    }

    this.productoService.actualizarProducto(payload).subscribe({
      next: () => {
        this.confirmMsg = '✅ Cambios guardados';
        this.cargarProductos();
        this.editProducto = null;
      },
      error: (e) => { this.errorMsg = e?.error?.error || 'Error al actualizar'; console.error(e); }
    });
  }

  cancelarEdicion() {
    this.editProducto = null;
  }

  eliminarProducto(id: number) {
    if (!confirm('¿Deseas eliminar este producto?')) return;
    this.productoService.eliminarProducto(id).subscribe({
      next: () => { this.cargarProductos(); this.confirmMsg = '🗑️ Producto eliminado'; },
      error: (e) => { this.errorMsg = e?.error?.error || 'Error al eliminar'; console.error(e); }
    });
  }
}
