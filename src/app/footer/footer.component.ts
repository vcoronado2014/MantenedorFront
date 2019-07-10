import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  direccion:string = environment.DIRECCION;
  telefono:string = environment.TELEFONO;
  contacto:string = environment.CONTACTO;
  web:string = environment.WEB;
  facebook:string = environment.FACEBOOK;
  twitter:string = environment.TWITTER;
  constructor() { }

  ngOnInit() {
  }

}
