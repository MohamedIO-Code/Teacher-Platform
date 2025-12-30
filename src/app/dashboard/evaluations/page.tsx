'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Star,
    Plus,
    Filter,
    Calendar,
    ChevronRight,
    ChevronLeft,
    X,
    User,
} from 'lucide-react';
import styles from './evaluations.module.css';

interface Evaluation {
    id: number;
    teacherId: number;
    date: string;
    teachingQuality: number;
    punctuality: number;
    studentInteraction: number;
    curriculumAdherence: number;
    lessonPlanning: number;
    lessonExecution: number;
    classroomManagement: number;
    professionalGrowth: number;
    overallScore: number;
    comments: string | null;
    teacher: { id: number; name: string; employeeId: string };
    evaluator: { id: number; name: string };
}

interface Teacher {
    id: number;
    name: string;
    employeeId: string;
}

interface User {
    id: number;
    name: string;
    role: string;
}

export default function EvaluationsPage() {
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [teacherFilter, setTeacherFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/session');
            const data = await res.json();
            if (data.authenticated) {
                setUser(data.user);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    const fetchEvaluations = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '15' });
            if (teacherFilter) params.set('teacherId', teacherFilter);

            const res = await fetch(`/api/evaluations?${params}`);
            const data = await res.json();
            setEvaluations(data.evaluations);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error('Failed to fetch evaluations:', error);
        } finally {
            setLoading(false);
        }
    }, [page, teacherFilter]);

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
        fetchEvaluations();
    }, [fetchEvaluations]);

    useEffect(() => {
        fetchTeachers();
        fetchUser();
    }, []);

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

    const isTeacher = user?.role === 'teacher';

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{isTeacher ? 'تقييماتي' : 'تقييمات الأداء'}</h1>
                    <p className={styles.subtitle}>
                        {isTeacher ? 'سجل تقييمات أدائك وتطورك المهني' : 'تقييم ومتابعة أداء المدرسين'}
                    </p>
                </div>
                {!isTeacher && (
                    <button className={styles.addButton} onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        تقييم جديد
                    </button>
                )}
            </div>

            {/* Filters */}
            {!isTeacher && (
                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <Filter size={18} />
                        <select
                            value={teacherFilter}
                            onChange={(e) => { setTeacherFilter(e.target.value); setPage(1); }}
                            className={styles.filterSelect}
                        >
                            <option value="">جميع المدرسين</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Evaluations Grid */}
            <div className={styles.gridContainer}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.loader}></div>
                        <p>جاري التحميل...</p>
                    </div>
                ) : evaluations.length === 0 ? (
                    <div className={styles.empty}>
                        <Star size={48} />
                        <h3>لا توجد تقييمات</h3>
                        <p>لم يتم إضافة تقييمات بعد</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {evaluations.map((evaluation) => (
                            <div key={evaluation.id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.teacherInfo}>
                                        <div className={styles.avatar}>
                                            {evaluation.teacher.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className={styles.teacherName}>{evaluation.teacher.name}</p>
                                            <p className={styles.teacherId}>{evaluation.teacher.employeeId}</p>
                                        </div>
                                    </div>
                                    <div className={`${styles.overallScore} ${getScoreColor(evaluation.overallScore)}`}>
                                        <Star size={18} />
                                        <span>{evaluation.overallScore.toFixed(1)}</span>
                                        <small>{getScoreLabel(evaluation.overallScore)}</small>
                                    </div>
                                </div>

                                <div className={styles.scores}>
                                    <div className={styles.scoreItem}>
                                        <span className={styles.scoreLabel}>التخطيط والإعداد للدرس</span>
                                        <div className={styles.scoreBar}>
                                            <div
                                                className={styles.scoreProgress}
                                                style={{ width: `${(evaluation.lessonPlanning || 0) * 10}%` }}
                                            ></div>
                                        </div>
                                        <span className={styles.scoreValue}>{evaluation.lessonPlanning || 0}/10</span>
                                    </div>
                                    <div className={styles.scoreItem}>
                                        <span className={styles.scoreLabel}>تنفيذ الدرس والتدريس</span>
                                        <div className={styles.scoreBar}>
                                            <div
                                                className={styles.scoreProgress}
                                                style={{ width: `${(evaluation.lessonExecution || 0) * 10}%` }}
                                            ></div>
                                        </div>
                                        <span className={styles.scoreValue}>{evaluation.lessonExecution || 0}/10</span>
                                    </div>
                                    <div className={styles.scoreItem}>
                                        <span className={styles.scoreLabel}>إدارة الصف والبيئة التعليمية</span>
                                        <div className={styles.scoreBar}>
                                            <div
                                                className={styles.scoreProgress}
                                                style={{ width: `${(evaluation.classroomManagement || 0) * 10}%` }}
                                            ></div>
                                        </div>
                                        <span className={styles.scoreValue}>{evaluation.classroomManagement || 0}/10</span>
                                    </div>
                                    <div className={styles.scoreItem}>
                                        <span className={styles.scoreLabel}>النمو المهني والمهنية</span>
                                        <div className={styles.scoreBar}>
                                            <div
                                                className={styles.scoreProgress}
                                                style={{ width: `${(evaluation.professionalGrowth || 0) * 10}%` }}
                                            ></div>
                                        </div>
                                        <span className={styles.scoreValue}>{evaluation.professionalGrowth || 0}/10</span>
                                    </div>
                                </div>

                                {evaluation.comments && (
                                    <div className={styles.comments}>
                                        <p>{evaluation.comments}</p>
                                    </div>
                                )}

                                <div className={styles.cardFooter}>
                                    <span className={styles.date}>
                                        <Calendar size={14} />
                                        {new Date(evaluation.date).toLocaleDateString('ar-SA')}
                                    </span>
                                    <span className={styles.evaluator}>
                                        <User size={14} />
                                        {evaluation.evaluator.name}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button
                            className={styles.pageBtn}
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronRight size={18} />
                            السابق
                        </button>
                        <span className={styles.pageInfo}>
                            صفحة {page} من {totalPages}
                        </span>
                        <button
                            className={styles.pageBtn}
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            التالي
                            <ChevronLeft size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showModal && (
                <EvaluationModal
                    teachers={teachers}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); fetchEvaluations(); }}
                />
            )}
        </div>
    );
}

interface ModalProps {
    teachers: Teacher[];
    onClose: () => void;
    onSave: () => void;
}

function EvaluationModal({ teachers, onClose, onSave }: ModalProps) {
    const [form, setForm] = useState({
        teacherId: '',
        date: new Date().toISOString().split('T')[0],
        // المعايير القديمة
        teachingQuality: 7,
        punctuality: 7,
        studentInteraction: 7,
        curriculumAdherence: 7,
        // المعايير الجديدة
        lessonPlanning: 7,
        lessonExecution: 7,
        classroomManagement: 7,
        professionalGrowth: 7,
        // ملاحظات لكل معيار
        lessonPlanningNote: '',
        lessonExecutionNote: '',
        classroomManagementNote: '',
        professionalGrowthNote: '',
        comments: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.teacherId) {
            setError('يرجى اختيار المدرس');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/evaluations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
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

    const oldScore = (form.teachingQuality + form.punctuality + form.studentInteraction + form.curriculumAdherence) / 4;
    const newScore = (form.lessonPlanning + form.lessonExecution + form.classroomManagement + form.professionalGrowth) / 4;
    const overallScore = (oldScore + newScore) / 2;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>تقييم جديد</h2>
                    <button className={styles.closeModal} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>المدرس *</label>
                            <select
                                value={form.teacherId}
                                onChange={e => setForm({ ...form, teacherId: e.target.value })}
                                required
                            >
                                <option value="">اختر المدرس</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>التاريخ *</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <h3 className={styles.sectionTitle}>معايير الأداء الأساسية</h3>
                    <div className={styles.scoreInputs}>
                        <div className={styles.scoreInput}>
                            <label>جودة التدريس</label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={form.teachingQuality}
                                onChange={e => setForm({ ...form, teachingQuality: parseInt(e.target.value) })}
                            />
                            <span>{form.teachingQuality}/10</span>
                        </div>
                        <div className={styles.scoreInput}>
                            <label>الالتزام بالمواعيد</label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={form.punctuality}
                                onChange={e => setForm({ ...form, punctuality: parseInt(e.target.value) })}
                            />
                            <span>{form.punctuality}/10</span>
                        </div>
                        <div className={styles.scoreInput}>
                            <label>التفاعل مع الطلاب</label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={form.studentInteraction}
                                onChange={e => setForm({ ...form, studentInteraction: parseInt(e.target.value) })}
                            />
                            <span>{form.studentInteraction}/10</span>
                        </div>
                        <div className={styles.scoreInput}>
                            <label>الالتزام بالمنهج</label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={form.curriculumAdherence}
                                onChange={e => setForm({ ...form, curriculumAdherence: parseInt(e.target.value) })}
                            />
                            <span>{form.curriculumAdherence}/10</span>
                        </div>
                    </div>

                    <h3 className={styles.sectionTitle}>معايير التقييم التفصيلية</h3>
                    <div className={styles.scoreInputs}>
                        <div className={styles.scoreInputWithNote}>
                            <div className={styles.scoreInput}>
                                <label>التخطيط والإعداد للدرس</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={form.lessonPlanning}
                                    onChange={e => setForm({ ...form, lessonPlanning: parseInt(e.target.value) })}
                                />
                                <span>{form.lessonPlanning}/10</span>
                            </div>
                            <input
                                type="text"
                                className={styles.noteInput}
                                placeholder="ملاحظة على التخطيط..."
                                value={form.lessonPlanningNote}
                                onChange={e => setForm({ ...form, lessonPlanningNote: e.target.value })}
                            />
                        </div>
                        <div className={styles.scoreInputWithNote}>
                            <div className={styles.scoreInput}>
                                <label>تنفيذ الدرس والتدريس</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={form.lessonExecution}
                                    onChange={e => setForm({ ...form, lessonExecution: parseInt(e.target.value) })}
                                />
                                <span>{form.lessonExecution}/10</span>
                            </div>
                            <input
                                type="text"
                                className={styles.noteInput}
                                placeholder="ملاحظة على التنفيذ..."
                                value={form.lessonExecutionNote}
                                onChange={e => setForm({ ...form, lessonExecutionNote: e.target.value })}
                            />
                        </div>
                        <div className={styles.scoreInputWithNote}>
                            <div className={styles.scoreInput}>
                                <label>إدارة الصف والبيئة التعليمية</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={form.classroomManagement}
                                    onChange={e => setForm({ ...form, classroomManagement: parseInt(e.target.value) })}
                                />
                                <span>{form.classroomManagement}/10</span>
                            </div>
                            <input
                                type="text"
                                className={styles.noteInput}
                                placeholder="ملاحظة على الإدارة..."
                                value={form.classroomManagementNote}
                                onChange={e => setForm({ ...form, classroomManagementNote: e.target.value })}
                            />
                        </div>
                        <div className={styles.scoreInputWithNote}>
                            <div className={styles.scoreInput}>
                                <label>النمو المهني والمهنية</label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={form.professionalGrowth}
                                    onChange={e => setForm({ ...form, professionalGrowth: parseInt(e.target.value) })}
                                />
                                <span>{form.professionalGrowth}/10</span>
                            </div>
                            <input
                                type="text"
                                className={styles.noteInput}
                                placeholder="ملاحظة على النمو المهني..."
                                value={form.professionalGrowthNote}
                                onChange={e => setForm({ ...form, professionalGrowthNote: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className={styles.overallPreview}>
                        <span>المتوسط العام:</span>
                        <strong>{overallScore.toFixed(1)}</strong>
                    </div>

                    <div className={styles.formGroup}>
                        <label>ملاحظات عامة</label>
                        <textarea
                            value={form.comments}
                            onChange={e => setForm({ ...form, comments: e.target.value })}
                            rows={3}
                            placeholder="أضف ملاحظاتك العامة هنا..."
                        />
                    </div>

                    {error && <div className={styles.formError}>{error}</div>}

                    <div className={styles.modalActions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            إلغاء
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'جاري الحفظ...' : 'حفظ التقييم'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
