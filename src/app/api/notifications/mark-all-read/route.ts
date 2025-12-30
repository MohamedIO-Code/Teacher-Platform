import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        await prisma.notification.updateMany({
            where: { userId: session.id, isRead: false },
            data: { isRead: true },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Mark all read error:', error);
        return NextResponse.json({ error: 'خطأ في التحديث' }, { status: 500 });
    }
}
