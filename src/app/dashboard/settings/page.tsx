'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Settings,
    User,
    Lock,
    Bell,
    Users,
    GraduationCap,
    UserCheck,
    Save,
    Check,
    Eye,
    EyeOff,
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    ChevronRight,
    ChevronLeft,
    Key,
} from 'lucide-react';
import styles from './settings.module.css';

interface UserProfile {
    name: string;
    email: string;
}

// Teacher interface
interface Teacher {
    id: number;
    employeeId: string;
    name: string;
    email: string | null;
    phone: string | null;
    status: string;
    department: { id: number; name: string } | null;
    subject: { id: number; name: string } | null;
}

// Student interface
interface Student {
    id: number;
    studentId: string;
    name: string;
    email: string | null;
    phone: string | null;
    grade: string | null;
    status: string;
    parent: { id: number; name: string } | null;
}

// Parent interface
interface Parent {
    id: number;
    email: string;
    name: string;
    phone: string | null;
    isActive: boolean;
    students: { id: number; name: string }[];
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Profile form
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
    });

    // Password form
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Notification settings
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        browserNotifications: true,
        teacherAlerts: true,
        attendanceAlerts: true,
        weeklyReport: false,
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setProfile({
                    name: data.user.name || '',
                    email: data.user.email || '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auth/update-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });

            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert('كلمات المرور غير متطابقة');
            return;
        }

        if (passwords.newPassword.length < 6) {
            alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword,
                }),
            });

            if (res.ok) {
                setSaved(true);
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setTimeout(() => setSaved(false), 3000);
            } else {
                const data = await res.json();
                alert(data.error || 'فشل تغيير كلمة المرور');
            }
        } catch (error) {
            console.error('Failed to change password:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotifications = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'الملف الشخصي', icon: User },
        { id: 'security', label: 'الأمان', icon: Lock },
        { id: 'notifications', label: 'الإشعارات', icon: Bell },
        { id: 'users', label: 'إدارة المستخدمين', icon: Users },
    ];

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerIcon}>
                    <Settings size={24} />
                </div>
                <div>
                    <h1 className={styles.title}>الإعدادات</h1>
                    <p className={styles.subtitle}>إدارة حسابك والمستخدمين</p>
                </div>
            </div>

            <div className={styles.content}>
                {/* Tabs */}
                <div className={styles.tabs}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className={styles.tabContent}>
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>معلومات الملف الشخصي</h2>
                            <p className={styles.cardDescription}>قم بتحديث معلومات حسابك</p>

                            <div className={styles.form}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>الاسم</label>
                                    <input
                                        type="text"
                                        className={styles.input}
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        placeholder="أدخل اسمك"
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        className={styles.input}
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        placeholder="أدخل بريدك الإلكتروني"
                                        dir="ltr"
                                    />
                                </div>

                                <button
                                    className={styles.saveBtn}
                                    onClick={handleSaveProfile}
                                    disabled={loading}
                                >
                                    {saved ? <Check size={18} /> : <Save size={18} />}
                                    {saved ? 'تم الحفظ' : 'حفظ التغييرات'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>تغيير كلمة المرور</h2>
                            <p className={styles.cardDescription}>تأكد من استخدام كلمة مرور قوية</p>

                            <div className={styles.form}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>كلمة المرور الحالية</label>
                                    <div className={styles.passwordInput}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className={styles.input}
                                            value={passwords.currentPassword}
                                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                            placeholder="أدخل كلمة المرور الحالية"
                                            dir="ltr"
                                        />
                                        <button
                                            type="button"
                                            className={styles.eyeBtn}
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>كلمة المرور الجديدة</label>
                                    <div className={styles.passwordInput}>
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            className={styles.input}
                                            value={passwords.newPassword}
                                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                            placeholder="أدخل كلمة المرور الجديدة"
                                            dir="ltr"
                                        />
                                        <button
                                            type="button"
                                            className={styles.eyeBtn}
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>تأكيد كلمة المرور الجديدة</label>
                                    <input
                                        type="password"
                                        className={styles.input}
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        placeholder="أعد إدخال كلمة المرور الجديدة"
                                        dir="ltr"
                                    />
                                </div>

                                <button
                                    className={styles.saveBtn}
                                    onClick={handleChangePassword}
                                    disabled={loading || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
                                >
                                    {saved ? <Check size={18} /> : <Lock size={18} />}
                                    {saved ? 'تم التغيير' : 'تغيير كلمة المرور'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className={styles.card}>
                            <h2 className={styles.cardTitle}>إعدادات الإشعارات</h2>
                            <p className={styles.cardDescription}>تحكم في كيفية تلقي الإشعارات</p>

                            <div className={styles.toggleList}>
                                <div className={styles.toggleItem}>
                                    <div>
                                        <h3 className={styles.toggleTitle}>إشعارات البريد الإلكتروني</h3>
                                        <p className={styles.toggleDescription}>استلام الإشعارات عبر البريد الإلكتروني</p>
                                    </div>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={notifications.emailNotifications}
                                            onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.toggleItem}>
                                    <div>
                                        <h3 className={styles.toggleTitle}>إشعارات المتصفح</h3>
                                        <p className={styles.toggleDescription}>إشعارات فورية في المتصفح</p>
                                    </div>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={notifications.browserNotifications}
                                            onChange={(e) => setNotifications({ ...notifications, browserNotifications: e.target.checked })}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.toggleItem}>
                                    <div>
                                        <h3 className={styles.toggleTitle}>تنبيهات المدرسين</h3>
                                        <p className={styles.toggleDescription}>تلقي تنبيهات عند إضافة أو تحديث بيانات المدرسين</p>
                                    </div>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={notifications.teacherAlerts}
                                            onChange={(e) => setNotifications({ ...notifications, teacherAlerts: e.target.checked })}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.toggleItem}>
                                    <div>
                                        <h3 className={styles.toggleTitle}>تنبيهات الحضور</h3>
                                        <p className={styles.toggleDescription}>تلقي تنبيهات عند تسجيل الحضور والغياب</p>
                                    </div>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={notifications.attendanceAlerts}
                                            onChange={(e) => setNotifications({ ...notifications, attendanceAlerts: e.target.checked })}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.toggleItem}>
                                    <div>
                                        <h3 className={styles.toggleTitle}>التقرير الأسبوعي</h3>
                                        <p className={styles.toggleDescription}>استلام ملخص أسبوعي عبر البريد الإلكتروني</p>
                                    </div>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={notifications.weeklyReport}
                                            onChange={(e) => setNotifications({ ...notifications, weeklyReport: e.target.checked })}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            </div>

                            <button
                                className={styles.saveBtn}
                                onClick={handleSaveNotifications}
                                disabled={loading}
                            >
                                {saved ? <Check size={18} /> : <Save size={18} />}
                                {saved ? 'تم الحفظ' : 'حفظ الإعدادات'}
                            </button>
                        </div>
                    )}

                    {/* Users Management Tab */}
                    {activeTab === 'users' && <UsersManagement />}
                </div>
            </div>

            {/* Success Toast */}
            {saved && (
                <div className={styles.toast}>
                    <Check size={18} />
                    تم حفظ التغييرات بنجاح
                </div>
            )}
        </div>
    );
}

// ============== USERS MANAGEMENT (Combined) ==============
function UsersManagement() {
    const [activeSubTab, setActiveSubTab] = useState<'teachers' | 'students' | 'parents' | 'accounts'>('teachers');

    const subTabs = [
        { id: 'teachers' as const, label: 'المدرسون', icon: Users },
        { id: 'students' as const, label: 'الطلاب', icon: GraduationCap },
        { id: 'parents' as const, label: 'أولياء الأمور', icon: UserCheck },
        { id: 'accounts' as const, label: 'حسابات المدرسين', icon: Key },
    ];

    return (
        <div className={styles.card}>
            <h2 className={styles.cardTitle}>إدارة المستخدمين</h2>
            <p className={styles.cardDescription}>إضافة وتعديل وحذف المستخدمين في النظام</p>

            {/* Sub Tabs */}
            <div className={styles.subTabs}>
                {subTabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`${styles.subTab} ${activeSubTab === tab.id ? styles.subTabActive : ''}`}
                        onClick={() => setActiveSubTab(tab.id)}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Sub Tab Content */}
            <div className={styles.subTabContent}>
                {activeSubTab === 'teachers' && <TeachersManagement />}
                {activeSubTab === 'students' && <StudentsManagement />}
                {activeSubTab === 'parents' && <ParentsManagement />}
                {activeSubTab === 'accounts' && <TeacherAccountsManagement />}
            </div>
        </div>
    );
}

// ============== TEACHERS MANAGEMENT ==============
function TeachersManagement() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

    const fetchTeachers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '10' });
            if (search) params.set('search', search);
            const res = await fetch(`/api/teachers?${params}`);
            const data = await res.json();
            setTeachers(data.teachers || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا المدرس؟')) return;
        try {
            await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
            fetchTeachers();
        } catch (error) {
            console.error('Failed to delete teacher:', error);
        }
    };

    return (
        <>
            <div className={styles.sectionHeader}>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="بحث بالاسم أو الرقم الوظيفي..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <button className={styles.addBtn} onClick={() => { setEditingTeacher(null); setShowModal(true); }}>
                    <Plus size={18} />
                    إضافة مدرس
                </button>
            </div>

            {loading ? (
                <div className={styles.loadingState}><div className={styles.loader}></div></div>
            ) : teachers.length === 0 ? (
                <div className={styles.emptyState}><Users size={40} /><p>لا يوجد مدرسين</p></div>
            ) : (
                <>
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>الرقم الوظيفي</th>
                                    <th>الاسم</th>
                                    <th>القسم</th>
                                    <th>الحالة</th>
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teachers.map((t) => (
                                    <tr key={t.id}>
                                        <td className={styles.mono}>{t.employeeId}</td>
                                        <td>{t.name}</td>
                                        <td>{t.department?.name || '-'}</td>
                                        <td>
                                            <span className={`${styles.badge} ${t.status === 'active' ? styles.badgeGreen : styles.badgeGray}`}>
                                                {t.status === 'active' ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button className={styles.editBtn} onClick={() => { setEditingTeacher(t); setShowModal(true); }}>
                                                    <Edit size={16} />
                                                </button>
                                                <button className={styles.deleteBtn} onClick={() => handleDelete(t.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronRight size={16} /></button>
                            <span>{page} / {totalPages}</span>
                            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronLeft size={16} /></button>
                        </div>
                    )}
                </>
            )}

            {showModal && (
                <TeacherModal
                    teacher={editingTeacher}
                    onClose={() => { setShowModal(false); setEditingTeacher(null); }}
                    onSave={() => { setShowModal(false); setEditingTeacher(null); fetchTeachers(); }}
                />
            )}
        </>
    );
}

function TeacherModal({ teacher, onClose, onSave }: { teacher: Teacher | null; onClose: () => void; onSave: () => void }) {
    const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
    const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
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

    useEffect(() => {
        fetch('/api/departments').then(r => r.json()).then(d => setDepartments(d.departments || []));
        fetch('/api/subjects').then(r => r.json()).then(d => setSubjects(d.subjects || []));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.employeeId || !form.name) { setError('الرقم الوظيفي والاسم مطلوبان'); return; }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(teacher ? `/api/teachers/${teacher.id}` : '/api/teachers', {
                method: teacher ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'حدث خطأ'); return; }
            onSave();
        } catch { setError('حدث خطأ في الاتصال'); } finally { setLoading(false); }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{teacher ? 'تعديل المدرس' : 'إضافة مدرس جديد'}</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}><label className={styles.label}>الرقم الوظيفي *</label><input type="text" className={styles.input} value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} required disabled={!!teacher} /></div>
                        <div className={styles.formGroup}><label className={styles.label}>الاسم *</label><input type="text" className={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}><label className={styles.label}>البريد الإلكتروني</label><input type="email" className={styles.input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                        <div className={styles.formGroup}><label className={styles.label}>رقم الهاتف</label><input type="tel" className={styles.input} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}><label className={styles.label}>القسم</label><select className={styles.select} value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })}><option value="">اختر القسم</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                        <div className={styles.formGroup}><label className={styles.label}>المادة</label><select className={styles.select} value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}><option value="">اختر المادة</option>{subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                    </div>
                    <div className={styles.formGroup}><label className={styles.label}>الحالة</label><select className={styles.select} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="active">نشط</option><option value="inactive">غير نشط</option><option value="on_leave">إجازة</option></select></div>
                    {error && <div className={styles.formError}>{error}</div>}
                    <div className={styles.modalActions}><button type="button" onClick={onClose} className={styles.cancelBtn}>إلغاء</button><button type="submit" className={styles.submitBtn} disabled={loading}>{loading ? 'جاري الحفظ...' : 'حفظ'}</button></div>
                </form>
            </div>
        </div>
    );
}

// ============== STUDENTS MANAGEMENT ==============
function StudentsManagement() {
    const [students, setStudents] = useState<Student[]>([]);
    const [parents, setParents] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: '10' });
            if (search) params.set('search', search);
            const res = await fetch(`/api/students?${params}`);
            const data = await res.json();
            setStudents(data.students || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);
    useEffect(() => { fetch('/api/parents?limit=100').then(r => r.json()).then(d => setParents(d.parents || [])); }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;
        try {
            const res = await fetch(`/api/students?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchStudents();
            } else {
                const data = await res.json();
                alert(data.error || 'فشل حذف الطالب');
            }
        } catch (error) {
            console.error('Failed to delete student:', error);
        }
    };

    const grades = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر'];

    return (
        <>
            <div className={styles.sectionHeader}>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input type="text" placeholder="بحث بالاسم أو الرقم الطلابي..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <button className={styles.addBtn} onClick={() => { setEditingStudent(null); setShowModal(true); }}><Plus size={18} />إضافة طالب</button>
            </div>

            {loading ? (
                <div className={styles.loadingState}><div className={styles.loader}></div></div>
            ) : students.length === 0 ? (
                <div className={styles.emptyState}><GraduationCap size={40} /><p>لا يوجد طلاب</p></div>
            ) : (
                <>
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead><tr><th>الرقم الطلابي</th><th>الاسم</th><th>الصف</th><th>ولي الأمر</th><th>الإجراءات</th></tr></thead>
                            <tbody>
                                {students.map((s) => (
                                    <tr key={s.id}>
                                        <td className={styles.mono}>{s.studentId}</td>
                                        <td>{s.name}</td>
                                        <td>{s.grade || '-'}</td>
                                        <td>{s.parent?.name || '-'}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button className={styles.editBtn} onClick={() => { setEditingStudent(s); setShowModal(true); }}><Edit size={16} /></button>
                                                <button className={styles.deleteBtn} onClick={() => handleDelete(s.id)}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (<div className={styles.pagination}><button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronRight size={16} /></button><span>{page} / {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronLeft size={16} /></button></div>)}
                </>
            )}

            {showModal && <StudentModal student={editingStudent} parents={parents} grades={grades} onClose={() => { setShowModal(false); setEditingStudent(null); }} onSave={() => { setShowModal(false); setEditingStudent(null); fetchStudents(); }} />}
        </>
    );
}

function StudentModal({ student, parents, grades, onClose, onSave }: { student: Student | null; parents: { id: number; name: string }[]; grades: string[]; onClose: () => void; onSave: () => void }) {
    const [form, setForm] = useState({ studentId: student?.studentId || '', name: student?.name || '', email: student?.email || '', phone: student?.phone || '', grade: student?.grade || '', parentId: student?.parent?.id?.toString() || '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.studentId || !form.name) { setError('الرقم الطلابي والاسم مطلوبان'); return; }
        setLoading(true); setError('');
        try {
            const url = student ? `/api/students?id=${student.id}` : '/api/students';
            const res = await fetch(url, { method: student ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'حدث خطأ'); return; }
            onSave();
        } catch { setError('حدث خطأ في الاتصال'); } finally { setLoading(false); }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}><h2>{student ? 'تعديل الطالب' : 'إضافة طالب جديد'}</h2><button onClick={onClose}><X size={20} /></button></div>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}><label className={styles.label}>الرقم الطلابي *</label><input type="text" className={styles.input} value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} required disabled={!!student} /></div>
                        <div className={styles.formGroup}><label className={styles.label}>الاسم *</label><input type="text" className={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}><label className={styles.label}>البريد الإلكتروني</label><input type="email" className={styles.input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                        <div className={styles.formGroup}><label className={styles.label}>رقم الهاتف</label><input type="tel" className={styles.input} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                    </div>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}><label className={styles.label}>الصف</label><select className={styles.select} value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}><option value="">اختر الصف</option>{grades.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                        <div className={styles.formGroup}><label className={styles.label}>ولي الأمر</label><select className={styles.select} value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })}><option value="">اختر ولي الأمر</option>{parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                    </div>
                    {error && <div className={styles.formError}>{error}</div>}
                    <div className={styles.modalActions}><button type="button" onClick={onClose} className={styles.cancelBtn}>إلغاء</button><button type="submit" className={styles.submitBtn} disabled={loading}>{loading ? 'جاري الحفظ...' : 'حفظ'}</button></div>
                </form>
            </div>
        </div>
    );
}

// ============== PARENTS MANAGEMENT ==============
function ParentsManagement() {
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
            const params = new URLSearchParams({ page: page.toString(), limit: '10' });
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

    useEffect(() => { fetchParents(); }, [fetchParents]);

    const handleDelete = async (id: number) => {
        if (!confirm('هل أنت متأكد من حذف ولي الأمر؟')) return;
        try {
            const res = await fetch(`/api/parents?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchParents();
            } else {
                const data = await res.json();
                alert(data.error || 'فشل حذف ولي الأمر');
            }
        } catch (error) {
            console.error('Failed to delete parent:', error);
        }
    };

    return (
        <>
            <div className={styles.sectionHeader}>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input type="text" placeholder="بحث بالاسم أو البريد الإلكتروني..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <button className={styles.addBtn} onClick={() => { setEditingParent(null); setShowModal(true); }}><Plus size={18} />إضافة ولي أمر</button>
            </div>

            {loading ? (
                <div className={styles.loadingState}><div className={styles.loader}></div></div>
            ) : parents.length === 0 ? (
                <div className={styles.emptyState}><UserCheck size={40} /><p>لا يوجد أولياء أمور</p></div>
            ) : (
                <>
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead><tr><th>الاسم</th><th>البريد الإلكتروني</th><th>الهاتف</th><th>الأبناء</th><th>الإجراءات</th></tr></thead>
                            <tbody>
                                {parents.map((p) => (
                                    <tr key={p.id}>
                                        <td>{p.name}</td>
                                        <td className={styles.mono}>{p.email}</td>
                                        <td>{p.phone || '-'}</td>
                                        <td><span className={styles.badge}>{p.students.length} طالب</span></td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button className={styles.editBtn} onClick={() => { setEditingParent(p); setShowModal(true); }}><Edit size={16} /></button>
                                                <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (<div className={styles.pagination}><button disabled={page === 1} onClick={() => setPage(p => p - 1)}><ChevronRight size={16} /></button><span>{page} / {totalPages}</span><button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><ChevronLeft size={16} /></button></div>)}
                </>
            )}

            {showModal && <ParentModal parent={editingParent} onClose={() => { setShowModal(false); setEditingParent(null); }} onSave={() => { setShowModal(false); setEditingParent(null); fetchParents(); }} />}
        </>
    );
}

function ParentModal({ parent, onClose, onSave }: { parent: Parent | null; onClose: () => void; onSave: () => void }) {
    const [form, setForm] = useState({ name: parent?.name || '', email: parent?.email || '', phone: parent?.phone || '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email) { setError('الاسم والبريد الإلكتروني مطلوبان'); return; }
        if (!parent && !form.password) { setError('كلمة المرور مطلوبة'); return; }
        setLoading(true); setError('');
        const body: Record<string, string> = { ...form };
        if (!form.password && parent) delete body.password;
        try {
            const url = parent ? `/api/parents?id=${parent.id}` : '/api/parents';
            const res = await fetch(url, { method: parent ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'حدث خطأ'); return; }
            onSave();
        } catch { setError('حدث خطأ في الاتصال'); } finally { setLoading(false); }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}><h2>{parent ? 'تعديل ولي الأمر' : 'إضافة ولي أمر جديد'}</h2><button onClick={onClose}><X size={20} /></button></div>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}><label className={styles.label}>الاسم *</label><input type="text" className={styles.input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                    <div className={styles.formGroup}><label className={styles.label}>البريد الإلكتروني *</label><input type="email" className={styles.input} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required disabled={!!parent} /></div>
                    <div className={styles.formGroup}><label className={styles.label}>رقم الهاتف</label><input type="tel" className={styles.input} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                    <div className={styles.formGroup}><label className={styles.label}>{parent ? 'كلمة المرور (اتركها فارغة للإبقاء)' : 'كلمة المرور *'}</label><input type="password" className={styles.input} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!parent} /></div>
                    {error && <div className={styles.formError}>{error}</div>}
                    <div className={styles.modalActions}><button type="button" onClick={onClose} className={styles.cancelBtn}>إلغاء</button><button type="submit" className={styles.submitBtn} disabled={loading}>{loading ? 'جاري الحفظ...' : 'حفظ'}</button></div>
                </form>
            </div>
        </div>
    );
}

// ============== TEACHER ACCOUNTS MANAGEMENT ==============
interface TeacherAccount {
    id: number;
    employeeId: string;
    name: string;
    email: string | null;
    department: string | null;
    hasAccount: boolean;
    accountEmail: string | null;
    accountActive: boolean | null;
}

function TeacherAccountsManagement() {
    const [teachers, setTeachers] = useState<TeacherAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'with' | 'without'>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<TeacherAccount | null>(null);

    const fetchTeachers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter === 'with') params.set('hasAccount', 'true');
            if (filter === 'without') params.set('hasAccount', 'false');
            const res = await fetch(`/api/teachers/accounts?${params}`);
            const data = await res.json();
            setTeachers(data.teachers || []);
        } catch (error) {
            console.error('Failed to fetch teacher accounts:', error);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

    const filteredTeachers = teachers.filter(t =>
        t.name.includes(search) || t.employeeId.includes(search)
    );

    return (
        <>
            <div className={styles.sectionHeader}>
                <div className={styles.searchBox}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="بحث بالاسم أو الرقم الوظيفي..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className={styles.filterSelect}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as typeof filter)}
                >
                    <option value="all">جميع المدرسين</option>
                    <option value="with">لديهم حساب</option>
                    <option value="without">بدون حساب</option>
                </select>
            </div>

            {loading ? (
                <div className={styles.loadingState}><div className={styles.loader}></div></div>
            ) : filteredTeachers.length === 0 ? (
                <div className={styles.emptyState}><Key size={40} /><p>لا يوجد مدرسين</p></div>
            ) : (
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>الرقم الوظيفي</th>
                                <th>الاسم</th>
                                <th>القسم</th>
                                <th>حالة الحساب</th>
                                <th>البريد الإلكتروني</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTeachers.map((t) => (
                                <tr key={t.id}>
                                    <td className={styles.mono}>{t.employeeId}</td>
                                    <td>{t.name}</td>
                                    <td>{t.department || '-'}</td>
                                    <td>
                                        <span className={`${styles.badge} ${t.hasAccount ? styles.badgeGreen : styles.badgeGray}`}>
                                            {t.hasAccount ? 'لديه حساب' : 'بدون حساب'}
                                        </span>
                                    </td>
                                    <td dir="ltr">{t.accountEmail || '-'}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            {!t.hasAccount ? (
                                                <button
                                                    className={styles.addBtn}
                                                    onClick={() => { setSelectedTeacher(t); setShowCreateModal(true); }}
                                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                                >
                                                    <Plus size={14} />
                                                    إنشاء حساب
                                                </button>
                                            ) : (
                                                <button
                                                    className={styles.editBtn}
                                                    onClick={() => { setSelectedTeacher(t); setShowResetModal(true); }}
                                                    title="إعادة تعيين كلمة المرور"
                                                >
                                                    <Lock size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showCreateModal && selectedTeacher && (
                <CreateAccountModal
                    teacher={selectedTeacher}
                    onClose={() => { setShowCreateModal(false); setSelectedTeacher(null); }}
                    onSave={() => { setShowCreateModal(false); setSelectedTeacher(null); fetchTeachers(); }}
                />
            )}

            {showResetModal && selectedTeacher && (
                <ResetPasswordModal
                    teacher={selectedTeacher}
                    onClose={() => { setShowResetModal(false); setSelectedTeacher(null); }}
                    onSave={() => { setShowResetModal(false); setSelectedTeacher(null); }}
                />
            )}
        </>
    );
}

function CreateAccountModal({ teacher, onClose, onSave }: { teacher: TeacherAccount; onClose: () => void; onSave: () => void }) {
    const [form, setForm] = useState({
        email: teacher.email || '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.email || !form.password) {
            setError('البريد الإلكتروني وكلمة المرور مطلوبين');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            return;
        }
        if (form.password.length < 8) {
            setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/teachers/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacherId: teacher.id,
                    email: form.email,
                    password: form.password,
                    name: teacher.name,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'حدث خطأ في إنشاء الحساب');
                return;
            }
            alert('تم إنشاء حساب المدرس بنجاح');
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
                    <h2>إنشاء حساب للمدرس: {teacher.name}</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>البريد الإلكتروني *</label>
                        <input
                            type="email"
                            className={styles.input}
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            required
                            dir="ltr"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>كلمة المرور *</label>
                        <div className={styles.passwordInput}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className={styles.input}
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                                dir="ltr"
                                placeholder="8 أحرف على الأقل"
                            />
                            <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>تأكيد كلمة المرور *</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={form.confirmPassword}
                            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                            required
                            dir="ltr"
                        />
                    </div>
                    {error && <div className={styles.formError}>{error}</div>}
                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>إلغاء</button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ResetPasswordModal({ teacher, onClose, onSave }: { teacher: TeacherAccount; onClose: () => void; onSave: () => void }) {
    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            return;
        }
        if (form.password.length < 8) {
            setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/teachers/accounts', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacherId: teacher.id,
                    newPassword: form.password,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'حدث خطأ');
                return;
            }
            alert('تم تحديث كلمة المرور بنجاح');
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
                    <h2>إعادة تعيين كلمة المرور: {teacher.name}</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>كلمة المرور الجديدة *</label>
                        <div className={styles.passwordInput}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className={styles.input}
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                                dir="ltr"
                                placeholder="8 أحرف على الأقل"
                            />
                            <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>تأكيد كلمة المرور *</label>
                        <input
                            type="password"
                            className={styles.input}
                            value={form.confirmPassword}
                            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                            required
                            dir="ltr"
                        />
                    </div>
                    {error && <div className={styles.formError}>{error}</div>}
                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>إلغاء</button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
