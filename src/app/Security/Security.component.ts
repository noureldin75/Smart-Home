import {Component, computed, OnInit, signal} from '@angular/core';
import { SideBarComponent } from "../SideBar/SideBar.component"
import {LowerCasePipe, NgClass} from "@angular/common";
interface DoorWindowDevice {
  name: string;
  status: 'locked' | 'unlocked' | 'closed' | 'open';
  icon: string; // Emoji for visual representation
  isLocked: boolean;
}

interface SensorCategory {
  name: string;
  count: number;
  total: number;
  isActive: boolean;
}

interface CameraFeed {
  name: string;
  status: 'Recording' | 'Idle' | 'Offline';
  isRecording: boolean;
}

interface ActivityLogEntry {
  type: 'Motion' | 'Door' | 'Alarm' | 'System' | 'Package' | 'Light';
  title: string;
  location: string;
  time: string;
  priority: 'High' | 'Normal' | 'Low';
}
@Component({
  selector: 'app-Security',
  standalone:true,
  templateUrl: './Security.component.html',
  styleUrls: ['./Security.component.css'],
  imports: [SideBarComponent, LowerCasePipe, NgClass]
})
export class SecurityComponent implements OnInit {

  // --- Data Models (Signals) ---

  // Doors & Windows
  readonly doorWindowDevices = signal<DoorWindowDevice[]>([
    { name: 'Front Door', status: 'locked', icon: '🚪', isLocked: true },
    { name: 'Back Door', status: 'locked', icon: '🚪', isLocked: true },
    { name: 'Garage Door', status: 'locked', icon: '🚗', isLocked: true },
    { name: 'Side Door', status: 'locked', icon: '🚪', isLocked: true },
    { name: 'Living Room Window', status: 'closed', icon: '🪟', isLocked: true },
    { name: 'Bedroom Window', status: 'open', icon: '🪟', isLocked: true },
  ]);

  // Sensor Categories
  readonly sensorCategories = signal<SensorCategory[]>([
    { name: 'Motion Sensors', count: 8, total: 8, isActive: true },
    { name: 'Door Sensors', count: 4, total: 4, isActive: true },
    { name: 'Window Sensors', count: 6, total: 6, isActive: true },
    { name: 'Glass Break Sensors', count: 2, total: 2, isActive: true },
    { name: 'Smoke Detectors', count: 5, total: 5, isActive: true },
    { name: 'CO Detectors', count: 3, total: 3, isActive: true },
    { name: 'Water Sensors', count: 0, total: 4, isActive: false },
  ]);

  // Camera Feeds
  readonly cameraFeeds = signal<CameraFeed[]>([
    { name: 'Front Door', status: 'Recording', isRecording: true },
    { name: 'Back Yard', status: 'Recording', isRecording: true },
    { name: 'Garage', status: 'Idle', isRecording: false },
    { name: 'Living Room', status: 'Recording', isRecording: true }
  ]);

  // Activity Log
  readonly activityLog = signal<ActivityLogEntry[]>([
    { type: 'Motion', title: 'Motion Detected', location: 'Back Yard', time: '2 min ago', priority: 'High' },
    { type: 'Door', title: 'Front Door Unlocked', location: 'Main Entrance', time: '15 min ago', priority: 'Normal' },
    { type: 'Door', title: 'Garage Door Opened', location: 'Main Entrance', time: '1 hour ago', priority: 'Normal' },
    { type: 'Alarm', title: 'Alarm Triggered', location: 'Living Room', time: '3 hours ago', priority: 'High' },
    { type: 'System', title: 'System Armed', location: 'Main Panel', time: '5 hours ago', priority: 'Normal' },

  ]);

  // --- Computed Properties ---

  readonly activeCameras = computed(() =>
    this.cameraFeeds().filter(c => c.isRecording).length
  );

  readonly totalActiveSensors = computed(() =>
    this.sensorCategories().filter(s => s.isActive).length
  );

  readonly allSecured = computed(() =>
    this.doorWindowDevices().every(d => d.status === 'locked' || d.status === 'closed')
  );

  constructor() { }

  ngOnInit() {
  }

}
