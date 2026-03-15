import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { EventService } from '../../../core/services/event.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    MessageModule,
    DatePickerModule,
    SelectModule,
    TextareaModule,
    DialogModule,
  ],
  templateUrl: './event-form.html',
  styleUrl: './event-form.scss',
})
export class EventForm implements OnInit {
  form: FormGroup;
  loading = signal(false);

  errorMessage = '';
  isEditMode = false;
  eventId: string | null = null;
  submitAction: 'draft' | 'publish' = 'draft';

  showValidationDialog = false;
  validationDialogTitle = 'Información incompleta';
  validationDialogMessage = '';
  validationSummary: string[] = [];

  statusOptions = [
    { label: 'Borrador', value: 'draft' },
    { label: 'Publicado', value: 'published' },
    { label: 'Cancelado', value: 'cancelled' },
    { label: 'Completado', value: 'completed' },
  ];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.form = this.fb.group(
      {
        title: ['', [Validators.required, Validators.minLength(3)]],
        description: [''],
        location: [''],
        start_date: [null, Validators.required],
        end_date: [null, Validators.required],
        capacity: [null, [Validators.required, Validators.min(1)]],
        status: ['draft'],
      },
      {
        validators: [this.dateRangeValidator()],
      }
    );
  }

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.eventId;

    if (this.isEditMode && this.eventId) {
      this.eventService.getEvent(this.eventId).subscribe({
        next: (event) => {
          this.form.patchValue({
            ...event,
            start_date: event.start_date ? new Date(event.start_date) : null,
            end_date: event.end_date ? new Date(event.end_date) : null,
          });
        },
        error: () => {
          this.errorMessage = 'No fue posible cargar la información del evento.';
        },
      });
    }
  }

  dateRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const start = control.get('start_date')?.value;
      const end = control.get('end_date')?.value;

      if (!start || !end) {
        return null;
      }

      const startDate = start instanceof Date ? start : new Date(start);
      const endDate = end instanceof Date ? end : new Date(end);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return null;
      }

      return endDate > startDate ? null : { dateRangeInvalid: true };
    };
  }

  get shouldShowDateRangeError(): boolean {
    const startTouched = this.form.get('start_date')?.touched;
    const endTouched = this.form.get('end_date')?.touched;
    return !!this.form.hasError('dateRangeInvalid') && !!(startTouched || endTouched);
  }

  onSubmitAs(action: 'draft' | 'publish'): void {
    this.submitAction = action;

    if (!this.validateAndNotify()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage = '';

    const value = this.form.value;
    const data = {
      ...value,
      status: action === 'publish' ? 'published' : 'draft',
      start_date: value.start_date instanceof Date
        ? value.start_date.toISOString()
        : value.start_date,
      end_date: value.end_date instanceof Date
        ? value.end_date.toISOString()
        : value.end_date,
    };

    this.eventService.createEvent(data).subscribe({
      next: (event) => {
        this.loading.set(false);
        this.router.navigate(['/events', event.id]);
      },
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Error al guardar el evento.';
        this.loading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (!this.validateAndNotify()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage = '';

    const value = this.form.value;
    const data = {
      ...value,
      start_date: value.start_date instanceof Date
        ? value.start_date.toISOString()
        : value.start_date,
      end_date: value.end_date instanceof Date
        ? value.end_date.toISOString()
        : value.end_date,
    };

    this.eventService.updateEvent(this.eventId!, data).subscribe({
      next: (event) => {
        this.loading.set(false);
        this.router.navigate(['/events', event.id]);
      },
      error: (err) => {
        this.errorMessage = err.error?.detail ?? 'Error al guardar el evento.';
        this.loading.set(false);
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
    this.validationDialogTitle = 'Revisa la información del formulario';
    this.validationDialogMessage =
      'Encontramos algunos datos pendientes o inconsistentes. Corrígelos para poder continuar.';
    this.showValidationDialog = true;

    setTimeout(() => {
      this.scrollToFirstError();
    }, 100);

    return false;
  }

  buildValidationSummary(): string[] {
    const errors: string[] = [];

    if (this.form.get('title')?.hasError('required')) {
      errors.push('Debes ingresar el título del evento.');
    } else if (this.form.get('title')?.hasError('minlength')) {
      errors.push('El título debe tener al menos 3 caracteres.');
    }

    if (this.form.get('start_date')?.hasError('required')) {
      errors.push('Debes seleccionar la fecha de inicio.');
    }

    if (this.form.get('end_date')?.hasError('required')) {
      errors.push('Debes seleccionar la fecha de finalización.');
    }

    if (this.form.hasError('dateRangeInvalid')) {
      errors.push('La fecha de finalización debe ser posterior a la fecha de inicio.');
    }

    if (this.form.get('capacity')?.hasError('required')) {
      errors.push('Debes indicar la capacidad del evento.');
    } else if (this.form.get('capacity')?.hasError('min')) {
      errors.push('La capacidad debe ser mínimo de 1 asistente.');
    }

    return [...new Set(errors)];
  }

  scrollToFirstError(): void {
    const selectors = [
      '#title.ng-invalid',
      '#start_date',
      '#end_date',
      '#capacity',
      '.section-invalid',
      '.p-invalid',
      '.ng-invalid',
    ];

    for (const selector of selectors) {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
    }
  }

  closeValidationDialog(): void {
    this.showValidationDialog = false;
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }
}