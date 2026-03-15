import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Register } from './register';
import { AuthService } from '../../../core/services/auth.service';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
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

  it('debería validar que las contraseñas coincidan', () => {
    component.form.patchValue({
      full_name: 'Diego Castillo',
      email: 'diego@test.com',
      password: '123456',
      confirm_password: '654321',
    });

    component.form.updateValueAndValidity();

    expect(component.form.hasError('passwordMismatch')).toBeTrue();
  });

  it('debería retornar false en shouldShowPasswordMismatch si no han tocado los campos', () => {
    component.form.patchValue({
      password: '123456',
      confirm_password: '654321',
    });
    component.form.updateValueAndValidity();

    expect(component.shouldShowPasswordMismatch).toBeFalse();
  });

  it('debería retornar true en shouldShowPasswordMismatch si las contraseñas no coinciden y los campos fueron tocados', () => {
    component.form.patchValue({
      password: '123456',
      confirm_password: '654321',
    });

    component.form.get('password')?.markAsTouched();
    component.form.get('confirm_password')?.markAsTouched();
    component.form.updateValueAndValidity();

    expect(component.shouldShowPasswordMismatch).toBeTrue();
  });

  it('debería construir el resumen de validación correctamente', () => {
    component.form.patchValue({
      full_name: 'Di',
      email: 'correo-invalido',
      password: '123',
      confirm_password: '456',
    });

    component.form.updateValueAndValidity();

    const summary = component.buildValidationSummary();

    expect(summary).toContain('El nombre completo debe tener al menos 3 caracteres.');
    expect(summary).toContain('Debes ingresar un correo electrónico válido.');
    expect(summary).toContain('La contraseña debe tener al menos 6 caracteres.');
    expect(summary).toContain('La confirmación de contraseña debe tener al menos 6 caracteres.');
    expect(summary).toContain('Las contraseñas no coinciden.');
  });

  it('debería mostrar el diálogo de validación si el formulario es inválido', () => {
    component.form.patchValue({
      full_name: '',
      email: '',
      password: '',
      confirm_password: '',
    });

    const result = component.validateAndNotify();

    expect(result).toBeFalse();
    expect(component.showValidationDialog).toBeTrue();
    expect(component.validationSummary.length).toBeGreaterThan(0);
  });

  it('debería cerrar el diálogo de validación', () => {
    component.showValidationDialog = true;

    component.closeValidationDialog();

    expect(component.showValidationDialog).toBeFalse();
  });

  it('no debería enviar el formulario si es inválido', () => {
    spyOn(component, 'validateAndNotify').and.returnValue(false);

    component.onSubmit();

    expect(authServiceSpy.register).not.toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  it('debería enviar el formulario y navegar al login si el registro es exitoso', fakeAsync(() => {
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    authServiceSpy.register.and.returnValue(
      of({
        id: '1',
        email: 'diego@test.com',
        full_name: 'Diego Castillo',
        is_active: true,
        role: { id: '3', name: 'attendee', description: null },
        created_at: '',
      })
    );

    component.form.setValue({
      full_name: 'Diego Castillo',
      email: 'diego@test.com',
      password: '123456',
      confirm_password: '123456',
    });

    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalledWith({
      full_name: 'Diego Castillo',
      email: 'diego@test.com',
      password: '123456',
    });
    expect(component.successMessage).toBe('Registro exitoso, redirigiendo...');
    expect(component.loading).toBeFalse();

    tick(1500);

    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
  }));

  it('debería mostrar mensaje de error si el registro falla', () => {
    authServiceSpy.register.and.returnValue(
      throwError(() => ({
        error: { detail: 'El correo ya está registrado' },
      }))
    );

    component.form.setValue({
      full_name: 'Diego Castillo',
      email: 'diego@test.com',
      password: '123456',
      confirm_password: '123456',
    });

    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalledWith({
      full_name: 'Diego Castillo',
      email: 'diego@test.com',
      password: '123456',
    });
    expect(component.errorMessage).toBe('El correo ya está registrado');
    expect(component.loading).toBeFalse();
  });

  it('debería mostrar mensaje genérico si el registro falla sin detail', () => {
    authServiceSpy.register.and.returnValue(
      throwError(() => ({}))
    );

    component.form.setValue({
      full_name: 'Diego Castillo',
      email: 'diego@test.com',
      password: '123456',
      confirm_password: '123456',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Error al registrarse');
    expect(component.loading).toBeFalse();
  });
});