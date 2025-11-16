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

// Bunga Option (Interest Rate) Types
export interface BungaOption {
    id: number;
    nama: string;
    persen: number;
    deskripsi: string;
    is_active: boolean;
    created_by: number;
    created_by_user?: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
    updated_at?: string;
}

export interface BungaOptionRequest {
    nama: string;
    persen: number;
    deskripsi: string;
}

export interface BungaOptionStatusRequest {
    is_active: boolean;
}

// Pinjaman (Loan) Types - API Structure
export interface Pinjaman {
    ID: number;
    CreatedAt: string;
    KodePinjaman: string;
    UserID: number;
    TanggalPinjam: string;
    JumlahPinjaman: number;
    BungaPersen: number;
    LamaBulan: number;
    JumlahAngsuran: number;
    SisaAngsuran: number;
    Status: 'proses' | 'disetujui' | 'lunas' | 'macet';
    User?: User;
}

// Frontend-friendly loan interface (snake_case)
export interface Loan {
    id: number;
    created_at: string;
    kode_pinjaman: string;
    user_id: number;
    tanggal_pinjam: string;
    jumlah_pinjaman: number;
    bunga_persen: number;
    lama_bulan: number;
    jumlah_angsuran: number;
    sisa_angsuran: number;
    status: 'proses' | 'disetujui' | 'lunas' | 'macet';
    user?: User;
}

export interface LoanRequest {
    jumlah_pinjaman: number;
    bunga_option_id: number;
    lama_bulan: number;
    jumlah_angsuran: number;
    user_id?: number;
    no_rekening_pencairan: string;
    bank_name: string;
    kode_pinjaman?: string;
    status?: string;
}

// Angsuran (Installment) Types - API Structure
export interface Angsuran {
    ID: number;
    PinjamanID: number;
    AngsuranKe: number;
    TanggalBayar: string;
    Pokok: number;
    Bunga: number;
    Denda: number;
    TotalBayar: number;
    UserID: number;
    Status: 'proses' | 'verified' | 'kurang' | 'lebih';
    Pinjaman?: Pinjaman;
    User?: User;
}

// Frontend-friendly installment interface (snake_case)
export interface Installment {
    id: number;
    pinjaman_id: number;
    angsuran_ke: number;
    tanggal_bayar: string;
    pokok: number;
    bunga: number;
    denda: number;
    total_bayar: number;
    user_id: number;
    status: 'proses' | 'verified' | 'kurang' | 'lebih';
    pinjaman?: Loan;
    user?: User;
}

export interface InstallmentRequest {
    pinjaman_id: number;
    angsuran_ke: number;
    pokok: number;
    bunga: number;
    denda?: number;
}

export interface InstallmentVerification {
    status: 'verified' | 'kurang' | 'lebih';
}

export interface LoanStatusUpdate {
    status: 'proses' | 'disetujui' | 'lunas' | 'macet';
    sisa_angsuran?: number;
}

// SHU (Annual Profit Sharing) Types
export interface SHUMemberDetail {
    user_id: number;
    email: string;
    total_simpanan: number;
    total_penjualan: number;
    jasa_modal: number;
    jasa_usaha: number;
    total_shu_anggota: number;
}

export interface SHUReport {
    tahun: number;
    total_shu_koperasi: number;
    persen_jasa_modal: number;
    persen_jasa_usaha: number;
    total_simpanan_all: number;
    total_penjualan_all: number;
    tanggal_hitung: string;
    detail_anggota: SHUMemberDetail[];
}

export interface SHURecord {
    id: number;
    tahun: number;
    total_shu: number;
    status: 'draft' | 'final';
    created_at: string;
    updated_at: string;
    shu_report?: SHUReport;
}

export interface SHUGenerateRequest {
    tahun: number;
    total_shu_koperasi: number;
}

// Enhanced SHU interfaces for automated generation
export interface SHUAutoGenerateRequest {
    tahun: number;
    beban_operasional: number;
    beban_non_operasional: number;
    beban_pajak: number;
}

export interface SHUAutoReport {
    tahun: number;
    pendapatan_operasional: number;
    pendapatan_non_operasional: number;
    beban_operasional: number;
    beban_non_operasional: number;
    beban_pajak: number;
    total_shu_koperasi: number;
    persen_jasa_modal: number;
    persen_jasa_usaha: number;
    total_simpanan_all: number;
    total_penjualan_all: number;
    tanggal_hitung: string;
    detail_anggota: SHUMemberDetail[];
}

export interface SHUAutoSaveRequest {
    tahun: number;
    pendapatan_operasional: number;
    pendapatan_non_operasional: number;
    beban_operasional: number;
    beban_non_operasional: number;
    beban_pajak: number;
    total_shu: number;
    status: 'draft' | 'final';
}

export interface SHUUserReport {
    user_id: number;
    email: string;
    total_simpanan: number;
    total_penjualan: number;
    jasa_modal: number;
    jasa_usaha: number;
    total_shu_anggota: number;
}

export interface SHUUserGenerateRequest {
    tahun: number;
    total_shu_koperasi: number;
}

export interface SHUSaveRequest {
    tahun: number;
    total_shu: number;
    status: 'draft' | 'final';
}

export interface SHUUpdateRequest {
    total_shu?: number;
    status?: 'draft' | 'final';
}

// SHU Anggota (Individual Member SHU Records) Types
export interface SHUAnggotaSaveRequest {
    tahun: number;
}

export interface SHUAnggotaRecord {
    id_shu_anggota: number;
    id_shu: number;
    id_anggota: number;
    jumlah_modal: number;
    jumlah_usaha: number;
    shu_diterima: number;
    created_at: string;
    updated_at: string;
    shu?: {
        id_shu?: number;
        tahun: number;
        total_shu: number;
        status: 'draft' | 'final';
    };
    user?: {
        id: number;
        email: string;
        name: string;
    };
}

export interface SHUAnggotaSaveResponse {
    message: string;
    data: SHUAnggotaRecord;
}

export interface SHUAnggotaHistoryResponse {
    data: SHUAnggotaRecord[];
}