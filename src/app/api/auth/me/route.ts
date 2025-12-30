import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'غير مصرح' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: session.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'المستخدم غير موجود' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في الخادم' },
            { status: 500 }
        );
    }
}
