import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EventRegistration, SessionRegistration } from '../models/attendee.model';

@Injectable({ providedIn: 'root' })
export class AttendeeService {
  private readonly apiUrl = `${environment.apiUrl}/attendees`;

  constructor(private http: HttpClient) {}

  registerToEvent(eventId: string): Observable<EventRegistration> {
    return this.http.post<EventRegistration>(`${this.apiUrl}/events`, { event_id: eventId });
  }

  cancelEventRegistration(eventId: string): Observable<EventRegistration> {
    return this.http.delete<EventRegistration>(`${this.apiUrl}/events/${eventId}`);
  }

  getMyEventRegistrations(): Observable<EventRegistration[]> {
    return this.http.get<EventRegistration[]>(`${this.apiUrl}/events/me`);
  }

  registerToSession(sessionId: string): Observable<SessionRegistration> {
    return this.http.post<SessionRegistration>(`${this.apiUrl}/sessions`, { session_id: sessionId });
  }

  cancelSessionRegistration(sessionId: string): Observable<SessionRegistration> {
    return this.http.delete<SessionRegistration>(`${this.apiUrl}/sessions/${sessionId}`);
  }

  getMySessionRegistrations(): Observable<SessionRegistration[]> {
    return this.http.get<SessionRegistration[]>(`${this.apiUrl}/sessions/me`);
  }
}