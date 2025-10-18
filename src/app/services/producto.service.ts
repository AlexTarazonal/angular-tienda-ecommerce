import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/productos`;

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  agregarProducto(prod: Producto): Observable<{ message: string; idProducto: number }> {
    return this.http.post<{ message: string; idProducto: number }>(this.apiUrl, prod);
  }

  actualizarProducto(prod: Producto): Observable<{ message: string }> {
    if (!prod.idProducto) throw new Error('idProducto requerido');
    return this.http.put<{ message: string }>(`${this.apiUrl}/${prod.idProducto}`, prod);
  }

  eliminarProducto(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
