import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http'; 
import { HttpModule } from '@angular/http';

//Rutas
import { appRouting } from './app-routing.module';

import { AppComponent } from './app.component';
//import { AppRoutingModule } from './/app-routing.module';
import { HomeComponent } from './home/home.component';
//plugin
import {MatGridListModule} from '@angular/material/grid-list';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './login/login.component';
//servicios
import { ServicioLoginService } from './servicios/servicio-login-service';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    FooterComponent,
    HeaderComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatGridListModule,
    MatToolbarModule,
    MatCardModule,
    HttpClientModule,
    HttpModule,
    appRouting,
    //NgbModule
  ],
  providers: [
    ServicioLoginService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
