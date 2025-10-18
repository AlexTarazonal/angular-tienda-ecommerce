export interface Producto {
  idProducto?: number;
  nombre: string;
  descripcion: string;
  precio: number;        
  stock: number;
  imagen: string;
  idEstadoProducto: number; 
}
