import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, PERMISSIONS, hasPermission } from '@/lib/auth';

export async function GET() {
    try {
        const categories = await prisma.activityCategory.findMany({
            include: {
                _count: { select: { activities: true } },
            },
            orderBy: { id: 'asc' },
        });

        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Get categories error:', error);
        return NextResponse.json({ error: 'خطأ في جلب الفئات' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.MANAGEMENT)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const body = await request.json();
        const { name, description, icon, color } = body;

        if (!name) {
            return NextResponse.json({ error: 'اسم الفئة مطلوب' }, { status: 400 });
        }

        const category = await prisma.activityCategory.create({
            data: { name, description, icon, color },
        });

        return NextResponse.json({ category }, { status: 201 });
    } catch (error) {
        console.error('Create category error:', error);
        return NextResponse.json({ error: 'خطأ في إنشاء الفئة' }, { status: 500 });
    }
}
