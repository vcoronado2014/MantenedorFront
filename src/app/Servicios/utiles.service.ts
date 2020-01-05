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
      InicializeOptionsDTFac(dtOptions, largoInicial){
        dtOptions = {
            pagingType: 'full_numbers',
            pageLength: largoInicial,
            language: {
              "url": "https://cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json"
            },
            columnDefs: [
              {
                "targets": [ 0 ],
                "visible": false,
                "searchable": false
              },
              {
                "targets": [ 4 ],
                "type": 'currency'
              }
            ],
            lengthMenu: [8, 10, 20, 50],
            dom: 'Blfrtip',
            //esto hace que llegue el orden por defecto
            order:[],
/*             colReorder:{
              order: [0,1],
              fixedColumnsRight: 2
            }, */
            // Configure the buttons
            buttons: [
              {
                extend: 'collection',
                text: 'Options',
                className: 'btn-outline-secondary',
                buttons: [
                  {
                    extend: 'excelHtml5',
                    className: 'btn-outline-secondary',
                    exportOptions: {
                      columns: ':visible'
                    }
                  },
                  {
                    extend: 'csvHtml5',
                    className: 'btn-outline-secondary',
                    exportOptions: {
                      columns: ':visible'
                    }
                  },
                  {
                    extend: 'pdfHtml5',
                    className: 'btn-outline-secondary',
                    exportOptions: {
                      columns: ':visible'
                    }
                  }
                ]
              },
              {
                extend: 'colvis',
                className: 'btn-outline-secondary',
                text: 'Columns'
              },
              {
                text: 'Custom Button',
                className: 'btn-purple',
                action: function ( e, dt, node, config ) {
                  alert("Custom Button Clicked!!");
                }
              }
            ],
            "footerCallback": function (row, data, start, end, display) {
              var api = this.api(), data;

              // Remove the formatting to get integer data for summation
              var intVal = function (i) {
                return typeof i === 'string' ?
                  i.replace(/[\$,.]/g, '') * 1 :
                  typeof i === 'number' ?
                    i : 0;
              };

              // Total over all pages
              var total = api
                .column(5)
                .data()
                .reduce(function (a, b) {
                  return intVal(a) + intVal(b);
                }, 0);

              // Total over this page
              var pageTotal = api
                .column(5, { page: 'current' })
                .data()
                .reduce(function (a, b) {
                  return intVal(a) + intVal(b);
                }, 0);

                var format = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0
                });
              // Update footer
/*               $(api.column(4).footer()).html(
                'Total página $' + pageTotal + ' ( $' + total + ' total)'
              ); */
              $(api.column(4).footer()).html(
                '<span>' + 'Total página: ' + format.format(pageTotal).replace(',','.').replace(',','.') + '</span>' +
                '<span style="color:darkblue;font-size:1.3em;float:left;">' + ' Total General: ' + format.format(total).replace(',','.').replace(',','.') + '</span>'

              );
            }

          };
          return dtOptions;
      }
      retornaCondicionVenta(condicion){
        var retorno = '';
        if (condicion == 'O'){
          retorno = 'Efectivo';
        }
        else if (condicion == 'C'){
          retorno = 'Crédito';
        }
        else{
          retorno = 'No definida';
        }

        return retorno;
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
            var cliente = {
              Id: nuevoElemento.Id,
              CiuClient: nuevoElemento.CiuClient,
              ComClient: nuevoElemento.ComClient,
              DigClient: nuevoElemento.DigClient,
              DirClient: nuevoElemento.DirClient,
              Eliminado: nuevoElemento.Eliminado,
              FaxClient: nuevoElemento.FaxClient,
              GirClient: nuevoElemento.GirClient,
              NomClient: nuevoElemento.NomClient,
              RutClient: nuevoElemento.RutClient,
              TelClient: nuevoElemento.TelClient,
              CorreoClient: nuevoElemento.CorreoClient,
              FleLocal: nuevoElemento.FleLocal,
              FleDomici: nuevoElemento.FleDomici,
              DesClient: nuevoElemento.DesClient
            }

            arreglo.push(cliente);
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