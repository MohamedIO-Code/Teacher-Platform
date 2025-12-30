import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const parentId = searchParams.get('parentId');

        if (!parentId) {
            return NextResponse.json({ error: 'معرف ولي الأمر مطلوب' }, { status: 400 });
        }

        const parent = await prisma.parent.findUnique({
            where: { id: parseInt(parentId) },
            select: {
                id: true,
                name: true,
                email: true,
                students: {
                    select: {
                        id: true,
                        name: true,
                        studentId: true,
                        grade: true,
                        participations: {
                            include: {
                                activity: {
                                    select: {
                                        id: true,
                                        title: true,
                                        date: true,
                                        time: true,
                                        location: true,
                                        status: true,
                                        category: { select: { name: true } },
                                    },
                                },
                                evaluations: {
                                    select: {
                                        id: true,
                                        score: true,
                                        performance: true,
                                        strengths: true,
                                        comments: true,
                                    },
                                },
                            },
                            orderBy: { activity: { date: 'desc' } },
                        },
                    },
                },
            },
        });

        if (!parent) {
            return NextResponse.json({ error: 'ولي الأمر غير موجود' }, { status: 404 });
        }

        return NextResponse.json({ parent });
    } catch (error) {
        console.error('Get parent data error:', error);
        return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
    }
}
