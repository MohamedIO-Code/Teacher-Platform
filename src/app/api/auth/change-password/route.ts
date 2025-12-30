import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'غير مصرح' },
                { status: 401 }
            );
        }

        const { currentPassword, newPassword } = await request.json();

        // Validate input
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'جميع الحقول مطلوبة' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
                { status: 400 }
            );
        }

        // Get user with password
        const user = await prisma.user.findUnique({
            where: { id: session.id },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'المستخدم غير موجود' },
                { status: 404 }
            );
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'كلمة المرور الحالية غير صحيحة' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: session.id },
            data: { password: hashedPassword },
        });

        return NextResponse.json({
            message: 'تم تغيير كلمة المرور بنجاح'
        });
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في الخادم' },
            { status: 500 }
        );
    }
}
