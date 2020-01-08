import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http'; 
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//Rutas
import { appRouting } from './app-routing.module';

import { AppComponent } from './app.component';
//import { AppRoutingModule } from './/app-routing.module';
import { HomeComponent } from './home/home.component';
//plugin
import {MatGridListModule} from '@angular/material/grid-list';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material';
import {CdkTableModule} from '@angular/cdk/table';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './login/login.component';
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { NgxLoadingModule } from 'ngx-loading';
import { Ng2CompleterModule } from "ng2-completer";
//datatables
import { DataTablesModule } from 'angular-datatables';
//primeg
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
//servicios
import { ServicioLoginService } from './servicios/servicio-login-service';
import { GlobalService } from './servicios/global.service';
import { GajicoService } from './servicios/gajico.service';
import { UtilesService } from './servicios/utiles.service';
import { MantenedorUsuariosComponent } from './mantenedor-usuarios/mantenedor-usuarios.component';
import { InicioComponent } from './inicio/inicio.component';
import { HeaderAppComponent } from './header-app/header-app.component';
import { ClientesComponent } from './clientes/clientes.component';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { MenuParametrosComponent } from './menu-parametros/menu-parametros.component';
import { ProductosComponent } from './productos/productos.component';
import { FacturasComponent } from './facturas/facturas.component';
import { ComprasComponent } from './compras/compras.component';
import { FacturaVentaComponent } from './factura-venta/factura-venta.component';
//pipes
import { CurrencyFormat } from './pipes/CurrencyFormat'


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    HeaderComponent,
    LoginComponent,
    MantenedorUsuariosComponent,
    InicioComponent,
    HeaderAppComponent,
    ClientesComponent,
    ProveedorComponent,
    MenuParametrosComponent,
    ProductosComponent,
    FacturasComponent,
    ComprasComponent,
    FacturaVentaComponent,
    CurrencyFormat,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatGridListModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatDatepickerModule,
    CdkTableModule,
    HttpClientModule,
    HttpModule,
    BrowserAnimationsModule,
    DataTablesModule,
    Ng2CompleterModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatNativeDateModule,
    ToastModule.forRoot(),
    NgxLoadingModule.forRoot({}),
    appRouting
    //NgbModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-CL' },
    MatDatepickerModule,
    ServicioLoginService,
    GlobalService,
    GajicoService,
    UtilesService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
