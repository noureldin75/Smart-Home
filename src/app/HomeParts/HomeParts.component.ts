import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { DeviceService, Device, RoomMeta } from '../services/device.service';
import { SideBarComponent } from '../SideBar/SideBar.component';



@Component({
  selector: 'app-home-parts',
  standalone: true,
  imports: [CommonModule, DecimalPipe, SideBarComponent],
  templateUrl: './HomeParts.component.html', 
  styleUrls: ['./HomeParts.component.css'] 
})
export class HomePartsComponent implements OnInit {

  rooms: RoomMeta[] = [];
  allDevices: Device[] = [];

  // Track which room is currently expanded (null = none)
  expandedRoomName: string | null = null;

  constructor(private deviceService: DeviceService) {}

  ngOnInit() {
  
    this.deviceService.getRooms().subscribe(data => {
      // Initialize lightIntensity if it's missing (important for the slider to show a value)
      this.rooms = data.map(room => ({
        ...room,
        lightIntensity: room.lightIntensity ?? 3 // Default to 3 if not provided by service
      }));
      
      
      this.rooms.forEach(room => {
        this.deviceService.getDevicesByRoom(room.name).subscribe(devs => {
          this.allDevices = [...this.allDevices, ...devs];
        });
      });
    });
  }

 
  getRoomDevices(roomName: string): Device[] {
    return this.allDevices.filter(d => d.room === roomName && d.type !== 'LIGHT');
  }

  // Count ON devices
  getActiveCount(roomName: string): number {
    // Only count non-light devices that are explicitly on/off, PLUS count the light as 'on' if its intensity is > 0
    const nonLightActive = this.allDevices
      .filter(d => d.room === roomName && d.type !== 'LIGHT' && d.isOn).length;
      
    const room = this.rooms.find(r => r.name === roomName);
    const lightActive = (room && room.lightIntensity > 0) ? 1 : 0;

    return nonLightActive + lightActive;
  }

  // Calculate Power
  getRoomPower(roomName: string): number {
    let powerSum = this.allDevices
      .filter(d => d.room === roomName && d.type !== 'LIGHT' && d.isOn)
      .reduce((sum, d) => sum + d.consumption, 0);

    // Optional: Add power based on light intensity (e.g., 0.1 kW per intensity level)
    const room = this.rooms.find(r => r.name === roomName);
    if (room) {
      // Assuming a light device consumes 0.1kW per intensity level (1 to 5)
      powerSum += room.lightIntensity * 0.1;
    }

    return powerSum;
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

  // --- NEW LIGHT INTENSITY ACTION ---

  /**
   * Updates the light intensity for a specific room when the slider is moved.
   * @param roomName The name of the room.
   * @param event The DOM event from the range slider.
   */
  adjustLight(roomName: string, event: Event) {
    // Get the new value from the slider input
    const newIntensity = +(event.target as HTMLInputElement).value;
    
    // 1. Update the local data model (rooms array)
    const room = this.rooms.find(r => r.name === roomName);
    if (room) {
      room.lightIntensity = newIntensity;
      
      // 2. Call the service to update the backend/state
      // IMPORTANT: You need to implement this method in your DeviceService
      // this.deviceService.setLightIntensity(roomName, newIntensity); 
      console.log(`Setting light intensity for ${roomName} to ${newIntensity}`);
    }
  }

  // --- OTHER ACTIONS ---

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
    // Turn off all non-light devices
    const nonLightDevices = this.allDevices.filter(d => d.room === roomName && d.type !== 'LIGHT');
    nonLightDevices.forEach(d => { if(d.isOn) this.deviceService.toggleDevice(d.id); });

    // Set light intensity to 0
    const room = this.rooms.find(r => r.name === roomName);
    if (room) {
        room.lightIntensity = 0;
        // this.deviceService.setLightIntensity(roomName, 0); // Service call
    }
  }
}