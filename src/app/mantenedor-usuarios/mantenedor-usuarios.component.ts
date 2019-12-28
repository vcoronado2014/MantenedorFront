import { Component, OnInit, ViewContainerRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/retry';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import {MatPaginator, MatTableDataSource} from '@angular/material';

//servicios
import { GlobalService } from '../servicios/global.service';
import { DISABLED } from '@angular/forms/src/model';

declare var $:any;

@Component({
  selector: 'app-mantenedor-usuarios',
  templateUrl: './mantenedor-usuarios.component.html',
  styleUrls: ['./mantenedor-usuarios.component.css']
})
export class MantenedorUsuariosComponent implements OnInit {
  editando=false;
  ausIdEditando=0;
  forma:FormGroup;
  //loading
  loading = false;
  //variables
  listaRegiones;
  listaUsuarios;
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
    private toastr: ToastsManager,
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
    if (this.rolIdLogueado == 1){
      this.obtenerNodos(true, null);
    }
    else {
      this.obtenerNodos(false, this.nodIdLogueado);
    }
    this.obtenerRoles(this.rolIdLogueado, null);
    this.obtenerRegiones(this.nodIdLogueado);
    this.obtenerUsuarios(this.nodIdLogueado, null);
    this.cargarForma();

  }
  //cargamos la forma
  cargarForma(){

    this.forma = new FormGroup({
      'nuevoNombreUsuario': new FormControl('', [Validators.required,
                                          Validators.minLength(3)]),
      'nuevoNodo': new FormControl('', Validators.required),
      'nuevoNombre': new FormControl('', Validators.required),
      'nuevoApellidoPaterno': new FormControl('', Validators.required),
      'nuevoApellidoMaterno': new FormControl(''),
      'nuevoUsuarioRegion': new FormControl('', Validators.required),
      'nuevoUsuarioComuna': new FormControl('', Validators.required),
      'nuevoUsuarioDireccion': new FormControl('', Validators.required),
      'nuevoTelefonos': new FormControl(''),
      'nuevoCorreo': new FormControl('', [Validators.required,Validators.pattern("[^ @]*@[^ @]*")]),
      'nuevoRol': new FormControl('', Validators.required),
      'nuevoPassword': new FormControl(''),
      'nuevoRepitaPassword': new FormControl('')
      //comentamos mientras cargamos los demas elementos
      /*,
      'nuevoUsuarioNumeroDireccion': new FormControl(),
      'nuevoUsuarioRestoDireccion': new FormControl(),
      'nuevoUsuarioSobrecupo': new FormControl('', Validators.required),
      'nuevoUsuarioTotalLicencias': new FormControl('', Validators.required)
      */
    });

    console.log(this.forma.valid + ' ' + this.forma.status);
  }
  //edicion
  editar(usu){
    //this.cargarForma();
    if (usu){
      console.log(usu);
      this.editando = true;
      this.ausIdEditando = usu.AutentificacionUsuario.Id;
      //this.cargarForma();
      this.tituloModal = 'Editando a ' + usu.Persona.Nombres + ' ' + usu.Persona.ApellidoPaterno;
      this.usuarioEditando = usu;
      //cargamos los combos
      //nodo del usuario
      this.obtenerNodos(false, this.usuarioEditando.Nodo.Id);
      //comuna del usuario
      this.obtenerComunas(this.usuarioEditando.Persona.RegId, null);
      //setear los campos
      //this.forma.controls.nuevoNombreUsuario
      this.forma.setValue({
        nuevoNombreUsuario: this.usuarioEditando.AutentificacionUsuario.NombreUsuario,
        nuevoNodo: this.usuarioEditando.Nodo.Id,
        nuevoNombre: this.usuarioEditando.Persona.Nombres,
        nuevoApellidoPaterno: this.usuarioEditando.Persona.ApellidoPaterno,
        nuevoApellidoMaterno: this.usuarioEditando.Persona.ApellidoMaterno,
        nuevoUsuarioRegion: this.usuarioEditando.Persona.RegId,
        nuevoUsuarioComuna: this.usuarioEditando.Persona.ComId,
        nuevoUsuarioDireccion: this.usuarioEditando.Persona.DireccionCompleta,
        nuevoTelefonos: this.usuarioEditando.Persona.Telefonos,
        nuevoCorreo: this.usuarioEditando.AutentificacionUsuario.CorreoElectronico,
        nuevoRol: this.usuarioEditando.AutentificacionUsuario.RolId,
        nuevoPassword: '',
        nuevoRepitaPassword: ''
      });
      //deshabilitamos el nombre usuario
      this.forma.controls.nuevoNombreUsuario.disable();

    }
  }
  seleccionar(usu){
    this.usuDesactivarActivar = usu;
  }
  activar(){
    this.loading = true;
    this.global.activarUsuario(this.usuDesactivarActivar.Nodo.Id, this.usuDesactivarActivar.AutentificacionUsuario.Id, "1").subscribe(
      data => {
        if (data) {
          this.listaUsuarios = data.json();
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
    $("#exampleModalCenter1").modal("toggle");
  }
  desactivar(){
    this.loading = true;
    this.global.activarUsuario(this.usuDesactivarActivar.Nodo.Id, this.usuDesactivarActivar.AutentificacionUsuario.Id, "0").subscribe(
      data => {
        if (data) {
          this.listaUsuarios = data.json();
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
    $("#exampleModalCenter").modal("toggle");
  }
  guardar(){
    if (this.forma.valid){
      //correcto
      //primero verificar si esta guardando contraseña o no
      var password = '';
      var repitaPassword = '';
      if (this.forma.controls.nuevoPassword){
        if (this.forma.controls.nuevoPassword.value != null){
          password = String(this.forma.controls.nuevoPassword.value);
        }
      }
      if (this.forma.controls.nuevoRepitaPassword){
        if (this.forma.controls.nuevoRepitaPassword.value != null){
          repitaPassword = String(this.forma.controls.nuevoRepitaPassword.value);
        }
      }


      if (password != '' || repitaPassword != ''){
        //cualquiera que sea distinta de vacio significa que ambas deben ser procesadas
        if (String(password).length < 6 || String(repitaPassword).length < 6){
          return this.showToast('error', 'La contraseña debe tener mínimo 6 caractéres', 'Contraseña');
        }
        if (String(password) != String(repitaPassword)){
          return this.showToast('error', 'La contraseñas deben coincidir', 'Contraseña');
        }
        //hasta acá va todo bien

      }
      //ahora los demas elementos
      //nombre usuario
      var nombreUsuario = '';
      if (this.forma.controls.nuevoNombreUsuario){
        if (this.forma.controls.nuevoNombreUsuario.value != null){
          nombreUsuario = String(this.forma.controls.nuevoNombreUsuario.value);
        }
      }
      var nodIdUsuario = '0';
      if (this.forma.controls.nuevoNodo){
        if (this.forma.controls.nuevoNodo.value != null){
          nodIdUsuario = String(this.forma.controls.nuevoNodo.value);
        }
      }
      var nombres = '';
      if (this.forma.controls.nuevoNombre){
        if (this.forma.controls.nuevoNombre.value != null){
          nombres = String(this.forma.controls.nuevoNombre.value);
        }
      }
      var primerApellido = '';
      if (this.forma.controls.nuevoApellidoPaterno){
        if (this.forma.controls.nuevoApellidoPaterno.value != null){
          primerApellido = String(this.forma.controls.nuevoApellidoPaterno.value);
        }
      }
      var segundoApellido = '';
      if (this.forma.controls.nuevoApellidoMaterno){
        if (this.forma.controls.nuevoApellidoMaterno.value != null){
          segundoApellido = String(this.forma.controls.nuevoApellidoMaterno.value);
        }
      }
      var regId = '0';
      if (this.forma.controls.nuevoUsuarioRegion){
        if (this.forma.controls.nuevoUsuarioRegion.value != null){
          regId = String(this.forma.controls.nuevoUsuarioRegion.value);
        }
      }
      var comId = '0';
      if (this.forma.controls.nuevoUsuarioComuna){
        if (this.forma.controls.nuevoUsuarioComuna.value != null){
          comId = String(this.forma.controls.nuevoUsuarioComuna.value);
        }
      }
      var direccion = '';
      if (this.forma.controls.nuevoUsuarioDireccion){
        if (this.forma.controls.nuevoUsuarioDireccion.value != null){
          direccion = String(this.forma.controls.nuevoUsuarioDireccion.value);
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
      var rolId = '0';
      if (this.forma.controls.nuevoRol){
        if (this.forma.controls.nuevoRol.value != null){
          rolId = String(this.forma.controls.nuevoRol.value);
        }
      }
      if (this.editando == false) {
        if (password == '' || repitaPassword == '') {
          //en este caso la password es requerida
          return this.showToast('error', 'Contraseña requerida', 'Contraseña');
        }
      }
      if (String(this.forma.controls.nuevoUsuarioComuna.value) == '0'){
        return this.showToast('error', 'Seleccione Comuna', 'Requerido');
      }
      //ahora creamos la entidad a enviar
      var entidad = {
        Editando: this.editando,
        AusId: this.ausIdEditando,
        NombreUsuario: nombreUsuario,
        NodId: nodIdUsuario,
        Nombres: nombres,
        ApellidoPaterno: primerApellido,
        ApellidoMaterno: segundoApellido,
        RegId: regId,
        ComId: comId,
        Direccion: direccion,
        Telefonos: telefonos,
        Correo: correo,
        RolId: rolId,
        Password: password
      }
      console.log(password);
      console.log(entidad);
      console.log('guardando');
      this.loading = true;
      this.global.putUsuario(entidad).subscribe(
        data => {
          this.listaUsuarios = data.json();
        },
        err => {
          console.error(err);
          this.showToast('error', err, 'Error');
          this.loading = false;

        },
        () => {
          console.log('save completed');
          this.showToast('success', 'Guardado con éxito', 'Usuario');
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
    this.tituloModal = 'Creando Usuario';
    //nodo del usuario
    this.obtenerNodos(false, this.nodIdLogueado);
    this.forma.controls.nuevoNombreUsuario.enable();
    this.forma.controls.nuevoNodo.setValue(this.nodIdLogueado); 
    this.forma.controls.nuevoUsuarioRegion.setValue(0);

  }
  //metodos de obtención
  obtenerRegiones(id){
    //indicador valor
    this.loading = true;
    this.global.postRegiones(id).subscribe(
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
  obtenerUsuarios(nodId, id){
    //indicador valor
    this.loading = true;
     this.global.postUsuarios(nodId, id).subscribe(
      data => {
        if (data) {
          this.listaUsuarios = data.json();
          //console.log(this.listaRegiones);
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
        console.log('get info usuarios');
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
    this.forma.controls.nuevoUsuarioComuna.setValue('0');
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
