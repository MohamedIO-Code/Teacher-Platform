'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    UserCheck,
    Plus,
    Search,
    ChevronRight,
    ChevronLeft,
    X,
    Edit,
    Trash2,
    Users,
} from 'lucide-react';
import styles from './parents.module.css';

interface Student {
    id: number;
    name: string;
    studentId: string;
    grade: string | null;
}

interface Parent {
    id: number;
    email: string;
    name: string;
    phone: string | null;
    isActive: boolean;
    students: Student[];
}

export default function ParentsPage() {
    const [parents, setParents] = useState<Parent[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editingParent, setEditingParent] = useState<Parent | null>(null);

    const fetchParents = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '15' });
            if (search) params.set('search', search);

            const res = await fetch(`/api/parents?${params}`);
            const data = await res.json();
            setParents(data.parents || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch parents:', error);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchParents();
    }, [fetchParents]);

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف ولي الأمر هذا؟')) return;

        try {
            await fetch(`/api/parents/${id}`, { method: 'DELETE' });
            fetchParents();
        } catch (error) {
            console.error('Failed to delete parent:', error);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerIcon}>
                        <UserCheck size={28} />
                    </div>
                    <div>
                        <h1 className={styles.title}>أولياء الأمور</h1>
                        <p className={styles.subtitle}>إدارة حسابات أولياء الأمور</p>
                    </div>
                </div>
                <button className={styles.addButton} onClick={() => { setEditingParent(null); setShowModal(true); }}>
                    <Plus size={18} />
                    إضافة ولي أمر
                </button>
            </div>

            {/* Search */}
            <div className={styles.filters}>
                <div className={styles.searchGroup}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="بحث بالاسم أو البريد الإلكتروني..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            {/* Parents List */}
            <div className={styles.listContainer}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.loader}></div>
                        <p>جاري التحميل...</p>
                    </div>
                ) : parents.length === 0 ? (
                    <div className={styles.empty}>
                        <UserCheck size={48} />
                        <h3>لا يوجد أولياء أمور</h3>
                        <p>لم يتم إضافة أولياء أمور بعد</p>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {parents.map((parent) => (
                            <div key={parent.id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.avatar}>{parent.name.charAt(0)}</div>
                                    <div className={styles.info}>
                                        <h3>{parent.name}</h3>
                                        <p>{parent.email}</p>
                                        {parent.phone && <span>{parent.phone}</span>}
                                    </div>
                                    <div className={styles.actions}>
                                        <button
                                            className={styles.editBtn}
                                            onClick={() => { setEditingParent(parent); setShowModal(true); }}
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDelete(parent.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.studentsSection}>
                                    <div className={styles.studentsHeader}>
                                        <Users size={16} />
                                        <span>الأبناء ({parent.students.length})</span>
                                    </div>
                                    {parent.students.length === 0 ? (
                                        <p className={styles.noStudents}>لا يوجد أبناء مسجلين</p>
                                    ) : (
                                        <div className={styles.studentsList}>
                                            {parent.students.map((student) => (
                                                <div key={student.id} className={styles.studentItem}>
                                                    <span className={styles.studentName}>{student.name}</span>
                                                    <span className={styles.studentGrade}>{student.grade || student.studentId}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                            <ChevronRight size={18} />
                            السابق
                        </button>
                        <span>صفحة {page} من {totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                            التالي
                            <ChevronLeft size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <ParentModal
                    parent={editingParent}
                    onClose={() => { setShowModal(false); setEditingParent(null); }}
                    onSave={() => { setShowModal(false); setEditingParent(null); fetchParents(); }}
                />
            )}
        </div>
    );
}

interface ModalProps {
    parent: Parent | null;
    onClose: () => void;
    onSave: () => void;
}

function ParentModal({ parent, onClose, onSave }: ModalProps) {
    const [form, setForm] = useState({
        name: parent?.name || '',
        email: parent?.email || '',
        phone: parent?.phone || '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email) {
            setError('الاسم والبريد الإلكتروني مطلوبان');
            return;
        }
        if (!parent && !form.password) {
            setError('كلمة المرور مطلوبة للحسابات الجديدة');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const body = { ...form };
            if (!form.password && parent) {
                delete (body as { password?: string }).password;
            }

            const res = await fetch(parent ? `/api/parents/${parent.id}` : '/api/parents', {
                method: parent ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
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
                    <h2>{parent ? 'تعديل ولي الأمر' : 'إضافة ولي أمر جديد'}</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label>الاسم الكامل *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="أدخل اسم ولي الأمر"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>البريد الإلكتروني *</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            placeholder="البريد الإلكتروني"
                            required
                            disabled={!!parent}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>رقم الهاتف</label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                            placeholder="رقم الهاتف"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{parent ? 'كلمة المرور (اتركها فارغة للإبقاء)' : 'كلمة المرور *'}</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            placeholder="كلمة المرور"
                            required={!parent}
                        />
                    </div>

                    {error && <div className={styles.formError}>{error}</div>}

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>إلغاء</button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
