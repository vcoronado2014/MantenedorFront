import { Injectable, Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Http, Headers, Response } from '@angular/http';
import { environment } from '../../environments/environment';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/retry';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GlobalService{

  
    constructor( 
      private http: Http,
      private httpClient: HttpClient
    ){
  
      //inicializamos los valores
      
    }
    postClientes(instId)  {
        const headers = new Headers;
        const body = JSON.stringify(
            {
                InstId: instId
            }
        );
        headers.append('Access-Control-Allow-Origin', '*');
        let url = environment.API_ENDPOINT + 'Cliente';
/*         let dataGet = {
            InstId: instId
        }; */
        let httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };

        let data = this.httpClient.post(url, body, options);
        return data;
    }
    postRegiones(instId) {
        let url = environment.API_ENDPOINT + 'ObtenerRegiones';
        let dataGet = {
            InstId: instId
        };

        let data = this.http.post(url, dataGet, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return data;


    }
    public postClientesP(instId) {
        let url = environment.API_ENDPOINT + 'Cliente';
        let dataGet = {
            InstId: instId
        }

        let data = this.http.post(url, dataGet, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return data;


    }
    postRoles(rolIdLogueado, id) {
        let url = environment.API_ENDPOINT + 'Roles';
        let dataGet = {
            RolId: rolIdLogueado,
            Id: id
        };

        let data = this.http.post(url, dataGet, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return data;


    }
    postNodos(traeSeleccione, id) {
        let url = environment.API_ENDPOINT + 'Nodo';
        let dataGet = {
            TraeSeleccione: traeSeleccione,
            Id: id
        };

        let data = this.http.post(url, dataGet, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return data;


    }
    postComunas(regId, id) {
        let url = environment.API_ENDPOINT + 'ObtenerComunas';
        let dataGet = {
            RegId: regId,
            Id: id
        };

        let data = this.http.post(url, dataGet, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return data;

    }
    postUsuarios(nodId, id) {
        let url = environment.API_ENDPOINT + 'Usuarios';
        let dataGet = {
            NodId: nodId,
            Id: id
        };

        let data = this.http.post(url, dataGet, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return data;

    }
    activarUsuario(nodId, id, activo) {
        let url = environment.API_ENDPOINT + 'ActivarUsuario';
        let dataGet = {
            NodId: nodId,
            Id: id,
            Activo: activo
        };

        let data = this.http.post(url, dataGet, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return data;

    }
    putUsuario(usuario) {
        let url = environment.API_ENDPOINT + 'Usuarios';
        let dataGet = usuario;

        let repos = this.http.put(url, dataGet, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return repos;
    }

  
  }