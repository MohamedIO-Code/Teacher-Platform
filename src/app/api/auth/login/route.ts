import { NextResponse } from 'next/server';
import { login, generateToken } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
                { status: 400 }
            );
        }

        const result = await login(email, password);

        if (!result.success || !result.user) {
            return NextResponse.json(
                { error: result.error },
                { status: 401 }
            );
        }

        const token = generateToken(result.user);

        // Create audit log
        await createAuditLog({
            userId: result.user.id,
            action: 'login',
            entity: 'user',
            entityId: result.user.id,
            details: { method: 'email' },
        });

        const response = NextResponse.json({
            success: true,
            user: result.user,
        });

        // Set HTTP-only cookie
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في تسجيل الدخول' },
            { status: 500 }
        );
    }
}
