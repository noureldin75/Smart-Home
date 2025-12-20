import {Component, OnInit} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { WelcomeComponent } from './welcome/welcome.component';
import { HomepageComponent } from './homepage/homepage.component';
import { SideBarComponent } from './SideBar/SideBar.component';
import {DeviceService} from "./services/device.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, WelcomeComponent, HomepageComponent,SideBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent  implements OnInit {
  title = 'resinex';
  showWelcome = true;
  constructor(private router: Router ,
              private deviceservice: DeviceService,
              ) {}


  onWelcomeComplete() {
    this.showWelcome = false;
    this.router.navigate(['/Home']);

  }

  ngOnInit() {
   this.deviceservice.syncAllRoomsToHardware();
  }
}
