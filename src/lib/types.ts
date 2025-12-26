export interface Role {
    id: number;
    name: 'super_admin' | 'admin' | 'member' | 'user';
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
    user?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface WalletTransaction {
    id: number;
    simpanan_id: number;
    simpanan?: {
        id: number;
        user_id: number;
        type: 'pokok' | 'wajib' | 'sukarela';
        user?: {
            id: number;
            name: string;
            email: string;
        };
    };
    type: 'topup' | 'adjustment';
    amount: number;
    description: string;
    status: 'pending' | 'verified' | 'rejected';
    image_bukti_transfer?: string; // Transfer proof image URL
    bank_account_id?: number; // Bank account ID for transfer
    bank_account?: { // Bank account details
        id: number;
        bank_name: string;
        account_number: string;
        account_name: string;
    };
    verified_by_id?: number;
    verified_at?: string;
    created_at: string;
}

export interface TopupRequest {
    type: 'pokok' | 'wajib' | 'sukarela';
    amount: number;
    description: string;
    image_bukti_transfer: string;
    bank_account_id?: number | string;
}

export interface BankAccount {
    id: number;
    ID?: number; // API might return ID instead of id
    bank_name: string;
    account_number: string;
    account_holder_name: string;
    account_name?: string; // Alternative field name
    description?: string;
    is_active: boolean;
    created_at?: string;
    CreatedAt?: string;
    updated_at?: string;
    UpdatedAt?: string;
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
    status: 'proses' | 'disetujui' | 'lunas' | 'macet' | 'ditolak';
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
    image_bukti_transfer?: string; // Transfer receipt image path
    no_rekening?: string; // Account number used for payment
    bank_name?: string; // Bank name used for payment
    pinjaman?: Loan;
    user?: User;
}

export interface InstallmentRequest {
    pinjaman_id: number;
    angsuran_ke?: number; // Optional, auto-generated if not provided
    pokok: number;
    bunga: number;
    denda?: number;
    image_bukti_transfer: string; // Required - path/URL to transfer receipt
    bank_account_id?: number | string; // Optional - bank account selection
    no_rekening?: string; // Optional - account number (if bank_account_id not provided)
    bank_name?: string; // Optional - bank name (if bank_account_id not provided)
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

// Transaction History & Reporting Types
export interface Transaction {
    id: number;
    user_id: number;
    transaction_type: 'SIMPANAN' | 'PINJAMAN' | 'ANGSURAN' | 'SHU';
    reference_table: string;
    reference_id: number;
    amount: number;
    balance_before: number;
    balance_after: number;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'VERIFIED';
    transaction_date: string;
    verified_by?: number;
    verified_at?: string;
    description: string;
    metadata?: string;
    user?: User;
    verified_by_user?: User;
}

export interface TransactionFilters {
    user_id?: number;
    transaction_type?: 'SIMPANAN' | 'PINJAMAN' | 'ANGSURAN' | 'SHU';
    status?: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'VERIFIED';
    start_date?: string;
    end_date?: string;
    min_amount?: number;
    max_amount?: number;
    limit?: number;
    offset?: number;
}

export interface TransactionHistoryResponse {
    message: string;
    data: Transaction[];
    total: number;
    limit: number;
    offset: number;
}

export interface FinancialSummary {
    total_simpanan: number;
    total_pinjaman: number;
    total_angsuran: number;
    total_shu: number;
    total_transactions: number;
    period_start: string;
    period_end: string;
}

export interface FinancialSummaryResponse {
    message: string;
    data: FinancialSummary;
}

export interface FinancialReportRequest {
    report_type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
    start_date: string;
    end_date: string;
}

export interface FinancialReport {
    report_type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
    period_start: string;
    period_end: string;
    generated_at: string;
    generated_by: number;
    summary: {
        total_simpanan: number;
        total_pinjaman: number;
        total_angsuran: number;
        total_shu: number;
        total_transactions: number;
    };
    transaction_count: number;
    type_breakdown: {
        SIMPANAN: number;
        PINJAMAN: number;
        ANGSURAN: number;
        SHU: number;
    };
    status_breakdown: {
        COMPLETED: number;
        PENDING: number;
        VERIFIED: number;
    };
    monthly_breakdown: { [key: string]: number };
}

export interface FinancialReportResponse {
    message: string;
    data: FinancialReport;
}