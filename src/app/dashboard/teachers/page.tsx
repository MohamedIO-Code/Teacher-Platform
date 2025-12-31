'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Search,
    Plus,
    Filter,
    Users,
    Star,
    Eye,
    Edit,
    MoreVertical,
    ChevronRight,
    ChevronLeft,
    X,
    Trash2,
} from 'lucide-react';
import styles from './teachers.module.css';

interface Teacher {
    id: number;
    employeeId: string;
    name: string;
    email: string | null;
    phone: string | null;
    status: string;
    department: { id: number; name: string } | null;
    subject: { id: number; name: string } | null;
    avgScore: number | null;
    _count: {
        evaluations: number;
        attendances: number;
        notes: number;
    };
}

interface Department {
    id: number;
    name: string;
}

interface Subject {
    id: number;
    name: string;
}

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

    const fetchTeachers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
            });
            if (search) params.set('search', search);
            if (statusFilter) params.set('status', statusFilter);
            if (departmentFilter) params.set('departmentId', departmentFilter);

            const res = await fetch(`/api/teachers?${params}`);
            const data = await res.json();
            setTeachers(data.teachers);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter, departmentFilter]);

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/departments');
            const data = await res.json();
            setDepartments(data.departments || []);
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await fetch('/api/subjects');
            const data = await res.json();
            setSubjects(data.subjects || []);
        } catch (error) {
            console.error('Failed to fetch subjects:', error);
        }
    };

    const handleDeleteTeacher = async (teacherId: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا المدرس؟')) return;
        try {
            const res = await fetch(`/api/teachers/${teacherId}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                fetchTeachers();
                setActionMenuOpen(null);
            } else {
                alert(data.error || 'فشل في حذف المدرس');
                setActionMenuOpen(null);
            }
        } catch (error) {
            console.error('Failed to delete teacher:', error);
            alert('حدث خطأ في الحذف');
            setActionMenuOpen(null);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);

    useEffect(() => {
        fetchDepartments();
        fetchSubjects();
    }, []);

    const getStatusBadge = (status: string) => {
        const labels: Record<string, { label: string; class: string }> = {
            active: { label: 'نشط', class: 'badgeSuccess' },
            inactive: { label: 'غير نشط', class: 'badgeGray' },
            suspended: { label: 'موقوف', class: 'badgeError' },
        };
        return labels[status] || { label: status, class: 'badgeGray' };
    };

    const getScoreColor = (score: number | null) => {
        if (score === null) return '';
        if (score >= 8) return styles.scoreHigh;
        if (score >= 6) return styles.scoreMedium;
        return styles.scoreLow;
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>إدارة المدرسين</h1>
                    <p className={styles.subtitle}>عرض وإدارة بيانات المدرسين في المنظومة</p>
                </div>
                <button
                    className={styles.addButton}
                    onClick={() => { setEditingTeacher(null); setShowModal(true); }}
                >
                    <Plus size={18} />
                    إضافة مدرس
                </button>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="بحث بالاسم أو الرقم الوظيفي..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className={styles.searchInput}
                    />
                    {search && (
                        <button className={styles.clearSearch} onClick={() => setSearch('')}>
                            <X size={16} />
                        </button>
                    )}
                </div>

                <div className={styles.filterGroup}>
                    <Filter size={18} />
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className={styles.filterSelect}
                    >
                        <option value="">جميع الحالات</option>
                        <option value="active">نشط</option>
                        <option value="inactive">غير نشط</option>
                        <option value="suspended">موقوف</option>
                    </select>

                    <select
                        value={departmentFilter}
                        onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
                        className={styles.filterSelect}
                    >
                        <option value="">جميع الأقسام</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className={styles.tableCard}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.loader}></div>
                        <p>جاري التحميل...</p>
                    </div>
                ) : teachers.length === 0 ? (
                    <div className={styles.empty}>
                        <Users size={48} />
                        <h3>لا يوجد مدرسين</h3>
                        <p>لم يتم العثور على مدرسين بناءً على معايير البحث</p>
                    </div>
                ) : (
                    <>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>المدرس</th>
                                    <th>القسم</th>
                                    <th>المادة</th>
                                    <th>التقييم</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.map((teacher) => {
                                    const status = getStatusBadge(teacher.status);
                                    return (
                                        <tr key={teacher.id}>
                                            <td>
                                                <div className={styles.teacherInfo}>
                                                    <div className={styles.avatar}>
                                                        {teacher.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className={styles.teacherName}>{teacher.name}</p>
                                                        <p className={styles.teacherId}>{teacher.employeeId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{teacher.department?.name || '-'}</td>
                                            <td>{teacher.subject?.name || '-'}</td>
                                            <td>
                                                {teacher.avgScore !== null ? (
                                                    <div className={`${styles.score} ${getScoreColor(teacher.avgScore)}`}>
                                                        <Star size={14} />
                                                        {teacher.avgScore}
                                                    </div>
                                                ) : (
                                                    <span className={styles.noScore}>-</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`${styles.badge} ${styles[status.class]}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <Link href={`/dashboard/teachers/${teacher.id}`} className={styles.actionBtn}>
                                                        <Eye size={16} />
                                                    </Link>
                                                    <button
                                                        className={styles.actionBtn}
                                                        onClick={() => { setEditingTeacher(teacher); setShowModal(true); }}
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <div className={styles.actionDropdown}>
                                                        <button
                                                            className={styles.actionBtn}
                                                            onClick={() => setActionMenuOpen(actionMenuOpen === teacher.id ? null : teacher.id)}
                                                        >
                                                            <MoreVertical size={16} />
                                                        </button>
                                                        {actionMenuOpen === teacher.id && (
                                                            <div className={styles.dropdownMenu}>
                                                                <button
                                                                    className={styles.dropdownItem}
                                                                    onClick={() => handleDeleteTeacher(teacher.id)}
                                                                >
                                                                    <Trash2 size={14} />
                                                                    حذف المدرس
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Pagination */}
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
                    </>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <TeacherModal
                    teacher={editingTeacher}
                    departments={departments}
                    subjects={subjects}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); fetchTeachers(); }}
                />
            )}
        </div>
    );
}

interface TeacherModalProps {
    teacher: Teacher | null;
    departments: Department[];
    subjects: Subject[];
    onClose: () => void;
    onSave: () => void;
}

function TeacherModal({ teacher, departments, subjects, onClose, onSave }: TeacherModalProps) {
    const [form, setForm] = useState({
        employeeId: teacher?.employeeId || '',
        name: teacher?.name || '',
        email: teacher?.email || '',
        phone: teacher?.phone || '',
        departmentId: teacher?.department?.id?.toString() || '',
        subjectId: teacher?.subject?.id?.toString() || '',
        status: teacher?.status || 'active',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = teacher ? `/api/teachers/${teacher.id}` : '/api/teachers';
            const method = teacher ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
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
                    <h2>{teacher ? 'تعديل بيانات المدرس' : 'إضافة مدرس جديد'}</h2>
                    <button className={styles.closeModal} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>الرقم الوظيفي *</label>
                            <input
                                type="text"
                                value={form.employeeId}
                                onChange={e => setForm({ ...form, employeeId: e.target.value })}
                                required
                                disabled={!!teacher}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>الاسم الكامل *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>البريد الإلكتروني</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>رقم الهاتف</label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>القسم</label>
                            <select
                                value={form.departmentId}
                                onChange={e => setForm({ ...form, departmentId: e.target.value })}
                            >
                                <option value="">اختر القسم</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>المادة</label>
                            <select
                                value={form.subjectId}
                                onChange={e => setForm({ ...form, subjectId: e.target.value })}
                            >
                                <option value="">اختر المادة</option>
                                {subjects.map(subj => (
                                    <option key={subj.id} value={subj.id}>{subj.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>الحالة</label>
                            <select
                                value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value })}
                            >
                                <option value="active">نشط</option>
                                <option value="inactive">غير نشط</option>
                                <option value="suspended">موقوف</option>
                            </select>
                        </div>
                    </div>

                    {error && <div className={styles.formError}>{error}</div>}

                    <div className={styles.modalActions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            إلغاء
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'جاري الحفظ...' : (teacher ? 'حفظ التعديلات' : 'إضافة المدرس')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

