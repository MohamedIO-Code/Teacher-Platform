'use client';

import {
    Users,
    ClipboardCheck,
    Star,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Clock,
    UserMinus,
    CheckCircle,
    XCircle,
    ArrowLeft,
    Award,
} from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

interface DashboardStats {
    totalTeachers: number;
    attendanceRate: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
    avgEvaluationScore: number;
    totalEvaluations: number;
    monthlyEvaluations: number;
    monthlyStats: {
        present: number;
        absent: number;
        late: number;
        excused: number;
    };
    alerts: { type: string; message: string; count: number }[];
    recentActivity: { id: number; action: string; entity: string; userName: string; createdAt: string }[];
    weeklyData: { date: string; present: number; absent: number }[];
    departmentStats: { name: string; count: number }[];
}

interface Props {
    stats: DashboardStats;
    userName: string;
}

export default function DashboardClient({ stats, userName }: Props) {
    const getActionLabel = (action: string) => {
        const labels: Record<string, string> = {
            login: 'تسجيل دخول',
            logout: 'تسجيل خروج',
            create: 'إنشاء',
            update: 'تعديل',
            delete: 'حذف',
            export: 'تصدير',
        };
        return labels[action] || action;
    };

    const getEntityLabel = (entity: string) => {
        const labels: Record<string, string> = {
            user: 'مستخدم',
            teacher: 'مدرس',
            attendance: 'حضور',
            evaluation: 'تقييم',
            note: 'ملاحظة',
            report: 'تقرير',
        };
        return labels[entity] || entity;
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'error':
                return <XCircle size={18} />;
            case 'warning':
                return <AlertTriangle size={18} />;
            default:
                return <Clock size={18} />;
        }
    };

    const maxAttendance = Math.max(...stats.weeklyData.map(d => d.present + d.absent), 1);

    return (
        <div className={styles.container}>
            {/* Welcome Slide - Dr. Hussein Abu Hamdan */}
            <div className={styles.welcomeSlide}>
                <div className={styles.slideContent}>
                    <div className={styles.slideInfo}>
                        <div className={styles.slideLabel}>
                            <Award size={16} />
                            عضو لجنة التحكيم
                        </div>
                        <h2 className={styles.slideName}>الدكتور حسين أبو حمدان</h2>
                        <p className={styles.slideTitle}>عضو لجنة تحكيم الوظيفة</p>
                        <p className={styles.slideDescription}>
                            نتشرف بوجود الدكتور حسين أبو حمدان كعضو في لجنة التحكيم،
                            حيث يساهم بخبرته الواسعة في مجال التعليم والتقييم التربوي
                            في تطوير معايير الأداء وضمان جودة العملية التعليمية.
                        </p>
                    </div>
                    <div className={styles.slideBadge}>
                        <Award size={48} className={styles.badgeIcon} />
                    </div>
                </div>
            </div>

            {/* Welcome Section */}
            <div className={styles.welcome}>
                <div>
                    <h1 className={styles.welcomeTitle}>مرحباً، {userName} 👋</h1>
                    <p className={styles.welcomeSubtitle}>إليك نظرة سريعة على أداء المدرسين اليوم</p>
                </div>
                <div className={styles.dateInfo}>
                    <p className={styles.currentDate}>
                        {new Date().toLocaleDateString('ar-SA', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                        <Users size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <p className={styles.statValue}>{stats.totalTeachers}</p>
                        <p className={styles.statLabel}>إجمالي المدرسين</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                        <ClipboardCheck size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <p className={styles.statValue}>{stats.attendanceRate}%</p>
                        <p className={styles.statLabel}>نسبة الحضور اليوم</p>
                        <span className={`${styles.statChange} ${stats.attendanceRate >= 80 ? styles.positive : styles.negative}`}>
                            {stats.attendanceRate >= 80 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {stats.presentToday} حاضر
                        </span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconYellow}`}>
                        <Star size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <p className={styles.statValue}>{stats.avgEvaluationScore}</p>
                        <p className={styles.statLabel}>متوسط التقييم</p>
                        <span className={`${styles.statChange} ${stats.avgEvaluationScore >= 7 ? styles.positive : styles.negative}`}>
                            من 10 درجات
                        </span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                        <CheckCircle size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <p className={styles.statValue}>{stats.monthlyEvaluations}</p>
                        <p className={styles.statLabel}>تقييمات هذا الشهر</p>
                        <span className={`${styles.statChange} ${styles.neutral}`}>
                            من {stats.totalEvaluations} إجمالي
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className={styles.contentGrid}>
                {/* Alerts Section */}
                {stats.alerts.length > 0 && (
                    <div className={styles.alertsSection}>
                        <h2 className={styles.sectionTitle}>
                            <AlertTriangle size={20} />
                            تنبيهات تحتاج انتباهك
                        </h2>
                        <div className={styles.alertsList}>
                            {stats.alerts.map((alert, index) => (
                                <div key={index} className={`${styles.alert} ${styles[`alert${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}`]}`}>
                                    {getAlertIcon(alert.type)}
                                    <span className={styles.alertCount}>{alert.count}</span>
                                    <span className={styles.alertMessage}>{alert.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Weekly Attendance Chart */}
                <div className={styles.chartSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <ClipboardCheck size={20} />
                            الحضور خلال الأسبوع
                        </h2>
                        <Link href="/dashboard/attendance" className={styles.sectionLink}>
                            عرض التفاصيل
                            <ArrowLeft size={16} />
                        </Link>
                    </div>
                    <div className={styles.chartContainer}>
                        <div className={styles.barChart}>
                            {stats.weeklyData.map((day, index) => (
                                <div key={index} className={styles.barGroup}>
                                    <div className={styles.barStack}>
                                        <div
                                            className={`${styles.bar} ${styles.barPresent}`}
                                            style={{ height: `${(day.present / maxAttendance) * 100}%` }}
                                            title={`حاضر: ${day.present}`}
                                        ></div>
                                        <div
                                            className={`${styles.bar} ${styles.barAbsent}`}
                                            style={{ height: `${(day.absent / maxAttendance) * 100}%` }}
                                            title={`غائب: ${day.absent}`}
                                        ></div>
                                    </div>
                                    <span className={styles.barLabel}>{day.date}</span>
                                </div>
                            ))}
                        </div>
                        <div className={styles.chartLegend}>
                            <span className={styles.legendItem}>
                                <span className={`${styles.legendDot} ${styles.dotPresent}`}></span>
                                حاضر
                            </span>
                            <span className={styles.legendItem}>
                                <span className={`${styles.legendDot} ${styles.dotAbsent}`}></span>
                                غائب
                            </span>
                        </div>
                    </div>
                </div>

                {/* Today's Status */}
                <div className={styles.todaySection}>
                    <h2 className={styles.sectionTitle}>
                        <Clock size={20} />
                        حالة اليوم
                    </h2>
                    <div className={styles.todayGrid}>
                        <div className={`${styles.todayItem} ${styles.itemPresent}`}>
                            <CheckCircle size={20} />
                            <div>
                                <p className={styles.todayValue}>{stats.presentToday}</p>
                                <p className={styles.todayLabel}>حاضر</p>
                            </div>
                        </div>
                        <div className={`${styles.todayItem} ${styles.itemAbsent}`}>
                            <UserMinus size={20} />
                            <div>
                                <p className={styles.todayValue}>{stats.absentToday}</p>
                                <p className={styles.todayLabel}>غائب</p>
                            </div>
                        </div>
                        <div className={`${styles.todayItem} ${styles.itemLate}`}>
                            <Clock size={20} />
                            <div>
                                <p className={styles.todayValue}>{stats.lateToday}</p>
                                <p className={styles.todayLabel}>متأخر</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Departments Distribution */}
                <div className={styles.departmentsSection}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            <Users size={20} />
                            توزيع المدرسين
                        </h2>
                        <Link href="/dashboard/teachers" className={styles.sectionLink}>
                            عرض الكل
                            <ArrowLeft size={16} />
                        </Link>
                    </div>
                    <div className={styles.departmentsList}>
                        {stats.departmentStats.map((dept, index) => (
                            <div key={index} className={styles.departmentItem}>
                                <div className={styles.departmentInfo}>
                                    <span className={styles.departmentName}>{dept.name}</span>
                                    <span className={styles.departmentCount}>{dept.count} مدرس</span>
                                </div>
                                <div className={styles.departmentBar}>
                                    <div
                                        className={styles.departmentProgress}
                                        style={{ width: `${(dept.count / stats.totalTeachers) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className={styles.activitySection}>
                    <h2 className={styles.sectionTitle}>
                        <Clock size={20} />
                        آخر النشاطات
                    </h2>
                    <div className={styles.activityList}>
                        {stats.recentActivity.map((activity) => (
                            <div key={activity.id} className={styles.activityItem}>
                                <div className={styles.activityDot}></div>
                                <div className={styles.activityContent}>
                                    <p className={styles.activityText}>
                                        <strong>{activity.userName}</strong> قام بـ {getActionLabel(activity.action)} {getEntityLabel(activity.entity)}
                                    </p>
                                    <p className={styles.activityTime}>
                                        {new Date(activity.createdAt).toLocaleString('ar-SA', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            day: 'numeric',
                                            month: 'short',
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
