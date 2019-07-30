   
import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/retry';
import { HttpErrorResponse } from '@angular/common/http';

//Plugin
//import { ToastsManager } from 'ng2-toastr/ng2-toastr';
//Servicios
import { ServicioLoginService } from '../servicios/servicio-login-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loading = false;
  loginUsuario:string;
  loginContrasena:string;
  isLogged; 
  rol;


  constructor(
    private auth: ServicioLoginService,
               private router: Router,
               //private toastr: ToastsManager,
               private _vcr: ViewContainerRef
  ) { }

  ngOnInit() {
  }
  IniciarSesion(){

    if (!this.loginUsuario ){
      return console.log('Nombre de usuario requerido');
      //return this.showToast('error','Nombre de usuario requerido','Error');
    }
    if(!this.loginContrasena){
      return console.log('clave vacia'); 
      //return this.showToast('error','Contraseña requerida','Error');
    }
    this.loading = true;
    this.auth.login(this.loginUsuario,this.loginContrasena).subscribe(
      rs=> {
        this.loading = false;
        this.isLogged = rs;
        //comentado por mientras
        /*
        this.rol = sessionStorage.getItem("Rol");
        console.log(this.isLogged);
        sessionStorage.setItem('IsLogged', this.isLogged);
        console.log(this.rol);
        */
      },
      er => {
        this.loading = false;
        console.log('incorrecto' + er);
        //this.showToast('error',this.auth.mensajeError,'Error'); 
      },
      () => {
        if(this.isLogged){
          //correcto
          console.log('Correcto administrador web');
          //comentado por mientras
          /*
          this.router.navigateByUrl('/administracion-web')
          .then(data => console.log(data),
            error =>{
              console.log(error);
            }
          )
          */
        }
        else{
          //incorrecto
          console.log('Incorrecto');
          //this.showToast('error',this.auth.mensajeError,'Error');
        }
      }
    );
     
  }
}
