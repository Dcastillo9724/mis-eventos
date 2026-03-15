import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    DialogModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  form: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  showValidationDialog = false;
  validationDialogTitle = 'Revisa la información del formulario';
  validationDialogMessage =
    'Encontramos algunos datos pendientes o inconsistentes. Corrígelos para poder continuar.';
  validationSummary: string[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group(
      {
        full_name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirm_password: ['', [Validators.required, Validators.minLength(6)]],
      },
      { validators: this.passwordsMatchValidator() }
    );
  }

  passwordsMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirmPassword = control.get('confirm_password')?.value;

      if (!password || !confirmPassword) {
        return null;
      }

      return password === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  get shouldShowPasswordMismatch(): boolean {
    const passwordTouched = this.form.get('password')?.touched;
    const confirmTouched = this.form.get('confirm_password')?.touched;
    return !!this.form.hasError('passwordMismatch') && !!(passwordTouched || confirmTouched);
  }

  onSubmit(): void {
    if (!this.validateAndNotify()) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { confirm_password, ...payload } = this.form.value;

    this.authService.register(payload).subscribe({
      next: () => {
        this.successMessage = 'Registro exitoso, redirigiendo...';
        this.loading = false;
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Error al registrarse';
        this.loading = false;
      },
    });
  }

  validateAndNotify(): boolean {
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();

    if (this.form.valid) {
      return true;
    }

    this.validationSummary = this.buildValidationSummary();
    this.showValidationDialog = true;
    return false;
  }

  buildValidationSummary(): string[] {
    const errors: string[] = [];

    if (this.form.get('full_name')?.hasError('required')) {
      errors.push('Debes ingresar tu nombre completo.');
    } else if (this.form.get('full_name')?.hasError('minlength')) {
      errors.push('El nombre completo debe tener al menos 3 caracteres.');
    }

    if (this.form.get('email')?.hasError('required')) {
      errors.push('Debes ingresar tu correo electrónico.');
    } else if (this.form.get('email')?.hasError('email')) {
      errors.push('Debes ingresar un correo electrónico válido.');
    }

    if (this.form.get('password')?.hasError('required')) {
      errors.push('Debes ingresar una contraseña.');
    } else if (this.form.get('password')?.hasError('minlength')) {
      errors.push('La contraseña debe tener al menos 6 caracteres.');
    }

    if (this.form.get('confirm_password')?.hasError('required')) {
      errors.push('Debes confirmar tu contraseña.');
    } else if (this.form.get('confirm_password')?.hasError('minlength')) {
      errors.push('La confirmación de contraseña debe tener al menos 6 caracteres.');
    }

    if (this.form.hasError('passwordMismatch')) {
      errors.push('Las contraseñas no coinciden.');
    }

    return [...new Set(errors)];
  }

  closeValidationDialog(): void {
    this.showValidationDialog = false;
  }
}
