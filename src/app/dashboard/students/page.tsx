'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    GraduationCap,
    Plus,
    Search,
    Filter,
    ChevronRight,
    ChevronLeft,
    X,
    Edit,
    Trash2,
} from 'lucide-react';
import styles from './students.module.css';

interface Parent {
    id: number;
    name: string;
    phone: string | null;
}

interface Student {
    id: number;
    studentId: string;
    name: string;
    email: string | null;
    phone: string | null;
    grade: string | null;
    status: string;
    parent: Parent | null;
    _count: { participations: number };
}

interface ParentOption {
    id: number;
    name: string;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [parents, setParents] = useState<ParentOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [gradeFilter, setGradeFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '15' });
            if (search) params.set('search', search);
            if (gradeFilter) params.set('grade', gradeFilter);

            const res = await fetch(`/api/students?${params}`);
            const data = await res.json();
            setStudents(data.students || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    }, [page, search, gradeFilter]);

    const fetchParents = async () => {
        try {
            const res = await fetch('/api/parents?limit=100');
            const data = await res.json();
            setParents(data.parents || []);
        } catch (error) {
            console.error('Failed to fetch parents:', error);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    useEffect(() => {
        fetchParents();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;

        try {
            await fetch(`/api/students/${id}`, { method: 'DELETE' });
            fetchStudents();
        } catch (error) {
            console.error('Failed to delete student:', error);
        }
    };

    const grades = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر'];

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerIcon}>
                        <GraduationCap size={28} />
                    </div>
                    <div>
                        <h1 className={styles.title}>إدارة الطلاب</h1>
                        <p className={styles.subtitle}>إضافة ومتابعة بيانات الطلاب</p>
                    </div>
                </div>
                <button className={styles.addButton} onClick={() => { setEditingStudent(null); setShowModal(true); }}>
                    <Plus size={18} />
                    إضافة طالب
                </button>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.searchGroup}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="بحث بالاسم أو الرقم الطلابي..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <div className={styles.filterGroup}>
                    <Filter size={18} />
                    <select value={gradeFilter} onChange={(e) => { setGradeFilter(e.target.value); setPage(1); }}>
                        <option value="">جميع الصفوف</option>
                        {grades.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
            </div>

            {/* Students Table */}
            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.loader}></div>
                        <p>جاري التحميل...</p>
                    </div>
                ) : students.length === 0 ? (
                    <div className={styles.empty}>
                        <GraduationCap size={48} />
                        <h3>لا يوجد طلاب</h3>
                        <p>لم يتم إضافة طلاب بعد</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>الرقم الطلابي</th>
                                <th>الاسم</th>
                                <th>الصف</th>
                                <th>ولي الأمر</th>
                                <th>المشاركات</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student.id}>
                                    <td className={styles.studentId}>{student.studentId}</td>
                                    <td>
                                        <div className={styles.nameCell}>
                                            <div className={styles.avatar}>{student.name.charAt(0)}</div>
                                            <div>
                                                <span className={styles.name}>{student.name}</span>
                                                {student.email && <span className={styles.email}>{student.email}</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{student.grade || '-'}</td>
                                    <td>{student.parent?.name || '-'}</td>
                                    <td>
                                        <span className={styles.participationBadge}>
                                            {student._count.participations} نشاط
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button
                                                className={styles.editBtn}
                                                onClick={() => { setEditingStudent(student); setShowModal(true); }}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDelete(student.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                <StudentModal
                    student={editingStudent}
                    parents={parents}
                    grades={grades}
                    onClose={() => { setShowModal(false); setEditingStudent(null); }}
                    onSave={() => { setShowModal(false); setEditingStudent(null); fetchStudents(); }}
                />
            )}
        </div>
    );
}

interface ModalProps {
    student: Student | null;
    parents: ParentOption[];
    grades: string[];
    onClose: () => void;
    onSave: () => void;
}

function StudentModal({ student, parents, grades, onClose, onSave }: ModalProps) {
    const [form, setForm] = useState({
        studentId: student?.studentId || '',
        name: student?.name || '',
        email: student?.email || '',
        phone: student?.phone || '',
        grade: student?.grade || '',
        parentId: student?.parent?.id?.toString() || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.studentId || !form.name) {
            setError('الرقم الطلابي والاسم مطلوبان');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(student ? `/api/students/${student.id}` : '/api/students', {
                method: student ? 'PUT' : 'POST',
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
                    <h2>{student ? 'تعديل الطالب' : 'إضافة طالب جديد'}</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>الرقم الطلابي *</label>
                            <input
                                type="text"
                                value={form.studentId}
                                onChange={e => setForm({ ...form, studentId: e.target.value })}
                                placeholder="أدخل الرقم الطلابي"
                                required
                                disabled={!!student}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>الاسم الكامل *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                placeholder="أدخل اسم الطالب"
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>البريد الإلكتروني</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                placeholder="البريد الإلكتروني"
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
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>الصف الدراسي</label>
                            <select value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}>
                                <option value="">اختر الصف</option>
                                {grades.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>ولي الأمر</label>
                            <select value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })}>
                                <option value="">اختر ولي الأمر</option>
                                {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
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
