import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environment/environment';

export interface MotionAlert {
  isActive: boolean;
  scope: string;
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

    // Create EventSource connection
    this.eventSource = new EventSource(`${environment.baseUrl}/api/alerts/stream`);

    // Handle successful connection
    this.eventSource.onopen = () => {
      // Run inside NgZone to trigger Angular change detection
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
        console.log('[AlertService] Alarm cleared:', scope);
        
        this.motionAlertSubject.next({
          isActive: false,
          scope: '',
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

  /**
   * Send acknowledgment to stop the alarm
   */
  acknowledgeAlarm(): Observable<any> {
    console.log('[AlertService] Sending alarm acknowledgment...');
    return this.http.post(`${environment.baseUrl}/api/ack`, {});
  }

  /**
   * Get current motion alert state (non-reactive)
   */
  getCurrentAlertState(): MotionAlert {
    return this.motionAlertSubject.getValue();
  }

  /**
   * Manually clear the local alert state (UI only)
   */
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
