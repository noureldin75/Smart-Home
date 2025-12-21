import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WelcomeComponent } from './welcome/welcome.component';
import { HomepageComponent } from './homepage/homepage.component';
import { SideBarComponent } from './SideBar/SideBar.component';
import { DeviceService } from './services/device.service';
import { AlertService, MotionAlert } from './services/alert.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

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

  // Temperature alert properties (separate)
  tempAlertActive = false;
  tempValue: number | null = null;
  tempAlertTimestamp: Date | null = null;

  private alertSubscription?: Subscription;
  private tempSubscription?: Subscription;
  private motionSensorSubscription?: Subscription;
  private routerSubscription?: Subscription;
  private lastTempAlertTimestamp: string | null = null;
  private tempSuppressedUntil: number | null = null;
  private tempResumeTimeoutId?: any;

  private handleIncomingTempAlert(alert: { isActive: boolean; temp: number | null; timestamp: Date | null; }) {
    // If suppressed, do not show popup
    if (this.tempSuppressedUntil && Date.now() < this.tempSuppressedUntil) {
      console.log('[AppComponent] Temp alert suppressed until', new Date(this.tempSuppressedUntil).toLocaleTimeString());
      return;
    }

    // show immediately
    this.showTempAlarmIfNeeded();
  }

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

      // Subscribe to temperature alerts (separate from motion)
    this.tempSubscription = this.alertService.temperatureAlert$.subscribe(alert => {
      this.tempAlertActive = alert.isActive;
      this.tempValue = alert.temp;
      this.tempAlertTimestamp = alert.timestamp;

      // immediately attempt to show popup when a temp alarm arrives (unless suppressed)
      if (alert.isActive) {
        this.handleIncomingTempAlert(alert);
      }
    });

    // Show alarm when user navigates to any panel if an active TEMP alert exists
    this.routerSubscription = this.router.events.subscribe(event => {
      // Use NavigationEnd to ensure route is stable
      if ((event as any).constructor && (event as any).constructor.name === 'NavigationEnd') {
        this.showTempAlarmIfNeeded();
      }
    });
  }

  ngOnDestroy() {
    if (this.alertSubscription) {
      this.alertSubscription.unsubscribe();
    }
    if (this.tempSubscription) {
      this.tempSubscription.unsubscribe();
    }
    if (this.motionSensorSubscription) {
      this.motionSensorSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private showTempAlarmIfNeeded() {
    // Do not show if suppressed
    if (this.tempSuppressedUntil && Date.now() < this.tempSuppressedUntil) {
      return;
    }

    if (!this.tempAlertActive || !this.tempAlertTimestamp) {
      return;
    }

    const stamp = this.tempAlertTimestamp.toISOString();
    if (this.lastTempAlertTimestamp === stamp) {
      // already shown this temp alert
      return;
    }

    this.lastTempAlertTimestamp = stamp;
    this.showTempAlarmPopup();
  }

  private async showTempAlarmPopup() {
    // Play a short beep (best-effort, may be blocked by browser autoplay policies)
    try {
      const ctx = new (window as any).AudioContext();
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = 900;
      o.connect(ctx.destination);
      o.start();
      setTimeout(() => o.stop(), 800);
    } catch (e) {
      // ignore audio errors
      console.warn('[AppComponent] audio playback failed', e);
    }

    await Swal.fire({
      title: '🔥 Temperature Alarm!',
      html: `<div><strong>Temperature:</strong> ${this.tempValue ?? 'Unknown'}°</div>
             <div style="margin-top:8px"><strong>Time:</strong> ${this.tempAlertTimestamp?.toLocaleString() || ''}</div>
             <div style="margin-top:12px;color:#c00">Click <strong>Stop Alarm</strong> To stop house alarming</div>`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Stop Alarm',
      cancelButtonText: 'Dismiss',
      allowOutsideClick: false,
      customClass: {
        popup: 'alarm-popup'
      }
    }).then(result => {
      if (result.isConfirmed) {
        // Inform the user the alarm will be silenced for 5 seconds
        Swal.fire({
          title: 'Paused',
          html: 'Alarm silenced for 5 seconds',
          icon: 'info',
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });

        // Acknowledge temperature alarm (send SAFE) immediately
        this.alertService.acknowledgeTemperature().subscribe({
          next: () => {
            console.log('[AppComponent] Temperature SAFE sent');
            // hide UI alarm immediately and suppress further popups for 5 seconds
            this.tempAlertActive = false;
            this.tempValue = null;
            this.tempAlertTimestamp = null;

            // set suppression for 5 seconds to avoid repeated popups
            const ms = 5000;
            this.tempSuppressedUntil = Date.now() + ms;

            // clear any existing timeout
            if (this.tempResumeTimeoutId) {
              clearTimeout(this.tempResumeTimeoutId);
            }

            this.tempResumeTimeoutId = setTimeout(() => {
              // clear suppression
              this.tempSuppressedUntil = null;
              this.tempResumeTimeoutId = undefined;

              // Tell backend to resume temperature alarms
              this.alertService.resumeTemperature().subscribe({
                next: () => {
                  console.log('[AppComponent] Temperature resume requested');
                  // notify user that monitoring resumed
                  Swal.fire({
                    title: 'Resumed',
                    html: 'Temperature monitoring resumed',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                  });
                },
                error: (err) => console.error('[AppComponent] Failed to request resume:', err)
              });
            }, ms);
          },
          error: (err) => console.error('[AppComponent] Failed to send SAFE:', err)
        });
      }
    });
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

