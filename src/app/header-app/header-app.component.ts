import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-header-app',
  templateUrl: './header-app.component.html',
  styleUrls: ['./header-app.component.css']
})
export class HeaderAppComponent implements OnInit {
  usuario;
  logueado = false;
  constructor(
    private router: Router
  ) {

   }

  ngOnInit() {
    if (sessionStorage.getItem("USER_LOGUED_IN")){
      this.usuario = JSON.parse(sessionStorage.getItem("USER_LOGUED_IN"));
      if (this.usuario.AutentificacionUsuario){
        this.logueado = true;

      }

    }
  }
  salir(){
    sessionStorage.clear();
    this.router.navigateByUrl('/home')
    .then(data => console.log(data),
      error =>{
        console.log(error);
      }
    )
  }

}
