import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UserList } from './user-list';
import { UserService } from '../../../core/services/user.service';

describe('UserList', () => {
  let component: UserList;
  let fixture: ComponentFixture<UserList>;
  let userServiceMock: jasmine.SpyObj<UserService>;

  const mockRoles = [
    { id: '1', name: 'admin', description: 'Administrador' },
    { id: '2', name: 'organizer', description: 'Organizador' },
    { id: '3', name: 'attendee', description: 'Asistente' },
  ];

  const mockUsers = [
    {
      id: '1',
      email: 'admin@test.com',
      full_name: 'Admin User',
      is_active: true,
      role: { id: '1', name: 'admin', description: 'Administrador' },
      created_at: '2026-03-15T10:00:00',
    },
    {
      id: '2',
      email: 'user@test.com',
      full_name: 'Normal User',
      is_active: true,
      role: { id: '3', name: 'attendee', description: 'Asistente' },
      created_at: '2026-03-15T10:00:00',
    },
  ];

  beforeEach(async () => {
    userServiceMock = jasmine.createSpyObj<UserService>('UserService', [
      'getUsers',
      'getRoles',
      'createUser',
      'updateUser',
      'deleteUser',
    ]);

    userServiceMock.getUsers.and.returnValue(of(mockUsers));
    userServiceMock.getRoles.and.returnValue(of(mockRoles));
    userServiceMock.createUser.and.returnValue(
      of({
        id: '3',
        email: 'new@test.com',
        full_name: 'New User',
        is_active: true,
        role: { id: '2', name: 'organizer', description: 'Organizador' },
        created_at: '2026-03-15T10:00:00',
      })
    );
    userServiceMock.updateUser.and.returnValue(
      of({
        id: '1',
        email: 'admin@test.com',
        full_name: 'Admin Updated',
        is_active: false,
        role: { id: '2', name: 'organizer', description: 'Organizador' },
        created_at: '2026-03-15T10:00:00',
      })
    );
    userServiceMock.deleteUser.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [UserList],
      providers: [
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar usuarios y roles al iniciar', () => {
    expect(userServiceMock.getUsers).toHaveBeenCalled();
    expect(userServiceMock.getRoles).toHaveBeenCalled();
    expect(component.users().length).toBe(2);
    expect(component.roles().length).toBe(3);
    expect(component.loading()).toBeFalse();
  });

  it('debería abrir diálogo de creación y resetear formulario', () => {
    component.openCreateDialog();

    expect(component.editingUser()).toBeNull();
    expect(component.showDialog()).toBeTrue();
    expect(component.form.value.email).toBe('');
    expect(component.form.value.password).toBe('');
    expect(component.form.value.full_name).toBe('');
    expect(component.form.value.role_id).toBeNull();
    expect(component.form.value.is_active).toBeTrue();
  });

  it('debería abrir diálogo de edición y cargar datos del usuario', () => {
    const user = mockUsers[0];

    component.openEditDialog(user);

    expect(component.editingUser()).toEqual(user);
    expect(component.showDialog()).toBeTrue();
    expect(component.form.value.email).toBe(user.email);
    expect(component.form.value.full_name).toBe(user.full_name);
    expect(component.form.value.role_id).toBe(user.role.id);
    expect(component.form.value.is_active).toBeTrue();
  });

  it('no debería enviar si el formulario es inválido', () => {
    component.form.patchValue({
      email: '',
      password: '',
      full_name: '',
      role_id: null,
    });

    component.onSubmit();

    expect(userServiceMock.createUser).not.toHaveBeenCalled();
    expect(userServiceMock.updateUser).not.toHaveBeenCalled();
  });

  it('debería crear usuario cuando no está editando', () => {
    component.openCreateDialog();

    component.form.patchValue({
      email: 'new@test.com',
      password: '123456',
      full_name: 'New User',
      role_id: '2',
      is_active: true,
    });

    component.onSubmit();

    expect(userServiceMock.createUser).toHaveBeenCalledWith({
      email: 'new@test.com',
      password: '123456',
      full_name: 'New User',
      role_id: '2',
    });
    expect(component.users().length).toBe(3);
    expect(component.showDialog()).toBeFalse();
  });

  it('debería actualizar usuario cuando está editando', () => {
    const user = mockUsers[0];
    component.openEditDialog(user);

    component.form.patchValue({
      full_name: 'Admin Updated',
      role_id: '2',
      is_active: false,
    });

    component.onSubmit();

    expect(userServiceMock.updateUser).toHaveBeenCalledWith('1', {
      full_name: 'Admin Updated',
      role_id: '2',
      is_active: false,
    });

    expect(component.users()[0].full_name).toBe('Admin Updated');
    expect(component.users()[0].role.name).toBe('organizer');
    expect(component.users()[0].is_active).toBeFalse();
    expect(component.showDialog()).toBeFalse();
  });

  it('debería eliminar usuario de la lista', () => {
    component.deleteUser(mockUsers[0]);

    expect(userServiceMock.deleteUser).toHaveBeenCalledWith('1');
    expect(component.users().length).toBe(1);
    expect(component.users()[0].id).toBe('2');
  });

  it('debería mapear correctamente etiquetas de rol', () => {
    expect(component.getRoleLabel('admin')).toBe('Administrador');
    expect(component.getRoleLabel('organizer')).toBe('Organizador');
    expect(component.getRoleLabel('attendee')).toBe('Asistente');
    expect(component.getRoleLabel('other')).toBe('other');
  });

  it('debería mapear correctamente severidad de rol', () => {
    expect(component.getRoleSeverity('admin')).toBe('danger');
    expect(component.getRoleSeverity('organizer')).toBe('warn');
    expect(component.getRoleSeverity('attendee')).toBe('info');
    expect(component.getRoleSeverity('other')).toBe('secondary');
  });

  it('debería mapear roles con display_name', () => {
    const mapped = component.mappedRoles();

    expect(mapped.length).toBe(3);
    expect(mapped[0].display_name).toBe('Administrador');
    expect(mapped[1].display_name).toBe('Organizador');
    expect(mapped[2].display_name).toBe('Asistente');
  });
});