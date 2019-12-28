import { Injectable, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Http, Headers, Response } from '@angular/http';
import { environment } from '../../environments/environment';

import 'rxjs/add/operator/map';

@Injectable()
export class ServicioLoginService{
  username:string;
  loggedIn:boolean;
  mensajeError:string;

  constructor( 
    private http: Http
  ){

    //inicializamos los valores
    this.username = "";
    this.loggedIn = false;
    this.mensajeError = "Error en llamada Http";
    
  }

  login(usuario, clave) {

    let url = environment.API_ENDPOINT + 'login';
    let dataGet = { usuario: usuario, password: clave };


    return this.http.post(url, dataGet, { headers: new Headers({ 'Content-Type': 'application/json' }) })
      .map((data) =>
        data.json()
      ).map(data => {
        //control de errores
        
        if (data){
          this.loggedIn = true;
          //guardamos la variable de session
          var datos = JSON.stringify(data);
          sessionStorage.setItem("USER_LOGUED_IN", datos);
        }
        
        else{
          this.loggedIn = false;
        }
        return this.loggedIn;
      });
  }

  logout():void{
    sessionStorage.clear();
    this.username = "";
    this.loggedIn = false;
  }

  isLoggedId(){
    return this.loggedIn;
  }

}