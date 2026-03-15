import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockUser = {
    id: '1',
    email: 'test@test.com',
    full_name: 'Test User',
    is_active: true,
    role: { id: '1', name: 'admin', description: null },
    created_at: '',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería retornar null si no hay token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('debería estar no autenticado por defecto', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('debería hacer login guardar token y retornar usuario', () => {
    service.login({ username: 'test@test.com', password: '123456' }).subscribe(user => {
      expect(user.email).toBe('test@test.com');
      expect(service.getToken()).toBe('fake-token');
      expect(service.isAuthenticated()).toBeTrue();
    });

    const loginReq = httpMock.expectOne('http://localhost:8000/api/auth/login');
    expect(loginReq.request.method).toBe('POST');
    loginReq.flush({ access_token: 'fake-token', token_type: 'bearer' });

    const meReq = httpMock.expectOne('http://localhost:8000/api/auth/me');
    expect(meReq.request.method).toBe('GET');
    meReq.flush(mockUser);
  });

  it('debería hacer logout y limpiar el usuario', async () => {
    service.currentUser.set(mockUser);
    localStorage.setItem('access_token', 'fake-token');

    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/events']);
  });

  it('debería retornar true para hasRole con rol correcto', () => {
    service.currentUser.set(mockUser);
    expect(service.hasRole('admin')).toBeTrue();
    expect(service.hasRole('attendee')).toBeFalse();
  });

  it('debería retornar true para hasAnyRole con al menos un rol válido', () => {
    service.currentUser.set({ ...mockUser, role: { id: '2', name: 'organizer', description: null } });
    expect(service.hasAnyRole('admin', 'organizer')).toBeTrue();
    expect(service.hasAnyRole('admin')).toBeFalse();
  });

  it('debería retornar true para canManageEvents si es admin', () => {
    service.currentUser.set(mockUser);
    expect(service.canManageEvents()).toBeTrue();
  });

  it('debería retornar false para canRegisterInEvents si es admin', () => {
    service.currentUser.set(mockUser);
    expect(service.canRegisterInEvents()).toBeFalse();
  });

  it('debería retornar true para canRegisterInEvents si es attendee', () => {
    service.currentUser.set({ ...mockUser, role: { id: '3', name: 'attendee', description: null } });
    expect(service.canRegisterInEvents()).toBeTrue();
  });

  it('debería limpiar usuario si loadMe falla', () => {
    localStorage.setItem('access_token', 'fake-token');

    service.loadMe().subscribe({
      error: () => {
        expect(service.currentUser()).toBeNull();
        expect(service.getToken()).toBeNull();
      },
    });

    const req = httpMock.expectOne('http://localhost:8000/api/auth/me');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });
});