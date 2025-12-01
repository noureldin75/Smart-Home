import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { DeviceService, Device, RoomMeta } from '../services/device.service';
import { SideBarComponent } from '../SideBar/SideBar.component';

@Component({
  selector: 'app-home-parts',
  standalone: true,
  imports: [CommonModule, DecimalPipe,SideBarComponent],
  templateUrl: './homeparts.component.html',
  styleUrls: ['./homeparts.component.css']
})
export class HomePartsComponent implements OnInit {

  rooms: RoomMeta[] = [];
  allDevices: Device[] = [];
  
  // Track which room is currently expanded (null = none)
  expandedRoomName: string | null = null;

  constructor(private deviceService: DeviceService) {}

  ngOnInit() {
    // 1. Get Rooms
    this.deviceService.getRooms().subscribe(data => this.rooms = data);
    
    // 2. Get ALL Devices (We will filter them in the HTML or helpers)
    // Note: You might need to add a 'getAllDevices()' method to your service, 
    // or just loop through rooms and fetch them. Here is a simple way:
    this.rooms.forEach(room => {
      this.deviceService.getDevicesByRoom(room.name).subscribe(devs => {
        this.allDevices = [...this.allDevices, ...devs];
      });
    });
  }

  // --- HELPER METHODS ---

  // Get devices for a specific room
  getRoomDevices(roomName: string): Device[] {
    return this.allDevices.filter(d => d.room === roomName);
  }

  // Count ON devices
  getActiveCount(roomName: string): number {
    return this.getRoomDevices(roomName).filter(d => d.isOn).length;
  }

  // Calculate Power
  getRoomPower(roomName: string): number {
    return this.getRoomDevices(roomName)
      .filter(d => d.isOn)
      .reduce((sum, d) => sum + d.consumption, 0);
  }

  // Get Icon
  getIcon(type: string): string {
    const map: any = { 
      'AC': '❄️', 'LIGHT': '💡', 'TV': '📺', 'FAN': '💨', 
      'FRIDGE': '🧊', 'BLINDS': '🪟', 'AUDIO': '🔊', 
      'COFFEE': '☕', 'WIFI': '📶' 
    };
    return map[type] || '⚡';
  }

  // --- ACTIONS ---

  // Logic: If clicking the same room, close it. Otherwise, open the new one.
  toggleView(roomName: string) {
    if (this.expandedRoomName === roomName) {
      this.expandedRoomName = null; // Collapse
    } else {
      this.expandedRoomName = roomName; // Expand
    }
  }

  toggleDevice(device: Device) {
    this.deviceService.toggleDevice(device.id);
  }

  turnOffAll(roomName: string) {
    const roomDevices = this.getRoomDevices(roomName);
    roomDevices.forEach(d => { if(d.isOn) this.toggleDevice(d); });
  }
}