import {Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { DeviceService, Device, RoomMeta } from '../services/device.service';
import { SideBarComponent } from '../SideBar/SideBar.component';
import {interval, startWith, Subscription} from "rxjs";

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
  expandedRoomName: string | null = null;

  // refreshsub ?: Subscription;

  constructor(private deviceService: DeviceService) {}

  ngOnInit() {
    this.deviceService.getRooms().subscribe(data => {
      this.rooms = data.map(room => ({
        ...room,
        lightIntensity: room.lightIntensity ?? 3
      }));

      this.rooms.forEach(room => {
        this.deviceService.getDevicesByRoom(room.name).subscribe(devs => {
          this.allDevices = [...this.allDevices, ...devs];
        });

        if (room.lightIntensity > 0) {
          this.deviceService.setLightIntensity(room.name, room.lightIntensity).subscribe();
        }
      });
    });


    // this.refreshsub = interval(1000).pipe(startWith(0)).subscribe(() => {
    //     this.rooms.forEach(room => {
    //       this.deviceService.getDevicesByRoom(room.name).subscribe(devs => {
    //         this.allDevices = [...this.allDevices, ...devs];
    //       });
    //
    //       if (room.lightIntensity > 0) {
    //         this.deviceService.setLightIntensity(room.name, room.lightIntensity).subscribe();
    //       }
    //     })
    //   }
    // );

  }

  // ngOnDestroy() {
  //   this.refreshsub?.unsubscribe();
  // }

  getRoomDevices(roomName: string): Device[] {
    return this.allDevices.filter(d => d.room === roomName && d.type !== 'LIGHT');
  }

  getActiveCount(roomName: string): number {
    const nonLightActive = this.allDevices
      .filter(d => d.room === roomName && d.type !== 'LIGHT' && d.isOn).length;

    const room = this.rooms.find(r => r.name === roomName);
    const lightActive = (room && room.lightIntensity > 0) ? 1 : 0;

    return nonLightActive + lightActive;
  }

  getRoomPower(roomName: string): number {
    let powerSum = this.allDevices
      .filter(d => d.room === roomName && d.type !== 'LIGHT' && d.isOn)
      .reduce((sum, d) => sum + d.consumption, 0);

    const room = this.rooms.find(r => r.name === roomName);
    if (room) {
      // Assuming 0.1kW per intensity level
      powerSum += room.lightIntensity * 0.1;
    }

    return powerSum;
  }

  getIcon(type: string): string {
    const map: any = {
      'AC': '❄️', 'LIGHT': '💡', 'TV': '📺', 'FAN': '💨',
      'FRIDGE': '🧊', 'BLINDS': '🪟', 'AUDIO': '🔊',
      'COFFEE': '☕', 'WIFI': '📶'
    };
    return map[type] || '⚡';
  }


  adjustLight(roomName: string, event: Event) {
    const newIntensity = +(event.target as HTMLInputElement).value;

    const room = this.rooms.find(r => r.name === roomName);
    if (room) {
      // 1. Update UI instantly
      room.lightIntensity = newIntensity;

      // 2. Send to Backend (Must Subscribe!)
      this.deviceService.setLightIntensity(roomName, newIntensity).subscribe({
        error: (err) => console.error('Failed to set light:', err)
      });
    }
  }

  // --- OTHER ACTIONS ---

  toggleView(roomName: string) {
    this.expandedRoomName = this.expandedRoomName === roomName ? null : roomName;
  }

  toggleDevice(device: Device) {
    this.deviceService.toggleDevice(device.id);
  }

  turnOffAll(roomName: string) {
    const nonLightDevices = this.allDevices.filter(d => d.room === roomName && d.type !== 'LIGHT');
    nonLightDevices.forEach(d => { if(d.isOn) this.deviceService.toggleDevice(d.id); });

    const room = this.rooms.find(r => r.name === roomName);
    if (room) {
      room.lightIntensity = 0;
      // Updated: Subscribe to the service call
      this.deviceService.setLightIntensity(roomName, 0).subscribe();
    }
  }
}
