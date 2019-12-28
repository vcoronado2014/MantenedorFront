import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

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

}
