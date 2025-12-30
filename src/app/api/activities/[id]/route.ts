import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, PERMISSIONS, hasPermission } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { id } = await params;
        const activityId = parseInt(id);

        const activity = await prisma.activity.findUnique({
            where: { id: activityId },
            include: {
                category: true,
                teacher: { select: { id: true, name: true, employeeId: true } },
                participations: {
                    include: {
                        student: { select: { id: true, name: true, studentId: true, grade: true } },
                        teacher: { select: { id: true, name: true, employeeId: true } },
                        evaluations: {
                            include: {
                                evaluator: { select: { id: true, name: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!activity) {
            return NextResponse.json({ error: 'النشاط غير موجود' }, { status: 404 });
        }

        return NextResponse.json({ activity });
    } catch (error) {
        console.error('Get activity error:', error);
        return NextResponse.json({ error: 'خطأ في جلب النشاط' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.ALL)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { id } = await params;
        const activityId = parseInt(id);
        const body = await request.json();

        const { title, description, categoryId, teacherId, date, endDate, time, location, status, maxParticipants } = body;

        const activity = await prisma.activity.update({
            where: { id: activityId },
            data: {
                title,
                description,
                categoryId: categoryId ? parseInt(categoryId) : undefined,
                teacherId: teacherId ? parseInt(teacherId) : null,
                date: date ? new Date(date) : undefined,
                endDate: endDate ? new Date(endDate) : null,
                time,
                location,
                status,
                maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
            },
            include: {
                category: true,
                teacher: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json({ activity });
    } catch (error) {
        console.error('Update activity error:', error);
        return NextResponse.json({ error: 'خطأ في تحديث النشاط' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.MANAGEMENT)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { id } = await params;
        const activityId = parseInt(id);

        await prisma.activity.delete({
            where: { id: activityId },
        });

        return NextResponse.json({ message: 'تم حذف النشاط بنجاح' });
    } catch (error) {
        console.error('Delete activity error:', error);
        return NextResponse.json({ error: 'خطأ في حذف النشاط' }, { status: 500 });
    }
}
