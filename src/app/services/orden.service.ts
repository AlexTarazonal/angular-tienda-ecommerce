import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Orden } from '../models/orden';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrdenService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/ordenes`;

  crearOrden(orden: Orden): Observable<{ message: string; idOrden: number }> {
    
    const payload = {
      ...orden,
      productos: JSON.stringify(orden.productos || []),
    };
    return this.http.post<{ message: string; idOrden: number }>(this.apiUrl, payload);
  }
}
