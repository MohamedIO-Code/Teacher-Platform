'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
    ArrowRight,
    User,
    Mail,
    Phone,
    Building2,
    BookOpen,
    Calendar,
    Star,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    FileText,
    ClipboardList,
    Edit,
    ChevronLeft,
    ChevronRight,
    BookMarked,
    PlayCircle,
    LayoutGrid,
    Award,
} from 'lucide-react';
import styles from './teacherDetail.module.css';

interface Teacher {
    id: number;
    employeeId: string;
    name: string;
    email: string | null;
    phone: string | null;
    status: string;
    joinDate: string | null;
    department: { id: number; name: string } | null;
    subject: { id: number; name: string } | null;
    evaluations: Evaluation[];
    notes: Note[];
    attendances: Attendance[];
}

interface Evaluation {
    id: number;
    date: string;
    teachingQuality: number;
    punctuality: number;
    studentInteraction: number;
    curriculumAdherence: number;
    lessonPlanning: number;
    lessonPlanningNote: string | null;
    lessonExecution: number;
    lessonExecutionNote: string | null;
    classroomManagement: number;
    classroomManagementNote: string | null;
    professionalGrowth: number;
    professionalGrowthNote: string | null;
    overallScore: number;
    comments: string | null;
    evaluator: { name: string };
}

interface Note {
    id: number;
    type: string;
    content: string;
    createdAt: string;
    author: { name: string };
}

interface Attendance {
    id: number;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    status: string;
    notes: string | null;
}

interface Stats {
    avgScore: number | null;
    attendance: Record<string, number>;
    totalEvaluations: number;
    totalNotes: number;
}

export default function TeacherDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'evaluations' | 'attendance' | 'notes' | 'lessonPlanning' | 'lessonExecution' | 'classroomManagement' | 'professionalGrowth'>('evaluations');

    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                const res = await fetch(`/api/teachers/${id}`);
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || 'خطأ في جلب البيانات');
                    return;
                }

                setTeacher(data.teacher);
                setStats(data.stats);
            } catch {
                setError('خطأ في الاتصال');
            } finally {
                setLoading(false);
            }
        };

        fetchTeacher();
    }, [id]);

    const getStatusBadge = (status: string) => {
        const labels: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
            active: { label: 'نشط', class: 'badgeSuccess', icon: <CheckCircle2 size={14} /> },
            inactive: { label: 'غير نشط', class: 'badgeGray', icon: <XCircle size={14} /> },
            suspended: { label: 'موقوف', class: 'badgeError', icon: <AlertCircle size={14} /> },
        };
        return labels[status] || { label: status, class: 'badgeGray', icon: null };
    };

    const getAttendanceBadge = (status: string) => {
        const labels: Record<string, { label: string; class: string }> = {
            present: { label: 'حاضر', class: 'badgeSuccess' },
            absent: { label: 'غائب', class: 'badgeError' },
            late: { label: 'متأخر', class: 'badgeWarning' },
            excused: { label: 'إجازة', class: 'badgeInfo' },
        };
        return labels[status] || { label: status, class: 'badgeGray' };
    };

    const getNoteTypeBadge = (type: string) => {
        const labels: Record<string, { label: string; class: string }> = {
            positive: { label: 'إيجابي', class: 'badgeSuccess' },
            negative: { label: 'سلبي', class: 'badgeError' },
            improvement: { label: 'تحسين', class: 'badgeWarning' },
            general: { label: 'عام', class: 'badgeGray' },
        };
        return labels[type] || { label: type, class: 'badgeGray' };
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return '-';
        return new Date(timeStr).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>جاري تحميل البيانات...</p>
            </div>
        );
    }

    if (error || !teacher) {
        return (
            <div className={styles.errorContainer}>
                <AlertCircle size={48} />
                <h2>خطأ</h2>
                <p>{error || 'لم يتم العثور على المدرس'}</p>
                <Link href="/dashboard/teachers" className={styles.backLink}>
                    <ArrowRight size={18} />
                    العودة لقائمة المدرسين
                </Link>
            </div>
        );
    }

    const status = getStatusBadge(teacher.status);
    const totalAttendance = Object.values(stats?.attendance || {}).reduce((a, b) => a + b, 0);
    const presentCount = (stats?.attendance?.present || 0) + (stats?.attendance?.late || 0);
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    return (
        <div className={styles.container}>
            {/* Breadcrumb */}
            <div className={styles.breadcrumb}>
                <Link href="/dashboard/teachers">المدرسين</Link>
                <ChevronLeft size={16} />
                <span>{teacher.name}</span>
            </div>

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.teacherHeader}>
                    <div className={styles.avatar}>
                        {teacher.name.charAt(0)}
                    </div>
                    <div className={styles.teacherInfo}>
                        <h1 className={styles.teacherName}>{teacher.name}</h1>
                        <p className={styles.employeeId}>{teacher.employeeId}</p>
                        <span className={`${styles.badge} ${styles[status.class]}`}>
                            {status.icon}
                            {status.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconBlue}`}>
                        <Star size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>
                            {stats?.avgScore ? stats.avgScore.toFixed(1) : '-'}
                        </span>
                        <span className={styles.statLabel}>متوسط التقييم</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconGreen}`}>
                        <TrendingUp size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{attendanceRate}%</span>
                        <span className={styles.statLabel}>نسبة الحضور</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconPurple}`}>
                        <ClipboardList size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats?.totalEvaluations || 0}</span>
                        <span className={styles.statLabel}>التقييمات</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.iconOrange}`}>
                        <FileText size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{stats?.totalNotes || 0}</span>
                        <span className={styles.statLabel}>الملاحظات</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Info Card */}
                <div className={styles.infoCard}>
                    <h3 className={styles.cardTitle}>المعلومات الأساسية</h3>
                    <div className={styles.infoList}>
                        <div className={styles.infoItem}>
                            <User size={18} />
                            <span className={styles.infoLabel}>الرقم الوظيفي</span>
                            <span className={styles.infoValue}>{teacher.employeeId}</span>
                        </div>
                        {teacher.email && (
                            <div className={styles.infoItem}>
                                <Mail size={18} />
                                <span className={styles.infoLabel}>البريد الإلكتروني</span>
                                <span className={styles.infoValue}>{teacher.email}</span>
                            </div>
                        )}
                        {teacher.phone && (
                            <div className={styles.infoItem}>
                                <Phone size={18} />
                                <span className={styles.infoLabel}>رقم الهاتف</span>
                                <span className={styles.infoValue}>{teacher.phone}</span>
                            </div>
                        )}
                        {teacher.department && (
                            <div className={styles.infoItem}>
                                <Building2 size={18} />
                                <span className={styles.infoLabel}>القسم</span>
                                <span className={styles.infoValue}>{teacher.department.name}</span>
                            </div>
                        )}
                        {teacher.subject && (
                            <div className={styles.infoItem}>
                                <BookOpen size={18} />
                                <span className={styles.infoLabel}>المادة</span>
                                <span className={styles.infoValue}>{teacher.subject.name}</span>
                            </div>
                        )}
                        {teacher.joinDate && (
                            <div className={styles.infoItem}>
                                <Calendar size={18} />
                                <span className={styles.infoLabel}>تاريخ الالتحاق</span>
                                <span className={styles.infoValue}>{formatDate(teacher.joinDate)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Activity Tabs */}
                <div className={styles.activityCard}>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'evaluations' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('evaluations')}
                        >
                            <ClipboardList size={18} />
                            التقييمات
                            <span className={styles.tabCount}>{teacher.evaluations.length}</span>
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'attendance' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('attendance')}
                        >
                            <Clock size={18} />
                            الحضور
                            <span className={styles.tabCount}>{teacher.attendances.length}</span>
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'lessonPlanning' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('lessonPlanning')}
                        >
                            <BookMarked size={18} />
                            التخطيط
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'lessonExecution' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('lessonExecution')}
                        >
                            <PlayCircle size={18} />
                            التنفيذ
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'classroomManagement' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('classroomManagement')}
                        >
                            <LayoutGrid size={18} />
                            الإدارة
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'professionalGrowth' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('professionalGrowth')}
                        >
                            <Award size={18} />
                            النمو
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'notes' ? styles.tabActive : ''}`}
                            onClick={() => setActiveTab('notes')}
                        >
                            <FileText size={18} />
                            الملاحظات
                            <span className={styles.tabCount}>{teacher.notes.length}</span>
                        </button>
                    </div>

                    <div className={styles.tabContent}>
                        {activeTab === 'evaluations' && (
                            <div className={styles.evaluationsList}>
                                {teacher.evaluations.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <ClipboardList size={40} />
                                        <p>لا توجد تقييمات حتى الآن</p>
                                    </div>
                                ) : (
                                    teacher.evaluations.map((evaluation) => (
                                        <div key={evaluation.id} className={styles.evaluationItem}>
                                            <div className={styles.evaluationHeader}>
                                                <div className={styles.evaluationScore}>
                                                    <Star size={16} />
                                                    <span>{evaluation.overallScore.toFixed(1)}</span>
                                                </div>
                                                <span className={styles.evaluationDate}>
                                                    {formatDate(evaluation.date)}
                                                </span>
                                            </div>
                                            <div className={styles.evaluationScores}>
                                                <div className={styles.scoreItem}>
                                                    <span>جودة التدريس</span>
                                                    <div className={styles.scoreBar}>
                                                        <div
                                                            className={styles.scoreProgress}
                                                            style={{ width: `${evaluation.teachingQuality * 10}%` }}
                                                        />
                                                    </div>
                                                    <span>{evaluation.teachingQuality}</span>
                                                </div>
                                                <div className={styles.scoreItem}>
                                                    <span>الالتزام بالمواعيد</span>
                                                    <div className={styles.scoreBar}>
                                                        <div
                                                            className={styles.scoreProgress}
                                                            style={{ width: `${evaluation.punctuality * 10}%` }}
                                                        />
                                                    </div>
                                                    <span>{evaluation.punctuality}</span>
                                                </div>
                                                <div className={styles.scoreItem}>
                                                    <span>التفاعل مع الطلاب</span>
                                                    <div className={styles.scoreBar}>
                                                        <div
                                                            className={styles.scoreProgress}
                                                            style={{ width: `${evaluation.studentInteraction * 10}%` }}
                                                        />
                                                    </div>
                                                    <span>{evaluation.studentInteraction}</span>
                                                </div>
                                                <div className={styles.scoreItem}>
                                                    <span>الالتزام بالمنهج</span>
                                                    <div className={styles.scoreBar}>
                                                        <div
                                                            className={styles.scoreProgress}
                                                            style={{ width: `${evaluation.curriculumAdherence * 10}%` }}
                                                        />
                                                    </div>
                                                    <span>{evaluation.curriculumAdherence}</span>
                                                </div>
                                            </div>
                                            {evaluation.comments && (
                                                <p className={styles.evaluationComments}>{evaluation.comments}</p>
                                            )}
                                            <div className={styles.evaluatorInfo}>
                                                المقيّم: {evaluation.evaluator.name}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'attendance' && (
                            <div className={styles.attendanceList}>
                                {teacher.attendances.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <Clock size={40} />
                                        <p>لا توجد سجلات حضور</p>
                                    </div>
                                ) : (
                                    <table className={styles.attendanceTable}>
                                        <thead>
                                            <tr>
                                                <th>التاريخ</th>
                                                <th>الحالة</th>
                                                <th>وقت الحضور</th>
                                                <th>وقت الانصراف</th>
                                                <th>ملاحظات</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teacher.attendances.map((attendance) => {
                                                const attStatus = getAttendanceBadge(attendance.status);
                                                return (
                                                    <tr key={attendance.id}>
                                                        <td>{formatDate(attendance.date)}</td>
                                                        <td>
                                                            <span className={`${styles.badge} ${styles[attStatus.class]}`}>
                                                                {attStatus.label}
                                                            </span>
                                                        </td>
                                                        <td>{formatTime(attendance.checkIn)}</td>
                                                        <td>{formatTime(attendance.checkOut)}</td>
                                                        <td>{attendance.notes || '-'}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {activeTab === 'notes' && (
                            <div className={styles.notesList}>
                                {teacher.notes.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <FileText size={40} />
                                        <p>لا توجد ملاحظات</p>
                                    </div>
                                ) : (
                                    teacher.notes.map((note) => {
                                        const noteType = getNoteTypeBadge(note.type);
                                        return (
                                            <div key={note.id} className={styles.noteItem}>
                                                <div className={styles.noteHeader}>
                                                    <span className={`${styles.badge} ${styles[noteType.class]}`}>
                                                        {noteType.label}
                                                    </span>
                                                    <span className={styles.noteDate}>
                                                        {formatDate(note.createdAt)}
                                                    </span>
                                                </div>
                                                <p className={styles.noteContent}>{note.content}</p>
                                                <div className={styles.noteAuthor}>
                                                    الكاتب: {note.author.name}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {activeTab === 'lessonPlanning' && (
                            <div className={styles.criteriaResults}>
                                {teacher.evaluations.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <BookMarked size={40} />
                                        <p>لا توجد تقييمات لهذا المعيار حتى الآن</p>
                                    </div>
                                ) : (
                                    teacher.evaluations.map((evaluation) => (
                                        <div key={evaluation.id} className={styles.criteriaResultCard}>
                                            <div className={styles.criteriaResultHeader}>
                                                <span className={styles.criteriaScore}>{evaluation.lessonPlanning || 7}/10</span>
                                                <span className={styles.criteriaDate}>{formatDate(evaluation.date)}</span>
                                            </div>
                                            {evaluation.lessonPlanningNote && (
                                                <p className={styles.criteriaNote}>{evaluation.lessonPlanningNote}</p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'lessonExecution' && (
                            <div className={styles.criteriaResults}>
                                {teacher.evaluations.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <PlayCircle size={40} />
                                        <p>لا توجد تقييمات لهذا المعيار حتى الآن</p>
                                    </div>
                                ) : (
                                    teacher.evaluations.map((evaluation) => (
                                        <div key={evaluation.id} className={styles.criteriaResultCard}>
                                            <div className={styles.criteriaResultHeader}>
                                                <span className={styles.criteriaScore}>{evaluation.lessonExecution || 7}/10</span>
                                                <span className={styles.criteriaDate}>{formatDate(evaluation.date)}</span>
                                            </div>
                                            {evaluation.lessonExecutionNote && (
                                                <p className={styles.criteriaNote}>{evaluation.lessonExecutionNote}</p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'classroomManagement' && (
                            <div className={styles.criteriaResults}>
                                {teacher.evaluations.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <LayoutGrid size={40} />
                                        <p>لا توجد تقييمات لهذا المعيار حتى الآن</p>
                                    </div>
                                ) : (
                                    teacher.evaluations.map((evaluation) => (
                                        <div key={evaluation.id} className={styles.criteriaResultCard}>
                                            <div className={styles.criteriaResultHeader}>
                                                <span className={styles.criteriaScore}>{evaluation.classroomManagement || 7}/10</span>
                                                <span className={styles.criteriaDate}>{formatDate(evaluation.date)}</span>
                                            </div>
                                            {evaluation.classroomManagementNote && (
                                                <p className={styles.criteriaNote}>{evaluation.classroomManagementNote}</p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'professionalGrowth' && (
                            <div className={styles.criteriaResults}>
                                {teacher.evaluations.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <Award size={40} />
                                        <p>لا توجد تقييمات لهذا المعيار حتى الآن</p>
                                    </div>
                                ) : (
                                    teacher.evaluations.map((evaluation) => (
                                        <div key={evaluation.id} className={styles.criteriaResultCard}>
                                            <div className={styles.criteriaResultHeader}>
                                                <span className={styles.criteriaScore}>{evaluation.professionalGrowth || 7}/10</span>
                                                <span className={styles.criteriaDate}>{formatDate(evaluation.date)}</span>
                                            </div>
                                            {evaluation.professionalGrowthNote && (
                                                <p className={styles.criteriaNote}>{evaluation.professionalGrowthNote}</p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
