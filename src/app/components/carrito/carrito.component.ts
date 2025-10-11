import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Detalle } from '../../models/detalle';

@Component({
  selector: 'app-carrito',
  imports: [],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent {
  @Input() listaCarrito:Detalle[] = []
  @Output() idEnvia = new EventEmitter()
  @Input() totalCarrito = 0

  eliminarItemCarrito(id:number){
    this.idEnvia.emit(id)
  }
}
