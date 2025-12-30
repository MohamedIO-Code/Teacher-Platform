import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const notifications = await prisma.notification.findMany({
            where: { userId: session.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
    }
}
