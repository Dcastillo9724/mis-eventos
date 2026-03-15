import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Profile } from './profile';
import { AuthService } from '../../../core/services/auth.service';
import { AttendeeService } from '../../../core/services/attendee.service';
import { EventRegistration, SessionRegistration } from '../../../core/models/attendee.model';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let attendeeServiceMock: jasmine.SpyObj<AttendeeService>;
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
  };

  const mockEventRegistrations: EventRegistration[] = [
    {
      id: '1',
      user_id: 'user-1',
      event_id: 'event-1',
      registered_at: '2026-03-15T10:00:00',
      status: 'active',
    },
    {
      id: '2',
      user_id: 'user-1',
      event_id: 'event-2',
      registered_at: '2026-03-15T11:00:00',
      status: 'cancelled',
    },
  ];

  const mockSessionRegistrations: SessionRegistration[] = [
    {
      id: '1',
      user_id: 'user-1',
      session_id: 'session-1',
      event_id: 'event-1',
      registered_at: '2026-03-15T12:00:00',
      status: 'active',
    },
    {
      id: '2',
      user_id: 'user-1',
      session_id: 'session-2',
      event_id: 'event-1',
      registered_at: '2026-03-15T13:00:00',
      status: 'cancelled',
    },
  ];

  beforeEach(async () => {
    attendeeServiceMock = jasmine.createSpyObj<AttendeeService>('AttendeeService', [
      'getMyEventRegistrations',
      'getMySessionRegistrations',
      'cancelEventRegistration',
      'cancelSessionRegistration',
    ]);

    messageServiceMock = {
      add: jasmine.createSpy('add'),
      messageObserver: new Subject(),
      clearObserver: new Subject(),
    };

    attendeeServiceMock.getMyEventRegistrations.and.returnValue(of(mockEventRegistrations));
    attendeeServiceMock.getMySessionRegistrations.and.returnValue(of(mockSessionRegistrations));

    attendeeServiceMock.cancelEventRegistration.and.returnValue(
      of({
        id: '1',
        user_id: 'user-1',
        event_id: 'event-1',
        registered_at: '2026-03-15T10:00:00',
        status: 'cancelled',
      })
    );

    attendeeServiceMock.cancelSessionRegistration.and.returnValue(
      of({
        id: '1',
        user_id: 'user-1',
        session_id: 'session-1',
        event_id: 'event-1',
        registered_at: '2026-03-15T12:00:00',
        status: 'cancelled',
      })
    );

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: AttendeeService, useValue: attendeeServiceMock },
      ],
    })
      .overrideComponent(Profile, {
        set: {
          providers: [{ provide: MessageService, useValue: messageServiceMock }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar inscripciones al iniciar', () => {
    expect(attendeeServiceMock.getMyEventRegistrations).toHaveBeenCalled();
    expect(attendeeServiceMock.getMySessionRegistrations).toHaveBeenCalled();
    expect(component.eventRegistrations().length).toBe(2);
    expect(component.sessionRegistrations().length).toBe(2);
    expect(component.loading()).toBeFalse();
  });

  it('debería agrupar sesiones por evento', () => {
    const grouped = component.groupedRegistrations();

    expect(grouped.length).toBe(2);
    expect(grouped[0].eventRegistration.event_id).toBe('event-1');
    expect(grouped[0].sessionRegistrations.length).toBe(2);
    expect(grouped[1].eventRegistration.event_id).toBe('event-2');
    expect(grouped[1].sessionRegistrations.length).toBe(0);
  });

  it('debería calcular eventos y sesiones activas', () => {
    expect(component.totalActiveEvents()).toBe(1);
    expect(component.totalActiveSessions()).toBe(1);
  });

  it('debería indicar que sí tiene inscripciones', () => {
    expect(component.hasRegistrations()).toBeTrue();
  });

  it('debería obtener sesiones por evento', () => {
    const sessions = component.getSessionsForEvent('event-1');

    expect(sessions.length).toBe(2);
    expect(sessions[0].event_id).toBe('event-1');
  });

  it('debería detectar sesiones activas para un evento', () => {
    expect(component.hasActiveSessionsForEvent('event-1')).toBeTrue();
    expect(component.hasActiveSessionsForEvent('event-2')).toBeFalse();
  });

  it('no debería cancelar evento si tiene sesiones activas', () => {
    component.cancelEventRegistration('event-1');

    expect(attendeeServiceMock.cancelEventRegistration).not.toHaveBeenCalled();
    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Acción no permitida',
      detail: 'Debes cancelar primero las sesiones activas de este evento.',
      life: 5000,
    });
  });

  it('debería cancelar evento si no tiene sesiones activas', () => {
    component.sessionRegistrations.set([
      {
        id: '2',
        user_id: 'user-1',
        session_id: 'session-2',
        event_id: 'event-1',
        registered_at: '2026-03-15T13:00:00',
        status: 'cancelled',
      },
    ]);

    component.cancelEventRegistration('event-1');

    expect(attendeeServiceMock.cancelEventRegistration).toHaveBeenCalledWith('event-1');
    expect(component.eventRegistrations()[0].status).toBe('cancelled');
    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Inscripción cancelada',
      detail: 'Tu inscripción al evento ha sido cancelada.',
    });
  });

  it('debería cancelar una sesión', () => {
    component.cancelSessionRegistration('session-1');

    expect(attendeeServiceMock.cancelSessionRegistration).toHaveBeenCalledWith('session-1');
    expect(component.sessionRegistrations()[0].status).toBe('cancelled');
    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Sesión cancelada',
      detail: 'Tu inscripción a la sesión ha sido cancelada.',
    });
  });

  it('debería manejar error al cargar sesiones y dejar eventos cargados', () => {
    attendeeServiceMock.getMyEventRegistrations.and.returnValue(of(mockEventRegistrations));
    attendeeServiceMock.getMySessionRegistrations.and.returnValue(
      throwError(() => new Error('error'))
    );

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.eventRegistrations().length).toBe(2);
    expect(component.sessionRegistrations().length).toBe(0);
    expect(component.loading()).toBeFalse();
  });

  it('debería manejar error al cargar eventos', () => {
    attendeeServiceMock.getMyEventRegistrations.and.returnValue(
      throwError(() => new Error('error'))
    );

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.loading()).toBeFalse();
  });
});