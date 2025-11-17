export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(dateString: string): string {
    if (!dateString) {
        return 'Tanggal tidak tersedia';
    }

    try {
        const date = new Date(dateString);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            console.warn('Invalid date string:', dateString);
            return 'Tanggal tidak valid';
        }

        return date.toLocaleDateString("id-ID", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', dateString, error);
        return 'Format tanggal error';
    }
}

export function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function formatNumber(num: number): string {
    return new Intl.NumberFormat('id-ID').format(num);
}