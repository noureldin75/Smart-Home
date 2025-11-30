import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideBarComponent } from '../SideBar/SideBar.component';

interface sEnergyCards {
  id: number;
  title: string;
  value: string;
  subvalue: string;
  icon: string;
  type: 'usage' | 'cost' | 'bill' | 'ecoScore';
}

interface PowerConsumption {
  time: string;
  consumption: number;
}

@Component({
  selector: 'app-EnergyAnalytics',
  standalone: true,
  imports: [SideBarComponent, CommonModule],
  templateUrl: './EnergyAnalytics.component.html',
  styleUrls: ['./EnergyAnalytics.component.css']
})
export class EnergyAnalyticsComponent implements OnInit {

  maxConsumption: number = 1;
  

  cards: sEnergyCards[] = [
    { id: 1, title: 'current usage', value: '24 kW', subvalue: '12% vs yesterday', icon: '⚡', type: 'usage' },
    { id: 2, title: "today's cost", value: '18 EGP', subvalue: 'of EGP 450/mo', icon: '💰', type: 'cost' },
    { id: 3, title: 'projected bill', value: '450 EGP', subvalue: '5% vs last month', icon: '📉', type: 'bill' },
    { id: 4, title: 'eco score', value: '82/100', subvalue: 'Excellent', icon: '🏡', type: 'ecoScore' },
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
    this.calculateMax();
  }

  calculateMax() {
    const max = Math.max(...this.powerConsumption.map(p => p.consumption));
    this.maxConsumption = max > 0 ? max : 1;
  }

  getBarHeight(value: number): number {
    return (value / this.maxConsumption) * 100;
  }

  isHighUsage(value: number): boolean {
    return value > (this.maxConsumption * 0.7); 
  }
}