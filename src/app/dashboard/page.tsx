import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import TeacherDashboardClient from './TeacherDashboardClient';

async function getAdminDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Get teachers count
    const totalTeachers = await prisma.teacher.count({
        where: { status: 'active' },
    });

    // Get today's attendance
    const todayAttendance = await prisma.attendance.groupBy({
        by: ['status'],
        where: {
            date: {
                gte: today,
                lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
        },
        _count: true,
    });

    const attendanceMap = todayAttendance.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
    }, {} as Record<string, number>);

    const presentCount = attendanceMap['present'] || 0;
    const lateCount = attendanceMap['late'] || 0;
    const absentCount = attendanceMap['absent'] || 0;
    const excusedCount = attendanceMap['excused'] || 0;
    const totalAttendanceToday = presentCount + lateCount + absentCount + excusedCount;
    const attendanceRate = totalAttendanceToday > 0
        ? Math.round(((presentCount + lateCount) / totalAttendanceToday) * 100)
        : 0;

    // Get average evaluation score
    const evaluations = await prisma.evaluation.aggregate({
        _avg: { overallScore: true },
        _count: true,
    });

    const avgEvaluationScore = evaluations._avg.overallScore
        ? Number(evaluations._avg.overallScore.toFixed(1))
        : 0;

    // Get monthly statistics
    const monthlyAttendance = await prisma.attendance.groupBy({
        by: ['status'],
        where: {
            date: { gte: startOfMonth },
        },
        _count: true,
    });

    const monthlyMap = monthlyAttendance.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
    }, {} as Record<string, number>);

    // Get recent evaluations count this month
    const monthlyEvaluations = await prisma.evaluation.count({
        where: { date: { gte: startOfMonth } },
    });

    // Get alerts
    const alerts = await getAlerts();

    // Get recent activity
    const recentActivity = await prisma.auditLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true } },
        },
    });

    // Get weekly attendance data for chart
    const weeklyData = await getWeeklyAttendanceData();

    // Get department statistics
    const departmentStats = await prisma.department.findMany({
        include: {
            _count: { select: { teachers: true } },
        },
    });

    return {
        totalTeachers,
        attendanceRate,
        presentToday: presentCount + lateCount,
        absentToday: absentCount,
        lateToday: lateCount,
        avgEvaluationScore,
        totalEvaluations: evaluations._count,
        monthlyEvaluations,
        monthlyStats: {
            present: monthlyMap['present'] || 0,
            absent: monthlyMap['absent'] || 0,
            late: monthlyMap['late'] || 0,
            excused: monthlyMap['excused'] || 0,
        },
        alerts,
        recentActivity: recentActivity.map(log => ({
            id: log.id,
            action: log.action,
            entity: log.entity,
            userName: log.user?.name || 'النظام',
            createdAt: log.createdAt.toISOString(),
        })),
        weeklyData,
        departmentStats: departmentStats.map(d => ({
            name: d.name,
            count: d._count.teachers,
        })),
    };
}

async function getTeacherDashboardStats(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get teacher profile linked to this user
    const teacher = await prisma.teacher.findUnique({
        where: { userId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            employeeId: true,
            status: true,
            joinDate: true,
        },
    });

    if (!teacher) {
        return null;
    }

    // Get teacher's attendance statistics
    const attendanceStats = await prisma.attendance.groupBy({
        by: ['status'],
        where: { teacherId: teacher.id },
        _count: true,
    });

    const attendanceMap = attendanceStats.reduce((acc, curr) => {
        acc[curr.status] = curr._count;
        return acc;
    }, {} as Record<string, number>);

    // Check if teacher has registered attendance today
    const todayAttendance = await prisma.attendance.findUnique({
        where: {
            teacherId_date: {
                teacherId: teacher.id,
                date: today,
            },
        },
    });

    // Get recent evaluations
    const recentEvaluations = await prisma.evaluation.findMany({
        where: { teacherId: teacher.id },
        orderBy: { date: 'desc' },
        take: 5,
        include: {
            evaluator: { select: { name: true } },
        },
    });

    // Get recent notes
    const recentNotes = await prisma.note.findMany({
        where: { teacherId: teacher.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            author: { select: { name: true } },
        },
    });

    return {
        teacher: {
            ...teacher,
            joinDate: teacher.joinDate?.toISOString() || null,
        },
        attendance: {
            present: attendanceMap['present'] || 0,
            absent: attendanceMap['absent'] || 0,
            late: attendanceMap['late'] || 0,
            excused: attendanceMap['excused'] || 0,
            todayStatus: todayAttendance?.status || null,
        },
        recentEvaluations: recentEvaluations.map(e => ({
            id: e.id,
            date: e.date.toISOString(),
            overallScore: e.overallScore,
            comments: e.comments,
            evaluator: e.evaluator,
        })),
        recentNotes: recentNotes.map(n => ({
            id: n.id,
            type: n.type,
            content: n.content,
            createdAt: n.createdAt.toISOString(),
            author: n.author,
        })),
    };
}

async function getWeeklyAttendanceData() {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const attendance = await prisma.attendance.groupBy({
            by: ['status'],
            where: {
                date: {
                    gte: date,
                    lt: nextDate,
                },
            },
            _count: true,
        });

        const map = attendance.reduce((acc, curr) => {
            acc[curr.status] = curr._count;
            return acc;
        }, {} as Record<string, number>);

        data.push({
            date: date.toLocaleDateString('ar-SA', { weekday: 'short' }),
            present: (map['present'] || 0) + (map['late'] || 0),
            absent: map['absent'] || 0,
        });
    }

    return data;
}

async function getAlerts() {
    const alerts: { type: string; message: string; count: number }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check for absences today
    const absentToday = await prisma.attendance.count({
        where: {
            date: {
                gte: today,
                lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
            status: 'absent',
        },
    });

    if (absentToday > 0) {
        alerts.push({
            type: 'warning',
            message: 'مدرسين غائبين اليوم',
            count: absentToday,
        });
    }

    // Check for late arrivals
    const lateToday = await prisma.attendance.count({
        where: {
            date: {
                gte: today,
                lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
            },
            status: 'late',
        },
    });

    if (lateToday > 0) {
        alerts.push({
            type: 'info',
            message: 'مدرسين متأخرين اليوم',
            count: lateToday,
        });
    }

    // Check for low evaluation scores
    const lowScores = await prisma.evaluation.count({
        where: {
            overallScore: { lt: 6 },
        },
    });

    if (lowScores > 0) {
        alerts.push({
            type: 'error',
            message: 'تقييمات منخفضة تحتاج متابعة',
            count: lowScores,
        });
    }

    return alerts;
}

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    // إذا كان المستخدم ولي أمر، توجيهه للوحة التحكم الخاصة به
    if (session.role === 'parent') {
        redirect('/dashboard/parent');
    }

    // إذا كان المستخدم مدرس، عرض لوحة التحكم الخاصة به
    if (session.role === 'teacher') {
        const teacherStats = await getTeacherDashboardStats(session.id);

        if (!teacherStats) {
            // لا يوجد ملف مدرس مرتبط بالمستخدم
            return (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h1>لم يتم العثور على ملف المدرس</h1>
                    <p>يرجى التواصل مع المسؤول لربط حسابك بملف المدرس</p>
                </div>
            );
        }

        return <TeacherDashboardClient stats={teacherStats} userName={session.name} />;
    }

    // للمدير والمشرف، عرض لوحة التحكم العامة
    const stats = await getAdminDashboardStats();

    return <DashboardClient stats={stats} userName={session.name} />;
}
