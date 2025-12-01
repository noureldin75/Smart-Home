import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common'; // Added DecimalPipe
import { SideBarComponent } from '../SideBar/SideBar.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { DeviceService, Device } from '../services/device.service'; // Import Service

import {
  ApexChart,
  ApexAxisChartSeries,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexGrid,
  ApexXAxis,
  ApexTooltip,
  ApexFill,
} from 'ng-apexcharts';

interface sEnergyCards {
  id: number;
  title: string;
  value: string;
  subvalue: string;
  icon: string;
  type: 'usage' | 'cost' | 'bill' | 'ecoScore';
}

export interface ActionItem {
  id: number;
  type: 'critical' | 'warning';
  title: string;
  description: string;
  savingsAmount: string;
  actionButtonText: string;
}

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  grid: ApexGrid;
  colors: string[];
  legend: ApexLegend;
  tooltip: ApexTooltip;
  fill: ApexFill;
};

export interface UsageData {
  time: string;
  value: number;
  isPeak: boolean;
}

@Component({
  selector: 'app-EnergyAnalytics',
  standalone: true,
  // Added DecimalPipe to imports for number formatting in HTML
  imports: [SideBarComponent, CommonModule, NgApexchartsModule, DecimalPipe],
  templateUrl: './EnergyAnalytics.component.html',
  styleUrls: ['./EnergyAnalytics.component.css'],
})
export class EnergyAnalyticsComponent implements OnInit {
  @ViewChild('chart') chart: ChartComponent | undefined;

  public chartOptions: Partial<ChartOptions> | any;

  // --- NEW PROPERTIES FOR DEVICES LIST ---
  sortedDevices: Device[] = [];
  totalConsumption: number = 0;
  costRate: number = 120; // Mock rate

  cards: sEnergyCards[] = [
    { id: 1, title: 'current usage', value: '24 kW', subvalue: '12% vs yesterday', icon: '⚡', type: 'usage' },
    { id: 2, title: "today's cost", value: '18 EGP', subvalue: 'of EGP 450/mo', icon: '💰', type: 'cost' },
    { id: 3, title: 'projected bill', value: '450 EGP', subvalue: '5% vs last month', icon: '📉', type: 'bill' },
    { id: 4, title: 'eco score', value: '82/100', subvalue: 'Excellent', icon: '🏡', type: 'ecoScore' },
  ];

  actions: ActionItem[] = [
    { id: 1, type: 'critical', title: 'High AC Usage Detected', description: 'Living Room AC is set to 22°C while outside is 28°C.', savingsAmount: 'AED 50/mo', actionButtonText: 'Optimize' },
    { id: 2, type: 'warning', title: 'Idle Device Detected', description: 'Guest Room lights on for 2h with no motion.', savingsAmount: 'AED 8/mo', actionButtonText: 'Turn Off' },
  ];

  // Inject DeviceService
  constructor(private deviceService: DeviceService) {}

  ngOnInit(): void {
    // 1. Initialize Chart
    const mockData: UsageData[] = [
      { time: '00h', value: 20, isPeak: false },
      { time: '02h', value: 15, isPeak: false },
      { time: '04h', value: 10, isPeak: false },
      { time: '06h', value: 30, isPeak: false },
      { time: '08h', value: 50, isPeak: false },
      { time: '10h', value: 75, isPeak: false },
      { time: '12h', value: 90, isPeak: true },
      { time: '14h', value: 100, isPeak: true },
      { time: '16h', value: 85, isPeak: true },
      { time: '18h', value: 60, isPeak: false },
      { time: '20h', value: 45, isPeak: false },
      { time: '22h', value: 35, isPeak: false },
    ];
    this.initChart(mockData);

    // 2. Fetch Devices for the List
    this.deviceService.getAllDevices().subscribe(data => {
      this.totalConsumption = data.reduce((sum, d) => sum + d.consumption, 0);
      // Sort High to Low and take top 4
      this.sortedDevices = data.sort((a, b) => b.consumption - a.consumption).slice(0, 4);
    });
  }

  // --- HELPER METHODS FOR DEVICES ---
  getPercentage(consumption: number): number {
    if (this.totalConsumption === 0) return 0;
    return (consumption / this.totalConsumption) * 100;
  }

  getCost(consumption: number): number {
    return consumption * this.costRate;
  }

  getDeviceIcon(type: string): string {
    const map: any = { 
      'AC': '❄️', 'LIGHT': '💡', 'TV': '📺', 'FAN': '💨', 
      'FRIDGE': '🧊', 'BLINDS': '🪟', 'AUDIO': '🔊', 
      'COFFEE': '☕', 'WIFI': '📶', 'DISHWASHER': '🧼',
      'MICROWAVE': '♨️', 'OVEN': '🥘'
    };
    return map[type] || '⚡';
  }

  onActionClick(item: ActionItem) {
    console.log('Action clicked for:', item.title);
  }

  private initChart(data: UsageData[]) {
    this.chartOptions = {
      series: [{ name: 'Usage', data: data.map((d) => d.value) }],
      chart: { height: 280, type: 'bar', toolbar: { show: false }, fontFamily: 'Segoe UI, sans-serif' },
      colors: data.map((d) => (d.isPeak ? '#ff007f' : '#00e5ff')),
      plotOptions: { bar: { columnWidth: '45%', distributed: true, borderRadius: 4 } },
      dataLabels: { enabled: false },
      legend: { show: false },
      grid: { show: true, borderColor: 'rgba(255,255,255,0.05)', xaxis: { lines: { show: false } } },
      xaxis: { categories: data.map((d) => d.time), labels: { style: { colors: '#8b92a5', fontSize: '12px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { labels: { style: { colors: '#8b92a5' } } },
      fill: { type: 'gradient', gradient: { shade: 'dark', type: 'vertical', shadeIntensity: 0.5, inverseColors: true, opacityFrom: 1, opacityTo: 0.8, stops: [0, 100] } },
      tooltip: { theme: 'dark' },
    };
  }
}