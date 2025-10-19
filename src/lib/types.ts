export interface Role {
    id: number;
    name: 'super_admin' | 'admin' | 'member';
}

export interface User {
    id: number;
    email: string;
    role: Role;
    created_at: string;
    updated_at?: string;
    full_name?: string;
    phone?: string;
    address?: string;
    is_active?: boolean;
}

export interface CreateUserRequest {
    email: string;
    password: string;
    role_id: number;
    full_name?: string;
    phone?: string;
    address?: string;
}

export interface UpdateUserRequest {
    email?: string;
    password?: string;
    role_id?: number;
    full_name?: string;
    phone?: string;
    address?: string;
    is_active?: boolean;
}

export interface UserProfile {
    email?: string;
    current_password?: string;
    new_password?: string;
    full_name?: string;
    phone?: string;
    address?: string;
}