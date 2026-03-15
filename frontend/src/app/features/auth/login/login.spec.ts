import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Login } from './login';
import { AuthService } from '../../../core/services/auth.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería iniciar con el formulario inválido', () => {
    expect(component.form.invalid).toBeTrue();
  });

  it('debería marcar error si username es inválido', () => {
    component.form.setValue({
      username: 'correo-invalido',
      password: '123456',
    });

    expect(component.form.invalid).toBeTrue();
    expect(component.form.get('username')?.invalid).toBeTrue();
  });

  it('debería marcar error si password tiene menos de 6 caracteres', () => {
    component.form.setValue({
      username: 'test@test.com',
      password: '123',
    });

    expect(component.form.invalid).toBeTrue();
    expect(component.form.get('password')?.invalid).toBeTrue();
  });

  it('no debería llamar login si el formulario es inválido', () => {
    component.form.setValue({
      username: '',
      password: '',
    });

    component.onSubmit();

    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  it('debería llamar login y navegar a /events si el formulario es válido', () => {
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    authServiceSpy.login.and.returnValue(
      of({
        id: '1',
        email: 'test@test.com',
        full_name: 'Test User',
        is_active: true,
        role: { id: '1', name: 'admin', description: null },
        created_at: '',
      })
    );

    component.form.setValue({
      username: 'test@test.com',
      password: '123456',
    });

    component.onSubmit();

    expect(component.loading).toBeTrue();
    expect(component.errorMessage).toBe('');
    expect(authServiceSpy.login).toHaveBeenCalledWith({
      username: 'test@test.com',
      password: '123456',
    });
    expect(navigateSpy).toHaveBeenCalledWith(['/events']);
  });

  it('debería mostrar mensaje de error si login falla', () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => ({
        error: { detail: 'Credenciales inválidas' },
      }))
    );

    component.form.setValue({
      username: 'test@test.com',
      password: '123456',
    });

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(component.errorMessage).toBe('Credenciales inválidas');
    expect(component.loading).toBeFalse();
  });

  it('debería mostrar mensaje genérico si login falla sin detail', () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => ({}))
    );

    component.form.setValue({
      username: 'test@test.com',
      password: '123456',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Error al iniciar sesión');
    expect(component.loading).toBeFalse();
  });
});