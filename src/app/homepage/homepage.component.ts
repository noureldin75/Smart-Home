import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { HomepagesecComponent } from '../homepagesec/homepagesec.component';
import { RouterLink, RouterLinkActive } from '@angular/router';
interface Room {
  name: string;
  icon: string;
  devices: number;
  temperature: string;
  status: 'active' | 'offline' | 'sleep';
}
interface WeatherData {
  temperature: number;
  description: string;
  high: number;
  low: number;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  feelsLike: number;
  sunrise: string;
  sunset: string;
  sunPosition: number;
  animation: string;
  advice: string;
  adviceLevel: 'good' | 'moderate' | 'poor';
}
interface HourlyForecast {
  time: string;
  temperature: number;
  animation: string;
}
interface Activity {
  title: string;
  time: string;
  icon: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}
interface FamilyMember {
  name: string;
  avatar: string;
  emoji: string;
  location: string;
  status: 'online' | 'away' | 'offline';
}
interface JarvisMessage {
  content: string;
  type: 'user' | 'ai';
  time: string;
}
interface PowerConsumption {
  time: string;
  consumption: number;
}
@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, HomepagesecComponent, RouterLink, RouterLinkActive],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class HomepageComponent implements OnInit {
  isSidebarExpanded = true;
  isDarkMode = true;
  activeSection = 'profile';
  homePartsExpanded = false;
  securityArmed = true;
  connectedDevices = 24;
  activeRooms = 5;
  profileNotifications = 2;
  weatherExpanded = false;

  // 3D Home View Properties
  homeLightsOn = true;
  selectedRoom: string | null = null;
  viewMode: 'isometric' | 'topdown' = 'isometric';

  // Weather Data
  currentWeather: WeatherData = {
    temperature: 22,
    description: 'Partly Cloudy',
    high: 24,
    low: 14,
    humidity: 65,
    windSpeed: 12,
    rainChance: 10,
    feelsLike: 23,
    sunrise: '6:30 AM',
    sunset: '7:45 PM',
    sunPosition: 60,
    animation: 'partly-cloudy',
    advice: 'Perfect weather for outdoor exercise!',
    adviceLevel: 'good'
  };

  hourlyForecast: HourlyForecast[] = [
    { time: 'Now', temperature: 22, animation: 'partly-cloudy' },
    { time: '1 PM', temperature: 23, animation: 'partly-cloudy' },
    { time: '2 PM', temperature: 24, animation: 'sunny' },
    { time: '3 PM', temperature: 24, animation: 'sunny' },
    { time: '4 PM', temperature: 23, animation: 'sunny' },
    { time: '5 PM', temperature: 22, animation: 'partly-cloudy' },
    { time: '6 PM', temperature: 20, animation: 'partly-cloudy' }
  ];

  rooms: Room[] = [
    { name: 'Living Room', icon: '🛋️', devices: 12, temperature: '22°C', status: 'active' },
    { name: 'Bedroom', icon: '🛏️', devices: 8, temperature: '20°C', status: 'sleep' },
    { name: 'Kitchen', icon: '👨‍🍳', devices: 9, temperature: '25°C', status: 'active' },
    { name: 'Bathroom', icon: '🚿', devices: 4, temperature: '24°C', status: 'offline' },
    { name: 'Home Office', icon: '💻', devices: 7, temperature: '21°C', status: 'active' }
  ];

  sparklineData = [30, 45, 60, 35, 70, 50, 80, 40, 65, 55];

  // New Properties
  securityStatus = 'active';
  doorLocked = true;
  alarmArmed = true;

  outdoorLightsOn = false;
  windowLocksOn = true;
  homeTemperature = 22;
  sleepModeOn = false;

  jarvisStatus = 'listening';
  jarvisInput = '';
  jarvisMessages: JarvisMessage[] = [
    { content: 'Hello! I\'m Jarvis, your smart home assistant. How can I help you today?', type: 'ai', time: '10:00 AM' }
  ];

  quickCommands = ['Lights On', 'Good Night', 'I\'m Home', 'Leave Home'];

  recentActivities: Activity[] = [
    { title: 'Front door unlocked', time: '2 mins ago', icon: '🔓', priority: 'high' },
    { title: 'Living room lights turned on', time: '5 mins ago', icon: '💡', priority: 'low' },
    { title: 'Temperature adjusted to 22°C', time: '15 mins ago', icon: '❄️', priority: 'medium' },
    { title: 'Security system armed', time: '1 hour ago', icon: '🚨', priority: 'high' },
    { title: 'New device connected', time: '2 hours ago', icon: '📱', priority: 'medium' },
    { title: 'Water leak detected in kitchen', time: '3 hours ago', icon: '💧', priority: 'critical' }
  ];

  familyMembers: FamilyMember[] = [
    { name: 'Hany', avatar: '', emoji: '👨', location: ' ', status: 'online' },
    { name: 'Markeeb', avatar: '', emoji: '👧', location: ' ', status: 'online' },
    { name: 'Bigad', avatar: '', emoji: '😎', location: ' ', status: 'away' },
    { name: 'Eyad', avatar: '', emoji: '🧑', location: ' ', status: 'offline' },
    { name: 'Noor', avatar: '', emoji: '👦', location: ' ', status: 'online' }
  ];

  powerConsumption: PowerConsumption[] = [
    { time: '6AM', consumption: 20 },
    { time: '9AM', consumption: 45 },
    { time: '12PM', consumption: 65 },
    { time: '3PM', consumption: 80 },
    { time: '6PM', consumption: 95 },
    { time: '9PM', consumption: 75 },
    { time: '12AM', consumption: 30 }
  ];

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

    this.simulateRealTimeUpdates();
    this.simulateWeatherUpdates();
    this.simulateJarvisActivity();
  }

  toggleSidebar() {
    this.isSidebarExpanded = !this.isSidebarExpanded;
    if (!this.isSidebarExpanded) {
      this.homePartsExpanded = false;
    }
  }

  toggleWeather() {
    this.weatherExpanded = !this.weatherExpanded;
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

  selectRoom(room: Room) {
    console.log('Selected room:', room.name);
    const roomMap: { [key: string]: string } = {
      'Living Room': 'living-room',
      'Kitchen': 'kitchen',
      'Bedroom': 'bedroom',
      'Bathroom': 'bathroom',
      'Home Office': 'office'
    };
    this.selectedRoom = roomMap[room.name] || null;
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

  logout() {
    console.log('Logging out...');
  }

  // New Methods
  toggleDoorLock() {
    this.doorLocked = !this.doorLocked;
    this.addActivity(`Front door ${this.doorLocked ? 'locked' : 'unlocked'}`, '🔒', 'high');
  }

  toggleAlarm() {
    this.alarmArmed = !this.alarmArmed;
    this.securityStatus = this.alarmArmed ? 'active' : 'disabled';
    this.addActivity(`Security system ${this.alarmArmed ? 'armed' : 'disarmed'}`, '🚨', 'high');
  }

  toggleOutdoorLights() {
    this.outdoorLightsOn = !this.outdoorLightsOn;
    this.addActivity(`Outdoor lights turned ${this.outdoorLightsOn ? 'on' : 'off'}`, '💡', 'low');
  }

  toggleWindowLocks() {
    this.windowLocksOn = !this.windowLocksOn;
    this.addActivity(`Window locks ${this.windowLocksOn ? 'engaged' : 'released'}`, '🔒', 'medium');
  }

  onTemperatureChange(event: any) {
    this.homeTemperature = event.target.value;
    this.addActivity(`Temperature set to ${this.homeTemperature}°C`, '❄️', 'medium');
  }

  toggleSleepMode() {
    this.sleepModeOn = !this.sleepModeOn;
    if (this.sleepModeOn) {
      this.addActivity('Sleep mode activated', '😴', 'medium');
      this.homeTemperature = 21;
    } else {
      this.addActivity('Sleep mode deactivated', '😴', 'medium');
    }
  }

  getOnlineMembers(): number {
    return this.familyMembers.filter(member => member.status === 'online').length;
  }

  broadcastMessage() {
    this.addActivity('Broadcast message sent to all devices', '📢', 'medium');
  }

  toggleNotifications() {
    console.log('Notifications clicked');
  }

  openSettings() {
    console.log('Settings clicked');
  }

  sendToJarvis() {
    if (this.jarvisInput.trim()) {
      this.jarvisMessages.push({
        content: this.jarvisInput,
        type: 'user',
        time: this.getCurrentTime()
      });

      setTimeout(() => {
        this.jarvisMessages.push({
          content: this.generateJarvisResponse(this.jarvisInput),
          type: 'ai',
          time: this.getCurrentTime()
        });
      }, 1000);

      this.jarvisInput = '';
    }
  }

  executeQuickCommand(command: string) {
    switch (command) {
      case 'Lights On':
        this.homeLightsOn = true;
        this.addActivity('All lights turned on via Jarvis', '💡', 'low');
        break;
      case 'Good Night':
        this.sleepModeOn = true;
        this.addActivity('Good night mode activated via Jarvis', '😴', 'medium');
        break;
      case 'I\'m Home':
        this.doorLocked = false;
        this.homeLightsOn = true;
        this.addActivity('Welcome home sequence activated', '🏠', 'medium');
        break;
      case 'Leave Home':
        this.doorLocked = true;
        this.alarmArmed = true;
        this.homeLightsOn = false;
        this.addActivity('Away mode activated via Jarvis', '🚗', 'high');
        break;
    }
  }

  // 3D Home View Methods
  setViewMode(mode: 'isometric' | 'topdown') {
    this.viewMode = mode;
  }

  toggleLights() {
    this.homeLightsOn = !this.homeLightsOn;
    this.addActivity(`All home lights turned ${this.homeLightsOn ? 'on' : 'off'}`, '💡', 'low');
  }

  selectRoom3D(roomId: string) {
    this.selectedRoom = roomId;
  }

  deselectRoom() {
    this.selectedRoom = null;
  }

  getRoomName(room: string): string {
    const roomNames: { [key: string]: string } = {
      'living-room': 'Living Room',
      'kitchen': 'Kitchen',
      'bedroom': 'Bedroom',
      'bathroom': 'Bathroom',
      'office': 'Home Office'
    };
    return roomNames[room] || room;
  }

  getRoomDeviceCount(room: string): number {
    const deviceCounts: { [key: string]: number } = {
      'living-room': 12,
      'kitchen': 9,
      'bedroom': 8,
      'bathroom': 4,
      'office': 7
    };
    return deviceCounts[room] || 0;
  }

  getRoomTemperature(room: string): string {
    const temperatures: { [key: string]: string } = {
      'living-room': '22°C',
      'kitchen': '25°C',
      'bedroom': '20°C',
      'bathroom': '24°C',
      'office': '21°C'
    };
    return temperatures[room] || '22°C';
  }

  toggleRoomLights(room: string) {
    this.addActivity(`${this.getRoomName(room)} lights toggled`, '💡', 'low');
  }

  adjustRoomTemperature(room: string) {
    this.addActivity(`Adjusting temperature in ${this.getRoomName(room)}`, '❄️', 'medium');
  }

  private generateJarvisResponse(input: string): string {
    const responses = [
      "I've adjusted the living room temperature to your preference.",
      "The security system is now armed and all doors are locked.",
      "I've turned on the lights in the kitchen and living room.",
      "Sleep mode has been activated. Sweet dreams!",
      "All systems are functioning normally. Is there anything specific you'd like me to do?",
      "I've sent your message to the family broadcast system.",
      "The outdoor lights have been scheduled to turn on at sunset."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private getCurrentTime(): string {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  private addActivity(title: string, icon: string, priority: 'low' | 'medium' | 'high' | 'critical') {
    this.recentActivities.unshift({
      title,
      time: 'Just now',
      icon,
      priority
    });

    if (this.recentActivities.length > 6) {
      this.recentActivities.pop();
    }
  }

  private simulateRealTimeUpdates() {
    setInterval(() => {
      this.sparklineData = this.sparklineData.map(() =>
        Math.floor(Math.random() * 40) + 30
      );
      this.connectedDevices = 20 + Math.floor(Math.random() * 10);
      if (Math.random() > 0.9) {
        this.securityArmed = !this.securityArmed;
      }
    }, 5000);
  }

  private simulateWeatherUpdates() {
    setInterval(() => {
      const tempChange = (Math.random() - 0.5) * 2;
      this.currentWeather.temperature = Math.round((this.currentWeather.temperature + tempChange) * 10) / 10;
      this.currentWeather.feelsLike = Math.round((this.currentWeather.feelsLike + tempChange) * 10) / 10;

      if (Math.random() > 0.95) {
        const conditions = [
          { desc: 'Sunny', anim: 'sunny', advice: 'Great day for outdoor activities!', level: 'good' },
          { desc: 'Partly Cloudy', anim: 'partly-cloudy', advice: 'Perfect weather for outdoor exercise!', level: 'good' },
          { desc: 'Cloudy', anim: 'cloudy', advice: 'Good conditions for a walk or light exercise.', level: 'moderate' },
          { desc: 'Light Rain', anim: 'rainy', advice: 'Consider indoor activities today.', level: 'moderate' },
          { desc: 'Stormy', anim: 'stormy', advice: 'Better stay indoors today.', level: 'poor' }
        ];

        const newCondition = conditions[Math.floor(Math.random() * conditions.length)];
        this.currentWeather.description = newCondition.desc;
        this.currentWeather.animation = newCondition.anim;
        this.currentWeather.advice = newCondition.advice;
        this.currentWeather.adviceLevel = newCondition.level as 'good' | 'moderate' | 'poor';
      }
    }, 30000);
  }

  private simulateJarvisActivity() {
    setInterval(() => {
      const activities = [
        { msg: 'Regular system check completed. All systems optimal.', type: 'ai' as const },
        { msg: 'Weather update: Clear skies expected throughout the day.', type: 'ai' as const },
        { msg: 'Energy consumption is 15% lower than yesterday. Great job!', type: 'ai' as const }
      ];

      if (Math.random() > 0.7) {
        const activity = activities[Math.floor(Math.random() * activities.length)];
        this.jarvisMessages.push({
          content: activity.msg,
          type: activity.type,
          time: this.getCurrentTime()
        });
      }
    }, 30000);
  }
}
