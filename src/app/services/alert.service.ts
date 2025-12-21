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

  constructor(
    private http: HttpClient,
    private ngZone: NgZone
  ) {
    this.connectToSSE();
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
        const scope = event.data;
        console.log('[AlertService] Motion detected:', scope);
        
        this.motionAlertSubject.next({
          isActive: true,
          scope: scope,
          timestamp: new Date()
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
        const val = Number(event.data);
        console.log('[AlertService] Temperature update:', val);
        // update value but don't set alarm state
        const cur = this.temperatureAlertSubject.getValue();
        this.temperatureAlertSubject.next({
          ...cur,
          temp: isNaN(val) ? null : val
        });
      });
    });

    this.eventSource.addEventListener('tempAlarm', (event: MessageEvent) => {
      this.ngZone.run(() => {
        const val = Number(event.data);
        console.log('[AlertService] Temperature alarm:', val);

        this.temperatureAlertSubject.next({
          isActive: true,
          temp: isNaN(val) ? null : val,
          timestamp: new Date()
        });
      });
    });

    this.eventSource.addEventListener('tempCleared', (event: MessageEvent) => {
      this.ngZone.run(() => {
        console.log('[AlertService] Temperature alarm cleared');
        this.temperatureAlertSubject.next({
          isActive: false,
          temp: null,
          timestamp: null
        });
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
    return this.http.post(`${base}/api/temperature/ack`, { command: 'SAFE' });
  }

  /**
   * Resume temperature monitoring (if applicable)
   */
  resumeTemperature(): Observable<any> {
    const base = environment.baseUrl ?? 'http://localhost:8080';
    console.log('[AlertService] Sending temperature resume...');
    return this.http.post(`${base}/api/temperature/resume`, {});
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