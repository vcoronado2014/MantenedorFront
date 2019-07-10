import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(
    private ref: ChangeDetectorRef,
    private router: Router
  ) {
    
   }

  ngOnInit() {
  }

}
