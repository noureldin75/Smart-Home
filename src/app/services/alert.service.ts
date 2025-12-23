import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environment/environment';

export interface MotionAlert {
  isActive: boolean;
  scope: string;
  timestamp: Date | null;
}

export interface TemperatureAlert {
  isActive: boolean;
  temp: number | null;
  timestamp: Date | null;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService implements OnDestroy {

  private eventSource: EventSource | null = null;

  // Motion alert state - using BehaviorSubject for reactive updates
  private motionAlertSubject = new BehaviorSubject<MotionAlert>({
    isActive: false,
    scope: '',
    timestamp: null
  });

  // Observable for components to subscribe to
  public motionAlert$: Observable<MotionAlert> = this.motionAlertSubject.asObservable();

  // Temperature-specific alert state (separate from motion)
  private temperatureAlertSubject = new BehaviorSubject<TemperatureAlert>({
    isActive: false,
    temp: null,
    timestamp: null
  });

  public temperatureAlert$: Observable<TemperatureAlert> = this.temperatureAlertSubject.asObservable();

  // Connection status
  private connectionStatusSubject = new BehaviorSubject<'connected' | 'disconnected' | 'connecting'>('disconnected');
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  // Temperature suppression state: when true, ignore further temp alarms until backend RESUME/clear
  private tempSuppressedSubject = new BehaviorSubject<boolean>(false);
  public tempSuppressed$ = this.tempSuppressedSubject.asObservable();

  // Track last acknowledged alarm timestamp (ms since epoch). When set, ignore alarms with timestamp <= this value.
  private lastAckTimestamp: number | null = null;

  // Convenience getter
  public isTempSuppressed(): boolean {
    return this.tempSuppressedSubject.getValue();
  }

  constructor(
    private http: HttpClient,
    private ngZone: NgZone
  ) {
    // Expose service for quick manual testing in dev console: window.alertService.forceTemperatureAlarm(36)
    try { (window as any).alertService = this; } catch {}

    this.connectToSSE();
  }

  /**
   * Dev helper: force a temperature alarm (useful for debugging)
   */
  forceTemperatureAlarm(temp: number) {
    console.log('[AlertService] forceTemperatureAlarm called:', temp);
    this.temperatureAlertSubject.next({
      isActive: true,
      temp: temp,
      timestamp: new Date()
    });
  }

  /**
   * Helper used to extract numeric temperature from raw SSE payloads.
   * Supports JSON with keys (temp, temperature, value) or plain strings containing a number.
   */
  private parseTemperature(raw: any): number | null {
    if (raw === null || raw === undefined) return null;

    // If it's already a number
    if (typeof raw === 'number') return raw;

    // If EventSource wraps as string, trim whitespace
    const s = String(raw).trim();
    if (!s) return null;

    // Try JSON parse
    try {
      const data = JSON.parse(s);
      if (data && typeof data === 'object') {
        if (typeof data.temp === 'number') return data.temp;
        if (typeof data.temperature === 'number') return data.temperature;
        if (typeof data.value === 'number') return data.value;
      }
    } catch (e) {
      // ignore JSON parse errors
    }

    // Fallback: extract first number sequence (integers or floats)
    const m = s.match(/-?\d+(?:\.\d+)?/);
    if (m) {
      const n = Number(m[0]);
      return isNaN(n) ? null : n;
    }

    return null;
  }

  /**
   * Connect to the SSE stream from the backend
   */
  connectToSSE(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.connectionStatusSubject.next('connecting');
    console.log('[AlertService] Connecting to SSE stream...');

    // Create EventSource connection (explicit fallback to localhost:8080)
    const base = environment.baseUrl ?? 'http://localhost:8080';
    this.eventSource = new EventSource(`${base}/api/alerts/stream`);

    // Handle successful connection
    this.eventSource.onopen = () => {
      this.ngZone.run(() => {
        this.connectionStatusSubject.next('connected');
        console.log('[AlertService] SSE connection established');
      });
    };

    // Handle 'motion' events from the backend
    this.eventSource.addEventListener('motion', (event: MessageEvent) => {
      this.ngZone.run(() => {
        let scope = '';
        let isActive = true;
        let timestamp = new Date();

        // Try to parse as JSON (new format with isActive field)
        try {
          const data = JSON.parse(event.data);
          if (typeof data === 'object' && data !== null) {
            scope = data.scope || '';
            isActive = data.isActive !== undefined ? data.isActive : true;
            if (data.timestamp) {
              timestamp = new Date(data.timestamp);
            }
          } else {
            // Fallback: treat as plain string (old format)
            scope = event.data;
          }
        } catch {
          // Not JSON, treat as plain string scope
          scope = event.data;
        }

        console.log('[AlertService] Motion detected:', scope, 'isActive:', isActive);

        this.motionAlertSubject.next({
          isActive: isActive,
          scope: scope,
          timestamp: timestamp
        });
      });
    });

    // Handle 'alarmCleared' events from the backend
    this.eventSource.addEventListener('alarmCleared', (event: MessageEvent) => {
      this.ngZone.run(() => {
        const scope = event.data;
        console.log('[AlertService] Alarm cleared from server:', scope);

        // This confirms the clear from server side
        this.motionAlertSubject.next({
          isActive: false,
          scope: '',
          timestamp: null
        });
      });
    });

    // Handle 'temperature' (value updates), 'tempAlarm', and 'tempCleared' events separately
    this.eventSource.addEventListener('temperature', (event: MessageEvent) => {
      this.ngZone.run(() => {
        // Log raw payload for debugging
        console.log('[AlertService] raw temperature event.data:', event.data);

        // Parse incoming temperature robustly
        const val = this.parseTemperature(event.data);
        console.log('[AlertService] Temperature update (parsed):', val);

        // If above threshold, promote to an active temperature alarm only when allowed
        if (val !== null && val > environment.tempAlarmThreshold) {
          const suppressed = this.tempSuppressedSubject.getValue();
          const cur = this.temperatureAlertSubject.getValue();
          const incomingTs = new Date();

          // If acked previously, ignore alarms with timestamp <= lastAckTimestamp
          if (this.lastAckTimestamp && incomingTs.getTime() <= this.lastAckTimestamp) {
            console.log('[AlertService] Temperature update exceeded threshold but ignored because older-or-equal to last acknowledged alarm');
            this.temperatureAlertSubject.next({ ...cur, temp: val });
          } else if (suppressed) {
            console.log('[AlertService] Temperature threshold exceeded but ignored due to service suppression');
            // update value only
            this.temperatureAlertSubject.next({ ...cur, temp: val });
          } else if (cur.isActive) {
            console.log('[AlertService] Temperature threshold exceeded but an alarm is already active; ignoring');
            // update value only
            this.temperatureAlertSubject.next({ ...cur, temp: val });
          } else {
            console.log('[AlertService] Temperature threshold exceeded -> raising alarm');
            this.temperatureAlertSubject.next({
              isActive: true,
              temp: val,
              timestamp: incomingTs
            });
          }
        } else {
          // update value but do not change alarm state
          const cur = this.temperatureAlertSubject.getValue();
          this.temperatureAlertSubject.next({
            ...cur,
            temp: val
          });
        }
      });
    });

    this.eventSource.addEventListener('tempAlarm', (event: MessageEvent) => {
      this.ngZone.run(() => {
        console.log('[AlertService] raw tempAlarm event.data:', event.data);

        // Use the same robust parsing helper
        const val = this.parseTemperature(event.data);
        console.log('[AlertService] Temperature alarm (parsed):', val);

        // If temperature doesn't exceed the threshold, don't raise active alarm — just update value
        if (val === null || val <= environment.tempAlarmThreshold) {
          console.log('[AlertService] tempAlarm ignored because value does not exceed threshold');
          const cur = this.temperatureAlertSubject.getValue();
          this.temperatureAlertSubject.next({ ...cur, temp: val });
          return;
        }

        // If already suppressed or an active alarm exists, ignore repeated alarms
        const suppressed = this.tempSuppressedSubject.getValue();
        const cur = this.temperatureAlertSubject.getValue();
        const incomingTs = new Date();

        // If acked previously, ignore alarms with timestamp <= lastAckTimestamp
        if (this.lastAckTimestamp && incomingTs.getTime() <= this.lastAckTimestamp) {
          console.log('[AlertService] tempAlarm ignored because it is older-or-equal to last acknowledged alarm');
          this.temperatureAlertSubject.next({ ...cur, temp: val });
          return;
        }

        if (suppressed) {
          console.log('[AlertService] tempAlarm ignored because suppressed locally');
          // update temperature value silently (do not re-trigger alarm)
          this.temperatureAlertSubject.next({ ...cur, temp: val });
          return;
        }

        if (cur.isActive) {
          console.log('[AlertService] tempAlarm ignored because an alarm is already active');
          // update temperature value silently
          this.temperatureAlertSubject.next({ ...cur, temp: val });
          return;
        }

        // Otherwise, emit a new active temperature alarm with the current timestamp
        this.temperatureAlertSubject.next({
          isActive: true,
          temp: val,
          timestamp: incomingTs
        });
      });
    });

    this.eventSource.addEventListener('tempCleared', (event: MessageEvent) => {
      this.ngZone.run(() => {
        console.log('[AlertService] Temperature alarm cleared');
        // Clear active alarm and lift suppression
        this.temperatureAlertSubject.next({
          isActive: false,
          temp: null,
          timestamp: null
        });
        this.tempSuppressedSubject.next(false);
      });
    });

    // Optional backend 'tempResume' event - treat as a resume signal and lift suppression
    this.eventSource.addEventListener('tempResume', (event: MessageEvent) => {
      this.ngZone.run(() => {
        console.log('[AlertService] tempResume received from backend');
        this.tempSuppressedSubject.next(false);
      });
    });

    // Handle errors
    this.eventSource.onerror = (error) => {
      this.ngZone.run(() => {
        console.error('[AlertService] SSE connection error:', error);
        this.connectionStatusSubject.next('disconnected');

        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          console.log('[AlertService] Attempting to reconnect...');
          this.connectToSSE();
        }, 5000);
      });
    };
  }


  acknowledgeAlarm(): Observable<any> {
    console.log('[AlertService] Sending alarm acknowledgment...');

    return this.http.post(`${environment.baseUrl}/api/ack`, {}).pipe(
      tap(() => {
        console.log('✅ Acknowledgment success: Updating local state immediately');

        this.motionAlertSubject.next({
          isActive: false,
          scope: '',
          timestamp: null
        });
      })
    );
  }

  /**
   * Acknowledge a temperature alarm by sending the 'SAFE' command to backend
   * This is used to stop Arduino alarming logic.
   */
  acknowledgeTemperature(): Observable<any> {
    const base = environment.baseUrl ?? 'http://localhost:8080';
    console.log('[AlertService] Sending temperature SAFE ack...');

    // Locally suppress further temp alarms until backend sends resume/clear
    this.tempSuppressedSubject.next(true);

    // Record the timestamp of the current alarm so we ignore duplicate/old alarms
    const cur = this.temperatureAlertSubject.getValue();
    this.lastAckTimestamp = cur.timestamp ? cur.timestamp.getTime() : Date.now();

    // Backend expects a POST to /temperature/ack; send empty body to match handler
    return this.http.post(`${base}/api/temperature/ack`, {});
  }

  /**
   * Resume temperature monitoring (if applicable)
   */
  resumeTemperature(): Observable<any> {
    const base = environment.baseUrl ?? 'http://localhost:8080';
    console.log('[AlertService] Sending temperature resume...');
    return this.http.post(`${base}/api/temperature/resume`, {}).pipe(
      tap(() => {
        console.log('[AlertService] Resume request accepted — lifting local suppression');
        this.tempSuppressedSubject.next(false);
      })
    );
  }

  /**
   * Get current motion alert state (non-reactive)
   */
  getCurrentAlertState(): MotionAlert {
    return this.motionAlertSubject.getValue();
  }


  clearLocalAlert(): void {
    this.motionAlertSubject.next({
      isActive: false,
      scope: '',
      timestamp: null
    });
  }

  /**
   * Disconnect from SSE stream
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.connectionStatusSubject.next('disconnected');
      console.log('[AlertService] SSE connection closed');
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}