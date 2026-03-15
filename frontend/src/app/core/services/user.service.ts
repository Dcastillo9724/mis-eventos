import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserCreateByAdmin, UserUpdate } from '../models/user.model';
import { Role } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/users`;
  private readonly rolesUrl = `${environment.apiUrl}/roles`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl + '/');
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(data: UserCreateByAdmin): Observable<User> {
    return this.http.post<User>(this.apiUrl + '/', data);
  }

  updateUser(id: string, data: UserUpdate): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, data);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.rolesUrl + '/');
  }
}