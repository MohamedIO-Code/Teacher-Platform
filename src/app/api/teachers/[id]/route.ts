import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, PERMISSIONS, hasPermission } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { id } = await params;
        const teacherId = parseInt(id);

        const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
            include: {
                department: true,
                subject: true,
                evaluations: {
                    orderBy: { date: 'desc' },
                    take: 10,
                    include: {
                        evaluator: { select: { name: true } },
                    },
                },
                notes: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        author: { select: { name: true } },
                    },
                },
                attendances: {
                    orderBy: { date: 'desc' },
                    take: 30,
                },
            },
        });

        if (!teacher) {
            return NextResponse.json({ error: 'المدرس غير موجود' }, { status: 404 });
        }

        // Calculate statistics
        const avgScore = await prisma.evaluation.aggregate({
            where: { teacherId },
            _avg: { overallScore: true },
        });

        const attendanceStats = await prisma.attendance.groupBy({
            by: ['status'],
            where: { teacherId },
            _count: true,
        });

        const stats = {
            avgScore: avgScore._avg.overallScore ? Number(avgScore._avg.overallScore.toFixed(1)) : null,
            attendance: attendanceStats.reduce((acc, curr) => {
                acc[curr.status] = curr._count;
                return acc;
            }, {} as Record<string, number>),
            totalEvaluations: teacher.evaluations.length,
            totalNotes: teacher.notes.length,
        };

        return NextResponse.json({ teacher, stats });
    } catch (error) {
        console.error('Get teacher error:', error);
        return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.MANAGEMENT)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { id } = await params;
        const teacherId = parseInt(id);
        const body = await request.json();

        const { name, email, phone, departmentId, subjectId, joinDate, status } = body;

        const teacher = await prisma.teacher.update({
            where: { id: teacherId },
            data: {
                name,
                email,
                phone,
                departmentId: departmentId ? parseInt(departmentId) : null,
                subjectId: subjectId ? parseInt(subjectId) : null,
                joinDate: joinDate ? new Date(joinDate) : null,
                status,
            },
            include: {
                department: { select: { name: true } },
                subject: { select: { name: true } },
            },
        });

        await createAuditLog({
            userId: session.id,
            action: 'update',
            entity: 'teacher',
            entityId: teacher.id,
            details: { name: teacher.name },
        });

        return NextResponse.json({ success: true, teacher });
    } catch (error) {
        console.error('Update teacher error:', error);
        return NextResponse.json({ error: 'خطأ في تحديث المدرس' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.MANAGEMENT)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { id } = await params;
        const teacherId = parseInt(id);

        const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });

        if (!teacher) {
            return NextResponse.json({ error: 'المدرس غير موجود' }, { status: 404 });
        }

        // Hard delete - actually remove from database
        await prisma.teacher.delete({
            where: { id: teacherId },
        });

        await createAuditLog({
            userId: session.id,
            action: 'delete',
            entity: 'teacher',
            entityId: teacherId,
            details: { name: teacher.name },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete teacher error:', error);
        return NextResponse.json({ error: 'خطأ في حذف المدرس' }, { status: 500 });
    }
}
