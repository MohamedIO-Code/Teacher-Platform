'use client';

import { useEffect, useState } from 'react';
import {
    User,
    ClipboardCheck,
    Star,
    MessageSquare,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    UserCheck,
    ThumbsUp,
    AlertTriangle,
    Info,
    TrendingUp,
} from 'lucide-react';
import styles from './page.module.css';

interface TeacherStats {
    teacher: {
        id: number;
        name: string;
        email: string | null;
        phone: string | null;
        employeeId: string;
        status: string;
        joinDate: string | null;
    };
    attendance: {
        present: number;
        absent: number;
        late: number;
        excused: number;
        todayStatus: string | null;
    };
    recentEvaluations: Array<{
        id: number;
        date: string;
        overallScore: number;
        comments: string | null;
        evaluator: { name: string };
    }>;
    recentNotes: Array<{
        id: number;
        type: string;
        content: string;
        createdAt: string;
        author: { name: string };
    }>;
}

interface Props {
    stats: TeacherStats;
    userName: string;
}

export default function TeacherDashboardClient({ stats, userName }: Props) {
    const [registering, setRegistering] = useState(false);
    const [attendanceStatus, setAttendanceStatus] = useState(stats.attendance.todayStatus);

    const handleRegisterAttendance = async () => {
        setRegistering(true);
        try {
            const now = new Date();
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selfRegister: true,
                    date: now.toISOString().split('T')[0],
                    checkIn: now.toISOString(),
                    status: 'present',
                }),
            });

            if (res.ok) {
                setAttendanceStatus('present');
            } else {
                const data = await res.json();
                alert(data.error || 'حدث خطأ في تسجيل الحضور');
            }
        } catch (error) {
            console.error('Failed to register attendance:', error);
            alert('حدث خطأ في الاتصال');
        } finally {
            setRegistering(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 8) return styles.scoreHigh;
        if (score >= 6) return styles.scoreMedium;
        return styles.scoreLow;
    };

    const getScoreLabel = (score: number) => {
        if (score >= 9) return 'ممتاز';
        if (score >= 8) return 'جيد جداً';
        if (score >= 7) return 'جيد';
        if (score >= 6) return 'مقبول';
        return 'ضعيف';
    };

    const getNoteTypeInfo = (type: string) => {
        const info: Record<string, { label: string; icon: React.ReactNode; class: string }> = {
            positive: { label: 'إيجابي', icon: <ThumbsUp size={14} />, class: 'typePositive' },
            needs_improvement: { label: 'يحتاج تطوير', icon: <TrendingUp size={14} />, class: 'typeImprovement' },
            warning: { label: 'تنبيه', icon: <AlertTriangle size={14} />, class: 'typeWarning' },
            info: { label: 'معلومة', icon: <Info size={14} />, class: 'typeInfo' },
        };
        return info[type] || info.info;
    };

    const totalAttendance = stats.attendance.present + stats.attendance.absent + stats.attendance.late + stats.attendance.excused;
    const attendanceRate = totalAttendance > 0
        ? Math.round(((stats.attendance.present + stats.attendance.late) / totalAttendance) * 100)
        : 0;

    return (
        <div className={styles.container}>
            {/* Welcome Section */}
            <div className={styles.welcome}>
                <div>
                    <h1 className={styles.welcomeTitle}>مرحباً، {userName} 👋</h1>
                    <p className={styles.welcomeSubtitle}>هذه لوحة تحكمك الشخصية</p>
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

            {/* Teacher Profile Card */}
            <div className={styles.teacherProfileCard}>
                <div className={styles.profileHeader}>
                    <div className={styles.profileAvatar}>
                        <User size={48} />
                    </div>
                    <div className={styles.profileInfo}>
                        <h2>{stats.teacher.name}</h2>
                        <p>الرقم الوظيفي: {stats.teacher.employeeId}</p>
                        {stats.teacher.email && <p>البريد: {stats.teacher.email}</p>}
                        {stats.teacher.phone && <p>الهاتف: {stats.teacher.phone}</p>}
                    </div>
                </div>

                {/* Quick Attendance Registration */}
                <div className={styles.attendanceAction}>
                    {attendanceStatus ? (
                        <div className={styles.attendanceRegistered}>
                            <CheckCircle size={24} />
                            <span>تم تسجيل حضورك اليوم ✓</span>
                        </div>
                    ) : (
                        <button
                            className={styles.registerAttendanceBtn}
                            onClick={handleRegisterAttendance}
                            disabled={registering}
                        >
                            <UserCheck size={20} />
                            {registering ? 'جاري التسجيل...' : 'تسجيل الحضور'}
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                        <ClipboardCheck size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <p className={styles.statValue}>{attendanceRate}%</p>
                        <p className={styles.statLabel}>نسبة الحضور</p>
                        <span className={`${styles.statChange} ${styles.neutral}`}>
                            {stats.attendance.present} يوم حضور
                        </span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconRed}`}>
                        <XCircle size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <p className={styles.statValue}>{stats.attendance.absent}</p>
                        <p className={styles.statLabel}>أيام الغياب</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconYellow}`}>
                        <Clock size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <p className={styles.statValue}>{stats.attendance.late}</p>
                        <p className={styles.statLabel}>أيام التأخير</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                        <AlertCircle size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <p className={styles.statValue}>{stats.attendance.excused}</p>
                        <p className={styles.statLabel}>أيام الإجازة</p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className={styles.contentGrid}>
                {/* Recent Evaluations */}
                <div className={styles.sectionCard}>
                    <h2 className={styles.sectionTitle}>
                        <Star size={20} />
                        آخر التقييمات
                    </h2>
                    {stats.recentEvaluations.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Star size={32} />
                            <p>لا توجد تقييمات بعد</p>
                        </div>
                    ) : (
                        <div className={styles.evaluationsList}>
                            {stats.recentEvaluations.map((evaluation) => (
                                <div key={evaluation.id} className={styles.evaluationItem}>
                                    <div className={styles.evaluationHeader}>
                                        <div className={`${styles.evaluationScore} ${getScoreColor(evaluation.overallScore)}`}>
                                            <Star size={16} />
                                            <span>{evaluation.overallScore.toFixed(1)}</span>
                                            <small>{getScoreLabel(evaluation.overallScore)}</small>
                                        </div>
                                        <span className={styles.evaluationDate}>
                                            <Calendar size={12} />
                                            {new Date(evaluation.date).toLocaleDateString('ar-SA')}
                                        </span>
                                    </div>
                                    {evaluation.comments && (
                                        <p className={styles.evaluationComment}>{evaluation.comments}</p>
                                    )}
                                    <span className={styles.evaluator}>المقيّم: {evaluation.evaluator.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Notes */}
                <div className={styles.sectionCard}>
                    <h2 className={styles.sectionTitle}>
                        <MessageSquare size={20} />
                        آخر الملاحظات
                    </h2>
                    {stats.recentNotes.length === 0 ? (
                        <div className={styles.emptyState}>
                            <MessageSquare size={32} />
                            <p>لا توجد ملاحظات بعد</p>
                        </div>
                    ) : (
                        <div className={styles.notesList}>
                            {stats.recentNotes.map((note) => {
                                const typeInfo = getNoteTypeInfo(note.type);
                                return (
                                    <div key={note.id} className={styles.noteItem}>
                                        <div className={styles.noteHeader}>
                                            <span className={`${styles.noteType} ${styles[typeInfo.class] || ''}`}>
                                                {typeInfo.icon}
                                                {typeInfo.label}
                                            </span>
                                            <span className={styles.noteDate}>
                                                <Calendar size={12} />
                                                {new Date(note.createdAt).toLocaleDateString('ar-SA')}
                                            </span>
                                        </div>
                                        <p className={styles.noteContent}>{note.content}</p>
                                        <span className={styles.noteAuthor}>الكاتب: {note.author.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
