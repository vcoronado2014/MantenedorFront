import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { MantenedorUsuariosComponent } from './mantenedor-usuarios/mantenedor-usuarios.component';
import { InicioComponent } from './inicio/inicio.component';
import { ClientesComponent } from './clientes/clientes.component';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { MenuParametrosComponent } from './menu-parametros/menu-parametros.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'inicio', component: InicioComponent },
  { path: 'usuarios', component: MantenedorUsuariosComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'proveedores', component: ProveedorComponent },
  { path: 'parametros', component: MenuParametrosComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', pathMatch:'full', redirectTo: 'home' }
];

export const appRouting = RouterModule.forRoot(routes);
