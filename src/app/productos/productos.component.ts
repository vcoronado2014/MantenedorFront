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
import { GajicoService, Productos } from '../servicios/gajico.service';
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
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit, OnDestroy {
  @ViewChild(DataTableDirective)
  
  dtElement: DataTableDirective;
  //dtOptions: DataTables.Settings = {};
  dtOptions: any = {};
  persons: Productos[] = [];
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

/*     this.obtenerRegiones(this.nodIdLogueado);
    this.obtenerGiros(this.nodIdLogueado); */
    this.cargarClientes(this.nodIdLogueado);
    this.cargarForma(); 

  }
/*   buscarRut(rut, dv){
    var cliente = null;
    if (this.persons && this.persons.length >= 0){
      this.persons.forEach(clienteArr => {
        if (clienteArr.RutProved.toUpperCase() == rut.toUpperCase() && clienteArr.DigProved.toUpperCase() == dv.toUpperCase()){
          cliente = clienteArr;
        }
      });
    }
    return cliente;    
  } */
  limpiar(){
    this.editando = false;
    this.forma.reset({});
    this.usuarioEditando = null;
    this.ausIdEditando = 0;
    this.forma.controls.nuevoCodigo.enable();
    this.tituloModal = 'Creando producto';
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
      this.gajico.postProductosArr(nodId, null).subscribe((data: Productos[]) => {
        this.persons = data;
        this.dtTrigger.next();
        this.loading = false;
      });
    });
  }
  cargarClientes(nodId){
    this.loading = true;
    this.gajico.postProductosArr(nodId, null).subscribe((data: Productos[]) => {
      this.persons = data;
      this.dtTrigger.next();
      this.loading = false;
    });
  }

  keyDowEnter(event){
    console.log(event);
    var codigo = this.forma.controls.nuevoCodigo.value;

    //ambos elementos deben existir para realizar la llamada
    if (codigo && codigo.length > 0){
      //ahora realizamos la busqueda
      var cliente;
      this.loading = true;
      this.gajico.postProductosArr(this.nodIdLogueado, codigo).subscribe((data: Productos[]) => {
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
    }

  }
/*   buscarCliente(nodId, rut, dv){
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
  } */

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

  //cargamos la forma
  cargarForma(){

    this.forma = new FormGroup({
      'nuevoCodigo': new FormControl('', [Validators.required, Validators.minLength(3)]),
      'nuevoNombre': new FormControl('', Validators.required),
      'nuevoStockInicial': new FormControl('', Validators.required),
      'nuevoStockActual': new FormControl('', Validators.required),
      'nuevoValor': new FormControl('', Validators.required)
    });

    console.log(this.forma.valid + ' ' + this.forma.status);
  }
  //edicion
  editar(usu){
    
    if (usu){
      console.log(usu);
      this.editando = true;
      this.ausIdEditando = usu.Id;
      //this.cargarForma();
      this.tituloModal = 'Editando producto ' + usu.NomProduc;
      this.usuarioEditando = usu;
      this.forma.setValue({
        nuevoCodigo: this.usuarioEditando.CodProduc,
        nuevoNombre: this.usuarioEditando.NomProduc,
        nuevoStockInicial: this.usuarioEditando.VolProduc,
        nuevoStockActual: this.usuarioEditando.StoProduc,
        nuevoValor: this.usuarioEditando.ValProduc
      });
      //deshabilitamos
      this.forma.controls.nuevoCodigo.disable();
      //this.forma.controls.nuevoStockInicial.disable();
    }
  }
  seleccionar(usu){
    
    var entidad = {
      AusId: usu.Id,
      Id: usu.Id,
      Codigo: usu.CodProduc.toUpperCase(),
      Nombre: usu.NomProduc.toUpperCase(),
      Volumen: usu.VolProduc,
      Stock: usu.StoProduc,
      Valor: usu.ValProduc
    }
    this.usuDesactivarActivar = entidad;
    console.log(this.usuarioEditando);
    
  }
  activar(){
    if (this.usuDesactivarActivar && this.usuDesactivarActivar.Id > 0) {
      this.usuDesactivarActivar.Eliminado = 0;
      this.loading = true;
      this.gajico.putProductos(this.usuDesactivarActivar).subscribe(
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
          this.showToast('success', 'Activado con éxito', 'Producto');
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
      this.gajico.putProductos(this.usuDesactivarActivar).subscribe(
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
          this.showToast('success', 'Eliminado con éxito', 'Producto');
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
      var codigo = '';
      if (this.forma.controls.nuevoCodigo){
        if (this.forma.controls.nuevoCodigo.value != null){
          codigo = String(this.forma.controls.nuevoCodigo.value);
        }
      }

      var nombre = '';
      if (this.forma.controls.nuevoNombre){
        if (this.forma.controls.nuevoNombre.value != null){
          nombre = String(this.forma.controls.nuevoNombre.value);
        }
      }
      var valor = '0';
      if (this.forma.controls.nuevoValor){
        if (this.forma.controls.nuevoValor.value != null){
          valor = String(this.forma.controls.nuevoValor.value);
        }
      }
      var stock = '0';
      if (this.forma.controls.nuevoStockActual){
        if (this.forma.controls.nuevoStockActual.value != null){
          stock = String(this.forma.controls.nuevoStockActual.value);
        }
      }
      var volumen = '0';
      if (this.forma.controls.nuevoStockInicial){
        if (this.forma.controls.nuevoStockInicial.value != null){
          volumen = String(this.forma.controls.nuevoStockInicial.value);
        }
      }
      var volumenFloat = parseFloat(volumen);
      //console.log(volumenFloat);
      if (volumenFloat < parseFloat(stock)){
        return this.showToast('error', 'Stock inicial no puede ser menor al actual', 'Stock');
      }

      //ahora creamos la entidad a enviar
      var entidad = {
        Editando: this.editando,
        AusId: this.ausIdEditando,
        Codigo: codigo.toUpperCase(),
        Nombre: nombre.toUpperCase(),
        Valor: valor,
        Stock: stock,
        Volumen: volumen,
        Eliminado: 0
      }
      this.loading = true;
      this.gajico.putProductos(entidad).subscribe(
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
          this.showToast('success', 'Guardado con éxito', 'Producto');
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
    this.tituloModal = 'Creando producto';
    //nodo del usuario
    //this.obtenerNodos(false, this.nodIdLogueado);
    this.forma.controls.nuevoCodigo.enable();
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


