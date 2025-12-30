import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, PERMISSIONS, hasPermission } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.MANAGEMENT)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';

        const where: Record<string, unknown> = { isActive: true };
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
            ];
        }

        const [parents, total] = await Promise.all([
            prisma.parent.findMany({
                where,
                include: {
                    students: { select: { id: true, name: true, studentId: true, grade: true } },
                },
                orderBy: { name: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.parent.count({ where }),
        ]);

        // Remove password from response
        const safeParents = parents.map(({ password: _, ...parent }) => parent);

        return NextResponse.json({
            parents: safeParents,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('Get parents error:', error);
        return NextResponse.json({ error: 'خطأ في جلب أولياء الأمور' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.MANAGEMENT)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const body = await request.json();
        const { email, password, name, phone } = body;

        if (!email || !password || !name) {
            return NextResponse.json({ error: 'البريد الإلكتروني وكلمة المرور والاسم مطلوبون' }, { status: 400 });
        }

        const existing = await prisma.parent.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'البريد الإلكتروني موجود مسبقاً' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const parent = await prisma.parent.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone,
            },
        });

        const { password: _, ...safeParent } = parent;

        return NextResponse.json({ parent: safeParent }, { status: 201 });
    } catch (error) {
        console.error('Create parent error:', error);
        return NextResponse.json({ error: 'خطأ في إنشاء ولي الأمر' }, { status: 500 });
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
            return NextResponse.json({ error: 'معرف ولي الأمر مطلوب' }, { status: 400 });
        }

        const body = await request.json();
        const { name, phone, password } = body;

        const updateData: Record<string, unknown> = { name, phone };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const parent = await prisma.parent.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                students: { select: { id: true, name: true } },
            },
        });

        const { password: _, ...safeParent } = parent;
        return NextResponse.json({ parent: safeParent });
    } catch (error) {
        console.error('Update parent error:', error);
        return NextResponse.json({ error: 'خطأ في تحديث ولي الأمر' }, { status: 500 });
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
            return NextResponse.json({ error: 'معرف ولي الأمر مطلوب' }, { status: 400 });
        }

        // Unlink students from this parent first
        await prisma.student.updateMany({
            where: { parentId: parseInt(id) },
            data: { parentId: null },
        });

        await prisma.parent.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete parent error:', error);
        return NextResponse.json({ error: 'خطأ في حذف ولي الأمر' }, { status: 500 });
    }
}
