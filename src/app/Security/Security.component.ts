import { Component, OnInit } from '@angular/core';
import { SideBarComponent } from "../SideBar/SideBar.component"

@Component({
  selector: 'app-Security',
  standalone:true,
  templateUrl: './Security.component.html',
  styleUrls: ['./Security.component.css'],
  imports: [SideBarComponent]
})
export class SecurityComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
