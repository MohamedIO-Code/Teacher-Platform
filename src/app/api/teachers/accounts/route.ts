import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, PERMISSIONS, hasPermission, hashPassword } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

// Create user account for a teacher
export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.ADMIN)) {
            return NextResponse.json({ error: 'غير مصرح - فقط المسؤولين يمكنهم إنشاء حسابات المدرسين' }, { status: 403 });
        }

        const body = await request.json();
        const { teacherId, email, password, name } = body;

        if (!teacherId || !email || !password) {
            return NextResponse.json({ error: 'معرف المدرس والبريد الإلكتروني وكلمة المرور مطلوبة' }, { status: 400 });
        }

        // Validate password strength
        if (password.length < 8) {
            return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 });
        }

        // Check if teacher exists
        const teacher = await prisma.teacher.findUnique({
            where: { id: parseInt(teacherId) },
            include: { user: true },
        });

        if (!teacher) {
            return NextResponse.json({ error: 'المدرس غير موجود' }, { status: 404 });
        }

        if (teacher.userId) {
            return NextResponse.json({ error: 'المدرس لديه حساب مسجل بالفعل' }, { status: 400 });
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user and link to teacher in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user account
            const newUser = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: name || teacher.name,
                    role: 'teacher',
                    isActive: true,
                },
            });

            // Link user to teacher
            const updatedTeacher = await tx.teacher.update({
                where: { id: teacher.id },
                data: { userId: newUser.id },
                include: {
                    user: { select: { id: true, email: true, name: true, role: true } },
                },
            });

            return { user: newUser, teacher: updatedTeacher };
        });

        // Create audit log
        await createAuditLog({
            userId: session.id,
            action: 'create',
            entity: 'user',
            entityId: result.user.id,
            details: {
                teacherId: teacher.id,
                teacherName: teacher.name,
                email: result.user.email,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'تم إنشاء حساب المدرس بنجاح',
            teacher: {
                id: result.teacher.id,
                name: result.teacher.name,
                email: result.user.email,
                hasAccount: true,
            },
        }, { status: 201 });

    } catch (error) {
        console.error('Create teacher account error:', error);
        return NextResponse.json({ error: 'خطأ في إنشاء حساب المدرس' }, { status: 500 });
    }
}

// Get teachers with their account status
export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.ADMIN)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const hasAccount = searchParams.get('hasAccount');

        const where: Record<string, unknown> = {};

        if (hasAccount === 'true') {
            where.userId = { not: null };
        } else if (hasAccount === 'false') {
            where.userId = null;
        }

        const teachers = await prisma.teacher.findMany({
            where,
            include: {
                user: { select: { id: true, email: true, name: true, isActive: true } },
                department: { select: { name: true } },
            },
            orderBy: { name: 'asc' },
        });

        const teachersWithAccountStatus = teachers.map(t => ({
            id: t.id,
            employeeId: t.employeeId,
            name: t.name,
            email: t.email,
            department: t.department?.name,
            hasAccount: !!t.userId,
            accountEmail: t.user?.email,
            accountActive: t.user?.isActive,
        }));

        return NextResponse.json({ teachers: teachersWithAccountStatus });

    } catch (error) {
        console.error('Get teacher accounts error:', error);
        return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
    }
}

// Reset password for a teacher
export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.ADMIN)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const body = await request.json();
        const { teacherId, newPassword } = body;

        if (!teacherId || !newPassword) {
            return NextResponse.json({ error: 'معرف المدرس وكلمة المرور الجديدة مطلوبة' }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }, { status: 400 });
        }

        const teacher = await prisma.teacher.findUnique({
            where: { id: parseInt(teacherId) },
            include: { user: true },
        });

        if (!teacher || !teacher.userId) {
            return NextResponse.json({ error: 'المدرس لا يملك حساباً' }, { status: 404 });
        }

        const hashedPassword = await hashPassword(newPassword);

        await prisma.user.update({
            where: { id: teacher.userId },
            data: { password: hashedPassword },
        });

        await createAuditLog({
            userId: session.id,
            action: 'update',
            entity: 'user',
            entityId: teacher.userId,
            details: { action: 'password_reset', teacherId: teacher.id },
        });

        return NextResponse.json({
            success: true,
            message: 'تم تحديث كلمة المرور بنجاح',
        });

    } catch (error) {
        console.error('Reset teacher password error:', error);
        return NextResponse.json({ error: 'خطأ في تحديث كلمة المرور' }, { status: 500 });
    }
}
