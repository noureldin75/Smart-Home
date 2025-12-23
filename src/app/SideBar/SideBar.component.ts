import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { AlertService } from '../services/alert.service';
import { Subscription } from 'rxjs';

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
  imports: [CommonModule, RouterLink, RouterLinkActive,RouterModule],
  templateUrl: './SideBar.component.html',
  styleUrls: ['./SideBar.component.css']
})
export class SideBarComponent implements OnInit, OnDestroy {
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

  private tempSubscription?: Subscription;
  private latestTemp: number | null = null;
  private tempIntervalId?: any;

  constructor(private alertService: AlertService) {}

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

    // Subscribe to temperature updates but only apply to UI every 10 seconds
    this.tempSubscription = this.alertService.temperatureAlert$.subscribe(alert => {
      this.latestTemp = alert.temp;
    });

    // Load persisted value (if any)
    try {
      const raw = localStorage.getItem('resinex.roomTemps');
      if (raw) {
        const map = JSON.parse(raw) as Record<string, number>;
        const lt = map['Living Room'];
        if (typeof lt === 'number') {
          const living = this.rooms.find(r => r.name === 'Living Room');
          if (living) {
            living.temperature = `${lt}°C`;
          }
        }
      }
    } catch (e) {
      console.warn('[SideBar] Failed to load persisted temp', e);
    }

    // Apply latest temperature to Living Room every 10 seconds (non-instant)
    this.tempIntervalId = setInterval(() => {
      if (this.latestTemp !== null) {
        const living = this.rooms.find(r => r.name === 'Living Room');
        if (living) {
          // temperature is a string like '22°C' in this component
          living.temperature = `${this.latestTemp}°C`;

          // Persist the numeric value so HomeParts and reloads can reuse it
          try {
            const raw = localStorage.getItem('resinex.roomTemps');
            const map = raw ? JSON.parse(raw) as Record<string, number> : {};
            map['Living Room'] = this.latestTemp;
            localStorage.setItem('resinex.roomTemps', JSON.stringify(map));
          } catch (e) {
            console.warn('[SideBar] Failed to persist temp', e);
          }
        }
      }
    }, 10000);
  }

  ngOnDestroy() {
    if (this.tempSubscription) {
      this.tempSubscription.unsubscribe();
    }
    if (this.tempIntervalId) {
      clearInterval(this.tempIntervalId);
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