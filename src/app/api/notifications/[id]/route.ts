import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { id } = await params;
        const notificationId = parseInt(id);
        const body = await request.json();

        const notification = await prisma.notification.update({
            where: { id: notificationId, userId: session.id },
            data: { isRead: body.isRead },
        });

        return NextResponse.json({ notification });
    } catch (error) {
        console.error('Update notification error:', error);
        return NextResponse.json({ error: 'خطأ في التحديث' }, { status: 500 });
    }
}
