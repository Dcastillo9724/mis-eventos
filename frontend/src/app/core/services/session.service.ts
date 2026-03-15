import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResponse } from '../models/pagination.model';
import { Session, SessionCreate, SessionUpdate } from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly apiUrl = `${environment.apiUrl}/sessions`;

  constructor(private http: HttpClient) {}

  getSessionsByEvent(eventId: string, page = 1, pageSize = 10): Observable<PaginatedResponse<Session>> {
    return this.http.get<PaginatedResponse<Session>>(`${this.apiUrl}/event/${eventId}`, {
      params: { page, page_size: pageSize },
    });
  }

  getSession(id: string): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/${id}`);
  }

  createSession(data: SessionCreate): Observable<Session> {
    return this.http.post<Session>(this.apiUrl + '/', data);
  }

  updateSession(id: string, data: SessionUpdate): Observable<Session> {
    return this.http.patch<Session>(`${this.apiUrl}/${id}`, data);
  }

  deleteSession(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}