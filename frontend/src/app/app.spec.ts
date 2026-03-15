import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { App } from './app';
import { AuthService } from './core/services/auth.service';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  const authServiceMock = {
    currentUser: signal(null),
    loadingUser: signal(false),
    authVersion: signal(0),
    isAuthenticated: signal(false),
    logout: jasmine.createSpy('logout'),
    hasRole: jasmine.createSpy('hasRole').and.returnValue(false),
    hasAnyRole: jasmine.createSpy('hasAnyRole').and.returnValue(false),
    canManageEvents: jasmine.createSpy('canManageEvents').and.returnValue(false),
    canRegisterInEvents: jasmine.createSpy('canRegisterInEvents').and.returnValue(false),
    getToken: jasmine.createSpy('getToken').and.returnValue(null),
    initAuth: jasmine.createSpy('initAuth'),
    loadMe: jasmine.createSpy('loadMe'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});