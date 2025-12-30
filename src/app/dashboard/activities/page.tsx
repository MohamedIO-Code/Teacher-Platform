'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    BookOpen,
    Calendar,
    Library,
    Feather,
    Users,
    Clock,
    MapPin,
    Plus,
    Filter,
    ChevronLeft,
    ChevronRight,
    Star,
    X,
    UserPlus,
    Eye,
    Trash2,
} from 'lucide-react';
import Link from 'next/link';
import styles from './activities.module.css';

interface ActivityCategory {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    _count: { activities: number };
}

interface Activity {
    id: number;
    title: string;
    description: string | null;
    date: string;
    time: string | null;
    location: string | null;
    status: string;
    category: { id: number; name: string };
    teacher: { id: number; name: string } | null;
    _count: { participations: number };
}

interface Teacher {
    id: number;
    name: string;
    employeeId: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
    'يوم اللغة العربية': <BookOpen size={28} />,
    'يوم المكتبة': <Library size={28} />,
    'يوم الشعر': <Feather size={28} />,
    'يوم الحقوق الإنسانية': <Users size={28} />,
};

const categoryColors: Record<string, string> = {
    'يوم اللغة العربية': '#1e3a5f',
    'يوم المكتبة': '#2d5a8a',
    'يوم الشعر': '#6b4c9a',
    'يوم الحقوق الإنسانية': '#2f855a',
};

interface User {
    id: number;
    name: string;
    role: string;
}

export default function ActivitiesPage() {
    const [categories, setCategories] = useState<ActivityCategory[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('');
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

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/activity-categories');
            const data = await res.json();
            setCategories(data.categories || []);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const fetchActivities = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '10' });
            if (selectedCategory) params.set('categoryId', selectedCategory.toString());
            if (statusFilter) params.set('status', statusFilter);

            const res = await fetch(`/api/activities?${params}`);
            const data = await res.json();
            setActivities(data.activities || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        } finally {
            setLoading(false);
        }
    }, [page, selectedCategory, statusFilter]);

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
        fetchCategories();
        fetchTeachers();
        fetchUser();
    }, []);

    const isTeacher = user?.role === 'teacher';

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            upcoming: 'قادمة',
            ongoing: 'جارية',
            completed: 'منتهية',
            cancelled: 'ملغاة',
        };
        return labels[status] || status;
    };

    const getStatusClass = (status: string) => {
        return styles[`status${status.charAt(0).toUpperCase() + status.slice(1)}`];
    };

    const initializeCategories = async () => {
        const defaultCategories = [
            { name: 'يوم اللغة العربية', description: 'احتفالية خاصة بيوم اللغة العربية العالمي', icon: 'BookOpen', color: '#1e3a5f' },
            { name: 'يوم المكتبة', description: 'يوم مخصص لتعزيز ثقافة القراءة', icon: 'Library', color: '#2d5a8a' },
            { name: 'يوم الشعر', description: 'أمسية شعرية تحتفي بالشعر العربي', icon: 'Feather', color: '#6b4c9a' },
            { name: 'يوم الحقوق الإنسانية', description: 'فعالية توعوية عن حقوق الإنسان', icon: 'Users', color: '#2f855a' },
        ];

        for (const cat of defaultCategories) {
            await fetch('/api/activity-categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cat),
            });
        }
        fetchCategories();
    };

    const handleDeleteActivity = async (id: number, title: string) => {
        if (!confirm(`هل أنت متأكد من حذف النشاط "${title}"؟`)) return;
        try {
            const res = await fetch(`/api/activities/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchActivities();
                fetchCategories();
            } else {
                const data = await res.json();
                alert(data.error || 'فشل حذف النشاط');
            }
        } catch (error) {
            console.error('Failed to delete activity:', error);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerIcon}>
                        <BookOpen size={32} />
                    </div>
                    <div>
                        <h1 className={styles.title}>أنشطة اللغة العربية</h1>
                        <p className={styles.subtitle}>نظام متابعة وتقييم الفعاليات الثقافية واللغوية</p>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.addButton} onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        إضافة نشاط
                    </button>
                </div>
            </div>

            {/* Categories */}
            <div className={styles.categoriesSection}>
                <div className={styles.sectionHeader}>
                    <h2>فئات الأنشطة</h2>
                    {categories.length === 0 && (
                        <button className={styles.initButton} onClick={initializeCategories}>
                            تهيئة الفئات الأساسية
                        </button>
                    )}
                </div>
                <div className={styles.categoriesGrid}>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            className={`${styles.categoryCard} ${selectedCategory === category.id ? styles.categorySelected : ''}`}
                            onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                            style={{ '--category-color': categoryColors[category.name] || '#1e3a5f' } as React.CSSProperties}
                        >
                            <div className={styles.categoryIcon}>
                                {categoryIcons[category.name] || <Star size={28} />}
                            </div>
                            <div className={styles.categoryInfo}>
                                <h3>{category.name}</h3>
                                <span>{category._count.activities} نشاط</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <div className={styles.filterGroup}>
                    <Filter size={18} />
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">جميع الحالات</option>
                        <option value="upcoming">قادمة</option>
                        <option value="ongoing">جارية</option>
                        <option value="completed">منتهية</option>
                    </select>
                </div>
            </div>

            {/* Activities List */}
            <div className={styles.activitiesList}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.loader}></div>
                        <p>جاري التحميل...</p>
                    </div>
                ) : activities.length === 0 ? (
                    <div className={styles.empty}>
                        <BookOpen size={48} />
                        <h3>لا توجد أنشطة</h3>
                        <p>لم يتم إضافة أي أنشطة بعد</p>
                    </div>
                ) : (
                    <div className={styles.activitiesGrid}>
                        {activities.map((activity) => (
                            <div key={activity.id} className={styles.activityCard}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.categoryBadge}>{activity.category.name}</span>
                                    <span className={`${styles.statusBadge} ${getStatusClass(activity.status)}`}>
                                        {getStatusLabel(activity.status)}
                                    </span>
                                </div>

                                <h3 className={styles.activityTitle}>{activity.title}</h3>
                                {activity.description && (
                                    <p className={styles.activityDescription}>{activity.description}</p>
                                )}

                                <div className={styles.activityMeta}>
                                    <div className={styles.metaItem}>
                                        <Calendar size={16} />
                                        <span>{new Date(activity.date).toLocaleDateString('ar-SA')}</span>
                                    </div>
                                    {activity.time && (
                                        <div className={styles.metaItem}>
                                            <Clock size={16} />
                                            <span>{activity.time}</span>
                                        </div>
                                    )}
                                    {activity.location && (
                                        <div className={styles.metaItem}>
                                            <MapPin size={16} />
                                            <span>{activity.location}</span>
                                        </div>
                                    )}
                                    <div className={styles.metaItem}>
                                        <UserPlus size={16} />
                                        <span>{activity._count.participations} مشارك</span>
                                    </div>
                                </div>

                                {activity.teacher && (
                                    <div className={styles.teacherInfo}>
                                        <span>المسؤول:</span>
                                        <strong>{activity.teacher.name}</strong>
                                    </div>
                                )}

                                <div className={styles.cardActions}>
                                    <Link href={`/dashboard/activities/${activity.id}`} className={styles.viewButton}>
                                        <Eye size={16} />
                                        عرض التفاصيل
                                    </Link>
                                    {!isTeacher && (
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => handleDeleteActivity(activity.id, activity.title)}
                                        >
                                            <Trash2 size={16} />
                                            حذف
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={styles.pagination}>
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronRight size={18} />
                            السابق
                        </button>
                        <span>صفحة {page} من {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            التالي
                            <ChevronLeft size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Add Activity Modal */}
            {showModal && (
                <ActivityModal
                    categories={categories}
                    teachers={teachers}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); fetchActivities(); fetchCategories(); }}
                />
            )}
        </div>
    );
}

interface ModalProps {
    categories: ActivityCategory[];
    teachers: Teacher[];
    onClose: () => void;
    onSave: () => void;
}

function ActivityModal({ categories, teachers, onClose, onSave }: ModalProps) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        categoryId: '',
        teacherId: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        location: '',
        maxParticipants: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.categoryId || !form.date) {
            setError('يرجى ملء الحقول المطلوبة');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/activities', {
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
                    <h2>إضافة نشاط جديد</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>عنوان النشاط *</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                                placeholder="أدخل عنوان النشاط"
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>الفئة *</label>
                            <select
                                value={form.categoryId}
                                onChange={e => setForm({ ...form, categoryId: e.target.value })}
                                required
                            >
                                <option value="">اختر الفئة</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>الوصف</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            rows={3}
                            placeholder="أدخل وصف النشاط..."
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>التاريخ *</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>الوقت</label>
                            <input
                                type="text"
                                value={form.time}
                                onChange={e => setForm({ ...form, time: e.target.value })}
                                placeholder="مثال: 09:00 صباحاً"
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>المكان</label>
                            <input
                                type="text"
                                value={form.location}
                                onChange={e => setForm({ ...form, location: e.target.value })}
                                placeholder="أدخل مكان النشاط"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>المدرس المسؤول</label>
                            <select
                                value={form.teacherId}
                                onChange={e => setForm({ ...form, teacherId: e.target.value })}
                            >
                                <option value="">اختر المدرس</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>الحد الأقصى للمشاركين</label>
                        <input
                            type="number"
                            value={form.maxParticipants}
                            onChange={e => setForm({ ...form, maxParticipants: e.target.value })}
                            placeholder="اترك فارغاً للعدد غير محدود"
                        />
                    </div>

                    {error && <div className={styles.formError}>{error}</div>}

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>
                            إلغاء
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'جاري الحفظ...' : 'حفظ النشاط'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
