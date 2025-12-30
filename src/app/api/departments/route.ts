import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const departments = await prisma.department.findMany({
            include: {
                _count: { select: { teachers: true } },
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ departments });
    } catch (error) {
        console.error('Get departments error:', error);
        return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
    }
}
