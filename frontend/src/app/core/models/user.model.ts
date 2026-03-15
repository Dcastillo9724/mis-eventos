export interface Role {
  id: string;
  name: string;
  description: string | null;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  role: Role;
  created_at: string;
}

export interface UserUpdate {
  full_name?: string;
  is_active?: boolean;
  role_id?: string;
}

export interface UserCreateByAdmin {
  email: string;
  password: string;
  full_name: string;
  role_id: string;
}