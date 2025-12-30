'use client';

import { useState, useEffect, useCallback, use } from 'react';
import {
    ArrowRight,
    Calendar,
    Clock,
    MapPin,
    Users,
    Star,
    UserPlus,
    Edit,
    Trash2,
    X,
    CheckCircle,
    AlertCircle,
    User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './detail.module.css';

interface Evaluation {
    id: number;
    score: number;
    performance: string | null;
    strengths: string | null;
    improvements: string | null;
    comments: string | null;
    evaluator: { id: number; name: string };
}

interface Participation {
    id: number;
    role: string;
    status: string;
    notes: string | null;
    student: { id: number; name: string; studentId: string; grade: string | null } | null;
    teacher: { id: number; name: string; employeeId: string } | null;
    evaluations: Evaluation[];
}

interface Activity {
    id: number;
    title: string;
    description: string | null;
    date: string;
    endDate: string | null;
    time: string | null;
    location: string | null;
    status: string;
    maxParticipants: number | null;
    category: { id: number; name: string };
    teacher: { id: number; name: string; employeeId: string } | null;
    participations: Participation[];
}

interface Student {
    id: number;
    name: string;
    studentId: string;
    grade: string | null;
}

interface Teacher {
    id: number;
    name: string;
    employeeId: string;
}

export default function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [activity, setActivity] = useState<Activity | null>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [showParticipantModal, setShowParticipantModal] = useState(false);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
    const [selectedParticipation, setSelectedParticipation] = useState<Participation | null>(null);

    const fetchActivity = useCallback(async () => {
        try {
            const res = await fetch(`/api/activities/${resolvedParams.id}`);
            const data = await res.json();
            if (data.activity) {
                setActivity(data.activity);
            }
        } catch (error) {
            console.error('Failed to fetch activity:', error);
        } finally {
            setLoading(false);
        }
    }, [resolvedParams.id]);

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/students?limit=100');
            const data = await res.json();
            setStudents(data.students || []);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await fetch('/api/teachers?limit=100&status=active');
            const data = await res.json();
            setTeachers(data.teachers || []);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        }
    };

    useEffect(() => {
        fetchActivity();
        fetchStudents();
        fetchTeachers();
    }, [fetchActivity]);

    const handleDeleteActivity = async () => {
        if (!confirm('هل أنت متأكد من حذف هذا النشاط؟')) return;

        try {
            const res = await fetch(`/api/activities/${resolvedParams.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                router.push('/dashboard/activities');
            }
        } catch (error) {
            console.error('Failed to delete activity:', error);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/activities/${resolvedParams.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                fetchActivity();
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleRemoveParticipant = async (participationId: number) => {
        if (!confirm('هل أنت متأكد من إزالة هذا المشارك؟')) return;

        try {
            await fetch(`/api/participations?id=${participationId}`, {
                method: 'DELETE',
            });
            fetchActivity();
        } catch (error) {
            console.error('Failed to remove participant:', error);
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            upcoming: 'قادمة',
            ongoing: 'جارية',
            completed: 'منتهية',
            cancelled: 'ملغاة',
            registered: 'مسجل',
            attended: 'حضر',
            absent: 'غائب',
        };
        return labels[status] || status;
    };

    const getRoleLabel = (role: string) => {
        const labels: Record<string, string> = {
            participant: 'مشارك',
            organizer: 'منظم',
            presenter: 'مقدم',
            judge: 'محكم',
        };
        return labels[role] || role;
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.loader}></div>
                <p>جاري التحميل...</p>
            </div>
        );
    }

    if (!activity) {
        return (
            <div className={styles.notFound}>
                <AlertCircle size={48} />
                <h2>النشاط غير موجود</h2>
                <Link href="/dashboard/activities">العودة للأنشطة</Link>
            </div>
        );
    }

    const studentParticipants = activity.participations.filter(p => p.student);
    const teacherParticipants = activity.participations.filter(p => p.teacher);

    return (
        <div className={styles.container}>
            {/* Back Link */}
            <Link href="/dashboard/activities" className={styles.backLink}>
                <ArrowRight size={18} />
                العودة لقائمة الأنشطة
            </Link>

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <span className={styles.categoryBadge}>{activity.category.name}</span>
                    <h1>{activity.title}</h1>
                    {activity.description && <p>{activity.description}</p>}
                </div>
                <div className={styles.headerActions}>
                    <select
                        value={activity.status}
                        onChange={(e) => handleUpdateStatus(e.target.value)}
                        className={styles.statusSelect}
                    >
                        <option value="upcoming">قادمة</option>
                        <option value="ongoing">جارية</option>
                        <option value="completed">منتهية</option>
                        <option value="cancelled">ملغاة</option>
                    </select>
                    <button className={styles.deleteBtn} onClick={handleDeleteActivity}>
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Details Grid */}
            <div className={styles.detailsGrid}>
                <div className={styles.detailCard}>
                    <Calendar size={20} />
                    <div>
                        <span>التاريخ</span>
                        <strong>{new Date(activity.date).toLocaleDateString('ar-SA', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}</strong>
                    </div>
                </div>
                {activity.time && (
                    <div className={styles.detailCard}>
                        <Clock size={20} />
                        <div>
                            <span>الوقت</span>
                            <strong>{activity.time}</strong>
                        </div>
                    </div>
                )}
                {activity.location && (
                    <div className={styles.detailCard}>
                        <MapPin size={20} />
                        <div>
                            <span>المكان</span>
                            <strong>{activity.location}</strong>
                        </div>
                    </div>
                )}
                <div className={styles.detailCard}>
                    <Users size={20} />
                    <div>
                        <span>المشاركين</span>
                        <strong>{activity.participations.length} {activity.maxParticipants ? `/ ${activity.maxParticipants}` : ''}</strong>
                    </div>
                </div>
                {activity.teacher && (
                    <div className={styles.detailCard}>
                        <User size={20} />
                        <div>
                            <span>المسؤول</span>
                            <strong>{activity.teacher.name}</strong>
                        </div>
                    </div>
                )}
            </div>

            {/* Participants Section */}
            <div className={styles.participantsSection}>
                <div className={styles.sectionHeader}>
                    <h2>المشاركون</h2>
                    <button className={styles.addBtn} onClick={() => setShowParticipantModal(true)}>
                        <UserPlus size={18} />
                        إضافة مشارك
                    </button>
                </div>

                {/* Student Participants */}
                <div className={styles.participantGroup}>
                    <h3>الطلاب ({studentParticipants.length})</h3>
                    {studentParticipants.length === 0 ? (
                        <p className={styles.emptyText}>لم يتم تسجيل طلاب بعد</p>
                    ) : (
                        <div className={styles.participantsList}>
                            {studentParticipants.map((p) => (
                                <div key={p.id} className={styles.participantCard}>
                                    <div className={styles.participantInfo}>
                                        <div className={styles.avatar}>{p.student?.name.charAt(0)}</div>
                                        <div>
                                            <h4>{p.student?.name}</h4>
                                            <span>{p.student?.studentId} - {p.student?.grade}</span>
                                        </div>
                                    </div>
                                    <div className={styles.participantMeta}>
                                        <span className={styles.roleBadge}>{getRoleLabel(p.role)}</span>
                                        <span className={`${styles.statusBadge} ${styles[`status${p.status}`]}`}>
                                            {getStatusLabel(p.status)}
                                        </span>
                                    </div>
                                    <div className={styles.participantActions}>
                                        <button
                                            className={styles.evalBtn}
                                            onClick={() => { setSelectedParticipation(p); setShowEvaluationModal(true); }}
                                        >
                                            <Star size={16} />
                                            {p.evaluations.length > 0 ? `${p.evaluations[0].score}/10` : 'تقييم'}
                                        </button>
                                        <button
                                            className={styles.removeBtn}
                                            onClick={() => handleRemoveParticipant(p.id)}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Teacher Participants */}
                <div className={styles.participantGroup}>
                    <h3>المدرسون ({teacherParticipants.length})</h3>
                    {teacherParticipants.length === 0 ? (
                        <p className={styles.emptyText}>لم يتم تسجيل مدرسين بعد</p>
                    ) : (
                        <div className={styles.participantsList}>
                            {teacherParticipants.map((p) => (
                                <div key={p.id} className={styles.participantCard}>
                                    <div className={styles.participantInfo}>
                                        <div className={styles.avatarTeacher}>{p.teacher?.name.charAt(0)}</div>
                                        <div>
                                            <h4>{p.teacher?.name}</h4>
                                            <span>{p.teacher?.employeeId}</span>
                                        </div>
                                    </div>
                                    <div className={styles.participantMeta}>
                                        <span className={styles.roleBadge}>{getRoleLabel(p.role)}</span>
                                        <span className={`${styles.statusBadge} ${styles[`status${p.status}`]}`}>
                                            {getStatusLabel(p.status)}
                                        </span>
                                    </div>
                                    <div className={styles.participantActions}>
                                        <button
                                            className={styles.evalBtn}
                                            onClick={() => { setSelectedParticipation(p); setShowEvaluationModal(true); }}
                                        >
                                            <Star size={16} />
                                            {p.evaluations.length > 0 ? `${p.evaluations[0].score}/10` : 'تقييم'}
                                        </button>
                                        <button
                                            className={styles.removeBtn}
                                            onClick={() => handleRemoveParticipant(p.id)}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Participant Modal */}
            {showParticipantModal && (
                <AddParticipantModal
                    activityId={activity.id}
                    students={students}
                    teachers={teachers}
                    existingStudentIds={studentParticipants.map(p => p.student?.id).filter(Boolean) as number[]}
                    existingTeacherIds={teacherParticipants.map(p => p.teacher?.id).filter(Boolean) as number[]}
                    onClose={() => setShowParticipantModal(false)}
                    onSave={() => { setShowParticipantModal(false); fetchActivity(); }}
                />
            )}

            {/* Evaluation Modal */}
            {showEvaluationModal && selectedParticipation && (
                <EvaluationModal
                    participation={selectedParticipation}
                    onClose={() => { setShowEvaluationModal(false); setSelectedParticipation(null); }}
                    onSave={() => { setShowEvaluationModal(false); setSelectedParticipation(null); fetchActivity(); }}
                />
            )}
        </div>
    );
}

interface AddParticipantModalProps {
    activityId: number;
    students: Student[];
    teachers: Teacher[];
    existingStudentIds: number[];
    existingTeacherIds: number[];
    onClose: () => void;
    onSave: () => void;
}

function AddParticipantModal({ activityId, students, teachers, existingStudentIds, existingTeacherIds, onClose, onSave }: AddParticipantModalProps) {
    const [participantType, setParticipantType] = useState<'student' | 'teacher'>('student');
    const [selectedId, setSelectedId] = useState('');
    const [role, setRole] = useState('participant');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const availableStudents = students.filter(s => !existingStudentIds.includes(s.id));
    const availableTeachers = teachers.filter(t => !existingTeacherIds.includes(t.id));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedId) {
            setError('يرجى اختيار المشارك');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/participations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    activityId,
                    [participantType === 'student' ? 'studentId' : 'teacherId']: selectedId,
                    role,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'حدث خطأ');
                return;
            }

            onSave();
        } catch {
            setError('حدث خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>إضافة مشارك</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label>نوع المشارك</label>
                        <div className={styles.radioGroup}>
                            <label>
                                <input
                                    type="radio"
                                    checked={participantType === 'student'}
                                    onChange={() => { setParticipantType('student'); setSelectedId(''); }}
                                />
                                طالب
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    checked={participantType === 'teacher'}
                                    onChange={() => { setParticipantType('teacher'); setSelectedId(''); }}
                                />
                                مدرس
                            </label>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>اختر {participantType === 'student' ? 'الطالب' : 'المدرس'}</label>
                        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} required>
                            <option value="">اختر...</option>
                            {participantType === 'student' ? (
                                availableStudents.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} - {s.studentId}</option>
                                ))
                            ) : (
                                availableTeachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} - {t.employeeId}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>الدور</label>
                        <select value={role} onChange={e => setRole(e.target.value)}>
                            <option value="participant">مشارك</option>
                            <option value="organizer">منظم</option>
                            <option value="presenter">مقدم</option>
                            <option value="judge">محكم</option>
                        </select>
                    </div>

                    {error && <div className={styles.formError}>{error}</div>}

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>إلغاء</button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'جاري الإضافة...' : 'إضافة'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

interface EvaluationModalProps {
    participation: Participation;
    onClose: () => void;
    onSave: () => void;
}

function EvaluationModal({ participation, onClose, onSave }: EvaluationModalProps) {
    const existingEval = participation.evaluations[0];
    const [form, setForm] = useState({
        score: existingEval?.score || 7,
        performance: existingEval?.performance || '',
        strengths: existingEval?.strengths || '',
        improvements: existingEval?.improvements || '',
        comments: existingEval?.comments || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const participantName = participation.student?.name || participation.teacher?.name || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/activity-evaluations', {
                method: existingEval ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: existingEval?.id,
                    participationId: participation.id,
                    ...form,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'حدث خطأ');
                return;
            }

            onSave();
        } catch {
            setError('حدث خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>تقييم {participantName}</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label>التقييم (1-10)</label>
                        <div className={styles.scoreInput}>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={form.score}
                                onChange={e => setForm({ ...form, score: parseInt(e.target.value) })}
                            />
                            <span className={styles.scoreValue}>{form.score}/10</span>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>مستوى الأداء</label>
                        <select value={form.performance} onChange={e => setForm({ ...form, performance: e.target.value })}>
                            <option value="">اختر...</option>
                            <option value="ممتاز">ممتاز</option>
                            <option value="جيد جداً">جيد جداً</option>
                            <option value="جيد">جيد</option>
                            <option value="مقبول">مقبول</option>
                            <option value="ضعيف">ضعيف</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>نقاط القوة</label>
                        <textarea
                            value={form.strengths}
                            onChange={e => setForm({ ...form, strengths: e.target.value })}
                            rows={2}
                            placeholder="أذكر نقاط القوة..."
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>نقاط التحسين</label>
                        <textarea
                            value={form.improvements}
                            onChange={e => setForm({ ...form, improvements: e.target.value })}
                            rows={2}
                            placeholder="أذكر نقاط التحسين..."
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>ملاحظات إضافية</label>
                        <textarea
                            value={form.comments}
                            onChange={e => setForm({ ...form, comments: e.target.value })}
                            rows={2}
                            placeholder="ملاحظات..."
                        />
                    </div>

                    {error && <div className={styles.formError}>{error}</div>}

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>إلغاء</button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'جاري الحفظ...' : 'حفظ التقييم'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
