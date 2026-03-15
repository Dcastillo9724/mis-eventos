import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AttendeeService } from '../../../core/services/attendee.service';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { SessionService } from '../../../core/services/session.service';
import { Event } from '../../../core/models/event.model';
import { Session } from '../../../core/models/session.model';

type TagSeverity = 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null | undefined;

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    TextareaModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss',
})
export class EventDetail implements OnInit {
  event = signal<Event | null>(null);
  loading = signal(false);
  registering = signal(false);
  isRegistered = signal(false);

  showSessionDialog = signal(false);
  savingSession = signal(false);
  editingSession = signal<Session | null>(null);
  sessionForm: FormGroup;

  registeredSessionIds = signal<Set<string>>(new Set());

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService,
    private eventService: EventService,
    private attendeeService: AttendeeService,
    private sessionService: SessionService,
    private fb: FormBuilder,
    private messageService: MessageService,
  ) {
    this.sessionForm = this.fb.group(
      {
        title: ['', [Validators.required, Validators.minLength(3)]],
        description: [''],
        speaker_name: [''],
        start_time: [null, Validators.required],
        end_time: [null, Validators.required],
        capacity: [null, [Validators.min(1)]],
      },
      { validators: [this.timeRangeValidator()] }
    );
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvent(id);
      if (this.authService.isAuthenticated()) {
        this.loadMyRegistrations(id);
      }
    }
  }

  loadEvent(id: string): void {
    this.loading.set(true);
    this.eventService.getEvent(id).subscribe({
      next: (data) => {
        this.event.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/events']);
      },
    });
  }

  loadMyRegistrations(eventId: string): void {
    this.attendeeService.getMyEventRegistrations().subscribe({
      next: (registrations) => {
        const active = registrations.find(
          r => r.event_id === eventId && r.status === 'active'
        );
        this.isRegistered.set(!!active);
      },
    });

    this.attendeeService.getMySessionRegistrations().subscribe({
      next: (registrations) => {
        const activeIds = new Set(
          registrations
            .filter(r => r.status === 'active')
            .map(r => r.session_id)
        );
        this.registeredSessionIds.set(activeIds);
      },
    });
  }

  register(): void {
    const id = this.event()?.id;
    if (!id) return;

    this.registering.set(true);
    this.attendeeService.registerToEvent(id).subscribe({
      next: () => {
        this.isRegistered.set(true);
        this.registering.set(false);
        const current = this.event();
        if (current) {
          this.event.set({ ...current, registered_count: current.registered_count + 1 });
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Inscripción exitosa',
          detail: 'Te has inscrito al evento correctamente.',
        });
      },
      error: () => this.registering.set(false),
    });
  }

  cancelRegistration(): void {
    const id = this.event()?.id;
    if (!id) return;

    const hasActiveSessions = this.event()?.sessions?.some(
      s => this.isRegisteredToSession(s.id)
    );

    if (hasActiveSessions) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acción no permitida',
        detail: 'Debes cancelar tus inscripciones a las sesiones antes de cancelar el evento.',
        life: 5000,
      });
      return;
    }

    this.registering.set(true);
    this.attendeeService.cancelEventRegistration(id).subscribe({
      next: () => {
        this.isRegistered.set(false);
        this.registering.set(false);
        const current = this.event();
        if (current) {
          this.event.set({ ...current, registered_count: current.registered_count - 1 });
        }
        this.messageService.add({
          severity: 'info',
          summary: 'Inscripción cancelada',
          detail: 'Tu inscripción al evento ha sido cancelada.',
        });
      },
      error: () => this.registering.set(false),
    });
  }

  cancelEvent(): void {
    const id = this.event()?.id;
    if (!id) return;
    this.eventService.cancelEvent(id).subscribe({
      next: () => this.router.navigate(['/events']),
      error: () => {},
    });
  }

  deleteEvent(): void {
    const id = this.event()?.id;
    if (!id) return;
    this.eventService.deleteEvent(id).subscribe({
      next: () => this.router.navigate(['/events']),
      error: () => {},
    });
  }

  openAddSessionDialog(): void {
    this.editingSession.set(null);
    this.sessionForm.reset();
    this.showSessionDialog.set(true);
  }

  openEditSessionDialog(session: Session): void {
    this.editingSession.set(session);
    this.sessionForm.patchValue({
      ...session,
      start_time: new Date(session.start_time),
      end_time: new Date(session.end_time),
    });
    this.showSessionDialog.set(true);
  }

  saveSession(): void {
    if (this.sessionForm.invalid) return;

    this.savingSession.set(true);
    const value = this.sessionForm.value;
    const eventId = this.event()?.id;
    if (!eventId) return;

    const data = {
      ...value,
      event_id: eventId,
      start_time: value.start_time instanceof Date
        ? value.start_time.toISOString()
        : value.start_time,
      end_time: value.end_time instanceof Date
        ? value.end_time.toISOString()
        : value.end_time,
    };

    const editing = this.editingSession();
    const request = editing
      ? this.sessionService.updateSession(editing.id, data)
      : this.sessionService.createSession(data);

    request.subscribe({
      next: (saved) => {
        this.savingSession.set(false);
        this.showSessionDialog.set(false);
        const current = this.event();
        if (!current) return;

        if (editing) {
          this.event.set({
            ...current,
            sessions: current.sessions?.map(s => s.id === saved.id ? saved : s),
          });
        } else {
          this.event.set({
            ...current,
            sessions: [...(current.sessions ?? []), saved],
          });
        }

        this.messageService.add({
          severity: 'success',
          summary: editing ? 'Sesión actualizada' : 'Sesión creada',
          detail: editing
            ? 'La sesión ha sido actualizada correctamente.'
            : 'La sesión ha sido creada correctamente.',
        });
      },
      error: () => this.savingSession.set(false),
    });
  }

  deleteSession(session: Session): void {
    this.sessionService.deleteSession(session.id).subscribe({
      next: () => {
        const current = this.event();
        if (!current) return;
        this.event.set({
          ...current,
          sessions: current.sessions?.filter(s => s.id !== session.id),
        });
        this.messageService.add({
          severity: 'info',
          summary: 'Sesión eliminada',
          detail: 'La sesión ha sido eliminada.',
        });
      },
    });
  }

  registerToSession(sessionId: string): void {
    if (!this.isRegistered()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acción no permitida',
        detail: 'Debes inscribirte al evento antes de inscribirte a una sesión.',
        life: 5000,
      });
      return;
    }

    this.attendeeService.registerToSession(sessionId).subscribe({
      next: () => {
        const ids = new Set(this.registeredSessionIds());
        ids.add(sessionId);
        this.registeredSessionIds.set(ids);
        const current = this.event();
        if (!current) return;
        this.event.set({
          ...current,
          sessions: current.sessions?.map(s =>
            s.id === sessionId
              ? { ...s, registered_count: s.registered_count + 1 }
              : s
          ),
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Inscripción exitosa',
          detail: 'Te has inscrito a la sesión correctamente.',
        });
      },
    });
  }

  cancelSessionRegistration(sessionId: string): void {
    this.attendeeService.cancelSessionRegistration(sessionId).subscribe({
      next: () => {
        const ids = new Set(this.registeredSessionIds());
        ids.delete(sessionId);
        this.registeredSessionIds.set(ids);
        const current = this.event();
        if (!current) return;
        this.event.set({
          ...current,
          sessions: current.sessions?.map(s =>
            s.id === sessionId
              ? { ...s, registered_count: s.registered_count - 1 }
              : s
          ),
        });
        this.messageService.add({
          severity: 'info',
          summary: 'Inscripción cancelada',
          detail: 'Tu inscripción a la sesión ha sido cancelada.',
        });
      },
    });
  }

  isRegisteredToSession(sessionId: string): boolean {
    return this.registeredSessionIds().has(sessionId);
  }

  timeRangeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const start = control.get('start_time')?.value;
      const end = control.get('end_time')?.value;
      if (!start || !end) return null;
      const s = start instanceof Date ? start : new Date(start);
      const e = end instanceof Date ? end : new Date(end);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
      return e > s ? null : { timeRangeInvalid: true };
    };
  }

  get shouldShowTimeRangeError(): boolean {
    return !!this.sessionForm.hasError('timeRangeInvalid') &&
      !!(this.sessionForm.get('start_time')?.touched || this.sessionForm.get('end_time')?.touched);
  }

  getStatusSeverity(status: string): TagSeverity {
    const map: Record<string, TagSeverity> = {
      draft: 'secondary', published: 'success', cancelled: 'danger', completed: 'info',
    };
    return map[status] ?? 'secondary';
  }

  getStatusLabel(status: string): string {
    const map: Record<string, string> = {
      draft: 'Borrador', published: 'Publicado', cancelled: 'Cancelado', completed: 'Completado',
    };
    return map[status] ?? status;
  }

  hasCapacity(): boolean {
    const e = this.event();
    return e ? e.registered_count < e.capacity : false;
  }

  hasSessionCapacity(session: Session): boolean {
    return session.capacity ? session.registered_count < session.capacity : true;
  }
}