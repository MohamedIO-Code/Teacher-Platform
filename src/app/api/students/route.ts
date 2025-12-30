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
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const grade = searchParams.get('grade');
        const status = searchParams.get('status') || 'active';

        const where: Record<string, unknown> = { status };
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { studentId: { contains: search } },
            ];
        }
        if (grade) where.grade = grade;

        const [students, total] = await Promise.all([
            prisma.student.findMany({
                where,
                include: {
                    parent: { select: { id: true, name: true, phone: true } },
                    _count: { select: { participations: true } },
                },
                orderBy: { name: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.student.count({ where }),
        ]);

        return NextResponse.json({
            students,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('Get students error:', error);
        return NextResponse.json({ error: 'خطأ في جلب الطلاب' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.MANAGEMENT)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const body = await request.json();
        const { studentId, name, email, phone, grade, parentId } = body;

        if (!studentId || !name) {
            return NextResponse.json({ error: 'الرقم الطلابي والاسم مطلوبان' }, { status: 400 });
        }

        const existing = await prisma.student.findUnique({ where: { studentId } });
        if (existing) {
            return NextResponse.json({ error: 'الرقم الطلابي موجود مسبقاً' }, { status: 400 });
        }

        const student = await prisma.student.create({
            data: {
                studentId,
                name,
                email,
                phone,
                grade,
                parentId: parentId ? parseInt(parentId) : null,
            },
            include: {
                parent: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json({ student }, { status: 201 });
    } catch (error) {
        console.error('Create student error:', error);
        return NextResponse.json({ error: 'خطأ في إنشاء الطالب' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.MANAGEMENT)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'معرف الطالب مطلوب' }, { status: 400 });
        }

        const body = await request.json();
        const { name, email, phone, grade, parentId } = body;

        const student = await prisma.student.update({
            where: { id: parseInt(id) },
            data: {
                name,
                email,
                phone,
                grade,
                parentId: parentId ? parseInt(parentId) : null,
            },
            include: {
                parent: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json({ student });
    } catch (error) {
        console.error('Update student error:', error);
        return NextResponse.json({ error: 'خطأ في تحديث الطالب' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.MANAGEMENT)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'معرف الطالب مطلوب' }, { status: 400 });
        }

        // Delete related participations and evaluations first
        await prisma.activityEvaluation.deleteMany({
            where: { participation: { studentId: parseInt(id) } },
        });
        await prisma.activityParticipation.deleteMany({
            where: { studentId: parseInt(id) },
        });

        await prisma.student.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete student error:', error);
        return NextResponse.json({ error: 'خطأ في حذف الطالب' }, { status: 500 });
    }
}
