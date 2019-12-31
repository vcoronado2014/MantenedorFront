import { Injectable, Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Http, Headers, Response } from '@angular/http';
import { environment } from '../../environments/environment';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/retry';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GajicoService{
    constructor(
        private httpClient: HttpClient,
        private http: Http
    ) {


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
        let httpHeaders = new HttpHeaders({
            'Content-Type' : 'application/json',
            'Cache-Control': 'no-cache'
        });
        httpHeaders.set('Access-Control-Allow-Origin', '*');
        let options = { headers: httpHeaders };

        let data = this.httpClient.post(url, body, options);
        return data;
    }
    postClientesP(instId) {
        let url = environment.API_ENDPOINT + 'Cliente';
        let dataGet = {
            InstId: instId
        }

        let data = this.http.post(url, dataGet, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return data;


    }
    postClientesArr(instId, rut, dv): Observable<User[]>{
        let url = environment.API_ENDPOINT + 'Cliente';
        let dataGet = {
            InstId: instId,
            Rut: rut,
            Dv: dv
        }
        return this.http.post(url, dataGet, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        }).map((response) => {
            return response.json();
        });
    }
    postGiros(instId) {
        let url = environment.API_ENDPOINT + 'Giro';
        let dataGet = {
            InstId: instId
        };

        let data = this.http.post(url, dataGet, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return data;


    }
    putGiro(nombre) {
        let url = environment.API_ENDPOINT + 'Giro';
        let dataGet = {
            Nombre: nombre
        };

        let repos = this.http.put(url, dataGet, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return repos;
    }
    putCliente(cliente) {
        let url = environment.API_ENDPOINT + 'Cliente';
        let dataGet = cliente;

        let repos = this.http.put(url, dataGet, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return repos;
    }
    //proveedores
    postProveedorArr(instId, rut, dv): Observable<Proveedor[]>{
        let url = environment.API_ENDPOINT + 'Proveedor';
        let dataGet = {
            InstId: instId,
            Rut: rut,
            Dv: dv
        }
        return this.http.post(url, dataGet, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        }).map((response) => {
            return response.json();
        });
    }
    putProveedor(proveedor) {
        let url = environment.API_ENDPOINT + 'Proveedor';
        let dataGet = proveedor;

        let repos = this.http.put(url, dataGet, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return repos;
    }
    putInstitucion(institucion) {
        let url = environment.API_ENDPOINT + 'Institucion';
        let dataGet = institucion;

        let repos = this.http.put(url, dataGet, {
            headers: new Headers({ 'Content-Type': 'application/json' })
        });
        return repos;
    }
   
}
//creacion de la interface
export interface User {
    RutClient: string;
    DigClient: string;
    NomClient: string;
    GirClient: string;
    DirClient: string;
    ComClient: string;
    CiuClient: string;
    TelClient: string;
    FaxClient: string;
    AneClient: string;
    ConClient: string;
    Id: number;
    Eliminado: number;
    CorreoClient: string;
    FleLocal: string;
    FleDomici: string;
    DesClient: string;
  }
  export interface Proveedor {
    RutProved: string;
    DigProved: string;
    NomProved: string;
    GirProved: string;
    DirProved: string;
    ComProved: string;
    CiuProved: string;
    TelProved: string;
    FaxProved: string;
    AneProved: string;
    Id: number;
    Eliminado: number;
    CorreoProved: string;
  }