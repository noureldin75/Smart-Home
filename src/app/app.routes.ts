import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { EnergyAnalyticsComponent } from './EnergyAnalytics/EnergyAnalytics.component';
import { HomePartsComponent } from './HomeParts/HomeParts.component';
import { SecurityComponent } from './Security/Security.component';

export const routes: Routes = [
    { path:'Home', component: HomepageComponent },
    {path:'EnergyAnalytics',component:EnergyAnalyticsComponent},
    {path:'HomeParts',component:HomePartsComponent},
    {path:'Security',component:SecurityComponent},
];