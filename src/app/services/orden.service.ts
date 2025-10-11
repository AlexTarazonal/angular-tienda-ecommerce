import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Orden {
  nombre: string;
  correo: string;
  telefono: string;
  direccion: string;
  tarjeta: string;
  vencimiento: string;
  ccv: string;
  subtotal: number;
  envio: number;
  total: number;
  productos: string; // guardamos como JSON o texto la lista del carrito
}

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  private apiUrl = 'http://localhost:3000/ordenes';

  constructor(private http: HttpClient) {}

  crearOrden(orden: Orden): Observable<any> {
    return this.http.post(this.apiUrl, orden);
  }
}
