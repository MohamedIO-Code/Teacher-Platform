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
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const departmentId = searchParams.get('departmentId') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const where: Record<string, unknown> = {};

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { employeeId: { contains: search } },
                { email: { contains: search } },
            ];
        }

        if (status) {
            where.status = status;
        }

        if (departmentId) {
            where.departmentId = parseInt(departmentId);
        }

        const [teachers, total] = await Promise.all([
            prisma.teacher.findMany({
                where,
                include: {
                    department: { select: { id: true, name: true } },
                    subject: { select: { id: true, name: true } },
                    _count: {
                        select: {
                            evaluations: true,
                            attendances: true,
                            notes: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.teacher.count({ where }),
        ]);

        // Get average evaluation for each teacher
        const teachersWithAvg = await Promise.all(
            teachers.map(async (teacher) => {
                const avg = await prisma.evaluation.aggregate({
                    where: { teacherId: teacher.id },
                    _avg: { overallScore: true },
                });
                return {
                    ...teacher,
                    avgScore: avg._avg.overallScore ? Number(avg._avg.overallScore.toFixed(1)) : null,
                };
            })
        );

        return NextResponse.json({
            teachers: teachersWithAvg,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get teachers error:', error);
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
        const { employeeId, name, email, phone, departmentId, subjectId, joinDate, status } = body;

        if (!employeeId || !name) {
            return NextResponse.json({ error: 'الرقم الوظيفي والاسم مطلوبان' }, { status: 400 });
        }

        // Check if employeeId already exists
        const existing = await prisma.teacher.findUnique({ where: { employeeId } });
        if (existing) {
            return NextResponse.json({ error: 'الرقم الوظيفي مستخدم مسبقاً' }, { status: 400 });
        }

        const teacher = await prisma.teacher.create({
            data: {
                employeeId,
                name,
                email,
                phone,
                departmentId: departmentId ? parseInt(departmentId) : null,
                subjectId: subjectId ? parseInt(subjectId) : null,
                joinDate: joinDate ? new Date(joinDate) : null,
                status: status || 'active',
            },
            include: {
                department: { select: { name: true } },
                subject: { select: { name: true } },
            },
        });

        await createAuditLog({
            userId: session.id,
            action: 'create',
            entity: 'teacher',
            entityId: teacher.id,
            details: { name: teacher.name, employeeId: teacher.employeeId },
        });

        return NextResponse.json({ success: true, teacher }, { status: 201 });
    } catch (error) {
        console.error('Create teacher error:', error);
        return NextResponse.json({ error: 'خطأ في إنشاء المدرس' }, { status: 500 });
    }
}
