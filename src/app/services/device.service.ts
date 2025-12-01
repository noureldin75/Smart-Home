import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// 1. Updated Interface to match your data
export interface Device {
  id: number;
  name: string;
  // Added all the new types from your data
  type: 'AC' | 'LIGHT' | 'TV' | 'FAN' | 'WIFI' | 'OTHER' | 'BLINDS' | 'AUDIO' | 'SENSOR' | 'PLUG' | 'CLOCK' | 'HUMIDIFIER' | 'FRIDGE' | 'COFFEE' | 'DISHWASHER' | 'MICROWAVE' | 'OVEN'| 'SPRINKLER';
  room: string;
  isOn: boolean;
  consumption: number;
}

// 2. Define what a "Room" looks like (for the loop)
export interface RoomMeta {
  name: string;
  icon: string;
  temperature: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  // 3. Define the Rooms here (So HomeParts can loop over them)
  private rooms: RoomMeta[] = [
    { name: 'Living Room',    icon: '🛋️', temperature: 22 },
    { name: 'Master Bedroom', icon: '🛏️', temperature: 20 },
    { name: 'Kitchen',        icon: '🍳', temperature: 24 },
    { name: 'Bathroom',      icon: '🛁', temperature: 23 },
    { name: 'Garage',         icon: '🚗', temperature: 18 },
    {name:'Garden', icon:'🌳', temperature:19},

  ];

  // 4. Your Data
  private mockDevices: Device[] = [
    // Room 1 — Living Room
    { id: 201, name: 'Main Lights',    type: 'LIGHT', room: 'Living Room', isOn: true,  consumption: 0.07 },
    { id: 202, name: 'AC Unit',        type: 'AC',    room: 'Living Room', isOn: true,  consumption: 1.32 },
    { id: 203, name: 'Smart TV',       type: 'TV',    room: 'Living Room', isOn: true,  consumption: 0.16 },
    { id: 204, name: 'Ceiling Fan',    type: 'FAN',   room: 'Living Room', isOn: false, consumption: 0.11 },
    { id: 205, name: 'Smart Blinds',   type: 'BLINDS', room: 'Living Room', isOn: true, consumption: 0.03 },
    { id: 206, name: 'Sound System',   type: 'AUDIO', room: 'Living Room', isOn: true,  consumption: 0.12 },
    { id: 207, name: 'Motion Sensor',  type: 'SENSOR', room: 'Living Room', isOn: true, consumption: 0.02 },
    { id: 208, name: 'Smart Plug',     type: 'PLUG', room: 'Living Room', isOn: false, consumption: 0.04 },

    // Room 2 — Master Bedroom
    { id: 301, name: 'Bedroom Lights', type: 'LIGHT', room: 'Master Bedroom', isOn: true,  consumption: 0.05 },
    { id: 302, name: 'AC Unit',        type: 'AC',    room: 'Master Bedroom', isOn: true,  consumption: 1.18 },
    { id: 303, name: 'Smart Blinds',   type: 'BLINDS', room: 'Master Bedroom', isOn: false, consumption: 0.02 },
    { id: 304, name: 'Alarm Clock',    type: 'CLOCK', room: 'Master Bedroom', isOn: true,  consumption: 0.01 },
    { id: 305, name: 'Humidifier',     type: 'HUMIDIFIER', room: 'Master Bedroom', isOn: false, consumption: 0.04 },
    { id: 306, name: 'Night Light',    type: 'LIGHT', room: 'Master Bedroom', isOn: false, consumption: 0.03 },

    // Room 3 — Kitchen
    { id: 401, name: 'Kitchen Lights', type: 'LIGHT', room: 'Kitchen', isOn: true,  consumption: 0.06 },
    { id: 402, name: 'Refrigerator',   type: 'FRIDGE', room: 'Kitchen', isOn: true,  consumption: 0.14 },
    { id: 403, name: 'Coffee Maker',   type: 'COFFEE', room: 'Kitchen', isOn: false, consumption: 0.61 },
    { id: 404, name: 'Dishwasher',     type: 'DISHWASHER', room: 'Kitchen', isOn: false, consumption: 1.22 },
    { id: 405, name: 'Microwave',      type: 'MICROWAVE', room: 'Kitchen', isOn: false, consumption: 0.89 },
    { id: 406, name: 'Smart Oven',     type: 'OVEN', room: 'Kitchen', isOn: false,  consumption: 1.74 },
    { id: 407, name: 'Hood Fan',       type: 'FAN',  room: 'Kitchen', isOn: false,  consumption: 0.13 },

    // Room 4 — Garden
    { id: 501, name: 'Garden Lights', type: 'LIGHT', room: 'Garden', isOn: true, consumption: 0.05 },
    { id: 502, name: 'Sprinkler System', type: 'SPRINKLER', room: 'Garden', isOn: false, consumption: 0.20 },

    // Room 5 — Bathroom
    { id: 601, name: 'Bathroom Lights', type: 'LIGHT', room: 'Bathroom', isOn: true,  consumption: 0.04 },
    { id: 602, name: 'Exhaust Fan',     type: 'FAN',   room: 'Bathroom', isOn: false, consumption: 0.10 },
    { id: 603, name: 'Heated Mirror',   type: 'OTHER', room: 'Bathroom', isOn: true,  consumption: 0.08 },

    // Room 6 — Garage
    { id: 701, name: 'Garage Lights',  type: 'LIGHT', room: 'Garage', isOn: false, consumption: 0.05 },
    { id: 702, name: 'EV Charger',     type: 'OTHER', room: 'Garage', isOn: true,  consumption: 2.50 },

  ];

  constructor() { }

  // --- METHODS ---

  // A. Get the list of Rooms (For HomeParts)
  getRooms(): Observable<RoomMeta[]> {
    return of(this.rooms);
  }

  // B. Get devices filtered by Room Name (For RoomCard)
  getDevicesByRoom(roomName: string): Observable<Device[]> {
    const filtered = this.mockDevices.filter(d => d.room === roomName);
    return of(filtered);
  }

  // C. Toggle Device Status
  toggleDevice(id: number): void {
    const device = this.mockDevices.find(d => d.id === id);
    if (device) {
      device.isOn = !device.isOn;
      console.log(`Toggled ${device.name} to ${device.isOn}`);
    }
  }
  // D. Get All Devices (For Energy Analytics)
  getAllDevices(): Observable<Device[]> {
    return of(this.mockDevices);
  }
}