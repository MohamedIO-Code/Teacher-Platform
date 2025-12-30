import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PUT(request: Request) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'غير مصرح' },
                { status: 401 }
            );
        }

        const { name, email } = await request.json();

        // Validate input
        if (!name || !email) {
            return NextResponse.json(
                { error: 'الاسم والبريد الإلكتروني مطلوبان' },
                { status: 400 }
            );
        }

        // Check if email is already used by another user
        const existingUser = await prisma.user.findFirst({
            where: {
                email,
                id: { not: session.id },
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'البريد الإلكتروني مستخدم بالفعل' },
                { status: 400 }
            );
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: session.id },
            data: { name, email },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        return NextResponse.json({
            message: 'تم تحديث الملف الشخصي بنجاح',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في الخادم' },
            { status: 500 }
        );
    }
}
