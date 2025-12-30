'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    ClipboardCheck,
    Star,
    MessageSquare,
    FileText,
    Bell,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    School,
    BookOpen,
    GraduationCap,
    UserCheck,
} from 'lucide-react';
import styles from './dashboard.module.css';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

// Navigation items with role-based access control
const navigation = [
    { name: 'لوحة التحكم', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'teacher', 'parent'] },
    { name: 'المدرسون', href: '/dashboard/teachers', icon: Users, roles: ['admin', 'manager'] },
    { name: 'أبنائي', href: '/dashboard/parent', icon: Users, roles: ['parent'] },
    { name: 'أنشطة اللغة العربية', href: '/dashboard/activities', icon: BookOpen, roles: ['admin', 'manager', 'teacher'] },
    { name: 'الحضور والانصراف', href: '/dashboard/attendance', icon: ClipboardCheck, roles: ['admin', 'manager', 'teacher'] },
    { name: 'التقييمات', href: '/dashboard/evaluations', icon: Star, roles: ['admin', 'manager', 'teacher'] },
    { name: 'الملاحظات', href: '/dashboard/notes', icon: MessageSquare, roles: ['admin', 'manager', 'teacher'] },
    { name: 'التقارير', href: '/dashboard/reports', icon: FileText, roles: ['admin', 'manager'] },
    { name: 'الإشعارات', href: '/dashboard/notifications', icon: Bell, roles: ['admin', 'manager', 'teacher', 'parent'] },
    { name: 'الإعدادات', href: '/dashboard/settings', icon: Settings, roles: ['admin'] },
];

// Filter navigation items based on user role
const getFilteredNavigation = (userRole: string) => {
    return navigation.filter(item => item.roles.includes(userRole));
};


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchUser();
        fetchNotificationCount();
    }, []);

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/session');
            const data = await res.json();
            if (data.authenticated) {
                setUser(data.user);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNotificationCount = async () => {
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            const notifications = data.notifications || [];
            const unread = notifications.filter((n: { isRead: boolean }) => !n.isRead).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            admin: 'مشرف',
            manager: 'إداري',
            teacher: 'مدرس',
        };
        return labels[role] || role;
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>جاري التحميل...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div className={styles.backdrop} onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <School size={24} />
                        </div>
                        <span className={styles.logoText}>منصة المدرسين</span>
                    </div>
                    <button
                        className={styles.closeSidebar}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className={styles.nav}>
                    {getFilteredNavigation(user?.role || 'teacher').map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon size={20} />
                                <span>{item.name}</span>
                                {isActive && <ChevronLeft size={16} className={styles.navArrow} />}
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                            {user?.name?.charAt(0) || 'م'}
                        </div>
                        <div className={styles.userDetails}>
                            <p className={styles.userName}>{user?.name || 'مستخدم'}</p>
                            <p className={styles.userRole}>{getRoleLabel(user?.role || '')}</p>
                        </div>
                    </div>
                    <button className={styles.logoutButton} onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className={styles.main}>
                {/* Header */}
                <header className={styles.header}>
                    <button
                        className={styles.menuButton}
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className={styles.headerContent}>
                        <div className={styles.searchWrapper}>
                            {/* Search can be added here */}
                        </div>

                        <div className={styles.headerActions}>
                            <Link href="/dashboard/notifications" className={styles.notificationButton}>
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className={styles.notificationBadge}>{unreadCount}</span>
                                )}
                            </Link>

                            <div className={styles.headerUser}>
                                <div className={styles.userAvatar}>
                                    {user?.name?.charAt(0) || 'م'}
                                </div>
                                <span className={styles.headerUserName}>{user?.name}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
}
