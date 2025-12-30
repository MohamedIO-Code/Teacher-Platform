'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Calendar,
    ClipboardCheck,
    Clock,
    UserCheck,
    UserMinus,
    AlertCircle,
    CheckCircle,
    XCircle,
    ChevronRight,
    ChevronLeft,
    Filter,
    Plus,
    X,
    LogOut,
} from 'lucide-react';
import styles from './attendance.module.css';

interface AttendanceRecord {
    id: number;
    teacherId: number;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    status: string;
    notes: string | null;
    teacher: {
        id: number;
        name: string;
        employeeId: string;
    };
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

export default function AttendancePage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [registering, setRegistering] = useState(false);
    const [todayRegistered, setTodayRegistered] = useState(false);

    const [stats, setStats] = useState({
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
    });

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                startDate: selectedDate,
                endDate: selectedDate,
            });
            if (statusFilter) params.set('status', statusFilter);

            const res = await fetch(`/api/attendance?${params}`);
            const data = await res.json();
            setRecords(data.records);
            setTotalPages(data.pagination.totalPages || 1);

            // Calculate stats
            const newStats = { present: 0, absent: 0, late: 0, excused: 0 };
            data.records.forEach((r: AttendanceRecord) => {
                if (r.status in newStats) {
                    newStats[r.status as keyof typeof newStats]++;
                }
            });
            setStats(newStats);
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
        } finally {
            setLoading(false);
        }
    }, [page, selectedDate, statusFilter]);

    const fetchTeachers = async () => {
        try {
            const res = await fetch('/api/teachers?limit=100');
            const data = await res.json();
            setTeachers(data.teachers || []);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        }
    };

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

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    useEffect(() => {
        fetchTeachers();
        fetchUser();
    }, []);

    // Check if today's attendance is already registered for teacher
    useEffect(() => {
        if (user?.role === 'teacher' && records.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            const todayRecord = records.find(r => r.date.split('T')[0] === today);
            setTodayRegistered(!!todayRecord);
        }
    }, [records, user]);

    const handleSelfRegister = async () => {
        setRegistering(true);
        try {
            const now = new Date();
            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    selfRegister: true,
                    date: now.toISOString().split('T')[0],
                    checkIn: now.toISOString(),
                    status: 'present',
                }),
            });

            if (res.ok) {
                setTodayRegistered(true);
                fetchRecords();
            } else {
                const data = await res.json();
                alert(data.error || 'حدث خطأ في تسجيل الحضور');
            }
        } catch (error) {
            console.error('Failed to register attendance:', error);
            alert('حدث خطأ في الاتصال');
        } finally {
            setRegistering(false);
        }
    };

    const isTeacher = user?.role === 'teacher';

    const handleMarkAttendance = async (teacherId: number, status: string) => {
        try {
            const now = new Date();
            const checkIn = status === 'present' || status === 'late'
                ? now.toISOString()
                : null;

            await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacherId,
                    date: selectedDate,
                    checkIn,
                    status,
                }),
            });

            fetchRecords();
        } catch (error) {
            console.error('Failed to mark attendance:', error);
        }
    };

    const handleCheckout = async (recordId: number) => {
        try {
            const now = new Date();
            await fetch(`/api/attendance/${recordId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    checkOut: now.toISOString(),
                }),
            });
            fetchRecords();
        } catch (error) {
            console.error('Failed to record checkout:', error);
        }
    };

    const getStatusInfo = (status: string) => {
        const info: Record<string, { label: string; icon: React.ReactNode; class: string }> = {
            present: { label: 'حاضر', icon: <CheckCircle size={16} />, class: 'statusPresent' },
            absent: { label: 'غائب', icon: <XCircle size={16} />, class: 'statusAbsent' },
            late: { label: 'متأخر', icon: <Clock size={16} />, class: 'statusLate' },
            excused: { label: 'إجازة', icon: <AlertCircle size={16} />, class: 'statusExcused' },
        };
        return info[status] || info.present;
    };

    const formatTime = (datetime: string | null) => {
        if (!datetime) return '-';
        return new Date(datetime).toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const navigateDate = (direction: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + direction);
        setSelectedDate(date.toISOString().split('T')[0]);
        setPage(1);
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>الحضور والانصراف</h1>
                    <p className={styles.subtitle}>
                        {isTeacher ? 'سجلات حضورك وانصرافك' : 'تسجيل ومتابعة حضور وانصراف المدرسين'}
                    </p>
                </div>
                {isTeacher ? (
                    todayRegistered ? (
                        <div className={styles.registeredBadge}>
                            <CheckCircle size={18} />
                            تم تسجيل حضورك اليوم ✓
                        </div>
                    ) : (
                        <button
                            className={styles.addButton}
                            onClick={handleSelfRegister}
                            disabled={registering}
                        >
                            <UserCheck size={18} />
                            {registering ? 'جاري التسجيل...' : 'تسجيل حضوري'}
                        </button>
                    )
                ) : (
                    <button className={styles.addButton} onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        تسجيل الحضور
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.statPresent}`}>
                    <UserCheck size={24} />
                    <div>
                        <p className={styles.statValue}>{stats.present}</p>
                        <p className={styles.statLabel}>حاضر</p>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.statAbsent}`}>
                    <UserMinus size={24} />
                    <div>
                        <p className={styles.statValue}>{stats.absent}</p>
                        <p className={styles.statLabel}>غائب</p>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.statLate}`}>
                    <Clock size={24} />
                    <div>
                        <p className={styles.statValue}>{stats.late}</p>
                        <p className={styles.statLabel}>متأخر</p>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.statExcused}`}>
                    <AlertCircle size={24} />
                    <div>
                        <p className={styles.statValue}>{stats.excused}</p>
                        <p className={styles.statLabel}>إجازة</p>
                    </div>
                </div>
            </div>

            {/* Date Navigation & Filters */}
            <div className={styles.controls}>
                <div className={styles.dateNav}>
                    <button className={styles.navBtn} onClick={() => navigateDate(-1)}>
                        <ChevronRight size={20} />
                    </button>
                    <div className={styles.dateDisplay}>
                        <Calendar size={18} />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }}
                            className={styles.dateInput}
                        />
                    </div>
                    <button className={styles.navBtn} onClick={() => navigateDate(1)}>
                        <ChevronLeft size={20} />
                    </button>
                </div>

                <div className={styles.filterGroup}>
                    <Filter size={18} />
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className={styles.filterSelect}
                    >
                        <option value="">جميع الحالات</option>
                        <option value="present">حاضر</option>
                        <option value="absent">غائب</option>
                        <option value="late">متأخر</option>
                        <option value="excused">إجازة</option>
                    </select>
                </div>
            </div>

            {/* Attendance Table */}
            <div className={styles.tableCard}>
                {loading ? (
                    <div className={styles.loading}>
                        <div className={styles.loader}></div>
                        <p>جاري التحميل...</p>
                    </div>
                ) : records.length === 0 ? (
                    <div className={styles.empty}>
                        <ClipboardCheck size={48} />
                        <h3>لا توجد سجلات</h3>
                        <p>لم يتم تسجيل حضور في هذا اليوم</p>
                    </div>
                ) : (
                    <>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>المدرس</th>
                                    <th>الحالة</th>
                                    <th>وقت الحضور</th>
                                    <th>وقت الانصراف</th>
                                    <th>ملاحظات</th>
                                    {!isTeacher && <th>إجراءات</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((record) => {
                                    const statusInfo = getStatusInfo(record.status);
                                    return (
                                        <tr key={record.id}>
                                            <td>
                                                <div className={styles.teacherInfo}>
                                                    <div className={styles.avatar}>
                                                        {record.teacher.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className={styles.teacherName}>{record.teacher.name}</p>
                                                        <p className={styles.teacherId}>{record.teacher.employeeId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.status} ${styles[statusInfo.class]}`}>
                                                    {statusInfo.icon}
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td>{formatTime(record.checkIn)}</td>
                                            <td>{formatTime(record.checkOut)}</td>
                                            <td>{record.notes || '-'}</td>
                                            {!isTeacher && (
                                                <td>
                                                    <div className={styles.quickActions}>
                                                        <button
                                                            className={`${styles.actionBtn} ${styles.btnPresent}`}
                                                            onClick={() => handleMarkAttendance(record.teacherId, 'present')}
                                                            title="حاضر"
                                                        >
                                                            <CheckCircle size={14} />
                                                        </button>
                                                        <button
                                                            className={`${styles.actionBtn} ${styles.btnLate}`}
                                                            onClick={() => handleMarkAttendance(record.teacherId, 'late')}
                                                            title="متأخر"
                                                        >
                                                            <Clock size={14} />
                                                        </button>
                                                        <button
                                                            className={`${styles.actionBtn} ${styles.btnAbsent}`}
                                                            onClick={() => handleMarkAttendance(record.teacherId, 'absent')}
                                                            title="غائب"
                                                        >
                                                            <XCircle size={14} />
                                                        </button>
                                                        {(record.status === 'present' || record.status === 'late') && record.checkIn && !record.checkOut && (
                                                            <button
                                                                className={`${styles.actionBtn} ${styles.btnCheckout}`}
                                                                onClick={() => handleCheckout(record.id)}
                                                                title="تسجيل الانصراف"
                                                            >
                                                                <LogOut size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

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

            {/* Attendance Modal */}
            {showModal && (
                <AttendanceModal
                    teachers={teachers}
                    selectedDate={selectedDate}
                    onClose={() => setShowModal(false)}
                    onSave={() => { setShowModal(false); fetchRecords(); }}
                />
            )}
        </div>
    );
}

interface AttendanceModalProps {
    teachers: Teacher[];
    selectedDate: string;
    onClose: () => void;
    onSave: () => void;
}

function AttendanceModal({ teachers, selectedDate, onClose, onSave }: AttendanceModalProps) {
    const [form, setForm] = useState({
        teacherId: '',
        status: 'present',
        checkInTime: new Date().toTimeString().slice(0, 5),
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
            const [hours, minutes] = form.checkInTime.split(':');
            const checkInDate = new Date(selectedDate);
            checkInDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const checkIn = (form.status === 'present' || form.status === 'late')
                ? checkInDate.toISOString()
                : null;

            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacherId: parseInt(form.teacherId),
                    date: selectedDate,
                    checkIn,
                    status: form.status,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
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
                    <h2>تسجيل الحضور</h2>
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
                        <label>حالة الحضور *</label>
                        <select
                            value={form.status}
                            onChange={e => setForm({ ...form, status: e.target.value })}
                        >
                            <option value="present">حاضر</option>
                            <option value="late">متأخر</option>
                            <option value="absent">غائب</option>
                            <option value="excused">إجازة</option>
                        </select>
                    </div>

                    {(form.status === 'present' || form.status === 'late') && (
                        <div className={styles.formGroup}>
                            <label>وقت الحضور</label>
                            <input
                                type="time"
                                value={form.checkInTime}
                                onChange={e => setForm({ ...form, checkInTime: e.target.value })}
                            />
                        </div>
                    )}

                    {error && <div className={styles.formError}>{error}</div>}

                    <div className={styles.modalActions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            إلغاء
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? 'جاري الحفظ...' : 'تسجيل'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
