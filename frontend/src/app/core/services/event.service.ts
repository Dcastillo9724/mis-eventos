import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Event, EventCreate, EventUpdate, EventsByStatus } from '../models/event.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  getEvents(page = 1, pageSize = 10, title?: string): Observable<PaginatedResponse<Event>> {
    let params = new HttpParams()
      .set('page', page)
      .set('page_size', pageSize);
    if (title) params = params.set('title', title);
    return this.http.get<PaginatedResponse<Event>>(this.apiUrl + '/', { params });
  }

  getEvent(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  createEvent(data: EventCreate): Observable<Event> {
    return this.http.post<Event>(this.apiUrl + '/', data);
  }

  updateEvent(id: string, data: EventUpdate): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}`, data);
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  cancelEvent(id: string): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}/cancel`, {});
  }

  getEventsGrouped(): Observable<EventsByStatus> {
    return this.http.get<EventsByStatus>(`${this.apiUrl}/grouped`);
  }
}