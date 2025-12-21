import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WelcomeComponent } from './welcome/welcome.component';
import { HomepageComponent } from './homepage/homepage.component';
import { SideBarComponent } from './SideBar/SideBar.component';
import { DeviceService } from './services/device.service';
import { AlertService, MotionAlert } from './services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, WelcomeComponent, HomepageComponent, SideBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'resinex';
  showWelcome = true;

  // Motion Alert Properties (global for all pages)
  motionAlertActive = false;
  motionAlertScope = '';
  motionAlertTimestamp: Date | null = null;
  motionSensorEnabled = true;

  private alertSubscription?: Subscription;
  private motionSensorSubscription?: Subscription;

  constructor(
    private router: Router,
    private deviceService: DeviceService,
    private alertService: AlertService
  ) { }

  onWelcomeComplete() {
    this.showWelcome = false;
    this.router.navigate(['/Home']);
  }

  ngOnInit() {
    this.deviceService.syncAllRoomsToHardware();

    // Subscribe to SSE motion alerts (global for all pages)
    this.alertSubscription = this.alertService.motionAlert$.subscribe(
      (alert: MotionAlert) => {
        // Only process alert if motion sensor is enabled
        if (this.motionSensorEnabled) {
          this.motionAlertActive = alert.isActive;
          this.motionAlertScope = alert.scope;
          this.motionAlertTimestamp = alert.timestamp;
        }
      }
    );

    // Subscribe to DeviceService motion sensor state
    this.motionSensorSubscription = this.deviceService.motionSensorEnabled$.subscribe(
      (enabled) => {
        this.motionSensorEnabled = enabled;
        // If sensor is disabled and alert is active, clear the local state
        if (!enabled && this.motionAlertActive) {
          this.motionAlertActive = false;
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.alertSubscription) {
      this.alertSubscription.unsubscribe();
    }
    if (this.motionSensorSubscription) {
      this.motionSensorSubscription.unsubscribe();
    }
  }

  /**
   * Stop the alarm by sending acknowledgment to backend
   */
  stopAlarm() {
    if (!this.motionAlertActive) {
      return;
    }

    this.alertService.acknowledgeAlarm().subscribe({
      next: () => {
        console.log('[AppComponent] Alarm acknowledged successfully');
        this.motionAlertActive = false;
        this.motionAlertScope = '';
        this.motionAlertTimestamp = null;
      },
      error: (err) => {
        console.error('[AppComponent] Failed to acknowledge alarm:', err);
      }
    });
  }
}

