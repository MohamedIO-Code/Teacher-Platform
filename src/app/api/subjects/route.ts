import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const subjects = await prisma.subject.findMany({
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ subjects });
    } catch (error) {
        console.error('Get subjects error:', error);
        return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
    }
}
