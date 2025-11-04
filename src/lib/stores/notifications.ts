import { writable } from 'svelte/store';

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    duration?: number;
    dismissible?: boolean;
}

export const notifications = writable<Notification[]>([]);

let notificationId = 0;

export function addNotification(notification: Omit<Notification, 'id'>) {
    const id = `notification-${++notificationId}`;
    const newNotification: Notification = {
        id,
        duration: 5000, // 5 seconds default
        dismissible: true,
        ...notification
    };

    notifications.update(items => [...items, newNotification]);

    // Auto-remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
            removeNotification(id);
        }, newNotification.duration);
    }

    return id;
}

export function removeNotification(id: string) {
    notifications.update(items => items.filter(item => item.id !== id));
}

export function clearAllNotifications() {
    notifications.set([]);
}

// Convenience functions
export function showSuccess(message: string, title?: string, duration?: number) {
    return addNotification({ type: 'success', message, title, duration });
}

export function showError(message: string, title?: string, duration?: number) {
    return addNotification({ type: 'error', message, title, duration });
}

export function showWarning(message: string, title?: string, duration?: number) {
    return addNotification({ type: 'warning', message, title, duration });
}

export function showInfo(message: string, title?: string, duration?: number) {
    return addNotification({ type: 'info', message, title, duration });
}