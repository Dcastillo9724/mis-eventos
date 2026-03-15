import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { EventList } from './event-list';
import { AuthService } from '../../../core/services/auth.service';
import { EventService } from '../../../core/services/event.service';
import { EventsByStatus } from '../../../core/models/event.model';

describe('EventList', () => {
  let component: EventList;
  let fixture: ComponentFixture<EventList>;
  let authServiceMock: {
    authVersion: ReturnType<typeof signal>;
    canManageEvents: jasmine.Spy;
  };
  let eventServiceMock: {
    getEventsGrouped: jasmine.Spy;
  };

  const groupedEventsMock: EventsByStatus = {
    published: [
      {
        id: '1',
        title: 'Angular Connect',
        description: 'Evento de Angular',
        location: 'Bogotá',
        start_date: '2026-03-20T10:00:00',
        end_date: '2026-03-20T12:00:00',
        capacity: 100,
        registered_count: 25,
        status: 'published',
        organizer_id: '10',
        created_at: '2026-03-10T08:00:00',
      },
      {
        id: '2',
        title: 'Python Conf',
        description: 'Evento backend',
        location: 'Medellín',
        start_date: '2026-03-22T09:00:00',
        end_date: '2026-03-22T11:00:00',
        capacity: 80,
        registered_count: 40,
        status: 'published',
        organizer_id: '10',
        created_at: '2026-03-11T08:00:00',
      },
    ],
    draft: [
      {
        id: '3',
        title: 'Evento borrador',
        description: 'Pendiente',
        location: 'Cali',
        start_date: '2026-03-25T08:00:00',
        end_date: '2026-03-25T10:00:00',
        capacity: 50,
        registered_count: 0,
        status: 'draft',
        organizer_id: '10',
        created_at: '2026-03-12T08:00:00',
      },
    ],
    cancelled: [],
    completed: [],
    published_total: 2,
    draft_total: 1,
    cancelled_total: 0,
    completed_total: 0,
  };

  beforeEach(async () => {
    authServiceMock = {
      authVersion: signal(0),
      canManageEvents: jasmine.createSpy('canManageEvents').and.returnValue(true),
    };

    eventServiceMock = {
      getEventsGrouped: jasmine.createSpy('getEventsGrouped').and.returnValue(of(groupedEventsMock)),
    };

    await TestBed.configureTestingModule({
      imports: [EventList],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: EventService, useValue: eventServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar eventos al iniciar', () => {
    expect(eventServiceMock.getEventsGrouped).toHaveBeenCalled();
    expect(component.groupedResponse()).toEqual(groupedEventsMock);
    expect(component.loading()).toBeFalse();
  });

  it('debería permitir crear evento si el usuario puede administrar', () => {
    authServiceMock.canManageEvents.and.returnValue(true);
    expect(component.canCreateEvent()).toBeTrue();
  });

  it('debería no permitir crear evento si el usuario no puede administrar', () => {
    authServiceMock.canManageEvents.and.returnValue(false);

    fixture = TestBed.createComponent(EventList);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.canCreateEvent()).toBeFalse();
  });

  it('debería filtrar eventos por texto en el título, descripción o ubicación', () => {
    component.searchTitle.set('angular');

    const items = component.getFilteredItems('published');

    expect(items.length).toBe(1);
    expect(items[0].title).toBe('Angular Connect');
  });

  it('debería cambiar de tab y limpiar la búsqueda', () => {
    component.searchTitle.set('python');

    component.setActiveTab('draft');

    expect(component.activeTab()).toBe('draft');
    expect(component.searchTitle()).toBe('');
  });

  it('debería retornar los estados visibles con total mayor a 0', () => {
    const visibleStatuses = component.getVisibleStatuses();

    expect(visibleStatuses).toEqual(['published', 'draft']);
  });

  it('debería ajustar el tab activo si el actual no está visible', () => {
    component.activeTab.set('cancelled');
    component.ensureValidActiveTab();

    expect(component.activeTab()).toBe('published');
  });

  it('debería limpiar la búsqueda', () => {
    component.searchTitle.set('algo');

    component.clearSearch();

    expect(component.searchTitle()).toBe('');
  });

  it('debería usar tabla para estados cancelled y completed', () => {
    expect(component.shouldUseTable('cancelled')).toBeTrue();
    expect(component.shouldUseTable('completed')).toBeTrue();
    expect(component.shouldUseTable('published')).toBeFalse();
  });
});