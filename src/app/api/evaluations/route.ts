import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, PERMISSIONS, hasPermission } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const teacherId = searchParams.get('teacherId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const where: Record<string, unknown> = {};

        // إذا كان المستخدم مدرس، فلترة لتقييماته فقط
        if (session.role === 'teacher') {
            // جلب معرف المدرس المرتبط بالمستخدم
            const teacherProfile = await prisma.teacher.findUnique({
                where: { userId: session.id },
                select: { id: true }
            });
            if (teacherProfile) {
                where.teacherId = teacherProfile.id;
            } else {
                // لا يوجد ملف مدرس مرتبط
                return NextResponse.json({
                    evaluations: [],
                    pagination: { page, limit, total: 0, totalPages: 0 },
                });
            }
        } else if (teacherId) {
            where.teacherId = parseInt(teacherId);
        }

        if (startDate || endDate) {
            where.date = {};
            if (startDate) (where.date as Record<string, unknown>).gte = new Date(startDate);
            if (endDate) (where.date as Record<string, unknown>).lte = new Date(endDate);
        }

        const [evaluations, total] = await Promise.all([
            prisma.evaluation.findMany({
                where,
                include: {
                    teacher: { select: { id: true, name: true, employeeId: true } },
                    evaluator: { select: { id: true, name: true } },
                },
                orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.evaluation.count({ where }),
        ]);

        return NextResponse.json({
            evaluations,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get evaluations error:', error);
        return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.MANAGEMENT)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const body = await request.json();
        const {
            teacherId,
            date,
            // المعايير القديمة
            teachingQuality,
            punctuality,
            studentInteraction,
            curriculumAdherence,
            // المعايير الجديدة
            lessonPlanning,
            lessonPlanningNote,
            lessonExecution,
            lessonExecutionNote,
            classroomManagement,
            classroomManagementNote,
            professionalGrowth,
            professionalGrowthNote,
            comments
        } = body;

        if (!teacherId || !date) {
            return NextResponse.json({ error: 'المدرس والتاريخ مطلوبان' }, { status: 400 });
        }

        const parsedTeacherId = typeof teacherId === 'string' ? parseInt(teacherId) : teacherId;

        if (isNaN(parsedTeacherId)) {
            return NextResponse.json({ error: 'معرف المدرس غير صالح' }, { status: 400 });
        }

        // Check if teacher exists
        const teacher = await prisma.teacher.findUnique({ where: { id: parsedTeacherId } });

        if (!teacher) {
            return NextResponse.json({ error: 'المدرس غير موجود' }, { status: 404 });
        }

        // Ensure session.id is a valid number
        const evaluatorId = typeof session.id === 'string' ? parseInt(session.id) : session.id;

        if (isNaN(evaluatorId)) {
            return NextResponse.json({ error: 'معرف المستخدم غير صالح' }, { status: 400 });
        }

        // حساب المتوسط العام
        const tq = typeof teachingQuality === 'number' ? teachingQuality : parseInt(teachingQuality) || 7;
        const pu = typeof punctuality === 'number' ? punctuality : parseInt(punctuality) || 7;
        const si = typeof studentInteraction === 'number' ? studentInteraction : parseInt(studentInteraction) || 7;
        const ca = typeof curriculumAdherence === 'number' ? curriculumAdherence : parseInt(curriculumAdherence) || 7;
        const lp = typeof lessonPlanning === 'number' ? lessonPlanning : parseInt(lessonPlanning) || 7;
        const le = typeof lessonExecution === 'number' ? lessonExecution : parseInt(lessonExecution) || 7;
        const cm = typeof classroomManagement === 'number' ? classroomManagement : parseInt(classroomManagement) || 7;
        const pg = typeof professionalGrowth === 'number' ? professionalGrowth : parseInt(professionalGrowth) || 7;

        const oldScore = (tq + pu + si + ca) / 4;
        const newScore = (lp + le + cm + pg) / 4;
        const overallScore = (oldScore + newScore) / 2;

        const evaluation = await prisma.evaluation.create({
            data: {
                teacherId: parsedTeacherId,
                evaluatorId: evaluatorId,
                date: new Date(date),
                teachingQuality: tq,
                punctuality: pu,
                studentInteraction: si,
                curriculumAdherence: ca,
                lessonPlanning: lp,
                lessonPlanningNote: lessonPlanningNote || null,
                lessonExecution: le,
                lessonExecutionNote: lessonExecutionNote || null,
                classroomManagement: cm,
                classroomManagementNote: classroomManagementNote || null,
                professionalGrowth: pg,
                professionalGrowthNote: professionalGrowthNote || null,
                overallScore,
                comments,
            },
            include: {
                teacher: { select: { name: true } },
                evaluator: { select: { name: true } },
            },
        });

        await createAuditLog({
            userId: evaluatorId,
            action: 'create',
            entity: 'evaluation',
            entityId: evaluation.id,
            details: { teacherId, overallScore },
        });

        return NextResponse.json({ success: true, evaluation }, { status: 201 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : '';
        console.error('Create evaluation error:', errorMessage);
        console.error('Error stack:', errorStack);
        console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        return NextResponse.json({ error: 'خطأ في إنشاء التقييم', details: errorMessage }, { status: 500 });
    }
}
