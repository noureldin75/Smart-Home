import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Room {
  name: string;
  icon: string;
  devices: number;
  temperature: string;
  status: 'active' | 'offline' | 'sleep';
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './SideBar.component.html',
  styleUrls: ['./SideBar.component.css']
})
export class SideBarComponent {
  @Input() isSidebarExpanded: boolean = true;
  @Input() isDarkMode: boolean = true;
  @Input() activeSection: string = 'dashboard';
  @Input() homePartsExpanded: boolean = false;
  @Input() securityArmed: boolean = true;
  @Input() connectedDevices: number = 0;
  @Input() activeRooms: number = 0;
  @Input() profileNotifications: number = 0;
  @Input() rooms: Room[] = [];
  @Input() sparklineData: number[] = [];

  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleHomeParts = new EventEmitter<void>();
  @Output() toggleDarkMode = new EventEmitter<void>();
  @Output() activeSectionChange = new EventEmitter<string>();
  @Output() roomSelected = new EventEmitter<Room>();
  @Output() logout = new EventEmitter<void>();

  // Methods
  onToggleSidebar() {
    this.toggleSidebar.emit();
    this.isSidebarExpanded = !this.isSidebarExpanded;
    if (!this.isSidebarExpanded) {
      this.homePartsExpanded = false;
    }
  }
 

  onToggleHomeParts() {
    this.toggleHomeParts.emit();
  }

  onToggleDarkMode() {
    this.toggleDarkMode.emit();
  }

  setActiveSection(section: string) {
    this.activeSectionChange.emit(section);
  }

  selectRoom(room: Room) {
    this.roomSelected.emit(room);
  }

  onLogout() {
    this.logout.emit();
  }
}