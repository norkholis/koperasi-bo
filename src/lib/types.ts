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

// Simpanan (Wallet) Types
export interface Wallet {
    id: number;
    user_id: number;
    type: 'pokok' | 'wajib' | 'sukarela';
    balance: number;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface WalletTransaction {
    id: number;
    simpanan_id: number;
    simpanan?: {
        id: number;
        user_id: number;
        type: 'pokok' | 'wajib' | 'sukarela';
    };
    type: 'topup' | 'adjustment';
    amount: number;
    description: string;
    status: 'pending' | 'verified' | 'rejected';
    verified_by_id?: number;
    verified_at?: string;
    created_at: string;
}

export interface TopupRequest {
    type: 'pokok' | 'wajib' | 'sukarela';
    amount: number;
    description: string;
}

export interface BalanceAdjustment {
    amount: number;
    description: string;
}

export interface TransactionVerification {
    approve: boolean;
}