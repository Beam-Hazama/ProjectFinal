/**
 * Notification Utility
 * Handles browser notifications and sound alerts.
 */

// Simple base64 encoded notification sound (a subtle ping)
const NOTIFICATION_SOUND_URL = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTlvT19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX19fX18=";

export const playNotificationSound = () => {
    try {
        const audio = new Audio(NOTIFICATION_SOUND_URL);
        audio.volume = 0.5;
        audio.play().catch(e => console.warn("Audio play prevented by browser:", e));
    } catch (err) {
        console.error("Error playing notification sound:", err);
    }
};

export const showBrowserNotification = async (title, body, options = {}) => {
    if (!("Notification" in window)) {
        console.warn("Notifications not supported in this browser");
        return;
    }

    if (Notification.permission === "granted") {
        const notification = new Notification(title, {
            body: body,
            icon: options.icon || '/vite.svg',
            ...options
        });

        playNotificationSound();

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        return notification;
    } else {
        console.warn("Notification permission not granted");
    }
};

export const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return "unsupported";
    
    const permission = await Notification.requestPermission();
    return permission;
};
