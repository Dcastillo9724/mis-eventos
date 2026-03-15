import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { EventForm } from './event-form';
import { EventService } from '../../../core/services/event.service';

describe('EventForm', () => {
  let component: EventForm;
  let fixture: ComponentFixture<EventForm>;
  let eventServiceMock: jasmine.SpyObj<EventService>;
  let router: Router;

  const mockEvent = {
    id: 'event-1',
    title: 'Angular Connect',
    description: 'Evento de Angular',
    location: 'Bogotá',
    start_date: '2026-03-20T10:00:00.000Z',
    end_date: '2026-03-20T12:00:00.000Z',
    capacity: 100,
    registered_count: 10,
    status: 'draft' as const,
    organizer_id: 'org-1',
    created_at: '2026-03-10T08:00:00.000Z',
    sessions: [],
  };

  function configureTest(id: string | null = null) {
    eventServiceMock = jasmine.createSpyObj<EventService>('EventService', [
      'getEvent',
      'createEvent',
      'updateEvent',
    ]);

    eventServiceMock.getEvent.and.returnValue(of(mockEvent));
    eventServiceMock.createEvent.and.returnValue(of(mockEvent));
    eventServiceMock.updateEvent.and.returnValue(of(mockEvent));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [EventForm],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? id : null),
              },
            },
          },
        },
        { provide: EventService, useValue: eventServiceMock },
      ],
    });

    fixture = TestBed.createComponent(EventForm);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({}).compileComponents();
  });

  it('should create', () => {
    configureTest();
    expect(component).toBeTruthy();
  });

  it('debería iniciar en modo creación si no hay id', () => {
    configureTest();

    expect(component.isEditMode).toBeFalse();
    expect(component.eventId).toBeNull();
  });

  it('debería cargar evento en modo edición', () => {
    configureTest('event-1');

    expect(component.isEditMode).toBeTrue();
    expect(component.eventId).toBe('event-1');
    expect(eventServiceMock.getEvent).toHaveBeenCalledWith('event-1');
    expect(component.form.value.title).toBe('Angular Connect');
    expect(component.form.value.location).toBe('Bogotá');
    expect(component.form.value.status).toBe('draft');
    expect(component.form.value.start_date instanceof Date).toBeTrue();
    expect(component.form.value.end_date instanceof Date).toBeTrue();
  });

  it('debería mostrar error si falla la carga del evento en edición', () => {
    eventServiceMock = jasmine.createSpyObj<EventService>('EventService', [
      'getEvent',
      'createEvent',
      'updateEvent',
    ]);

    eventServiceMock.getEvent.and.returnValue(throwError(() => new Error('error')));
    eventServiceMock.createEvent.and.returnValue(of(mockEvent));
    eventServiceMock.updateEvent.and.returnValue(of(mockEvent));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [EventForm],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
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
        { provide: EventService, useValue: eventServiceMock },
      ],
    });

    fixture = TestBed.createComponent(EventForm);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.errorMessage).toBe('No fue posible cargar la información del evento.');
  });

  it('debería validar rango de fechas inválido', () => {
    configureTest();

    component.form.patchValue({
      start_date: new Date('2026-03-20T14:00:00.000Z'),
      end_date: new Date('2026-03-20T13:00:00.000Z'),
    });

    component.form.get('start_date')?.markAsTouched();
    component.form.get('end_date')?.markAsTouched();
    component.form.updateValueAndValidity();

    expect(component.form.hasError('dateRangeInvalid')).toBeTrue();
    expect(component.shouldShowDateRangeError).toBeTrue();
  });

  it('debería construir el resumen de validación correctamente', () => {
    configureTest();

    component.form.patchValue({
      title: '',
      start_date: null,
      end_date: null,
      capacity: null,
    });

    const summary = component.buildValidationSummary();

    expect(summary).toContain('Debes ingresar el título del evento.');
    expect(summary).toContain('Debes seleccionar la fecha de inicio.');
    expect(summary).toContain('Debes seleccionar la fecha de finalización.');
    expect(summary).toContain('Debes indicar la capacidad del evento.');
  });

  it('debería construir mensaje de capacidad mínima inválida', () => {
    configureTest();

    component.form.patchValue({
      title: 'Evento',
      start_date: new Date('2026-03-20T10:00:00.000Z'),
      end_date: new Date('2026-03-20T12:00:00.000Z'),
      capacity: 0,
    });
    component.form.updateValueAndValidity();

    const summary = component.buildValidationSummary();

    expect(summary).toContain('La capacidad debe ser mínimo de 1 asistente.');
  });

  it('debería mostrar diálogo de validación si el formulario es inválido', fakeAsync(() => {
    configureTest();
    spyOn(component, 'scrollToFirstError');

    component.form.patchValue({
      title: '',
      start_date: null,
      end_date: null,
      capacity: null,
    });

    const result = component.validateAndNotify();
    tick(100);

    expect(result).toBeFalse();
    expect(component.showValidationDialog).toBeTrue();
    expect(component.validationDialogTitle).toBe('Revisa la información del formulario');
    expect(component.validationSummary.length).toBeGreaterThan(0);
    expect(component.scrollToFirstError).toHaveBeenCalled();
  }));

  it('debería cerrar el diálogo de validación', () => {
    configureTest();

    component.showValidationDialog = true;
    component.closeValidationDialog();

    expect(component.showValidationDialog).toBeFalse();
  });

  it('no debería crear evento si el formulario es inválido', () => {
    configureTest();
    spyOn(component, 'validateAndNotify').and.returnValue(false);

    component.onSubmitAs('draft');

    expect(eventServiceMock.createEvent).not.toHaveBeenCalled();
  });

  it('debería crear evento como borrador', () => {
    configureTest();
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    component.form.patchValue({
      title: 'Nuevo evento',
      description: 'Desc',
      location: 'Cali',
      start_date: new Date('2026-03-20T10:00:00.000Z'),
      end_date: new Date('2026-03-20T12:00:00.000Z'),
      capacity: 50,
      status: 'draft',
    });

    component.onSubmitAs('draft');

    expect(eventServiceMock.createEvent).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'Nuevo evento',
        description: 'Desc',
        location: 'Cali',
        capacity: 50,
        status: 'draft',
      }) as any
    );

    expect(component.submitAction).toBe('draft');
    expect(navigateSpy).toHaveBeenCalledWith(['/events', 'event-1']);
    expect(component.loading()).toBeFalse();
  });

  it('debería crear evento como publicado', () => {
    configureTest();
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    component.form.patchValue({
      title: 'Nuevo evento',
      description: 'Desc',
      location: 'Cali',
      start_date: new Date('2026-03-20T10:00:00.000Z'),
      end_date: new Date('2026-03-20T12:00:00.000Z'),
      capacity: 50,
      status: 'draft',
    });

    component.onSubmitAs('publish');

    expect(eventServiceMock.createEvent).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'Nuevo evento',
        description: 'Desc',
        location: 'Cali',
        capacity: 50,
        status: 'published',
      }) as any
    );

    expect(component.submitAction).toBe('publish');
    expect(navigateSpy).toHaveBeenCalledWith(['/events', 'event-1']);
  });

  it('debería mostrar error si falla createEvent', () => {
    configureTest();
    eventServiceMock.createEvent.and.returnValue(
      throwError(() => ({
        error: { detail: 'No se pudo crear el evento' },
      }))
    );

    component.form.patchValue({
      title: 'Nuevo evento',
      description: 'Desc',
      location: 'Cali',
      start_date: new Date('2026-03-20T10:00:00.000Z'),
      end_date: new Date('2026-03-20T12:00:00.000Z'),
      capacity: 50,
      status: 'draft',
    });

    component.onSubmitAs('draft');

    expect(component.errorMessage).toBe('No se pudo crear el evento');
    expect(component.loading()).toBeFalse();
  });

  it('debería actualizar evento en modo edición', () => {
    configureTest('event-1');
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    component.form.patchValue({
      title: 'Evento actualizado',
      description: 'Nueva descripción',
      location: 'Medellín',
      start_date: new Date('2026-03-21T10:00:00.000Z'),
      end_date: new Date('2026-03-21T12:00:00.000Z'),
      capacity: 80,
      status: 'published',
    });

    component.onSubmit();

    expect(eventServiceMock.updateEvent).toHaveBeenCalledWith(
      'event-1',
      jasmine.objectContaining({
        title: 'Evento actualizado',
        location: 'Medellín',
        status: 'published',
      })
    );
    expect(navigateSpy).toHaveBeenCalledWith(['/events', 'event-1']);
    expect(component.loading()).toBeFalse();
  });

  it('debería mostrar error si falla updateEvent', () => {
    configureTest('event-1');
    eventServiceMock.updateEvent.and.returnValue(
      throwError(() => ({
        error: { detail: 'No se pudo actualizar el evento' },
      }))
    );

    component.form.patchValue({
      title: 'Evento actualizado',
      description: 'Nueva descripción',
      location: 'Medellín',
      start_date: new Date('2026-03-21T10:00:00.000Z'),
      end_date: new Date('2026-03-21T12:00:00.000Z'),
      capacity: 80,
      status: 'published',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('No se pudo actualizar el evento');
    expect(component.loading()).toBeFalse();
  });

  it('debería navegar a /events con goBack', () => {
    configureTest();
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);

    component.goBack();

    expect(navigateSpy).toHaveBeenCalledWith(['/events']);
  });

  it('debería ejecutar scrollToFirstError cuando encuentra un elemento', () => {
    configureTest();

    const fakeElement = {
      scrollIntoView: jasmine.createSpy('scrollIntoView'),
    } as unknown as HTMLElement;

    spyOn(document, 'querySelector').and.returnValue(fakeElement);

    component.scrollToFirstError();

    expect(document.querySelector).toHaveBeenCalled();
    expect(fakeElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    });
  });
});