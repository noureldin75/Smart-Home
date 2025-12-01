import {Component, computed, OnInit, signal} from '@angular/core';
import { SideBarComponent } from "../SideBar/SideBar.component"
import {LowerCasePipe, NgClass, Time} from "@angular/common";
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
  name: string; //unique
  status: 'Recording' | 'Idle' ;
  isRecording: boolean;
}

interface ActivityLogEntry {
  type: 'Motion' | 'Door' | 'Alarm' | 'System' | 'Package' | 'Light' | 'Camera';
  title: string;
  location: string;
  time: string;
  timestamp: Date;
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
  constructor() { }

  ngOnInit() {
    const that = this;

    setInterval(function() {
      // Trigger signal update to recompute displayActivityLog
      that.activityLog.set(that.activityLog());
    }, 1000);
  }

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
    { type: 'Motion', title: 'Motion Detected', location: 'Back Yard', time: '2 min ago', priority: 'High',timestamp:new Date() },
    { type: 'Door', title: 'Front Door Unlocked', location: 'Main Entrance', time: '15 min ago', priority: 'Normal',timestamp:new Date() },
    { type: 'Door', title: 'Garage Door Opened', location: 'Main Entrance', time: '1 hour ago', priority: 'Normal' ,timestamp:new Date()},
    { type: 'Alarm', title: 'Alarm Triggered', location: 'Living Room', time: '3 hours ago', priority: 'High',timestamp:new Date() },
    { type: 'System', title: 'System Armed', location: 'Main Panel', time: '5 hours ago', priority: 'Normal',timestamp:new Date() },

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


  toggleCameraStatus(camera: CameraFeed) {
    const feeds = this.cameraFeeds();
    const updatedFeeds: CameraFeed[] = [];

    for (let i = 0; i < feeds.length; i++) {

      const f = feeds[i];

      if (f.name === camera.name) {

        const newState = !f.isRecording;

        updatedFeeds.push({
          name: f.name,
          isRecording: newState,
          status: newState ? 'Recording' : 'Idle'
        });
        this.addLog(
          {
            type:'Camera',
            location:camera.name,
            title:newState? 'Camera started recording' :' Camera is idle',
            priority:'Normal',
            time:'Just now',
            timestamp: new Date(),

          }
        )

      } else {
        updatedFeeds.push({ ...f });
      }
    }

    this.cameraFeeds.set(updatedFeeds);

  }
  addLog(log: ActivityLogEntry) {
    const logs=this.activityLog();
    const updated=[log, ...logs];
    if(updated.length > 5){
      updated.pop();
    }
    this.activityLog.set(updated);

  }


  get displayActivityLog(): ActivityLogEntry[] {
    const now = new Date();

    return this.activityLog().map(function(log) {
      const diffMs = now.getTime() - log.timestamp.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHr = Math.floor(diffMin / 60);

      let displayTime = '';

      if (diffSec < 10) displayTime = 'Just now';
      else if (diffSec < 60) displayTime = diffSec + ' sec ago';
      else if (diffMin < 60) displayTime = diffMin + ' min ago';
      else displayTime = diffHr + ' hr ago';

      return {
        type: log.type,
        title: log.title,
        location: log.location,
        timestamp: log.timestamp,
        priority: log.priority,
        time: displayTime // dynamically computed
      };
    });


  }
  toggleDoor(door: DoorWindowDevice) {
    const Windows = this.doorWindowDevices();
    const updated:DoorWindowDevice[]=[];
    for(let i = 0; i < Windows.length; i++) {
      const w = Windows[i];
      if(w.name===door.name){
        let newStatus: 'locked' | 'unlocked' | 'closed' | 'open';
        if (w.status === 'locked') newStatus = 'unlocked';
        else if (w.status === 'unlocked') newStatus = 'locked';
        else if (w.status === 'closed') newStatus = 'open';
        else newStatus = 'closed';
        updated.push({
          ...w,
          status: newStatus,
          isLocked: newStatus === 'locked' || newStatus === 'closed'
        });
        this.addLog({
          type: 'Door',
          title: `${w.name} is ${newStatus}`,
          location: w.name,
          priority: 'Normal',
          time: 'Just now',
          timestamp: new Date()
        })
      }
      else{
        updated.push({...w});
      }
      this.doorWindowDevices.set(updated);
    }
  }



}
