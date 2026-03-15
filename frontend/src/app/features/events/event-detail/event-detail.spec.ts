import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { EventDetail } from './event-detail';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { AttendeeService } from '../../../core/services/attendee.service';
import { SessionService } from '../../../core/services/session.service';

describe('EventDetail', () => {
  let component: EventDetail;
  let fixture: ComponentFixture<EventDetail>;
  let router: Router;

  let eventServiceMock: jasmine.SpyObj<EventService>;
  let attendeeServiceMock: jasmine.SpyObj<AttendeeService>;
  let sessionServiceMock: jasmine.SpyObj<SessionService>;
  let messageServiceMock: {
    add: jasmine.Spy;
    messageObserver: Subject<any>;
    clearObserver: Subject<any>;
  };

  const authServiceMock = {
    currentUser: signal({
      id: '1',
      email: 'test@test.com',
      full_name: 'Test User',
      is_active: true,
      role: { id: '3', name: 'attendee', description: null },
      created_at: '',
    }),
    isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(true),
    canManageEvents: jasmine.createSpy('canManageEvents').and.returnValue(false),
    canRegisterInEvents: jasmine.createSpy('canRegisterInEvents').and.returnValue(true),
  };

  const mockEvent = {
    id: 'event-1',
    title: 'Angular Connect',
    description: 'Evento de Angular',
    location: 'Bogotá',
    start_date: '2026-03-20T10:00:00.000Z',
    end_date: '2026-03-20T12:00:00.000Z',
    capacity: 100,
    registered_count: 10,
    status: 'published' as const,
    organizer_id: 'org-1',
    created_at: '2026-03-10T08:00:00.000Z',
    sessions: [
      {
        id: 'session-1',
        event_id: 'event-1',
        title: 'Sesión 1',
        description: 'Descripción sesión 1',
        speaker_name: 'Speaker 1',
        start_time: '2026-03-20T10:00:00.000Z',
        end_time: '2026-03-20T11:00:00.000Z',
        capacity: 20,
        registered_count: 5,
        created_at: '2026-03-10T08:00:00.000Z',
      },
      {
        id: 'session-2',
        event_id: 'event-1',
        title: 'Sesión 2',
        description: 'Descripción sesión 2',
        speaker_name: 'Speaker 2',
        start_time: '2026-03-20T11:00:00.000Z',
        end_time: '2026-03-20T12:00:00.000Z',
        capacity: 10,
        registered_count: 10,
        created_at: '2026-03-10T08:00:00.000Z',
      },
    ],
  };

  beforeEach(async () => {
    eventServiceMock = jasmine.createSpyObj<EventService>('EventService', [
      'getEvent',
      'cancelEvent',
      'deleteEvent',
    ]);

    attendeeServiceMock = jasmine.createSpyObj<AttendeeService>('AttendeeService', [
      'getMyEventRegistrations',
      'getMySessionRegistrations',
      'registerToEvent',
      'cancelEventRegistration',
      'registerToSession',
      'cancelSessionRegistration',
    ]);

    sessionServiceMock = jasmine.createSpyObj<SessionService>('SessionService', [
      'createSession',
      'updateSession',
      'deleteSession',
    ]);

    messageServiceMock = {
      add: jasmine.createSpy('add'),
      messageObserver: new Subject(),
      clearObserver: new Subject(),
    };

    eventServiceMock.getEvent.and.returnValue(of(mockEvent));
    eventServiceMock.cancelEvent.and.returnValue(of(mockEvent));
    eventServiceMock.deleteEvent.and.returnValue(of(void 0));

    attendeeServiceMock.getMyEventRegistrations.and.returnValue(
      of([
        {
          id: 'reg-1',
          user_id: '1',
          event_id: 'event-1',
          status: 'active',
          registered_at: '2026-03-15T10:00:00.000Z',
        },
      ])
    );

    attendeeServiceMock.getMySessionRegistrations.and.returnValue(
      of([
        {
          id: 'sreg-1',
          user_id: '1',
          session_id: 'session-1',
          event_id: 'event-1',
          status: 'active',
          registered_at: '2026-03-15T10:30:00.000Z',
        },
      ])
    );

    attendeeServiceMock.registerToEvent.and.returnValue(
      of({
        id: 'reg-1',
        user_id: '1',
        event_id: 'event-1',
        status: 'active',
        registered_at: '2026-03-15T10:00:00.000Z',
      })
    );

    attendeeServiceMock.cancelEventRegistration.and.returnValue(
      of({
        id: 'reg-1',
        user_id: '1',
        event_id: 'event-1',
        status: 'cancelled',
        registered_at: '2026-03-15T10:00:00.000Z',
      })
    );

    attendeeServiceMock.registerToSession.and.returnValue(
      of({
        id: 'sreg-1',
        user_id: '1',
        session_id: 'session-1',
        event_id: 'event-1',
        status: 'active',
        registered_at: '2026-03-15T10:30:00.000Z',
      })
    );

    attendeeServiceMock.cancelSessionRegistration.and.returnValue(
      of({
        id: 'sreg-1',
        user_id: '1',
        session_id: 'session-1',
        event_id: 'event-1',
        status: 'cancelled',
        registered_at: '2026-03-15T10:30:00.000Z',
      })
    );

    sessionServiceMock.createSession.and.returnValue(
      of({
        id: 'session-3',
        event_id: 'event-1',
        title: 'Nueva sesión',
        description: '',
        speaker_name: '',
        start_time: '2026-03-20T13:00:00.000Z',
        end_time: '2026-03-20T14:00:00.000Z',
        capacity: 30,
        registered_count: 0,
        created_at: '2026-03-10T08:00:00.000Z',
      })
    );

    sessionServiceMock.updateSession.and.returnValue(
      of({
        id: 'session-1',
        event_id: 'event-1',
        title: 'Sesión 1 actualizada',
        description: 'Actualizada',
        speaker_name: 'Speaker 1',
        start_time: '2026-03-20T10:00:00.000Z',
        end_time: '2026-03-20T11:00:00.000Z',
        capacity: 20,
        registered_count: 5,
        created_at: '2026-03-10T08:00:00.000Z',
      })
    );

    sessionServiceMock.deleteSession.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [EventDetail],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 'event-1' : null),
              },
            },
          },
        },
        { provide: AuthService, useValue: authServiceMock },
        { provide: EventService, useValue: eventServiceMock },
        { provide: AttendeeService, useValue: attendeeServiceMock },
        { provide: SessionService, useValue: sessionServiceMock },
      ],
    })
      .overrideComponent(EventDetail, {
        set: {
          providers: [{ provide: MessageService, useValue: messageServiceMock }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EventDetail);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar el evento al iniciar', () => {
    expect(eventServiceMock.getEvent).toHaveBeenCalledWith('event-1');
    expect(component.event()?.id).toBe('event-1');
    expect(component.loading()).toBeFalse();
  });

  it('debería cargar mis inscripciones si el usuario está autenticado', () => {
    expect(attendeeServiceMock.getMyEventRegistrations).toHaveBeenCalled();
    expect(attendeeServiceMock.getMySessionRegistrations).toHaveBeenCalled();
    expect(component.isRegistered()).toBeTrue();
    expect(component.isRegisteredToSession('session-1')).toBeTrue();
  });

  it('debería navegar a /events si falla loadEvent', () => {
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    eventServiceMock.getEvent.and.returnValue(throwError(() => new Error('error')));

    component.loadEvent('event-1');

    expect(component.loading()).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/events']);
  });

  it('debería registrarse al evento', () => {
    component.event.set({ ...mockEvent, registered_count: 10 });
    component.isRegistered.set(false);

    component.register();

    expect(attendeeServiceMock.registerToEvent).toHaveBeenCalledWith('event-1');
    expect(component.isRegistered()).toBeTrue();
    expect(component.event()?.registered_count).toBe(11);
    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Inscripción exitosa',
      detail: 'Te has inscrito al evento correctamente.',
    });
  });

  it('no debería cancelar inscripción al evento si tiene sesiones activas', () => {
    component.event.set(mockEvent);
    component.isRegistered.set(true);
    component.registeredSessionIds.set(new Set(['session-1']));

    component.cancelRegistration();

    expect(attendeeServiceMock.cancelEventRegistration).not.toHaveBeenCalled();
    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Acción no permitida',
      detail: 'Debes cancelar tus inscripciones a las sesiones antes de cancelar el evento.',
      life: 5000,
    });
  });

  it('debería cancelar inscripción al evento si no tiene sesiones activas', () => {
    component.event.set(mockEvent);
    component.isRegistered.set(true);
    component.registeredSessionIds.set(new Set());

    component.cancelRegistration();

    expect(attendeeServiceMock.cancelEventRegistration).toHaveBeenCalledWith('event-1');
    expect(component.isRegistered()).toBeFalse();
    expect(component.event()?.registered_count).toBe(9);
    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Inscripción cancelada',
      detail: 'Tu inscripción al evento ha sido cancelada.',
    });
  });

  it('debería cancelar el evento y navegar', () => {
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    component.event.set(mockEvent);

    component.cancelEvent();

    expect(eventServiceMock.cancelEvent).toHaveBeenCalledWith('event-1');
    expect(navigateSpy).toHaveBeenCalledWith(['/events']);
  });

  it('debería eliminar el evento y navegar', () => {
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    component.event.set({ ...mockEvent, status: 'draft' as const });

    component.deleteEvent();

    expect(eventServiceMock.deleteEvent).toHaveBeenCalledWith('event-1');
    expect(navigateSpy).toHaveBeenCalledWith(['/events']);
  });

  it('debería abrir diálogo para nueva sesión', () => {
    component.openAddSessionDialog();

    expect(component.editingSession()).toBeNull();
    expect(component.showSessionDialog()).toBeTrue();
  });

  it('debería abrir diálogo de edición y cargar datos', () => {
    const session = mockEvent.sessions[0];
    component.openEditSessionDialog(session);

    expect(component.editingSession()).toEqual(session);
    expect(component.showSessionDialog()).toBeTrue();
    expect(component.sessionForm.value.title).toBe(session.title);
  });

  it('no debería guardar sesión si el formulario es inválido', () => {
    component.sessionForm.patchValue({
      title: '',
      start_time: null,
      end_time: null,
    });

    component.saveSession();

    expect(sessionServiceMock.createSession).not.toHaveBeenCalled();
    expect(sessionServiceMock.updateSession).not.toHaveBeenCalled();
  });

  it('debería crear una nueva sesión', () => {
    component.event.set(mockEvent);
    component.openAddSessionDialog();

    component.sessionForm.patchValue({
      title: 'Nueva sesión',
      description: '',
      speaker_name: '',
      start_time: new Date('2026-03-20T13:00:00.000Z'),
      end_time: new Date('2026-03-20T14:00:00.000Z'),
      capacity: 30,
    });

    component.saveSession();

    expect(sessionServiceMock.createSession).toHaveBeenCalled();
    expect(component.showSessionDialog()).toBeFalse();
    expect(component.event()?.sessions?.length).toBe(3);
    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Sesión creada',
      detail: 'La sesión ha sido creada correctamente.',
    });
  });

  it('debería actualizar una sesión existente', () => {
    component.event.set(mockEvent);
    component.openEditSessionDialog(mockEvent.sessions[0]);

    component.sessionForm.patchValue({
      title: 'Sesión 1 actualizada',
      description: 'Actualizada',
      speaker_name: 'Speaker 1',
      start_time: new Date('2026-03-20T10:00:00.000Z'),
      end_time: new Date('2026-03-20T11:00:00.000Z'),
      capacity: 20,
    });

    component.saveSession();

    expect(sessionServiceMock.updateSession).toHaveBeenCalled();
    expect(component.event()?.sessions?.[0].title).toBe('Sesión 1 actualizada');
    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Sesión actualizada',
      detail: 'La sesión ha sido actualizada correctamente.',
    });
  });

  it('debería eliminar una sesión', () => {
    component.event.set(mockEvent);

    component.deleteSession(mockEvent.sessions[0]);

    expect(sessionServiceMock.deleteSession).toHaveBeenCalledWith('session-1');
    expect(component.event()?.sessions?.length).toBe(1);
    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Sesión eliminada',
      detail: 'La sesión ha sido eliminada.',
    });
  });

  it('no debería registrar a sesión si no está inscrito al evento', () => {
    component.isRegistered.set(false);

    component.registerToSession('session-1');

    expect(attendeeServiceMock.registerToSession).not.toHaveBeenCalled();
    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Acción no permitida',
      detail: 'Debes inscribirte al evento antes de inscribirte a una sesión.',
      life: 5000,
    });
  });

  it('debería registrarse a una sesión', () => {
    component.event.set(mockEvent);
    component.isRegistered.set(true);
    component.registeredSessionIds.set(new Set());

    component.registerToSession('session-1');

    expect(attendeeServiceMock.registerToSession).toHaveBeenCalledWith('session-1');
    expect(component.isRegisteredToSession('session-1')).toBeTrue();
    expect(component.event()?.sessions?.[0].registered_count).toBe(6);
    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Inscripción exitosa',
      detail: 'Te has inscrito a la sesión correctamente.',
    });
  });

  it('debería cancelar inscripción a una sesión', () => {
    component.event.set(mockEvent);
    component.registeredSessionIds.set(new Set(['session-1']));

    component.cancelSessionRegistration('session-1');

    expect(attendeeServiceMock.cancelSessionRegistration).toHaveBeenCalledWith('session-1');
    expect(component.isRegisteredToSession('session-1')).toBeFalse();
    expect(component.event()?.sessions?.[0].registered_count).toBe(4);
    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Inscripción cancelada',
      detail: 'Tu inscripción a la sesión ha sido cancelada.',
    });
  });

  it('debería validar rango de tiempo inválido', () => {
    component.sessionForm.patchValue({
      start_time: new Date('2026-03-20T14:00:00.000Z'),
      end_time: new Date('2026-03-20T13:00:00.000Z'),
    });

    component.sessionForm.get('start_time')?.markAsTouched();
    component.sessionForm.get('end_time')?.markAsTouched();
    component.sessionForm.updateValueAndValidity();

    expect(component.sessionForm.hasError('timeRangeInvalid')).toBeTrue();
    expect(component.shouldShowTimeRangeError).toBeTrue();
  });

  it('debería mapear etiquetas y severidades de estado', () => {
    expect(component.getStatusLabel('draft')).toBe('Borrador');
    expect(component.getStatusLabel('published')).toBe('Publicado');
    expect(component.getStatusSeverity('cancelled')).toBe('danger');
    expect(component.getStatusSeverity('completed')).toBe('info');
  });

  it('debería validar capacidad del evento y de sesiones', () => {
    component.event.set(mockEvent);

    expect(component.hasCapacity()).toBeTrue();
    expect(component.hasSessionCapacity(mockEvent.sessions[0])).toBeTrue();
    expect(component.hasSessionCapacity(mockEvent.sessions[1])).toBeFalse();
  });
});