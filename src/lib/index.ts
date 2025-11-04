// place files you want to import through the `$lib` alias in this folder.

// Export error handling utilities
export { extractErrorMessage, isErrorResponse } from './errorUtils';

// Export notification system
export {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
} from './stores/notifications';
