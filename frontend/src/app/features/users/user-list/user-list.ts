import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Role, User } from '../../../core/models/user.model';
import { UserService } from '../../../core/services/user.service';

type RoleSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
    TagModule,
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList implements OnInit {
  users = signal<User[]>([]);
  roles = signal<Role[]>([]);
  loading = signal(false);
  showDialog = signal(false);
  editingUser = signal<User | null>(null);
  form: FormGroup;

  statusOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false },
  ];

  mappedRoles = computed(() =>
    this.roles().map((role) => ({
      ...role,
      display_name: this.getRoleLabel(role.name),
    }))
  );

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      full_name: ['', [Validators.required, Validators.minLength(3)]],
      role_id: [null, Validators.required],
      is_active: [true],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (data) => this.roles.set(data),
    });
  }

  openCreateDialog(): void {
    this.editingUser.set(null);
    this.form.reset({
      email: '',
      password: '',
      full_name: '',
      role_id: null,
      is_active: true,
    });

    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('password')?.updateValueAndValidity();

    this.showDialog.set(true);
  }

  openEditDialog(user: User): void {
    this.editingUser.set(user);
    this.form.patchValue({
      email: user.email,
      full_name: user.full_name,
      role_id: user.role.id,
      is_active: user.is_active,
    });

    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();

    this.showDialog.set(true);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const editing = this.editingUser();

    if (editing) {
      this.userService.updateUser(editing.id, {
        full_name: this.form.value.full_name,
        role_id: this.form.value.role_id,
        is_active: this.form.value.is_active,
      }).subscribe({
        next: (updated) => {
          this.users.set(this.users().map((u) => (u.id === updated.id ? updated : u)));
          this.showDialog.set(false);
        },
      });
    } else {
      this.userService.createUser({
        email: this.form.value.email,
        password: this.form.value.password,
        full_name: this.form.value.full_name,
        role_id: this.form.value.role_id,
      }).subscribe({
        next: (created) => {
          this.users.set([...this.users(), created]);
          this.showDialog.set(false);
        },
      });
    }
  }

  deleteUser(user: User): void {
    this.userService.deleteUser(user.id).subscribe({
      next: () => this.users.set(this.users().filter((u) => u.id !== user.id)),
    });
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      admin: 'Administrador',
      organizer: 'Organizador',
      attendee: 'Asistente',
    };
    return map[role] ?? role;
  }

  getRoleSeverity(role: string): RoleSeverity {
    const map: Record<string, RoleSeverity> = {
      admin: 'danger',
      organizer: 'warn',
      attendee: 'info',
    };
    return map[role] ?? 'secondary';
  }
}
