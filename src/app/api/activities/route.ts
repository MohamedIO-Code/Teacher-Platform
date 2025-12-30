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
        const categoryId = searchParams.get('categoryId');
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const where: Record<string, unknown> = {};
        if (categoryId) where.categoryId = parseInt(categoryId);
        if (status) where.status = status;

        const [activities, total] = await Promise.all([
            prisma.activity.findMany({
                where,
                include: {
                    category: true,
                    teacher: { select: { id: true, name: true } },
                    _count: { select: { participations: true } },
                },
                orderBy: { date: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.activity.count({ where }),
        ]);

        return NextResponse.json({
            activities,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get activities error:', error);
        return NextResponse.json({ error: 'خطأ في جلب الأنشطة' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.ALL)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const body = await request.json();
        const { title, description, categoryId, teacherId, date, endDate, time, location, maxParticipants } = body;

        if (!title || !categoryId || !date) {
            return NextResponse.json({ error: 'يرجى ملء الحقول المطلوبة' }, { status: 400 });
        }

        const activity = await prisma.activity.create({
            data: {
                title,
                description,
                categoryId: parseInt(categoryId),
                teacherId: teacherId ? parseInt(teacherId) : null,
                date: new Date(date),
                endDate: endDate ? new Date(endDate) : null,
                time,
                location,
                maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
            },
            include: {
                category: true,
                teacher: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json({ activity }, { status: 201 });
    } catch (error) {
        console.error('Create activity error:', error);
        return NextResponse.json({ error: 'خطأ في إنشاء النشاط' }, { status: 500 });
    }
}
