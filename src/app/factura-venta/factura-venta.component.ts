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
import { GajicoService, Factura, Detalle, User } from '../servicios/gajico.service';
import { UtilesService } from '../servicios/utiles.service';
import { DISABLED } from '@angular/forms/src/model';
//completer
import { CompleterService, CompleterData } from 'ng2-completer';
import { DataTableDirective } from 'angular-datatables';
import { ModalDirective } from 'ngx-bootstrap/modal';
//dialog
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, throwToolbarMixedModesError } from '@angular/material';


declare var $: any;
import * as moment from 'moment';
//sweet alert
//import swal from 'sweetalert';
import * as _swal from 'sweetalert';
import { SweetAlert } from 'sweetalert/typings/core';
import { Title } from '@angular/platform-browser';
const swal: SweetAlert = _swal as any;


@Component({
  selector: 'app-factura-venta',
  templateUrl: './factura-venta.component.html',
  styleUrls: ['./factura-venta.component.css']
})

export class FacturaVentaComponent implements OnInit {
  //loading
  loading = false;
  //forma
  forma: FormGroup;
  formaFactura: FormGroup;
  formaDetalle: FormGroup;
  //variables de usuario
  nodIdLogueado;
  rolIdLogueado;
  nombreUsuarioLogueado;
  //usuario buscado
  usuarioBuscado = null;
  //listados
  listaRegiones;
  listaComunas;
  listaGirosStr;
  listaGiros;
  listaBancos;
  listaBancosStr;
  listaProductos = [];
  listaNombresProd;
  listaCodigosProd;
  parametros;
  numeroFacturaAnterior = 0;
  numeroFacturaActual = 0;
  //productoCreando;
  //variables de modificacion cliente
  modificaCliente: boolean = false;
  botonLimpiarCliente: boolean = true;
  //variables modificacion numero factura
  modificaNumeroFactura: boolean = false;
  //variables modificacion stock
  modificaStock: boolean = false;
  fechaActual;
  //iva
  iva: number = 0;
  //datepiker
  maxDate;
  fechaInicio;
  minDate;


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
    
    this.fechaActual = moment().format("DD/MM/YYYY");
    if (sessionStorage.getItem("USER_LOGUED_IN")) {
      var usuarioLogueado = JSON.parse(sessionStorage.getItem("USER_LOGUED_IN"));
      if (usuarioLogueado.AutentificacionUsuario) {
        this.nodIdLogueado = usuarioLogueado.AutentificacionUsuario.InstId;
        this.rolIdLogueado = usuarioLogueado.Rol.Id;
        this.nombreUsuarioLogueado = usuarioLogueado.AutentificacionUsuario.NombreUsuario;
        //iva 
        this.iva = usuarioLogueado.Parametro.Iva;
      }
    }
    //fechas
    var fechaIni = moment();
    var maxima = moment().add(90, 'days');
    var minima = moment().subtract(7, 'days');
    this.fechaInicio = this.retornaFecha(fechaIni);
    this.maxDate = this.retornaFecha(maxima);
    this.minDate = this.retornaFecha(minima);

    this.obtenerCodigosProductos();
    this.obtenerNombresProductos();
    this.obtenerRegiones(this.nodIdLogueado);
    this.obtenerGiros(this.nodIdLogueado);
    this.obtenerBancos(this.nodIdLogueado);
    this.obtenerParametros(this.nodIdLogueado);
    this.cargarForma();
    this.cargarFormaFactura();
    this.cargarFormaDetalle();
    //swal("hola");

  }
  cargarFormaDetalle(){
    this.formaDetalle = new FormGroup({
      'nuevoId': new FormControl(0),
      'nuevoCodigo': new FormControl('', Validators.required),
      'nuevoNombreDetalle': new FormControl('', Validators.required),
      'nuevoStock': new FormControl('0', [Validators.required, Validators.min(1)]),
      'nuevoCantidad': new FormControl(0, [Validators.required, Validators.min(1)]),
      'nuevoVolumen': new FormControl(0, Validators.required),
      'nuevoMedida': new FormControl('UN', Validators.required),
      'nuevoValor': new FormControl(0, Validators.required),
      'nuevoSubtotal': new FormControl(0, Validators.required),
    });
    this.formaDetalle.controls.nuevoVolumen.disable();
    this.formaDetalle.controls.nuevoStock.disable();
  }
  cargarFormaFactura(){
    this.formaFactura = new FormGroup({
      'nuevoNumeroFactura': new FormControl(this.numeroFacturaActual, Validators.required),
      'nuevoNumeroGuia': new FormControl('0'),
      'nuevoCV': new FormControl('', Validators.required),
      'nuevoBanco': new FormControl(''),
      'nuevoVencimiento': new FormControl(this.retornaFecha(moment())),
      'nuevoNumeroCheque': new FormControl(''),
    });
  }
  cargarForma() {

    this.forma = new FormGroup({
      'nuevoIdCliente': new FormControl(0),
      'nuevoRut': new FormControl('', [Validators.required, Validators.minLength(3)]),
      'nuevoDig': new FormControl('', [Validators.required, Validators.maxLength(1)]),
      'nuevoNombre': new FormControl('', Validators.required),
      'nuevoRegion': new FormControl('', Validators.required),
      'nuevoGiro': new FormControl('', Validators.required),
      'nuevoComuna': new FormControl('', Validators.required),
      'nuevoDireccion': new FormControl('', Validators.required),
      'nuevoTelefonos': new FormControl(''),
      'nuevoContacto': new FormControl(''),
      'nuevoCorreo': new FormControl('', [Validators.pattern("[^ @]*@[^ @]*")]),
      'nuevoFax': new FormControl(''),
      'nuevoFleteLocal': new FormControl(''),
      'nuevoFleteDomicilio': new FormControl(''),
      'nuevoDescuento': new FormControl('')
    });

    console.log(this.forma.valid + ' ' + this.forma.status);
  }
  limpiarTodo(){
    this.listaProductos = [];
    this.usuarioBuscado = null;
    this.limpiarCliente();
    this.obtenerParametros(this.nodIdLogueado);
  }
  //validar todo
  validaAntesGuardar(){
    var retorno ={
      Cliente: null,
      Factura: null,
      Errores: [],
      Productos: [],
      Totales: null
    }
    var errores = [];
    var id = 0;
    if (this.forma.controls.nuevoIdCliente){
      if (this.forma.controls.nuevoIdCliente.value != null){
        id = this.forma.controls.nuevoIdCliente.value;
      }
    }
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
    var contacto = '';
    if (this.forma.controls.nuevoContacto){
      if (this.forma.controls.nuevoContacto.value != null){
        contacto = String(this.forma.controls.nuevoContacto.value);
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
    var fleteLocal = '0';
    if (this.forma.controls.nuevoFleteLocal){
      if (this.forma.controls.nuevoFleteLocal.value != null && String(this.forma.controls.nuevoFleteLocal.value) != ''){
        fleteLocal = String(this.forma.controls.nuevoFleteLocal.value);
      }
    }
    var fleteDomicilio = '0';
    if (this.forma.controls.nuevoFleteDomicilio){
      if (this.forma.controls.nuevoFleteDomicilio.value != null && String(this.forma.controls.nuevoFleteDomicilio.value) != ''){
        fleteDomicilio = String(this.forma.controls.nuevoFleteDomicilio.value);
      }
    }
    var descuento = '0';
    if (this.forma.controls.nuevoDescuento){
      if (this.forma.controls.nuevoDescuento.value != null && String(this.forma.controls.nuevoDescuento.value) != ''){
        descuento = String(this.forma.controls.nuevoDescuento.value);
      }
    }

    if (String(this.forma.controls.nuevoComuna.value) == '' || String(this.forma.controls.nuevoComuna.value) == 'Seleccione'){
      var error = {
        Mensaje: 'Comuna Requerido'
      }
      errores.push(error);
    }
    if (String(this.forma.controls.nuevoGiro.value) == ''){
      var error = {
        Mensaje: 'Giro Requerido'
      }
      errores.push(error);
    }
    if (String(this.forma.controls.nuevoRegion.value) == '' || String(this.forma.controls.nuevoRegion.value) == 'Seleccione'){
      var error = {
        Mensaje: 'Región Requerido'
      }
      errores.push(error);
    }
    if (rut.length <= 3){
      var error = {
        Mensaje: 'Rut con menos de 3 caracteres'
      }
      errores.push(error);
    }
    if (nombres == ''){
      var error = {
        Mensaje: 'Nombres requerido'
      }
      errores.push(error);
    }
    if (direccion == ''){
      var error = {
        Mensaje: 'Dirección requerido'
      }
      errores.push(error);
    }
    var numeroFactura = this.formaFactura.controls.nuevoNumeroFactura.value;
    if (numeroFactura <= 0){
      var error = {
        Mensaje: 'Número de factura invalido'
      }
      errores.push(error);
    }
    var numeroGuia = this.formaFactura.controls.nuevoNumeroGuia.value;
    var condicionVenta = this.formaFactura.controls.nuevoCV.value;
    var banco = this.formaFactura.controls.nuevoBanco.value;
    var vencimiento = this.formaFactura.controls.nuevoVencimiento.value;
    var numeroCheque = this.formaFactura.controls.nuevoNumeroCheque.value;
    if (condicionVenta != 'O'){
      if (banco == ''){
        var error = {
          Mensaje: 'Banco invalido'
        }
        errores.push(error);
      }
      if (vencimiento == ''){
        var error = {
          Mensaje: 'Vencimiento cheque invalido'
        }
        errores.push(error);
      }
      if (numeroCheque == ''){
        var error = {
          Mensaje: 'Cheque invalido'
        }
        errores.push(error);
      }
    }
    if (this.listaProductos.length == 0){
      var error = {
        Mensaje: 'No hay Productos en la venta'
      }
      errores.push(error);
    }

    var entidadFactura = {
      NumeroFactura: numeroFactura,
      NumeroGuia: numeroGuia,
      CondicionVenta: condicionVenta,
      Banco: banco,
      Vencimiento: vencimiento,
      NumeroCheque: numeroCheque
    }

    var entidadCliente = {
      Id: id,
      Rut: rut,
      Dv: dv.toUpperCase(),
      Nombres: nombres.toUpperCase(),
      Region: ciudad.toUpperCase(),
      Giro: giro.toUpperCase(),
      Comuna: comuna.toUpperCase(),
      Direccion: direccion.toUpperCase(),
      Telefonos: telefonos,
      Contacto: contacto.toUpperCase(),
      Correo: correo.toUpperCase(),
      Fax: fax,
      FleteLocal: fleteLocal,
      FleteDomicilio: fleteDomicilio,
      Eliminado: 0,
      Descuento: descuento
    };
    var entidadTotales = {
      Neto: this.sumarNetosN(),
      Iva: this.ivaDetalle(),
      Total: this.sumaTotal()
    }
    retorno.Cliente = entidadCliente;
    retorno.Errores = errores;
    retorno.Productos = this.listaProductos;
    retorno.Factura = entidadFactura;
    retorno.Totales = entidadTotales;

    return retorno;

  }
  guardarTodo(){
    console.log(this.validaAntesGuardar());
    var retorno = this.validaAntesGuardar();
    if (retorno.Errores.length > 0){
      var mensaje = '';
      retorno.Errores.forEach(error => {
        mensaje += error.Mensaje + '\r\n'
      });
      swal(
        {
          title: 'Errores en el formulario',
          text: mensaje
        }
      )
    }
    else {
      swal(
        {
          title: '¿Quieres guardar la factura?',
          text: 'Se guardará completamente la venta, pudiendo sólo modificar el número de factura posteriormente.',
          buttons: ["NO", "SI QUIERO"],
        }
      ).then((value) => {
        if (value){
          this.limpiarTodo();
          //aca debriamos guardar toda la factura
          //swal(`The returned value is: ${value}`);
        }
        
      });
    }
  }
  retornaFecha(fechaMoment){
    var retorno = '';
    var year = fechaMoment.year();
    var mes = fechaMoment.month() + 1;
    var dia = fechaMoment.date();
    var mesStr = '';
    var diaStr = '';
    if (mes < 10){
        mesStr = '0' + mes.toString();
    }
    else{
        mesStr = mes.toString();
    }

    if (dia < 10){
        diaStr = '0' + dia.toString();
    }
    else{
        diaStr = dia.toString();
    }

    retorno = year +'-' + mesStr + '-' + diaStr;

    return retorno;
  }
  keyDowEnter(event) {
    console.log(event);
    var rut = this.forma.controls.nuevoRut.value;
    var dv = this.forma.controls.nuevoDig.value;
    var elementos = {
      Rut: rut,
      Dv: dv
    }
    //ambos elementos deben existir para realizar la llamada
    if (rut && rut.length > 0 && dv && dv.length > 0) {
      //ahora realizamos la busqueda
      var cliente;
      this.loading = true;
      this.gajico.postClientesArr(this.nodIdLogueado, rut, dv).subscribe((data: User[]) => {
        //revisamos si la data viene correcta
        if (data && data.length == 1) {
          cliente = data[0];
          this.usuarioBuscado = cliente;
          this.mostrarDatos(cliente);
          this.loading = false;
        }
        else {
          //el usuario no existe, deberiamos mandar el foco al nombre
          //this.botonLimpiarCliente = true;
          this.loading = false;
        }

      });

      console.log(elementos);
    }

  }
  keyDowEnterProducto(event, tipoBusqueda) {
    //console.log(event);
    var texto = event.target.value;

    //ambos elementos deben existir para realizar la llamada
    if (texto && texto.length > 0) {
      //ahora realizamos la busqueda
      this.loading = true;
      this.gajico.postProductosTexto(this.nodIdLogueado, tipoBusqueda, texto).subscribe(
        data => {
          if (data) {
            //cargar la forma con la data
            var producto = data.json();
            //this.productoCreando = producto;
            this.mostrarDatosDetalle(producto[0]);
            console.log(producto);
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

  }
  agregarProductoDetalle() {
    console.log(this.formaDetalle.controls);
    //aca se debe validar antes
    var productoLista = null;
    //por mientras
    var entidad = {
      Id: this.formaDetalle.controls.nuevoId.value,
      Eliminado: 0,
      CodProduc: this.formaDetalle.controls.nuevoCodigo.value.toUpperCase(),
      NomProduc: this.formaDetalle.controls.nuevoNombreDetalle.value.toUpperCase(),
      //VolProduc: this.formaDetalle.controls.nuevoVolumen.value,
      //lo dejamos en 0
      VolProduc:this.formaDetalle.controls.nuevoVolumen.value,
      Cantidad: this.formaDetalle.controls.nuevoCantidad.value,
      ValProduc: this.formaDetalle.controls.nuevoValor.value,
      StoProduc: this.formaDetalle.controls.nuevoStock.value - this.formaDetalle.controls.nuevoCantidad.value,
      Subtotal: this.formaDetalle.controls.nuevoSubtotal.value,
      Unidad: this.formaDetalle.controls.nuevoMedida.value
    };
    var existe = false;
    if (this.listaProductos.length == 0){
      this.listaProductos.push(entidad);
    }
    else{
      for (var i=0; i < this.listaProductos.length; i++){
        var producto = this.listaProductos[i];
        if (producto.CodProduc.toUpperCase() == entidad.CodProduc.toUpperCase()){
          //existe
          productoLista = producto;
          this.listaProductos[i].Cantidad = this.listaProductos[i].Cantidad + entidad.Cantidad;
          this.listaProductos[i].VolProduc = this.listaProductos[i].VolProduc + entidad.VolProduc;
          this.listaProductos[i].Subtotal = this.listaProductos[i].Subtotal + entidad.Subtotal;
          existe = true;
          break;
        }
      }
      //ahora realizamos las compraciones
      if (!existe){
        this.listaProductos.push(entidad);
      }
    }
    this.limpiarDetalle();
  }
  quitarProductoLista(id){
    var nuevaLista = [];
    this.listaProductos.forEach(producto => {
      if (producto.Id != id){
        nuevaLista.push(producto);
      }
    });
    this.listaProductos = nuevaLista;
  }
  modificarNumeroFactura(){
    this.modificaNumeroFactura = true;
    this.formaFactura.controls.nuevoNumeroFactura.enable();

  }
  guardaNumeroFactura(){
    if (this.formaFactura.valid){

      var numero = 0;
      if (this.formaFactura.controls.nuevoNumeroFactura){
        if (this.formaFactura.controls.nuevoNumeroFactura.value != null){
          numero = parseInt(this.formaFactura.controls.nuevoNumeroFactura.value);
        }
      }

      this.loading = true;
      this.gajico.putParametros(this.parametros.Id, this.nodIdLogueado, numero, this.parametros.Iva, 
        this.parametros.StockMinimoCantidad, this.parametros.StockMinimoMetros).subscribe(
        data => {
          if (data) {
            var nuevoParametro = data.json();
            this.parametros = nuevoParametro;
            //ahora que tenemos el nuevo giro lo insertamos a la lista
            this.modificaNumeroFactura = false;
            this.formaFactura.controls.nuevoNumeroFactura.disable();
            this.showToast('success', 'Numero factura actualizado', 'Número Factura');
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

  }
  calculaSubtotal(event){
    var medida = event.target.value;
    var factor = 1;
    if (medida == 'M3'){
      factor = 10;
    }
    //var cantidad = parseInt(event.target.value);
    var cantidad = this.formaDetalle.controls.nuevoCantidad.value;
    var retorno = 0;
    if (this.formaDetalle.controls.nuevoValor){
      if (cantidad > 0){
        var valor =this.formaDetalle.controls.nuevoValor.value;
        retorno = valor * cantidad * factor;
      }
    }
    this.formaDetalle.controls.nuevoVolumen.setValue(cantidad * factor);
    this.formaDetalle.controls.nuevoSubtotal.setValue(retorno);
    return retorno;
  }
  onChangeCV(event){
    if (event.target.value){
      if (event.target.value == 'O'){
        //limpiamos los datos del cheque
        this.formaFactura.controls.nuevoBanco.setValue('');
        this.formaFactura.controls.nuevoVencimiento.setValue('');
        this.formaFactura.controls.nuevoNumeroCheque.setValue('');
      }
    }
  }
  mostrarDatosParametros(){
    if (this.parametros){
      this.formaFactura.setValue({
        nuevoVencimiento: this.retornaFecha(moment()),
        nuevoBanco: '',
        nuevoNumeroFactura: this.numeroFacturaActual,
        nuevoNumeroGuia: '0',
        nuevoCV: 'O',
        nuevoNumeroCheque: ''
      });
      //deshabilitamos
      this.formaFactura.controls.nuevoNumeroFactura.disable();
    }
  }
  mostrarDatosDetalle(detalle) {
    if (detalle) {
      if (detalle.Id > 0) {
        //aca deberiamos levantar una alerta si el producto no tiene stock
        //o dejar que el mismo usuario modifique dicho stock
        if (detalle.StoProduc == '' || detalle.StoProduc == '0'){
          //swal('No hay');
          swal(
            {
              title: 'No tienes stock suficiente',
              text: 'Se habilitará la casilla para que ingreses el nuevo stock y poder continuar con la operación',
              buttons: ["NO", "SI QUIERO"],
            }
          ).then((value) => {
            if (value){
              this.formaDetalle.controls.nuevoStock.enable();
              this.modificaStock = true;
              document.getElementById('inlineFormInputGroupStock').focus();
              this.formaDetalle.setValue({
                nuevoId: detalle.Id,
                nuevoCodigo: detalle.CodProduc,
                nuevoNombreDetalle: detalle.NomProduc,
                nuevoStock: 0,
                nuevoCantidad: 0,
                nuevoVolumen: parseFloat(detalle.VolProduc),
                nuevoMedida: 'UN',
                nuevoValor: parseInt(detalle.ValProduc),
                nuevoSubtotal: 0
              });
              //aca debriamos guardar toda la factura
              //swal(`The returned value is: ${value}`);
            }
            
          });
        }
        else{
          this.formaDetalle.setValue({
            nuevoId: detalle.Id,
            nuevoCodigo: detalle.CodProduc,
            nuevoNombreDetalle: detalle.NomProduc,
            nuevoStock: detalle.StoProduc,
            nuevoCantidad: 0,
            nuevoVolumen: 0,
            nuevoMedida: 'UN',
            nuevoValor: parseInt(detalle.ValProduc),
            nuevoSubtotal: 0
          });
          //deshabilitamos
          this.formaDetalle.controls.nuevoStock.disable();
        }

      }
      else {
        //producto no está
        var nuevoCodigo = this.formaDetalle.controls.nuevoCodigo.value.toUpperCase();
        this.formaDetalle.setValue({
          nuevoCodigo: nuevoCodigo,
          nuevoId: 0,
          nuevoNombreDetalle: '',
          nuevoStock: 0,
          nuevoCantidad: 0,
          nuevoVolumen: 0,
          nuevoMedida: 'UN',
          nuevoValor: 0,
          nuevoSubtotal: 0
        });
        //deshabilitamos
        this.formaDetalle.controls.nuevoStock.enable();
      }

    }
    else {
      //producto no está
      var nuevoCodigo = this.formaDetalle.controls.nuevoCodigo.value.toUpperCase();
      this.formaDetalle.setValue({
        nuevoCodigo: nuevoCodigo,
        nuevoId: 0,
        nuevoNombreDetalle: '',
        nuevoStock: 0,
        nuevoCantidad: 0,
        nuevoVolumen: 0,
        nuevoMedida: 'UN',
        nuevoValor: 0,
        nuevoSubtotal: 0
      });
      //deshabilitamos
      this.formaDetalle.controls.nuevoStock.enable();
    }

    
  }
  limpiarDetalle(){
    //this.formaDetalle.reset({});
    this.formaDetalle.setValue({
      nuevoCodigo: '',
      nuevoId: 0,
      nuevoNombreDetalle: '',
      nuevoStock: 0,
      nuevoCantidad: 0,
      nuevoVolumen: 0,
      nuevoMedida: 'UN',
      nuevoValor: 0,
      nuevoSubtotal: 0
    });
    //deshabilitamos
    this.formaDetalle.controls.nuevoStock.enable();
    //this.formaDetalle.controls.nuevoCodigo
    document.getElementById('inputCodigo').focus();

  }
  mostrarDatos(usu) {
    if (usu) {
      this.obtenerComunas(this.usuarioBuscado.CiuClient, null);
      //setear los campos
      //this.forma.controls.nuevoNombreUsuario
      this.forma.setValue({
        nuevoIdCliente: this.usuarioBuscado.Id,
        nuevoRut: this.usuarioBuscado.RutClient,
        nuevoDig: this.usuarioBuscado.DigClient,
        nuevoNombre: this.usuarioBuscado.NomClient,
        nuevoRegion: this.usuarioBuscado.CiuClient,
        nuevoGiro: this.usuarioBuscado.GirClient,
        nuevoComuna: this.usuarioBuscado.ComClient,
        nuevoDireccion: this.usuarioBuscado.DirClient,
        nuevoTelefonos: this.usuarioBuscado.TelClient,
        nuevoContacto: this.usuarioBuscado.ConClient,
        nuevoCorreo: this.usuarioBuscado.CorreoClient,
        nuevoFax: this.usuarioBuscado.FaxClient,
        nuevoFleteLocal: this.usuarioBuscado.FleLocal,
        nuevoFleteDomicilio: this.usuarioBuscado.FleDomici,
        nuevoDescuento: this.usuarioBuscado.DesClient,
      });
      //deshabilitamos
      this.desactivarControles();
    }

  }
  desactivarControles(){
    this.forma.controls.nuevoRut.disable();
    this.forma.controls.nuevoDig.disable();
    this.forma.controls.nuevoNombre.disable();
    this.forma.controls.nuevoRegion.disable();
    this.forma.controls.nuevoGiro.disable();
    this.forma.controls.nuevoComuna.disable();
    this.forma.controls.nuevoDireccion.disable();
    this.forma.controls.nuevoTelefonos.disable();
    this.forma.controls.nuevoContacto.disable();
    this.forma.controls.nuevoCorreo.disable();
    this.forma.controls.nuevoFax.disable();
    this.forma.controls.nuevoFleteLocal.disable();
    this.forma.controls.nuevoFleteDomicilio.disable();
    this.forma.controls.nuevoDescuento.disable();
  }
  activarControles(){
    this.forma.controls.nuevoRut.disable();
    this.forma.controls.nuevoDig.disable();
    this.forma.controls.nuevoNombre.enable();
    this.forma.controls.nuevoRegion.enable();
    this.forma.controls.nuevoGiro.enable();
    this.forma.controls.nuevoComuna.enable();
    this.forma.controls.nuevoDireccion.enable();
    this.forma.controls.nuevoTelefonos.enable();
    this.forma.controls.nuevoContacto.enable();
    this.forma.controls.nuevoCorreo.enable();
    this.forma.controls.nuevoFax.enable();
    this.forma.controls.nuevoFleteLocal.enable();
    this.forma.controls.nuevoFleteDomicilio.enable();
    this.forma.controls.nuevoDescuento.enable();
  }
  modificarCliente(modifica){
    if (modifica){
      this.modificaCliente = true;
      //this.botonLimpiarCliente = true;
      this.activarControles();
    }
  }
  cancelarModificacion(){
    this.desactivarControles();
    this.modificaCliente = false;
    this.botonLimpiarCliente = false;
  }
  limpiarCliente() {
    //dejamos al cliente editando nulo
    this.modificaCliente = false;
    this.usuarioBuscado = null;
    this.forma.reset({});
    this.forma.controls.nuevoRegion.setValue("Seleccione");
    this.obtenerComunas("Seleccione", null);
    //es un cliente completamente nuevo
    this.forma.controls.nuevoRut.enable();
    this.forma.controls.nuevoDig.enable();
    this.forma.controls.nuevoNombre.enable();
    this.forma.controls.nuevoRegion.enable();
    this.forma.controls.nuevoGiro.enable();
    this.forma.controls.nuevoComuna.enable();
    this.forma.controls.nuevoDireccion.enable();
    this.forma.controls.nuevoTelefonos.enable();
    this.forma.controls.nuevoContacto.enable();
    this.forma.controls.nuevoCorreo.enable();
    this.forma.controls.nuevoFax.enable();
    this.forma.controls.nuevoFleteLocal.enable();
    this.forma.controls.nuevoFleteDomicilio.enable();
    this.forma.controls.nuevoDescuento.enable();
  }
  guardarCliente(){
    if (this.forma.valid){
      //correcto
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
      var contacto = '';
      if (this.forma.controls.nuevoContacto){
        if (this.forma.controls.nuevoContacto.value != null){
          contacto = String(this.forma.controls.nuevoContacto.value);
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
      var fleteLocal = '0';
      if (this.forma.controls.nuevoFleteLocal){
        if (this.forma.controls.nuevoFleteLocal.value != null && String(this.forma.controls.nuevoFleteLocal.value) != ''){
          fleteLocal = String(this.forma.controls.nuevoFleteLocal.value);
        }
      }
      var fleteDomicilio = '0';
      if (this.forma.controls.nuevoFleteDomicilio){
        if (this.forma.controls.nuevoFleteDomicilio.value != null && String(this.forma.controls.nuevoFleteDomicilio.value) != ''){
          fleteDomicilio = String(this.forma.controls.nuevoFleteDomicilio.value);
        }
      }
      var descuento = '0';
      if (this.forma.controls.nuevoDescuento){
        if (this.forma.controls.nuevoDescuento.value != null && String(this.forma.controls.nuevoDescuento.value) != ''){
          descuento = String(this.forma.controls.nuevoDescuento.value);
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
        Editando: this.modificaCliente,
        AusId: this.usuarioBuscado.Id,
        Rut: rut,
        Dv: dv.toUpperCase(),
        Nombres: nombres.toUpperCase(),
        Region: ciudad.toUpperCase(),
        Giro: giro.toUpperCase(),
        Comuna: comuna.toUpperCase(),
        Direccion: direccion.toUpperCase(),
        Telefonos: telefonos,
        Contacto: contacto.toUpperCase(),
        Correo: correo.toUpperCase(),
        Fax: fax,
        FleteLocal: fleteLocal,
        FleteDomicilio: fleteDomicilio,
        Eliminado: 0,
        Descuento: descuento
      }
      this.loading = true;
      this.gajico.putCliente(entidad).subscribe(
        data => {
          var cliente = data.json();
          this.usuarioBuscado.Id = cliente.Id;
          this.modificaCliente = false;
          //this.rerenderNod(this.nodIdLogueado);
        },
        err => {
          console.error(err);
          this.showToast('error', err, 'Error');
          this.loading = false;
        },
        () => {
          console.log('save completed');
          this.showToast('success', 'Guardado con éxito', 'Cliente');
          this.loading = false;

        }
      );
    }
    else {
      this.showToast('error', 'Revise campos', 'Requeridos');
    }
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
  //on change
  onChangeRegion(event) {
    console.log(event.target.value);
    this.obtenerComunas(event.target.value, null);
    this.forma.controls.nuevoComuna.setValue('Seleccione');
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
  obtenerBancos(instId) {
    //indicador valor
    this.listaBancosStr = [];
    this.loading = true;
    this.gajico.postBancos(instId).subscribe(
      data => {
        if (data) {
          this.listaBancos = data.json();
          this.listaBancos.forEach(element => {
            this.listaBancosStr.push(element.Nombre);
          });
          //console.log(this.listaGiros);
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
  obtenerParametros(instId) {
    //indicador valor
    this.loading = true;
    this.gajico.postParametros(instId).subscribe(
      data => {
        if (data) {
          this.parametros = data.json();
          //actualizamos los numeros de factura
          this.numeroFacturaAnterior = parseInt(this.parametros.NumDocumento);
          this.numeroFacturaActual = this.numeroFacturaAnterior + 1;
          this.mostrarDatosParametros();
          console.log(this.parametros);
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
  obtenerNombresProductos() {
    //indicador valor
    
    this.loading = true;
    this.gajico.postTextos(2).subscribe(
      data => {
        if (data) {
          this.listaNombresProd = data.json();
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
  obtenerCodigosProductos() {
    //indicador valor
    
    this.loading = true;
    this.gajico.postTextos(1).subscribe(
      data => {
        if (data) {
          this.listaCodigosProd = data.json();
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
  sumarNetosN(){
    var retorno = 0
    if (this.listaProductos && this.listaProductos.length > 0){
      this.listaProductos.forEach(detalle => {
        retorno = retorno + parseInt(detalle.Subtotal);
      });
    }
    return retorno;
  }
  ivaDetalle(){
    var total = this.sumarNetosN();
    var retorno = 0;
    if (total > 0){
      retorno = Math.floor((total * this.iva) / 100);
    }
    return retorno;
  }
  sumaTotal(){
    var netos = this.sumarNetosN();
    var iva = this.ivaDetalle();
    var retorno = 0;
    if (netos > 0){
      retorno = netos + iva;
    }
    return retorno;
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