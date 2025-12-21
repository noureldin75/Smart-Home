import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { APILightServiceService } from '../Controllers/apilight-service.service';

export interface Device {
  id: number;
  name: string;
  type: 'AC' | 'LIGHT' | 'TV' | 'FAN' | 'WIFI' | 'OTHER' | 'BLINDS' | 'AUDIO' | 'SENSOR' | 'PLUG' | 'CLOCK' | 'HUMIDIFIER' | 'FRIDGE' | 'COFFEE' | 'DISHWASHER' | 'MICROWAVE' | 'OVEN' | 'SPRINKLER';
  room: string;
  isOn: boolean;
  consumption: number;
}

export interface RoomMeta {
  name: string;
  icon: string;
  temperature: number;
  lightIntensity: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  // Motion Sensor State - shared across components
  private motionSensorEnabledSubject = new BehaviorSubject<boolean>(true);
  public motionSensorEnabled$ = this.motionSensorEnabledSubject.asObservable();

  private rooms: RoomMeta[] = [
    { name: 'Living Room', icon: '🛋️', temperature: 22, lightIntensity: 4 },
    { name: 'Master Bedroom', icon: '🛏️', temperature: 20, lightIntensity: 3 },
    { name: 'Kitchen', icon: '🍳', temperature: 24, lightIntensity: 2 },
    { name: 'Bathroom', icon: '🛁', temperature: 23, lightIntensity: 5 },
    { name: 'Garage', icon: '🚗', temperature: 18, lightIntensity: 0 },
    { name: 'Garden', icon: '🌳', temperature: 19, lightIntensity: 1 },
  ];

  private mockDevices: Device[] = [
    { id: 201, name: 'Main Lights', type: 'LIGHT', room: 'Living Room', isOn: true, consumption: 0.07 },
    { id: 202, name: 'AC Unit', type: 'AC', room: 'Living Room', isOn: true, consumption: 1.32 },
    { id: 203, name: 'Smart TV', type: 'TV', room: 'Living Room', isOn: true, consumption: 0.16 },
    { id: 204, name: 'Ceiling Fan', type: 'FAN', room: 'Living Room', isOn: false, consumption: 0.11 },
    { id: 205, name: 'Smart Blinds', type: 'BLINDS', room: 'Living Room', isOn: true, consumption: 0.03 },
    { id: 206, name: 'Sound System', type: 'AUDIO', room: 'Living Room', isOn: true, consumption: 0.12 },
    { id: 207, name: 'Motion Sensor', type: 'SENSOR', room: 'Living Room', isOn: true, consumption: 0.02 },
    { id: 208, name: 'Smart Plug', type: 'PLUG', room: 'Living Room', isOn: false, consumption: 0.04 },
    { id: 301, name: 'Bedroom Lights', type: 'LIGHT', room: 'Master Bedroom', isOn: true, consumption: 0.05 },
    { id: 302, name: 'AC Unit', type: 'AC', room: 'Master Bedroom', isOn: true, consumption: 1.18 },
    { id: 303, name: 'Smart Blinds', type: 'BLINDS', room: 'Master Bedroom', isOn: false, consumption: 0.02 },
    { id: 304, name: 'Alarm Clock', type: 'CLOCK', room: 'Master Bedroom', isOn: true, consumption: 0.01 },
    { id: 305, name: 'Humidifier', type: 'HUMIDIFIER', room: 'Master Bedroom', isOn: false, consumption: 0.04 },
    { id: 306, name: 'Night Light', type: 'LIGHT', room: 'Master Bedroom', isOn: false, consumption: 0.03 },
    { id: 401, name: 'Kitchen Lights', type: 'LIGHT', room: 'Kitchen', isOn: true, consumption: 0.06 },
    { id: 402, name: 'Refrigerator', type: 'FRIDGE', room: 'Kitchen', isOn: true, consumption: 0.14 },
    { id: 403, name: 'Coffee Maker', type: 'COFFEE', room: 'Kitchen', isOn: false, consumption: 0.61 },
    { id: 404, name: 'Dishwasher', type: 'DISHWASHER', room: 'Kitchen', isOn: false, consumption: 1.22 },
    { id: 405, name: 'Microwave', type: 'MICROWAVE', room: 'Kitchen', isOn: false, consumption: 0.89 },
    { id: 406, name: 'Smart Oven', type: 'OVEN', room: 'Kitchen', isOn: false, consumption: 1.74 },
    { id: 407, name: 'Hood Fan', type: 'FAN', room: 'Kitchen', isOn: false, consumption: 0.13 },
    { id: 501, name: 'Garden Lights', type: 'LIGHT', room: 'Garden', isOn: true, consumption: 0.05 },
    { id: 502, name: 'Sprinkler System', type: 'SPRINKLER', room: 'Garden', isOn: false, consumption: 0.20 },
    { id: 601, name: 'Bathroom Lights', type: 'LIGHT', room: 'Bathroom', isOn: true, consumption: 0.04 },
    { id: 602, name: 'Exhaust Fan', type: 'FAN', room: 'Bathroom', isOn: false, consumption: 0.10 },
    { id: 603, name: 'Heated Mirror', type: 'OTHER', room: 'Bathroom', isOn: true, consumption: 0.08 },
    { id: 701, name: 'Garage Lights', type: 'LIGHT', room: 'Garage', isOn: false, consumption: 0.05 },
    { id: 702, name: 'EV Charger', type: 'OTHER', room: 'Garage', isOn: true, consumption: 2.50 },
  ];

  constructor(
    private apiLightService: APILightServiceService
  ) { }

  // Motion Sensor Methods
  getMotionSensorEnabled(): boolean {
    return this.motionSensorEnabledSubject.getValue();
  }

  setMotionSensorEnabled(enabled: boolean): void {
    // Update the Motion Sensor device state
    const motionSensor = this.mockDevices.find(d => d.id === 207);
    if (motionSensor) {
      motionSensor.isOn = enabled;
    }
    this.motionSensorEnabledSubject.next(enabled);
    console.log(`[DeviceService] Motion Sensor ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  toggleMotionSensor(): boolean {
    const newState = !this.getMotionSensorEnabled();
    this.setMotionSensorEnabled(newState);
    return newState;
  }

  getRooms(): Observable<RoomMeta[]> {
    return of(this.rooms);
  }

  getDevicesByRoom(roomName: string): Observable<Device[]> {
    const filtered = this.mockDevices.filter(d => d.room === roomName);
    return of(filtered);
  }

  toggleDevice(id: number): void {
    const device = this.mockDevices.find(d => d.id === id);
    if (device) {
      device.isOn = !device.isOn;
      console.log(`Toggled ${device.name} to ${device.isOn}`);
    }
  }

  getAllDevices(): Observable<Device[]> {
    return of(this.mockDevices);
  }


  setLightIntensity(roomName: string, intensity: number): Observable<any> {
    const room = this.rooms.find(r => r.name === roomName);

    if (room) {
      // UI
      room.lightIntensity = intensity;
      console.log(`[DeviceService] Setting ${roomName} intensity to ${intensity}`);

      // TO BACKEND
      return this.apiLightService.sendLightLevel(roomName, intensity);
    } else {
      console.error(`[DeviceService] Room not found: ${roomName}`);
      return of(false);
    }
  }

  syncAllRoomsToHardware() {
    console.log('[DeviceService] Starting full hardware sync...');

    this.rooms.forEach(room => {
      if (room.lightIntensity > 0) {
        // Send command for each room that has light
        this.apiLightService.sendLightLevel(room.name, room.lightIntensity).subscribe({
          next: () => console.log(`   -> Synced ${room.name}: ${room.lightIntensity}`),
          error: (err) => console.error(`   -> Failed to sync ${room.name}`, err)
        });
      }
    });
  }

}
