import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-menu-parametros',
  templateUrl: './menu-parametros.component.html',
  styleUrls: ['./menu-parametros.component.css']
})
export class MenuParametrosComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }
  abrirUsuarios(){
    this.router.navigateByUrl('/usuarios')
    .then(data => console.log(data),
      error =>{
        console.log(error);
      }
    )
  }
  abrirClientes(){
    this.router.navigateByUrl('/clientes')
    .then(data => console.log(data),
      error =>{
        console.log(error);
      }
    )
  }
  abrirProveedores(){
    this.router.navigateByUrl('/proveedores')
    .then(data => console.log(data),
      error =>{
        console.log(error);
      }
    )
  }

}
