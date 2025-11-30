import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PrayerTime {
  name: string;
  time: string;
  isNext: boolean;
  passed: boolean;
}

interface CalendarDay {
  day: number;
  month: string;
  prayerTimes: PrayerTime[];
  isToday: boolean;
}

@Component({
  selector: 'app-homepagesec',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './homepagesec.component.html',
  styleUrls: ['./homepagesec.component.css']
})
export class HomepagesecComponent implements OnInit {
  isExpanded = false;
  currentTime = new Date();
  currentDate = '';
  nextPrayer = '';
  timeToNextPrayer = '';
  
  // Alexandria, Egypt coordinates
  location = {
    city: 'Alexandria',
    country: 'Egypt',
    latitude: 31.2001,
    longitude: 29.9187
  };

  // Sample prayer times for Alexandria
  todaysPrayers: PrayerTime[] = [
    { name: 'Fajr', time: '05:30', isNext: false, passed: false },
    { name: 'Sunrise', time: '06:45', isNext: false, passed: false },
    { name: 'Dhuhr', time: '12:15', isNext: false, passed: false },
    { name: 'Asr', time: '15:30', isNext: false, passed: false },
    { name: 'Maghrib', time: '17:45', isNext: false, passed: false },
    { name: 'Isha', time: '19:15', isNext: false, passed: false }
  ];

  // Sample calendar data
  calendarDays: CalendarDay[] = [
    { day: 15, month: 'DEC', prayerTimes: this.todaysPrayers, isToday: true },
    { day: 16, month: 'DEC', prayerTimes: this.todaysPrayers, isToday: false },
    { day: 17, month: 'DEC', prayerTimes: this.todaysPrayers, isToday: false },
    { day: 18, month: 'DEC', prayerTimes: this.todaysPrayers, isToday: false },
    { day: 19, month: 'DEC', prayerTimes: this.todaysPrayers, isToday: false },
    { day: 20, month: 'DEC', prayerTimes: this.todaysPrayers, isToday: false },
    { day: 21, month: 'DEC', prayerTimes: this.todaysPrayers, isToday: false }
  ];

  ngOnInit() {
    this.updateDateTime();
    this.calculateNextPrayer();
    
    // Update time every second
    setInterval(() => {
      this.updateDateTime();
      this.calculateNextPrayer();
    }, 1000);
  }

  updateDateTime() {
    this.currentTime = new Date();
    this.currentDate = this.currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  calculateNextPrayer() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    let nextPrayerFound = false;
    
    for (let prayer of this.todaysPrayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerTime = hours * 60 + minutes;
      
      if (prayerTime > currentTime) {
        prayer.isNext = true;
        prayer.passed = false;
        this.nextPrayer = prayer.name;
        
        // Calculate time remaining
        const timeDiff = prayerTime - currentTime;
        const hoursRemaining = Math.floor(timeDiff / 60);
        const minutesRemaining = timeDiff % 60;
        this.timeToNextPrayer = `${hoursRemaining}h ${minutesRemaining}m`;
        
        nextPrayerFound = true;
        break;
      } else {
        prayer.passed = true;
        prayer.isNext = false;
      }
    }
    
    // If no next prayer found, next prayer is tomorrow's Fajr
    if (!nextPrayerFound) {
      this.todaysPrayers[0].isNext = true;
      this.nextPrayer = 'Fajr (Tomorrow)';
      this.timeToNextPrayer = 'Tomorrow';
    }
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }

  getCurrentTimeString(): string {
    return this.currentTime.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getHijriDate(): string {
    // Simplified Hijri date - in real app, use a proper Hijri calendar library
    const hijriMonths = ['Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 
                        'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 
                        'Shaaban', 'Ramadan', 'Shawwal', 'Dhu al-Qadah', 'Dhu al-Hijjah'];
    const randomHijriDate = `${Math.floor(Math.random() * 28) + 1} ${hijriMonths[Math.floor(Math.random() * 12)]} 1445`;
    return randomHijriDate;
  }
}