import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatDateTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        present: '#10b981',
        absent: '#ef4444',
        late: '#f59e0b',
        excused: '#6366f1',
        active: '#10b981',
        inactive: '#6b7280',
        suspended: '#ef4444',
        positive: '#10b981',
        needs_improvement: '#f59e0b',
        warning: '#ef4444',
        info: '#3b82f6',
    };
    return colors[status] || '#6b7280';
}

export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        present: 'حاضر',
        absent: 'غائب',
        late: 'متأخر',
        excused: 'إجازة',
        active: 'نشط',
        inactive: 'غير نشط',
        suspended: 'موقوف',
        positive: 'إيجابي',
        needs_improvement: 'يحتاج تطوير',
        warning: 'تنبيه',
        info: 'معلومة',
    };
    return labels[status] || status;
}

export function getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
        admin: 'مشرف',
        manager: 'إداري',
        teacher: 'مدرس',
    };
    return labels[role] || role;
}

export function calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

export function getScoreGrade(score: number): { label: string; color: string } {
    if (score >= 9) return { label: 'ممتاز', color: '#10b981' };
    if (score >= 8) return { label: 'جيد جداً', color: '#3b82f6' };
    if (score >= 7) return { label: 'جيد', color: '#6366f1' };
    if (score >= 6) return { label: 'مقبول', color: '#f59e0b' };
    return { label: 'ضعيف', color: '#ef4444' };
}
