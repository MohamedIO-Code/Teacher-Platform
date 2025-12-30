import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, PERMISSIONS, hasPermission } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const activityId = searchParams.get('activityId');
        const studentId = searchParams.get('studentId');
        const teacherId = searchParams.get('teacherId');

        const where: Record<string, unknown> = {};
        if (activityId) where.activityId = parseInt(activityId);
        if (studentId) where.studentId = parseInt(studentId);
        if (teacherId) where.teacherId = parseInt(teacherId);

        const participations = await prisma.activityParticipation.findMany({
            where,
            include: {
                activity: { select: { id: true, title: true, date: true } },
                student: { select: { id: true, name: true, studentId: true, grade: true } },
                teacher: { select: { id: true, name: true, employeeId: true } },
                evaluations: {
                    include: {
                        evaluator: { select: { id: true, name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ participations });
    } catch (error) {
        console.error('Get participations error:', error);
        return NextResponse.json({ error: 'خطأ في جلب المشاركات' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.ALL)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const body = await request.json();
        const { activityId, studentId, teacherId, role, notes } = body;

        if (!activityId || (!studentId && !teacherId)) {
            return NextResponse.json({ error: 'يرجى تحديد النشاط والمشارك' }, { status: 400 });
        }

        const participation = await prisma.activityParticipation.create({
            data: {
                activityId: parseInt(activityId),
                studentId: studentId ? parseInt(studentId) : null,
                teacherId: teacherId ? parseInt(teacherId) : null,
                role: role || 'participant',
                notes,
            },
            include: {
                activity: { select: { id: true, title: true } },
                student: { select: { id: true, name: true } },
                teacher: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json({ participation }, { status: 201 });
    } catch (error) {
        console.error('Create participation error:', error);
        return NextResponse.json({ error: 'خطأ في تسجيل المشاركة' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.ALL)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const body = await request.json();
        const { id, status, role, notes } = body;

        if (!id) {
            return NextResponse.json({ error: 'معرف المشاركة مطلوب' }, { status: 400 });
        }

        const participation = await prisma.activityParticipation.update({
            where: { id: parseInt(id) },
            data: {
                status,
                role,
                notes,
            },
        });

        return NextResponse.json({ participation });
    } catch (error) {
        console.error('Update participation error:', error);
        return NextResponse.json({ error: 'خطأ في تحديث المشاركة' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.ALL)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'معرف المشاركة مطلوب' }, { status: 400 });
        }

        await prisma.activityParticipation.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ message: 'تم حذف المشاركة بنجاح' });
    } catch (error) {
        console.error('Delete participation error:', error);
        return NextResponse.json({ error: 'خطأ في حذف المشاركة' }, { status: 500 });
    }
}
