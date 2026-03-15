import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { EventRegistration, SessionRegistration, EventWithSessionRegistrations } from '../../../core/models/attendee.model';
import { AttendeeService } from '../../../core/services/attendee.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    TagModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  eventRegistrations = signal<EventRegistration[]>([]);
  sessionRegistrations = signal<SessionRegistration[]>([]);
  loading = signal(false);

  groupedRegistrations = computed<EventWithSessionRegistrations[]>(() => {
    return this.eventRegistrations().map((eventReg) => ({
      eventRegistration: eventReg,
      sessionRegistrations: this.sessionRegistrations().filter(
        (sr) => sr.event_id === eventReg.event_id
      ),
    }));
  });

  totalActiveEvents = computed(() =>
    this.eventRegistrations().filter((r) => r.status === 'active').length
  );

  totalActiveSessions = computed(() =>
    this.sessionRegistrations().filter((r) => r.status === 'active').length
  );

  hasRegistrations = computed(() => this.eventRegistrations().length > 0);

  constructor(
    public authService: AuthService,
    private attendeeService: AttendeeService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadRegistrations();
  }

  loadRegistrations(): void {
    this.loading.set(true);

    this.attendeeService.getMyEventRegistrations().subscribe({
      next: (eventData) => {
        this.attendeeService.getMySessionRegistrations().subscribe({
          next: (sessionData) => {
            this.eventRegistrations.set(eventData);
            this.sessionRegistrations.set(sessionData);
            this.loading.set(false);
          },
          error: () => {
            this.eventRegistrations.set(eventData);
            this.sessionRegistrations.set([]);
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getSessionsForEvent(eventId: string): SessionRegistration[] {
    return this.sessionRegistrations().filter(
      (sr) => sr.event_id === eventId
    );
  }

  hasActiveSessionsForEvent(eventId: string): boolean {
    return this.sessionRegistrations().some(
      (sr) => sr.event_id === eventId && sr.status === 'active'
    );
  }

  cancelEventRegistration(eventId: string): void {
    const hasSessions = this.sessionRegistrations().some(
      (sr) => sr.event_id === eventId && sr.status === 'active'
    );

    if (hasSessions) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acción no permitida',
        detail: 'Debes cancelar primero las sesiones activas de este evento.',
        life: 5000,
      });
      return;
    }

    this.attendeeService.cancelEventRegistration(eventId).subscribe({
      next: () => {
        this.eventRegistrations.set(
          this.eventRegistrations().map((r) =>
            r.event_id === eventId ? { ...r, status: 'cancelled' as const } : r
          )
        );

        this.messageService.add({
          severity: 'info',
          summary: 'Inscripción cancelada',
          detail: 'Tu inscripción al evento ha sido cancelada.',
        });
      },
    });
  }

  cancelSessionRegistration(sessionId: string): void {
    this.attendeeService.cancelSessionRegistration(sessionId).subscribe({
      next: () => {
        this.sessionRegistrations.set(
          this.sessionRegistrations().map((r) =>
            r.session_id === sessionId ? { ...r, status: 'cancelled' as const } : r
          )
        );

        this.messageService.add({
          severity: 'info',
          summary: 'Sesión cancelada',
          detail: 'Tu inscripción a la sesión ha sido cancelada.',
        });
      },
    });
  }
}