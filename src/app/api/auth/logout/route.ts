import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function POST() {
    try {
        const session = await getSession();

        if (session) {
            await createAuditLog({
                userId: session.id,
                action: 'logout',
                entity: 'user',
                entityId: session.id,
            });
        }

        const response = NextResponse.json({ success: true });

        // Clear the auth cookie
        response.cookies.set('auth-token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في تسجيل الخروج' },
            { status: 500 }
        );
    }
}
