import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import {environment} from "../../environment/environment";

@Injectable({
  providedIn: 'root'
})
export class APILightServiceService {

  constructor(
    private http: HttpClient
  ) { }

  sendLightLevel(roomName: string, intensity: number): Observable<any> {
    const body = {
      room: roomName,
      intensity: intensity
    };
    return this.http.post(`${environment.baseUrl}/lights/control`, body);
  }


}
