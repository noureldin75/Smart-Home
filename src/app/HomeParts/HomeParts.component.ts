import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { DeviceService, Device, RoomMeta } from '../services/device.service';
import { SideBarComponent } from '../SideBar/SideBar.component';
import { AlertService } from '../services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home-parts',
  standalone: true,
  imports: [CommonModule, DecimalPipe, SideBarComponent],
  templateUrl: './HomeParts.component.html',
  styleUrls: ['./HomeParts.component.css']
})
export class HomePartsComponent implements OnInit, OnDestroy {

  rooms: RoomMeta[] = [];
  allDevices: Device[] = [];
  expandedRoomName: string | null = null;

  // Motion sensor and alert state
  motionAlertActive = false;
  private motionAlertSubscription?: Subscription;
  private motionSensorSubscription?: Subscription;

  constructor(
    private deviceService: DeviceService,
    private alertService: AlertService
  ) { }

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

    // Subscribe to motion alerts to update sensor visual state
    this.motionAlertSubscription = this.alertService.motionAlert$.subscribe(alert => {
      this.motionAlertActive = alert.isActive;
    });

    // Subscribe to motion sensor state changes from DeviceService
    this.motionSensorSubscription = this.deviceService.motionSensorEnabled$.subscribe(enabled => {
      // Sync the motion sensor device state
      const motionSensor = this.allDevices.find(d => d.id === 207);
      if (motionSensor) {
        motionSensor.isOn = enabled;
      }
    });
  }

  ngOnDestroy() {
    if (this.motionAlertSubscription) {
      this.motionAlertSubscription.unsubscribe();
    }
    if (this.motionSensorSubscription) {
      this.motionSensorSubscription.unsubscribe();
    }
  }

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
      'COFFEE': '☕', 'WIFI': '📶', 'SENSOR': '📡'
    };
    return map[type] || '⚡';
  }

  /**
   * Check if a device is the motion sensor
   */
  isMotionSensor(device: Device): boolean {
    return device.id === 207 && device.type === 'SENSOR';
  }

  /**
   * Check if there's an active motion alert
   */
  hasActiveAlert(): boolean {
    return this.motionAlertActive && this.deviceService.getMotionSensorEnabled();
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
    // Special handling for Motion Sensor
    if (this.isMotionSensor(device)) {
      this.toggleMotionSensor(device);
      return;
    }

    this.deviceService.toggleDevice(device.id);
  }

  /**
   * Toggle motion sensor with AlertService integration
   */
  toggleMotionSensor(device: Device) {
    const newState = this.deviceService.toggleMotionSensor();
    device.isOn = newState;

    // If disabling and there's an active alert, acknowledge it
    if (!newState && this.motionAlertActive) {
      this.alertService.acknowledgeAlarm().subscribe({
        next: () => {
          console.log('[HomeParts] Motion sensor disabled, alarm acknowledged');
          this.motionAlertActive = false;
        },
        error: (err) => console.error('[HomeParts] Failed to acknowledge alarm:', err)
      });
    }
  }

  /**
   * Stop the active alarm
   */
  stopAlarm() {
    if (!this.motionAlertActive) return;

    this.alertService.acknowledgeAlarm().subscribe({
      next: () => {
        console.log('[HomeParts] Alarm stopped');
        this.motionAlertActive = false;
      },
      error: (err) => console.error('[HomeParts] Failed to stop alarm:', err)
    });
  }

  turnOffAll(roomName: string) {
    const nonLightDevices = this.allDevices.filter(d => d.room === roomName && d.type !== 'LIGHT');
    nonLightDevices.forEach(d => {
      if (d.isOn) {
        // Don't auto-disable motion sensor with turn off all
        if (!this.isMotionSensor(d)) {
          this.deviceService.toggleDevice(d.id);
        }
      }
    });

    const room = this.rooms.find(r => r.name === roomName);
    if (room) {
      room.lightIntensity = 0;
      // Updated: Subscribe to the service call
      this.deviceService.setLightIntensity(roomName, 0).subscribe();
    }
  }
}

