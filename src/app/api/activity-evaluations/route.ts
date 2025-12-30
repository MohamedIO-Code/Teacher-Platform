import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, PERMISSIONS, hasPermission } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.ALL)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const body = await request.json();
        const { participationId, score, performance, strengths, improvements, comments } = body;

        if (!participationId) {
            return NextResponse.json({ error: 'معرف المشاركة مطلوب' }, { status: 400 });
        }

        const parsedParticipationId = parseInt(participationId);
        if (isNaN(parsedParticipationId)) {
            return NextResponse.json({ error: 'معرف المشاركة غير صالح' }, { status: 400 });
        }

        // Check existence
        const participation = await prisma.activityParticipation.findUnique({
            where: { id: parsedParticipationId }
        });

        if (!participation) {
            return NextResponse.json({ error: 'المشاركة غير موجودة' }, { status: 404 });
        }

        const evaluation = await prisma.activityEvaluation.create({
            data: {
                participationId: parsedParticipationId,
                evaluatorId: session.id,
                score: parseInt(score) || 0,
                performance,
                strengths,
                improvements,
                comments,
            },
            include: {
                evaluator: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json({ evaluation }, { status: 201 });
    } catch (error) {
        console.error('Create activity evaluation error:', error);
        return NextResponse.json({ error: 'خطأ في إنشاء التقييم' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.ALL)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const body = await request.json();
        const { id, score, performance, strengths, improvements, comments } = body;

        if (!id) {
            return NextResponse.json({ error: 'معرف التقييم مطلوب' }, { status: 400 });
        }

        const evaluation = await prisma.activityEvaluation.update({
            where: { id: parseInt(id) },
            data: {
                score: parseInt(score) || undefined,
                performance,
                strengths,
                improvements,
                comments,
            },
        });

        return NextResponse.json({ evaluation });
    } catch (error) {
        console.error('Update activity evaluation error:', error);
        return NextResponse.json({ error: 'خطأ في تحديث التقييم' }, { status: 500 });
    }
}
