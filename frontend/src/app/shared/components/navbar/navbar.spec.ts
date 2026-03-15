import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Navbar } from './navbar';
import { AuthService } from '../../../core/services/auth.service';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  let isAuthenticatedSignal = signal(false);
  let currentUserSignal = signal<any>(null);

  const authServiceMock = {
    currentUser: currentUserSignal,
    loadingUser: signal(false),
    authVersion: signal(0),
    isAuthenticated: jasmine.createSpy('isAuthenticated').and.callFake(() => isAuthenticatedSignal()),
    logout: jasmine.createSpy('logout'),
    hasRole: jasmine.createSpy('hasRole').and.callFake((role: string) => role === 'admin' ? false : false),
    hasAnyRole: jasmine.createSpy('hasAnyRole').and.returnValue(false),
    canManageEvents: jasmine.createSpy('canManageEvents').and.returnValue(false),
    canRegisterInEvents: jasmine.createSpy('canRegisterInEvents').and.returnValue(false),
    getToken: jasmine.createSpy('getToken').and.returnValue(null),
    initAuth: jasmine.createSpy('initAuth'),
    loadMe: jasmine.createSpy('loadMe'),
  };

  beforeEach(async () => {
    isAuthenticatedSignal = signal(false);
    currentUserSignal = signal(null);

    authServiceMock.currentUser = currentUserSignal;
    authServiceMock.isAuthenticated.and.callFake(() => isAuthenticatedSignal());
    authServiceMock.hasRole.and.callFake(() => false);
    authServiceMock.logout.calls.reset();

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería abrir y cerrar el menú con toggleMenu', () => {
    expect(component.menuOpen).toBeFalse();

    component.toggleMenu();
    expect(component.menuOpen).toBeTrue();

    component.toggleMenu();
    expect(component.menuOpen).toBeFalse();
  });

  it('debería cerrar el menú con closeMenu', () => {
    component.menuOpen = true;

    component.closeMenu();

    expect(component.menuOpen).toBeFalse();
  });

  it('debería mostrar Ingresar y Registrarse si no está autenticado', () => {
    isAuthenticatedSignal.set(false);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Ingresar');
    expect(text).toContain('Registrarse');
    expect(text).not.toContain('Mi Perfil');
  });

  it('debería mostrar Mi Perfil y el nombre del usuario si está autenticado', () => {
    isAuthenticatedSignal.set(true);
    currentUserSignal.set({
      id: '1',
      full_name: 'Test User',
      email: 'test@test.com',
      role: { id: '1', name: 'attendee', description: null },
      is_active: true,
      created_at: '',
    });

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Mi Perfil');
    expect(text).toContain('Test User');
  });

  it('debería mostrar enlace de Usuarios si el usuario es admin', () => {
    isAuthenticatedSignal.set(true);
    authServiceMock.hasRole.and.callFake((role: string) => role === 'admin');

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Usuarios');
  });

  it('no debería mostrar enlace de Usuarios si el usuario no es admin', () => {
    isAuthenticatedSignal.set(true);
    authServiceMock.hasRole.and.callFake(() => false);

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;

    expect(text).not.toContain('Usuarios');
  });

  it('debería llamar logout al hacer click en salir', () => {
    isAuthenticatedSignal.set(true);
    currentUserSignal.set({
      id: '1',
      full_name: 'Test User',
      email: 'test@test.com',
      role: { id: '1', name: 'admin', description: null },
      is_active: true,
      created_at: '',
    });

    fixture.detectChanges();

    const logoutButtons = fixture.debugElement.queryAll(By.css('.btn-logout'));
    expect(logoutButtons.length).toBeGreaterThan(0);

    logoutButtons[0].nativeElement.click();
    fixture.detectChanges();

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(component.menuOpen).toBeFalse();
  });
});