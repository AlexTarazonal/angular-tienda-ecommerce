import { Detalle } from './detalle';

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
  productos: Detalle[]; 
}
