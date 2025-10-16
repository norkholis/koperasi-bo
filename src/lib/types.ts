export interface Role {
    id: number;
    name: 'super_admin' | 'admin' | 'member';
}

export interface User {
    id: number;
    email: string;
    role: Role;
    created_at: string;
}