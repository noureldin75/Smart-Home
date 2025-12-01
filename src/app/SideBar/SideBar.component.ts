import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './SideBar.component.html',
  styleUrls: ['./SideBar.component.css']
})
export class SideBarComponent implements OnInit {
  // المتغيرات الخاصة بالسايد بار (مستخرجة من الكود الأصلي)
  isSidebarExpanded = true;
  isDarkMode = true;
  activeSection = 'profile'; // أو 'dashboard' حسب ما تحب تبدأ
  homePartsExpanded = false;
  securityArmed = true;
  connectedDevices = 24;
  activeRooms = 5;
  profileNotifications = 2;
  sparklineData = [30, 45, 60, 35, 70, 50, 80, 40, 65, 55];

  ngOnInit() {
    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.isDarkMode = false;
      document.body.classList.add('light-mode');
    } else {
      this.isDarkMode = true;
      document.body.classList.remove('light-mode');
    }
  }

  rooms: Room[] = [
    { name: 'Living Room', icon: '🛋️', devices: 12, temperature: '22°C', status: 'active' },
    { name: 'Bedroom', icon: '🛏️', devices: 8, temperature: '20°C', status: 'sleep' },
    { name: 'Kitchen', icon: '👨‍🍳', devices: 9, temperature: '25°C', status: 'active' },
    { name: 'Bathroom', icon: '🚿', devices: 4, temperature: '24°C', status: 'offline' },
    { name: 'Home Office', icon: '💻', devices: 7, temperature: '21°C', status: 'active' }
  ];

  // الدوال (Methods)
  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
    if (!this.isSidebarExpanded) {
      this.homePartsExpanded = false;
    }
  }

  setActiveSection(section: string) {
    this.activeSection = section;
    if (section !== 'home-parts') {
      this.homePartsExpanded = false;
    }
  }

  toggleHomeParts() {
    if (this.isSidebarExpanded) {
      this.homePartsExpanded = !this.homePartsExpanded;
      this.activeSection = 'home-parts';
    } else {
      this.isSidebarExpanded = true;
      setTimeout(() => {
        this.homePartsExpanded = true;
        this.activeSection = 'home-parts';
      }, 300);
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    
    // Toggle the light-mode class on body element
    if (this.isDarkMode) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
    
    // Save preference to localStorage
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  selectRoom(room: Room) {
    console.log('Selected room:', room.name);
    // لو عايز تبعت ايفينت للاب ممكن تستخدم Output هنا، بس حالياً خليتها لوج بس زي طلبك
  }

  logout() {
    console.log('Logging out...');
  }
}