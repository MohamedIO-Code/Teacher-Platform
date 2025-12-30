'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    BookOpen,
    Calendar,
    Star,
    User,
    Clock,
    MapPin,
    Trophy,
    LogOut,
    Eye,
    ChevronLeft,
} from 'lucide-react';
import styles from './portal.module.css';

interface Evaluation {
    id: number;
    score: number;
    performance: string | null;
    strengths: string | null;
    comments: string | null;
}

interface Participation {
    id: number;
    role: string;
    status: string;
    activity: {
        id: number;
        title: string;
        date: string;
        time: string | null;
        location: string | null;
        status: string;
        category: { name: string };
    };
    evaluations: Evaluation[];
}

interface Student {
    id: number;
    name: string;
    studentId: string;
    grade: string | null;
    participations: Participation[];
}

interface ParentData {
    id: number;
    name: string;
    email: string;
    students: Student[];
}

function ParentPortalContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [parent, setParent] = useState<ParentData | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    const fetchParentData = useCallback(async () => {
        const parentId = searchParams.get('id');
        if (!parentId) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`/api/parent-portal?parentId=${parentId}`);
            const data = await res.json();

            if (data.parent) {
                setParent(data.parent);
                if (data.parent.students.length > 0) {
                    setSelectedStudent(data.parent.students[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch parent data:', error);
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        fetchParentData();
    }, [fetchParentData]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);

        try {
            const res = await fetch('/api/parent-portal/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginForm),
            });

            const data = await res.json();
            if (!res.ok) {
                setLoginError(data.error || 'بيانات الدخول غير صحيحة');
                return;
            }

            router.push(`/parent-portal?id=${data.parent.id}`);
        } catch {
            setLoginError('حدث خطأ في الاتصال');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = () => {
        router.push('/parent-portal');
        setParent(null);
        setSelectedStudent(null);
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            upcoming: 'قادمة',
            ongoing: 'جارية',
            completed: 'منتهية',
            registered: 'مسجل',
            attended: 'حضر',
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.loader}></div>
                <p>جاري التحميل...</p>
            </div>
        );
    }

    // Login Form
    if (!parent) {
        return (
            <div className={styles.loginContainer}>
                <div className={styles.loginCard}>
                    <div className={styles.loginHeader}>
                        <div className={styles.loginIcon}>
                            <User size={32} />
                        </div>
                        <h1>بوابة أولياء الأمور</h1>
                        <p>تابع أنشطة ومشاركات أبنائك</p>
                    </div>

                    <form onSubmit={handleLogin} className={styles.loginForm}>
                        <div className={styles.formGroup}>
                            <label>البريد الإلكتروني</label>
                            <input
                                type="email"
                                value={loginForm.email}
                                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                                placeholder="أدخل البريد الإلكتروني"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>كلمة المرور</label>
                            <input
                                type="password"
                                value={loginForm.password}
                                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                                placeholder="أدخل كلمة المرور"
                                required
                            />
                        </div>

                        {loginError && <div className={styles.formError}>{loginError}</div>}

                        <button type="submit" className={styles.loginBtn} disabled={loginLoading}>
                            {loginLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Parent Dashboard
    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1>مرحباً، {parent.name}</h1>
                    <p>بوابة متابعة أنشطة الأبناء</p>
                </div>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    <LogOut size={18} />
                    تسجيل الخروج
                </button>
            </div>

            {/* Student Selector */}
            {parent.students.length > 1 && (
                <div className={styles.studentSelector}>
                    {parent.students.map((student) => (
                        <button
                            key={student.id}
                            className={`${styles.studentTab} ${selectedStudent?.id === student.id ? styles.studentTabActive : ''}`}
                            onClick={() => setSelectedStudent(student)}
                        >
                            <div className={styles.studentAvatar}>{student.name.charAt(0)}</div>
                            <div>
                                <span className={styles.studentName}>{student.name}</span>
                                <span className={styles.studentGrade}>{student.grade || student.studentId}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Selected Student Info */}
            {selectedStudent && (
                <>
                    <div className={styles.studentInfo}>
                        <div className={styles.studentInfoCard}>
                            <div className={styles.bigAvatar}>{selectedStudent.name.charAt(0)}</div>
                            <div>
                                <h2>{selectedStudent.name}</h2>
                                <p>الرقم الطلابي: {selectedStudent.studentId}</p>
                                {selectedStudent.grade && <span>الصف: {selectedStudent.grade}</span>}
                            </div>
                        </div>
                        <div className={styles.statsCards}>
                            <div className={styles.statCard}>
                                <Trophy size={24} />
                                <div>
                                    <span className={styles.statValue}>{selectedStudent.participations.length}</span>
                                    <span className={styles.statLabel}>إجمالي المشاركات</span>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <Star size={24} />
                                <div>
                                    <span className={styles.statValue}>
                                        {selectedStudent.participations.filter(p => p.evaluations.length > 0).length}
                                    </span>
                                    <span className={styles.statLabel}>مشاركات مقيّمة</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activities List */}
                    <div className={styles.activitiesSection}>
                        <h3>
                            <BookOpen size={20} />
                            الأنشطة والمشاركات
                        </h3>

                        {selectedStudent.participations.length === 0 ? (
                            <div className={styles.empty}>
                                <BookOpen size={48} />
                                <h4>لا توجد مشاركات</h4>
                                <p>لم يتم تسجيل مشاركات بعد</p>
                            </div>
                        ) : (
                            <div className={styles.activitiesList}>
                                {selectedStudent.participations.map((participation) => (
                                    <div key={participation.id} className={styles.activityCard}>
                                        <div className={styles.activityHeader}>
                                            <span className={styles.categoryBadge}>
                                                {participation.activity.category.name}
                                            </span>
                                            <span className={`${styles.statusBadge} ${styles[`status${participation.activity.status}`]}`}>
                                                {getStatusLabel(participation.activity.status)}
                                            </span>
                                        </div>

                                        <h4>{participation.activity.title}</h4>

                                        <div className={styles.activityMeta}>
                                            <div className={styles.metaItem}>
                                                <Calendar size={16} />
                                                {new Date(participation.activity.date).toLocaleDateString('ar-SA')}
                                            </div>
                                            {participation.activity.time && (
                                                <div className={styles.metaItem}>
                                                    <Clock size={16} />
                                                    {participation.activity.time}
                                                </div>
                                            )}
                                            {participation.activity.location && (
                                                <div className={styles.metaItem}>
                                                    <MapPin size={16} />
                                                    {participation.activity.location}
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.participationInfo}>
                                            <span className={styles.roleBadge}>
                                                {participation.role === 'participant' ? 'مشارك' : participation.role}
                                            </span>
                                            <span className={`${styles.participationStatus} ${styles[`pstatus${participation.status}`]}`}>
                                                {getStatusLabel(participation.status)}
                                            </span>
                                        </div>

                                        {/* Evaluation */}
                                        {participation.evaluations.length > 0 && (
                                            <div className={styles.evaluation}>
                                                <div className={styles.evalHeader}>
                                                    <Star size={18} />
                                                    <span>التقييم</span>
                                                    <span className={styles.evalScore}>
                                                        {participation.evaluations[0].score}/10
                                                    </span>
                                                </div>
                                                {participation.evaluations[0].performance && (
                                                    <p className={styles.evalPerformance}>
                                                        الأداء: {participation.evaluations[0].performance}
                                                    </p>
                                                )}
                                                {participation.evaluations[0].strengths && (
                                                    <p className={styles.evalStrengths}>
                                                        نقاط القوة: {participation.evaluations[0].strengths}
                                                    </p>
                                                )}
                                                {participation.evaluations[0].comments && (
                                                    <p className={styles.evalComments}>
                                                        ملاحظات: {participation.evaluations[0].comments}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function ParentPortalFallback() {
    return (
        <div className={styles.loading}>
            <div className={styles.loader}></div>
            <p>جاري التحميل...</p>
        </div>
    );
}

export default function ParentPortalPage() {
    return (
        <Suspense fallback={<ParentPortalFallback />}>
            <ParentPortalContent />
        </Suspense>
    );
}
