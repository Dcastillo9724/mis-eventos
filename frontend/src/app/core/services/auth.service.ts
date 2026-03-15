import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, catchError, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, TokenResponse } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  currentUser = signal<User | null>(null);
  loadingUser = signal(false);

  private authVersionInternal = signal(0);
  authVersion = computed(() => this.authVersionInternal());

  isAuthenticated = computed(() => !!this.currentUser());

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/register`, data);
  }

  login(data: LoginRequest): Observable<User> {
    const body = new URLSearchParams();
    body.set('username', data.username);
    body.set('password', data.password);

    return this.http
      .post<TokenResponse>(`${this.apiUrl}/auth/login`, body.toString(), {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('access_token', response.access_token);
          this.bumpAuthVersion();
        }),
        switchMap(() => this.loadMe())
      );
  }

  loadMe(): Observable<User> {
    this.loadingUser.set(true);

    return this.http.get<User>(`${this.apiUrl}/auth/me`).pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.loadingUser.set(false);
        this.bumpAuthVersion();
      }),
      catchError((error) => {
        localStorage.removeItem('access_token');
        this.currentUser.set(null);
        this.loadingUser.set(false);
        this.bumpAuthVersion();
        return throwError(() => error);
      })
    );
  }

  initAuth(): void {
    if (this.getToken()) {
      this.loadMe().subscribe({
        next: () => {},
        error: () => {},
      });
    } else {
      this.currentUser.set(null);
      this.bumpAuthVersion();
    }
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.currentUser.set(null);
    this.bumpAuthVersion();
    window.location.href = '/events';
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.role?.name === role;
  }

  hasAnyRole(...roles: string[]): boolean {
    const role = this.currentUser()?.role?.name;
    return roles.includes(role ?? '');
  }

  canManageEvents(): boolean {
    return this.hasAnyRole('admin', 'organizer');
  }

  canRegisterInEvents(): boolean {
    return this.isAuthenticated() && !this.canManageEvents();
  }

  private bumpAuthVersion(): void {
    this.authVersionInternal.update((value) => value + 1);
  }
}