import { Injectable, Component, ViewChild,  ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Http, Headers, Response } from '@angular/http';
import { environment } from '../../environments/environment';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/retry';
import { HttpErrorResponse } from '@angular/common/http';

declare var $:any;

@Injectable()
export class UtilesService{
    constructor( 
        private http: Http,
        private httpClient: HttpClient,
      ){
        
      }
      CerrarModal(nombreModal){
        nombreModal.hide();
        if ($('.modal-backdrop').is(':visible')) {
          $('body').removeClass('modal-open'); 
          $('.modal-backdrop').remove(); 
        };
      }
      InicializeOptionsDT(dtOptions, largoInicial){
        dtOptions = {
/*             dom: '<lf<t>ip>',
            buttons: [
              'copy',
              'excel',
              'print'
            ], */
            pagingType: 'full_numbers',
            pageLength: largoInicial,
            language: {
              "url": "https://cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json"
            },
            columnDefs: [
              {
                targets: [0, 1, 2],
                className: 'mdl-data-table__cell--non-numeric'
              },
              {
                "targets": [ 0 ],
                "visible": false,
                "searchable": false
              }
            ],
            lengthMenu: [8, 10, 20, 50],
            dom: 'Blfrtip',
            // Configure the buttons
            buttons: [
              'columnsToggle',
              'colvis',
              'copy',
              'print',
              'excel',
              {
                text: 'Some button',
                key: '1',
                action: function (e, dt, node, config) {
                  alert('Button activated');
                }
              }
            ]

          };
          return dtOptions;
      }
      InsertaReemplazaElemento(nuevoElemento, arreglo){
        var esta = false;
        if (arreglo && arreglo.length >= 0){
          arreglo.forEach(cliente => {
            if (cliente.Id == nuevoElemento.Id){
              cliente.CiuClient = nuevoElemento.CiuClient;
              cliente.ComClient = nuevoElemento.ComClient;
              cliente.ConClient = nuevoElemento.ConClient;
              cliente.DigClient = nuevoElemento.DigClient;
              cliente.DirClient = nuevoElemento.DirClient;
              cliente.Eliminado = nuevoElemento.Eliminado;
              cliente.FaxClient = nuevoElemento.FaxClient;
              cliente.GirClient = nuevoElemento.GirClient;
              cliente.Id = nuevoElemento.Id;
              cliente.NomClient = nuevoElemento.NomClient;
              cliente.RutClient = nuevoElemento.RutClient;
              cliente.TelClient = nuevoElemento.TelClient;
              cliente.CorreoClient = nuevoElemento.CorreoClient;
              cliente.FleLocal = nuevoElemento.FleLocal;
              cliente.FleDomici = nuevoElemento.FleDomici;
              cliente.DesClient = nuevoElemento.DesClient;
              esta = true;
            }
          });
          if (esta == false){
            arreglo.push(nuevoElemento);
          }
        }
        return arreglo;
      }

      VerificaObjetoArray(nombre, arreglo){
        var retorno = false;
        if (arreglo && arreglo.length > 0){
          arreglo.forEach(giro => {
            if (giro.Nombre.toUpperCase() == nombre.toUpperCase()){
              retorno = true;
            }
          });
        }
        return retorno;
      }
      UpperCaseF(a) {
        setTimeout(function () {
          a.target.value = a.target.value.toUpperCase();
        }, 1);
      }
}