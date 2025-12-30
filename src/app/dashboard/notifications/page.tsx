'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, CheckCheck, Trash2, Clock, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import styles from './notifications.module.css';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (id: number) => {
        try {
            await fetch(`/api/notifications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isRead: true }),
            });
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/mark-all-read', { method: 'POST' });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle size={18} />;
            case 'warning':
                return <AlertTriangle size={18} />;
            case 'alert':
                return <AlertTriangle size={18} />;
            default:
                return <Info size={18} />;
        }
    };

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>الإشعارات</h1>
                    <p className={styles.subtitle}>
                        {unreadCount > 0 ? `لديك ${unreadCount} إشعارات غير مقروءة` : 'جميع الإشعارات مقروءة'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button className={styles.markAllBtn} onClick={markAllAsRead}>
                        <CheckCheck size={18} />
                        تحديد الكل كمقروء
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <button
                    className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
                    onClick={() => setFilter('all')}
                >
                    الكل ({notifications.length})
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === 'unread' ? styles.active : ''}`}
                    onClick={() => setFilter('unread')}
                >
                    غير مقروء ({unreadCount})
                </button>
            </div>

            {/* Notifications List */}
            <div className={styles.listCard}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.loader}></div>
                        <p>جاري التحميل...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className={styles.empty}>
                        <Bell size={48} />
                        <h3>لا توجد إشعارات</h3>
                        <p>ستظهر الإشعارات الجديدة هنا</p>
                    </div>
                ) : (
                    <div className={styles.list}>
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
                                onClick={() => !notification.isRead && markAsRead(notification.id)}
                            >
                                <div className={`${styles.notificationIcon} ${styles[`type${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}`]}`}>
                                    {getTypeIcon(notification.type)}
                                </div>
                                <div className={styles.notificationContent}>
                                    <div className={styles.notificationHeader}>
                                        <h3 className={styles.notificationTitle}>{notification.title}</h3>
                                        {!notification.isRead && <span className={styles.unreadDot}></span>}
                                    </div>
                                    <p className={styles.notificationMessage}>{notification.message}</p>
                                    <span className={styles.notificationTime}>
                                        <Clock size={12} />
                                        {new Date(notification.createdAt).toLocaleString('ar-SA', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                <div className={styles.actions}>
                                    {!notification.isRead && (
                                        <button
                                            className={styles.actionBtn}
                                            onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                                            title="تحديد كمقروء"
                                        >
                                            <Check size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
