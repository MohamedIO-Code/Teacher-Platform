import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, PERMISSIONS, hasPermission } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const teacherId = searchParams.get('teacherId');
        const type = searchParams.get('type');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const where: Record<string, unknown> = {};

        // إذا كان المستخدم مدرس، فلترة لملاحظاته فقط
        if (session.role === 'teacher') {
            // جلب معرف المدرس المرتبط بالمستخدم
            const teacherProfile = await prisma.teacher.findUnique({
                where: { userId: session.id },
                select: { id: true }
            });
            if (teacherProfile) {
                where.teacherId = teacherProfile.id;
            } else {
                // لا يوجد ملف مدرس مرتبط
                return NextResponse.json({
                    notes: [],
                    pagination: { page, limit, total: 0, totalPages: 0 },
                });
            }
        } else if (teacherId) {
            where.teacherId = parseInt(teacherId);
        }

        if (type) {
            where.type = type;
        }

        const [notes, total] = await Promise.all([
            prisma.note.findMany({
                where,
                include: {
                    teacher: { select: { id: true, name: true, employeeId: true } },
                    author: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.note.count({ where }),
        ]);

        return NextResponse.json({
            notes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get notes error:', error);
        return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.MANAGEMENT)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const body = await request.json();
        const { teacherId, type, content } = body;

        if (!teacherId || !content) {
            return NextResponse.json({ error: 'المدرس والمحتوى مطلوبان' }, { status: 400 });
        }

        // Verify teacher exists
        const teacher = await prisma.teacher.findUnique({ where: { id: parseInt(teacherId) } });
        if (!teacher) {
            return NextResponse.json({ error: 'المدرس غير موجود' }, { status: 404 });
        }

        const note = await prisma.note.create({
            data: {
                teacherId: parseInt(teacherId),
                authorId: session.id,
                type: type || 'info',
                content,
            },
            include: {
                teacher: { select: { name: true } },
                author: { select: { name: true } },
            },
        });

        await createAuditLog({
            userId: session.id,
            action: 'create',
            entity: 'note',
            entityId: note.id,
            details: { teacherId, type },
        });

        return NextResponse.json({ success: true, note }, { status: 201 });
    } catch (error) {
        console.error('Create note error:', error);
        return NextResponse.json({ error: 'خطأ في إنشاء الملاحظة' }, { status: 500 });
    }
}
