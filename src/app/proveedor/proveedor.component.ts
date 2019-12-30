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
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

declare var $:any;

@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.css']
})
export class ProveedorComponent implements OnInit, OnDestroy {
  @ViewChild(DataTableDirective)
  
  dtElement: DataTableDirective;
  //dtOptions: DataTables.Settings = {};
  dtOptions: any = {};
  persons: Proveedor[] = [];
    // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject();

  verGiro=false;
  editando=false;
  ausIdEditando=0;
  forma:FormGroup;
  //loading
  loading = false;
  //variables
  listaRegiones;
  listaGiros;
  listaGirosStr;

  listaComunas;
  listaNodos;
  listaRoles;
  nodIdLogueado;
  rolIdLogueado;
  usuarioEditando;
  tituloModal;
  usuDesactivarActivar;
  nombreUsuarioLogueado;


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
    if (sessionStorage.getItem("USER_LOGUED_IN")){
      var usuarioLogueado = JSON.parse(sessionStorage.getItem("USER_LOGUED_IN"));
      if (usuarioLogueado.AutentificacionUsuario){
        this.nodIdLogueado = usuarioLogueado.AutentificacionUsuario.InstId;
        this.rolIdLogueado = usuarioLogueado.Rol.Id;
        this.nombreUsuarioLogueado = usuarioLogueado.AutentificacionUsuario.NombreUsuario;
      }
    }
    this.dtOptions = this.utiles.InicializeOptionsDT(this.dtOptions, 8);

    this.obtenerRegiones(this.nodIdLogueado);
    this.obtenerGiros(this.nodIdLogueado);
    this.cargarClientes(this.nodIdLogueado);
    this.cargarForma(); 

  }
  buscarRut(rut, dv){
    var cliente = null;
    if (this.persons && this.persons.length >= 0){
      this.persons.forEach(clienteArr => {
        if (clienteArr.RutProved.toUpperCase() == rut.toUpperCase() && clienteArr.DigProved.toUpperCase() == dv.toUpperCase()){
          cliente = clienteArr;
        }
      });
    }
    return cliente;    
  }
  limpiar(){
    this.editando = false;
    this.forma.reset({});
    //nodo del usuario
    //this.obtenerNodos(false, this.nodIdLogueado);
    this.forma.controls.nuevoRegion.setValue("Seleccione");
    this.obtenerComunas("Seleccione", null);
    this.usuarioEditando = null;
    this.ausIdEditando = 0;
    this.forma.controls.nuevoRut.enable();
    this.forma.controls.nuevoDig.enable();
    this.tituloModal = 'Creando proveedor';
  }

  rerender() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtOptions = this.utiles.InicializeOptionsDT(this.dtOptions, 8);
      this.dtTrigger.next();
    });
  }

  rerenderNod(nodId) {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtOptions = this.utiles.InicializeOptionsDT(this.dtOptions, 8);
      this.loading = true;
      this.gajico.postProveedorArr(nodId, null, null).subscribe((data: Proveedor[]) => {
        this.persons = data;
        this.dtTrigger.next();
        this.loading = false;
      });
    });
  }
  cargarClientes(nodId){
    this.loading = true;
    this.gajico.postProveedorArr(nodId, null, null).subscribe((data: Proveedor[]) => {
      this.persons = data;
      this.dtTrigger.next();
      this.loading = false;
    });
  }

  keyDowEnter(event){
    console.log(event);
    var rut = this.forma.controls.nuevoRut.value;
    var dv = this.forma.controls.nuevoDig.value;
    var elementos = {
      Rut: rut,
      Dv: dv
    }
    //ambos elementos deben existir para realizar la llamada
    if (rut && rut.length > 0 && dv && dv.length > 0){
      //ahora realizamos la busqueda
      var cliente;
      this.loading = true;
      this.gajico.postProveedorArr(this.nodIdLogueado, rut, dv).subscribe((data: Proveedor[]) => {
        //revisamos si la data viene correcta
        if (data && data.length == 1){
          cliente = data[0];
          this.usuarioEditando = cliente;
          this.editar(cliente);
          this.loading = false;
        }
        else {
          //el usuario no existe, deberiamos mandar el foco al nombre
  
          this.loading = false;
        }
        
      });

      console.log(elementos);
    }

  }
  buscarCliente(nodId, rut, dv){
    var cliente = null;
    this.loading = true;
    this.gajico.postProveedorArr(nodId, rut, dv).subscribe((data: Proveedor[]) => {
      //revisamos si la data viene correcta
      if (data && data.length == 1){
        cliente = data[0];
        this.loading = false;
      }
      else {
        //el usuario no existe, deberiamos mandar el foco al nombre

        this.loading = false;
      }
      
    });
    return cliente;
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
  mostrarGiro(mostrar){
    if (mostrar){
      this.verGiro = true;
    }
    else{
      this.verGiro = false;
    }
  }
  upperCaseF(a) {
    setTimeout(function () {
      a.target.value = a.target.value.toUpperCase();
    }, 1);
  }

  insertarGiro(){
    //antes debemos validar si existe o no en la lista de giros
    var nombre = $('#nuevoGiroGuardar').val();
    if (this.utiles.VerificaObjetoArray(nombre, this.listaGiros)){
      this.showToast('error', 'El giro ya se encuentra agregado en la lista', 'Ya existe');
      return;
    }
    //indicador valor
    this.loading = true;
    this.gajico.putGiro(nombre).subscribe(
      data => {
        if (data) {
          var nuevoGiro = data.json();
          //ahora que tenemos el nuevo giro lo insertamos a la lista
          this.listaGiros.push(nuevoGiro);
          this.listaGirosStr.push(nuevoGiro.Nombre);
          //y lo dejamos seleccionado en el control
          this.forma.controls.nuevoGiro.setValue(nuevoGiro.Nombre);
          //ahora cerramos el control
          this.verGiro = false;
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
  obtenerGiros(instId){
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

  //cargamos la forma
  cargarForma(){

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
      'nuevoFax': new FormControl('')
    });

    console.log(this.forma.valid + ' ' + this.forma.status);
  }
  //edicion
  editar(usu){
    //this.cargarForma();
    if (usu){
      console.log(usu);
      this.editando = true;
      this.ausIdEditando = usu.Id;
      //this.cargarForma();
      this.tituloModal = 'Editando a ' + usu.NomProved;
      this.usuarioEditando = usu;
      //cargamos los combos
      //comuna del usuario
      this.obtenerComunas(this.usuarioEditando.CiuProved, null);
      //setear los campos
      //this.forma.controls.nuevoNombreUsuario
      this.forma.setValue({
        nuevoRut: this.usuarioEditando.RutProved,
        nuevoDig: this.usuarioEditando.DigProved,
        nuevoNombre: this.usuarioEditando.NomProved,
        nuevoRegion: this.usuarioEditando.CiuProved,
        nuevoGiro: this.usuarioEditando.GirProved,
        nuevoComuna: this.usuarioEditando.ComProved,
        nuevoDireccion: this.usuarioEditando.DirProved,
        nuevoTelefonos: this.usuarioEditando.TelProved,
        nuevoCorreo: this.usuarioEditando.CorreoProved,
        nuevoFax: this.usuarioEditando.FaxProved,
      });
      //deshabilitamos
      this.forma.controls.nuevoRut.disable();
      this.forma.controls.nuevoDig.disable();
    }
  }
  seleccionar(usu){
    
    var entidad = {
      AusId: usu.Id,
      Id: usu.Id,
      Rut: usu.RutProved,
      Dv: usu.DigProved,
      Nombres: usu.NomProved.toUpperCase(),
      Region: usu.CiuProved.toUpperCase(),
      Giro: usu.GirProved.toUpperCase(),
      Comuna: usu.ComProved.toUpperCase(),
      Direccion: usu.DirProved.toUpperCase(),
      Telefonos: usu.TelProved,
      Correo: usu.CorreoProved.toUpperCase(),
      Fax: usu.FaxProved
    }
    this.usuDesactivarActivar = entidad;
    
  }
  activar(){
    if (this.usuDesactivarActivar && this.usuDesactivarActivar.Id > 0) {
      this.usuDesactivarActivar.Eliminado = 0;
      this.loading = true;
      this.gajico.putProveedor(this.usuDesactivarActivar).subscribe(
        data => {
          var cliente = data.json();
          this.rerenderNod(this.nodIdLogueado);
        },
        err => {
          console.error(err);
          this.showToast('error', err, 'Error');
          this.loading = false;

        },
        () => {
          console.log('save completed');
          this.showToast('success', 'Activado con éxito', 'Proveedor');
          //cierre del modal
          this.utiles.CerrarModal($('#exampleModalCenter1'));
          //$("#exampleModalCenter").modal("toggle");
          this.loading = false;

        }
      );
    }
  }
  desactivar(){

    //antes verificamos que se encuentre seleccionado el usuario a desactivar
    if (this.usuDesactivarActivar && this.usuDesactivarActivar.Id > 0) {
      this.usuDesactivarActivar.Eliminado = 1;
      this.loading = true;
      this.gajico.putProveedor(this.usuDesactivarActivar).subscribe(
        data => {
          var cliente = data.json();
          this.rerenderNod(this.nodIdLogueado);
        },
        err => {
          console.error(err);
          this.showToast('error', err, 'Error');
          this.loading = false;

        },
        () => {
          console.log('save completed');
          this.showToast('success', 'Eliminado con éxito', 'Proveedor');
          //cierre del modal
          this.utiles.CerrarModal($('#exampleModalCenter'));
          //$("#exampleModalCenter").modal("toggle");
          this.loading = false;

        }
      );
    }
  }

  guardar(){
    if (this.forma.valid){
      //correcto
      //ahora los demas elementos
      //nombre usuario
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
      if (this.forma.controls.nuevoNombre){
        if (this.forma.controls.nuevoNombre.value != null){
          nombres = String(this.forma.controls.nuevoNombre.value);
        }
      }
      var giro = '';
      if (this.forma.controls.nuevoGiro){
        if (this.forma.controls.nuevoGiro.value != null){
          giro = String(this.forma.controls.nuevoGiro.value);
        }
      }
      var comuna = '';
      if (this.forma.controls.nuevoComuna){
        if (this.forma.controls.nuevoComuna.value != null){
          comuna = String(this.forma.controls.nuevoComuna.value);
        }
      }
      var ciudad = '';
      if (this.forma.controls.nuevoRegion){
        if (this.forma.controls.nuevoRegion.value != null){
          ciudad = String(this.forma.controls.nuevoRegion.value);
        }
      }
      var direccion = '';
      if (this.forma.controls.nuevoDireccion){
        if (this.forma.controls.nuevoDireccion.value != null){
          direccion = String(this.forma.controls.nuevoDireccion.value);
        }
      }
      var telefonos = '';
      if (this.forma.controls.nuevoTelefonos){
        if (this.forma.controls.nuevoTelefonos.value != null){
          telefonos = String(this.forma.controls.nuevoTelefonos.value);
        }
      }
      var correo = '';
      if (this.forma.controls.nuevoCorreo){
        if (this.forma.controls.nuevoCorreo.value != null){
          correo = String(this.forma.controls.nuevoCorreo.value);
        }
      }
      var fax = '';
      if (this.forma.controls.nuevoFax){
        if (this.forma.controls.nuevoFax.value != null){
          fax = String(this.forma.controls.nuevoFax.value);
        }
      }

      if (String(this.forma.controls.nuevoComuna.value) == '' || String(this.forma.controls.nuevoComuna.value) == 'Seleccione'){
        return this.showToast('error', 'Seleccione Comuna', 'Requerido');
      }
      if (String(this.forma.controls.nuevoGiro.value) == ''){
        return this.showToast('error', 'Seleccione Giro', 'Requerido');
      }
      if (String(this.forma.controls.nuevoRegion.value) == '' || String(this.forma.controls.nuevoRegion.value) == 'Seleccione'){
        return this.showToast('error', 'Seleccione Región', 'Requerido');
      }
      //ahora creamos la entidad a enviar
      var entidad = {
        Editando: this.editando,
        AusId: this.ausIdEditando,
        Rut: rut,
        Dv: dv,
        Nombres: nombres.toUpperCase(),
        Region: ciudad.toUpperCase(),
        Giro: giro.toUpperCase(),
        Comuna: comuna.toUpperCase(),
        Direccion: direccion.toUpperCase(),
        Telefonos: telefonos,
        Correo: correo.toUpperCase(),
        Fax: fax,
        Eliminado: 0
      }
      this.loading = true;
      this.gajico.putProveedor(entidad).subscribe(
        data => {
          var cliente = data.json();
          this.rerenderNod(this.nodIdLogueado);
        },
        err => {
          console.error(err);
          this.showToast('error', err, 'Error');
          this.loading = false;

        },
        () => {
          console.log('save completed');
          this.showToast('success', 'Guardado con éxito', 'Proveedor');
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
  crear(){
    this.editando = false;
    this.forma.reset({});
    this.tituloModal = 'Creando Proveedor';
    //nodo del usuario
    //this.obtenerNodos(false, this.nodIdLogueado);
    this.forma.controls.nuevoRut.enable();
    this.forma.controls.nuevoDig.enable();
    this.forma.controls.nuevoRegion.setValue("Seleccione");

  }
  //metodos de obtención
  obtenerRegiones(instId){
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
  obtenerComunas(regId, id){
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
  obtenerRoles(rolIdLogueado, id){
    //indicador valor
    this.loading = true;
    this.global.postRoles(rolIdLogueado, id).subscribe(
      data => {
        if (data) {
          this.listaRoles = data.json();
          console.log(this.listaRoles);
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
        console.log('get info roles');
      }
    );

  }
  obtenerNodos(traeSeleccione, id){
    //indicador valor
    this.loading = true;
    this.listaNodos = [];
    this.global.postNodos(traeSeleccione, id).subscribe(
      data => {
        if (data) {
          var datos = data.json();
          if (!Array.isArray(datos)){
            //si no es array es object
            this.listaNodos.push(datos);
          }
          else {
            this.listaNodos = datos;
          }
          console.log(this.listaNodos);
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
        console.log('get info Nodos');
      }
    );

  }
  //on change
  onChangeRegion(event){
    console.log(event.target.value);
    this.obtenerComunas(event.target.value, null);
    this.forma.controls.nuevoComuna.setValue('Seleccione');
  }

  showToast(tipo, mensaje, titulo){
    if (tipo == 'success'){
      this.toastr.success(mensaje, titulo);
    }
    if (tipo == 'error'){
      this.toastr.error(mensaje, titulo);
    }
    if (tipo == 'info'){
      this.toastr.info(mensaje, titulo);
    }
    if (tipo == 'warning'){
      this.toastr.warning(mensaje, titulo);
    }

  }
}


