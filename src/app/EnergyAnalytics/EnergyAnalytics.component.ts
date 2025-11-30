import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideBarComponent } from '../SideBar/SideBar.component';
import { NgApexchartsModule } from "ng-apexcharts";

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
  ApexFill
} from "ng-apexcharts";

interface sEnergyCards {
  id: number;
  title: string;
  value: string;
  subvalue: string;
  icon: string;
  type: 'usage' | 'cost' | 'bill' | 'ecoScore';
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
  imports: [SideBarComponent, CommonModule, NgApexchartsModule],
  templateUrl: './EnergyAnalytics.component.html',
  styleUrls: ['./EnergyAnalytics.component.css']
})


export class EnergyAnalyticsComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent | undefined;
  
  // نستخدم Partial لأننا سنملؤها في ngOnInit
  public chartOptions: Partial<ChartOptions> | any;
  

  cards: sEnergyCards[] = [
    { id: 1, title: 'current usage', value: '24 kW', subvalue: '12% vs yesterday', icon: '⚡', type: 'usage' },
    { id: 2, title: "today's cost", value: '18 EGP', subvalue: 'of EGP 450/mo', icon: '💰', type: 'cost' },
    { id: 3, title: 'projected bill', value: '450 EGP', subvalue: '5% vs last month', icon: '📉', type: 'bill' },
    { id: 4, title: 'eco score', value: '82/100', subvalue: 'Excellent', icon: '🏡', type: 'ecoScore' },
  ];

  ngOnInit(): void {
    // محاكاة البيانات القادمة (ساعات + استهلاك + حالة الذروة)
    const mockData: UsageData[] = [
      { time: '00h', value: 20, isPeak: false },
      { time: '02h', value: 15, isPeak: false },
      { time: '04h', value: 10, isPeak: false },
      { time: '06h', value: 30, isPeak: false },
      { time: '08h', value: 50, isPeak: false },
      { time: '10h', value: 75, isPeak: false },
      { time: '12h', value: 90, isPeak: true },  // Peak
      { time: '14h', value: 100, isPeak: true }, // Peak
      { time: '16h', value: 85, isPeak: true },  // Peak
      { time: '18h', value: 60, isPeak: false },
      { time: '20h', value: 45, isPeak: false },
      { time: '22h', value: 35, isPeak: false },
    ];

    // تهيئة الشارت بناءً على البيانات
    this.initChart(mockData);
  }

   private initChart(data: UsageData[]) {
    this.chartOptions = {
      series: [{
        name: "Usage",
        data: data.map(d => d.value)
      }],
      chart: {
        height: 280,
        type: "bar",
        toolbar: { show: false },
        fontFamily: 'Segoe UI, sans-serif'
      },
      // Logic الألوان: وردي للذروة، أزرق للعادي
      colors: data.map(d => d.isPeak ? '#ff007f' : '#00e5ff'),
      
      plotOptions: {
        bar: {
          columnWidth: "45%",
          distributed: true, // ضروري لتلوين كل عمود بلون مختلف
          borderRadius: 4
        }
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      grid: {
        show: true,
        borderColor: 'rgba(255,255,255,0.05)',
        xaxis: { lines: { show: false } }
      },
      xaxis: {
        categories: data.map(d => d.time),
        labels: {
          style: { colors: '#8b92a5', fontSize: "12px" }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: { style: { colors: '#8b92a5' } }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          type: "vertical",
          shadeIntensity: 0.5,
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 0.8,
          stops: [0, 100]
        }
      },
      tooltip: { theme: 'dark' }
    };
  }
}