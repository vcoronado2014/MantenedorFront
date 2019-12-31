import { Component, OnInit, ViewContainerRef, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs';

import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/map';

import { HttpErrorResponse } from '@angular/common/http';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

//servicios
import { GlobalService } from '../servicios/global.service';
import { GajicoService, Proveedor } from '../servicios/gajico.service';
import { UtilesService } from '../servicios/utiles.service';
import { DISABLED } from '@angular/forms/src/model';
//completer
import { CompleterService, CompleterData } from 'ng2-completer';
import { DataTableDirective } from 'angular-datatables';
import { ModalDirective } from 'ngx-bootstrap/modal';
//dialog
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

declare var $: any;


@Component({
    selector: 'app-menu-parametros',
    templateUrl: './menu-parametros.component.html',
    styleUrls: ['./menu-parametros.component.css']
})
export class MenuParametrosComponent implements OnInit {
    nodIdLogueado;
    rolIdLogueado;
    usuarioEditando;
    nombreUsuarioLogueado;
    objetoLogueado;

    forma: FormGroup;
    //loading
    loading = false;
    //variables
    listaRegiones;
    listaGiros;
    listaGirosStr;
    listaComunas;
    //institucion
    institucion;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private global: GlobalService,
        private gajico: GajicoService,
        private toastr: ToastsManager,
        public completerService: CompleterService,
        public utiles: UtilesService,
        public dialog: MatDialog,
        private _vcr: ViewContainerRef
    ) {
        this.toastr.setRootViewContainerRef(_vcr);
    }

    ngOnInit() {
        if (sessionStorage.getItem("USER_LOGUED_IN")) {
            var usuarioLogueado = JSON.parse(sessionStorage.getItem("USER_LOGUED_IN"));
            if (usuarioLogueado.AutentificacionUsuario) {
                this.nodIdLogueado = usuarioLogueado.AutentificacionUsuario.InstId;
                this.rolIdLogueado = usuarioLogueado.Rol.Id;
                this.nombreUsuarioLogueado = usuarioLogueado.AutentificacionUsuario.NombreUsuario;
                this.institucion = usuarioLogueado.Institucion;
                this.objetoLogueado = usuarioLogueado;
            }
        }
        this.obtenerRegiones(this.nodIdLogueado);
        this.obtenerGiros(this.nodIdLogueado);
        //this.cargarClientes(this.nodIdLogueado);
        this.cargarForma();
    }
    cargarDatosInstitucion() {
        console.log(this.institucion);
        //comuna del usuario
        this.obtenerComunas(this.institucion.Ciudad, null);
        //setear los campos
        //this.forma.controls.nuevoNombreUsuario
        this.forma.setValue({
            nuevoRut: this.institucion.Rut,
            nuevoDig: this.institucion.Dv,
            nuevoNombre: this.institucion.Nombre,
            nuevoRegion: this.institucion.Ciudad,
            nuevoGiro: this.institucion.Giro,
            nuevoComuna: this.institucion.Comuna,
            nuevoDireccion: this.institucion.Direccion,
            nuevoTelefonos: this.institucion.Telefono,
            nuevoCorreo: this.institucion.CorreoElectronico,
            nuevoFax: this.institucion.Fax,
            nuevoTitulo: this.institucion.Titulo,
            nuevoSubtitulo: this.institucion.Subtitulo,
        });
    }
    guardarInstitucion() {
        if (this.forma.valid) {
            var rut = '';
            if (this.forma.controls.nuevoRut){
              if (this.forma.controls.nuevoRut.value != null){
                rut = String(this.forma.controls.nuevoRut.value);
              }
            }
            var dv = '';
            if (this.forma.controls.nuevoDig){
              if (this.forma.controls.nuevoDig.value != null){
                dv = String(this.forma.controls.nuevoDig.value);
              }
            }
            var nombres = '';
            if (this.forma.controls.nuevoNombre) {
                if (this.forma.controls.nuevoNombre.value != null) {
                    nombres = String(this.forma.controls.nuevoNombre.value);
                }
            }
            var giro = '';
            if (this.forma.controls.nuevoGiro) {
                if (this.forma.controls.nuevoGiro.value != null) {
                    giro = String(this.forma.controls.nuevoGiro.value);
                }
            }
            var comuna = '';
            if (this.forma.controls.nuevoComuna) {
                if (this.forma.controls.nuevoComuna.value != null) {
                    comuna = String(this.forma.controls.nuevoComuna.value);
                }
            }
            var ciudad = '';
            if (this.forma.controls.nuevoRegion) {
                if (this.forma.controls.nuevoRegion.value != null) {
                    ciudad = String(this.forma.controls.nuevoRegion.value);
                }
            }
            var direccion = '';
            if (this.forma.controls.nuevoDireccion) {
                if (this.forma.controls.nuevoDireccion.value != null) {
                    direccion = String(this.forma.controls.nuevoDireccion.value);
                }
            }
            var telefonos = '';
            if (this.forma.controls.nuevoTelefonos) {
                if (this.forma.controls.nuevoTelefonos.value != null) {
                    telefonos = String(this.forma.controls.nuevoTelefonos.value);
                }
            }
            var correo = '';
            if (this.forma.controls.nuevoCorreo) {
                if (this.forma.controls.nuevoCorreo.value != null) {
                    correo = String(this.forma.controls.nuevoCorreo.value);
                }
            }
            var fax = '';
            if (this.forma.controls.nuevoFax) {
                if (this.forma.controls.nuevoFax.value != null) {
                    fax = String(this.forma.controls.nuevoFax.value);
                }
            }
            var titulo = '';
            if (this.forma.controls.nuevoTitulo) {
                if (this.forma.controls.nuevoTitulo.value != null) {
                    titulo = String(this.forma.controls.nuevoTitulo.value);
                }
            }
            var subtitulo = '';
            if (this.forma.controls.nuevoSubtitulo) {
                if (this.forma.controls.nuevoSubtitulo.value != null) {
                    subtitulo = String(this.forma.controls.nuevoSubtitulo.value);
                }
            }

            if (String(this.forma.controls.nuevoComuna.value) == '' || String(this.forma.controls.nuevoComuna.value) == 'Seleccione') {
                return this.showToast('error', 'Seleccione Comuna', 'Requerido');
            }
            if (String(this.forma.controls.nuevoGiro.value) == '') {
                return this.showToast('error', 'Seleccione Giro', 'Requerido');
            }
            if (String(this.forma.controls.nuevoRegion.value) == '' || String(this.forma.controls.nuevoRegion.value) == 'Seleccione') {
                return this.showToast('error', 'Seleccione Región', 'Requerido');
            }
            //ahora creamos la entidad a enviar
            var entidad = {
                Rut: rut,
                Dv: dv,
                Id: this.institucion.Id,
                Nombre: nombres,
                Region: ciudad.toUpperCase(),
                Giro: giro.toUpperCase(),
                Comuna: comuna.toUpperCase(),
                Direccion: direccion,
                Telefono: telefonos,
                CorreoElectronico: correo,
                Fax: fax,
                Eliminado: 0,
                Titulo: titulo,
                Subtitulo: subtitulo
            }
            this.loading = true;
            this.gajico.putInstitucion(entidad).subscribe(
                data => {
                    var institucionModificada = data.json();
                    this.institucion = institucionModificada;
                    this.objetoLogueado.Institucion = institucionModificada;
                    var datos = JSON.stringify(this.objetoLogueado);
                    sessionStorage.setItem("USER_LOGUED_IN", datos);
                },
                err => {
                    console.error(err);
                    this.showToast('error', err, 'Error');
                    this.loading = false;

                },
                () => {
                    console.log('save completed');
                    this.showToast('success', 'Guardado con éxito', 'Institucion');
                    //cierre del modal
                    this.utiles.CerrarModal($('#modalEdicion'));
                    this.loading = false;

                }
            );
        }
        else {
            this.showToast('error', 'Revise campos', 'Requeridos');
        }
    }
    obtenerGiros(instId) {
        //indicador valor
        this.listaGirosStr = [];
        this.loading = true;
        this.gajico.postGiros(instId).subscribe(
            data => {
                if (data) {
                    this.listaGiros = data.json();
                    this.listaGiros.forEach(element => {
                        this.listaGirosStr.push(element.Nombre);
                    });
                    console.log(this.listaGiros);
                    //this.showToast('success', 'Correcto', 'Recuperado');
                }
            },
            err => {
                console.error(err);
                this.loading = false;
                this.showToast('error', err, 'Error');
            },
            () => {
                this.loading = false;
                console.log('get info Regiones');
            }
        );

    }
    //metodos de obtención
    obtenerRegiones(instId) {
        //indicador valor
        this.loading = true;
        this.global.postRegiones(instId).subscribe(
            data => {
                if (data) {
                    this.listaRegiones = data.json();
                    console.log(this.listaRegiones);
                    //this.showToast('success', 'Correcto', 'Recuperado');
                }
            },
            err => {
                console.error(err);
                this.loading = false;
                this.showToast('error', err, 'Error');
            },
            () => {
                this.loading = false;
                console.log('get info Regiones');
            }
        );

    }
    obtenerComunas(regId, id) {
        //indicador valor
        this.listaComunas = [];
        this.loading = true;
        this.global.postComunas(regId, id).subscribe(
            data => {
                if (data) {
                    this.listaComunas = data.json();
                    //this.forma.controls.nuevoUsuarioComuna.setValue('0');
                    console.log(this.listaComunas);
                    //this.showToast('success', 'Correcto', 'Recuperado');
                }
            },
            err => {
                console.error(err);
                this.loading = false;
                this.showToast('error', err, 'Error');
            },
            () => {
                this.loading = false;
                console.log('get info comunas');
            }
        );

    }

    //cargamos la forma
    cargarForma() {

        this.forma = new FormGroup({
            'nuevoRut': new FormControl('', [Validators.required, Validators.minLength(3)]),
            'nuevoDig': new FormControl('', [Validators.required, Validators.maxLength(1)]),
            'nuevoNombre': new FormControl('', Validators.required),
            'nuevoRegion': new FormControl('', Validators.required),
            'nuevoGiro': new FormControl('', Validators.required),
            'nuevoComuna': new FormControl('', Validators.required),
            'nuevoDireccion': new FormControl('', Validators.required),
            'nuevoTelefonos': new FormControl(''),
            'nuevoCorreo': new FormControl('', [Validators.pattern("[^ @]*@[^ @]*")]),
            'nuevoFax': new FormControl(''),
            'nuevoTitulo': new FormControl(''),
            'nuevoSubtitulo': new FormControl(''),
        });

        console.log(this.forma.valid + ' ' + this.forma.status);
    }

    //on change
    onChangeRegion(event) {
        console.log(event.target.value);
        this.obtenerComunas(event.target.value, null);
        this.forma.controls.nuevoComuna.setValue('Seleccione');
    }
    abrirUsuarios() {
        this.router.navigateByUrl('/usuarios')
            .then(data => console.log(data),
                error => {
                    console.log(error);
                }
            )
    }
    abrirClientes() {
        this.router.navigateByUrl('/clientes')
            .then(data => console.log(data),
                error => {
                    console.log(error);
                }
            )
    }
    abrirProveedores() {
        this.router.navigateByUrl('/proveedores')
            .then(data => console.log(data),
                error => {
                    console.log(error);
                }
            )
    }

    showToast(tipo, mensaje, titulo) {
        if (tipo == 'success') {
            this.toastr.success(mensaje, titulo);
        }
        if (tipo == 'error') {
            this.toastr.error(mensaje, titulo);
        }
        if (tipo == 'info') {
            this.toastr.info(mensaje, titulo);
        }
        if (tipo == 'warning') {
            this.toastr.warning(mensaje, titulo);
        }

    }

}
