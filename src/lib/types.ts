export interface Role {
    id: number;
    name: 'super_admin' | 'admin' | 'member';
}

export interface User {
    id: number;
    email: string;
    name: string;
    address: string;
    phone_number: string;
    nik: string;
    role_id: number;
    admin_id?: number | null;
    role?: Role; // This will be populated by the /me endpoint
    created_at?: string;
    updated_at?: string;
    is_active?: boolean;
}

export interface ApiResponse<T> {
    data: T;
}

export interface CreateUserRequest {
    email: string;
    password: string;
    name: string;
    address: string;
    phone_number: string;
    nik: string;
    role_id: number;
}

export interface UpdateUserRequest {
    email?: string;
    password?: string;
    name?: string;
    address?: string;
    phone_number?: string;
    nik?: string;
    role_id?: number;
    is_active?: boolean;
}

export interface UserProfile {
    email?: string;
    current_password?: string;
    new_password?: string;
    name?: string;
    address?: string;
    phone_number?: string;
    nik?: string;
}