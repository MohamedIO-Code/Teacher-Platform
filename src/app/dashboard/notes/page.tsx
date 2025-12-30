'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    MessageSquare,
    Plus,
    Filter,
    ThumbsUp,
    AlertTriangle,
    Info,
    TrendingUp,
    ChevronRight,
    ChevronLeft,
    X,
    Calendar,
    User,
} from 'lucide-react';
import styles from './notes.module.css';

interface Note {
    id: number;
    teacherId: number;
    type: string;
    content: string;
    createdAt: string;
    teacher: { id: number; name: string; employeeId: string };
    author: { id: number; name: string };
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

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('');
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

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '20' });
            if (typeFilter) params.set('type', typeFilter);

            const res = await fetch(`/api/notes?${params}`);
            const data = await res.json();
            setNotes(data.notes);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        } finally {
            setLoading(false);
        }
    }, [page, typeFilter]);

    const fetchTeachers = async () => {
        try {
            const res = await fetch('/api/teachers?limit=100');
            const data = await res.json();
            setTeachers(data.teachers || []);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    useEffect(() => {
        fetchTeachers();
        fetchUser();
    }, []);

    const getTypeInfo = (type: string) => {
        const info: Record<string, { label: string; icon: React.ReactNode; class: string }> = {
            positive: { label: 'إيجابي', icon: <ThumbsUp size={16} />, class: 'typePositive' },
            needs_improvement: { label: 'يحتاج تطوير', icon: <TrendingUp size={16} />, class: 'typeImprovement' },
            warning: { label: 'تنبيه', icon: <AlertTriangle size={16} />, class: 'typeWarning' },
            info: { label: 'معلومة', icon: <Info size={16} />, class: 'typeInfo' },
        };
        return info[type] || info.info;
    };

    const isTeacher = user?.role === 'teacher';

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{isTeacher ? 'ملاحظاتي' : 'الملاحظات الإدارية'}</h1>
                    <p className={styles.subtitle}>
                        {isTeacher ? 'الملاحظات المسجلة على أدائك' : 'تسجيل ومتابعة الملاحظات على المدرسين'}
                    </p>
                </div>
                {!isTeacher && (
                    <button className={styles.addButton} onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        إضافة ملاحظة
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <Filter size={18} />
                    <select
                        value={typeFilter}
                        onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                        className={styles.filterSelect}
                    >
                        <option value="">جميع الأنواع</option>
                        <option value="positive">إيجابي</option>
                        <option value="needs_improvement">يحتاج تطوير</option>
                        <option value="warning">تنبيه</option>
                        <option value="info">معلومة</option>
                    </select>
                </div>
            </div>

            {/* Notes List */}
            <div className={styles.listCard}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.loader}></div>
                        <p>جاري التحميل...</p>
                    </div>
                ) : notes.length === 0 ? (
                    <div className={styles.empty}>
                        <MessageSquare size={48} />
                        <h3>لا توجد ملاحظات</h3>
                        <p>لم يتم إضافة ملاحظات بعد</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.list}>
                            {notes.map((note) => {
                                const typeInfo = getTypeInfo(note.type);
                                return (
                                    <div key={note.id} className={styles.noteItem}>
                                        <div className={`${styles.noteIcon} ${styles[typeInfo.class]}`}>
                                            {typeInfo.icon}
                                        </div>
                                        <div className={styles.noteContent}>
                                            <div className={styles.noteHeader}>
                                                <span className={styles.teacherName}>{note.teacher.name}</span>
                                                <span className={`${styles.typeBadge} ${styles[typeInfo.class]}`}>
                                                    {typeInfo.label}
                                                </span>
                                            </div>
                                            <p className={styles.noteText}>{note.content}</p>
                                            <div className={styles.noteMeta}>
                                                <span>
                                                    <User size={12} />
                                                    {note.author.name}
                                                </span>
                                                <span>
                                                    <Calendar size={12} />
                                                    {new Date(note.createdAt).toLocaleDateString('ar-SA', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

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
                    </>
                )}
            </div>

            {/* Add Modal */}
            {showModal && (
                <NoteModal
                    teachers={teachers}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); fetchNotes(); }}
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

function NoteModal({ teachers, onClose, onSave }: ModalProps) {
    const [form, setForm] = useState({
        teacherId: '',
        type: 'info',
        content: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.teacherId || !form.content) {
            setError('يرجى ملء جميع الحقول');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/notes', {
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

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>إضافة ملاحظة جديدة</h2>
                    <button className={styles.closeModal} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
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
                        <label>نوع الملاحظة</label>
                        <div className={styles.typeOptions}>
                            {[
                                { value: 'positive', label: 'إيجابي', icon: <ThumbsUp size={16} /> },
                                { value: 'needs_improvement', label: 'يحتاج تطوير', icon: <TrendingUp size={16} /> },
                                { value: 'warning', label: 'تنبيه', icon: <AlertTriangle size={16} /> },
                                { value: 'info', label: 'معلومة', icon: <Info size={16} /> },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`${styles.typeOption} ${form.type === option.value ? styles.typeSelected : ''} ${styles[`type${option.value.charAt(0).toUpperCase() + option.value.slice(1).replace('_', '')}`]}`}
                                    onClick={() => setForm({ ...form, type: option.value })}
                                >
                                    {option.icon}
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>الملاحظة *</label>
                        <textarea
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                            rows={4}
                            placeholder="اكتب الملاحظة هنا..."
                            required
                        />
                    </div>

                    {error && <div className={styles.formError}>{error}</div>}

                    <div className={styles.modalActions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            إلغاء
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'جاري الحفظ...' : 'حفظ الملاحظة'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
