import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }, { status: 400 });
        }

        const parent = await prisma.parent.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                isActive: true,
            },
        });

        if (!parent) {
            return NextResponse.json({ error: 'البريد الإلكتروني غير مسجل' }, { status: 401 });
        }

        if (!parent.isActive) {
            return NextResponse.json({ error: 'الحساب غير مفعّل' }, { status: 403 });
        }

        const validPassword = await bcrypt.compare(password, parent.password);
        if (!validPassword) {
            return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
        }

        return NextResponse.json({
            parent: {
                id: parent.id,
                name: parent.name,
                email: parent.email,
            },
        });
    } catch (error) {
        console.error('Parent login error:', error);
        return NextResponse.json({ error: 'خطأ في تسجيل الدخول' }, { status: 500 });
    }
}
