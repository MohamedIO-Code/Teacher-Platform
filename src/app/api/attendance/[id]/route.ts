import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, PERMISSIONS, hasPermission } from '@/lib/auth';

export async function PUT(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.MANAGEMENT)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { id } = await context.params;
        const attendanceId = parseInt(id);
        const body = await request.json();

        const record = await prisma.attendance.update({
            where: { id: attendanceId },
            data: {
                checkOut: body.checkOut ? new Date(body.checkOut) : undefined,
                status: body.status || undefined,
                notes: body.notes !== undefined ? body.notes : undefined,
            },
            include: {
                teacher: { select: { name: true } },
            },
        });

        return NextResponse.json({ success: true, record });
    } catch (error) {
        console.error('Update attendance error:', error);
        return NextResponse.json({ error: 'خطأ في تحديث سجل الحضور' }, { status: 500 });
    }
}
