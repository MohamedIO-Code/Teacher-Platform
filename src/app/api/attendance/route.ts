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
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '30');

        const where: Record<string, unknown> = {};

        // إذا كان المستخدم مدرس، فلترة لسجلاته فقط
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
                    records: [],
                    pagination: { page, limit, total: 0, totalPages: 0 },
                });
            }
        } else if (teacherId) {
            where.teacherId = parseInt(teacherId);
        }

        if (status) {
            where.status = status;
        }

        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                (where.date as Record<string, unknown>).gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                (where.date as Record<string, unknown>).lte = end;
            }
        }

        const [records, total] = await Promise.all([
            prisma.attendance.findMany({
                where,
                include: {
                    teacher: { select: { id: true, name: true, employeeId: true } },
                },
                orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.attendance.count({ where }),
        ]);

        return NextResponse.json({
            records,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
        }

        const body = await request.json();
        let { teacherId, date, checkIn, checkOut, status, notes } = body;
        const selfRegister = body.selfRegister === true;

        // إذا كان المستخدم مدرس ويريد تسجيل حضوره الذاتي
        if (session.role === 'teacher') {
            if (!selfRegister) {
                return NextResponse.json({ error: 'غير مصرح بتسجيل حضور مدرسين آخرين' }, { status: 403 });
            }
            // جلب معرف المدرس المرتبط بالمستخدم
            const teacherProfile = await prisma.teacher.findUnique({
                where: { userId: session.id },
                select: { id: true }
            });
            if (!teacherProfile) {
                return NextResponse.json({ error: 'لم يتم العثور على ملف المدرس' }, { status: 404 });
            }
            teacherId = teacherProfile.id;
        } else if (!hasPermission(session.role, PERMISSIONS.MANAGEMENT)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        if (!teacherId || !date) {
            return NextResponse.json({ error: 'المدرس والتاريخ مطلوبان' }, { status: 400 });
        }

        const parsedTeacherId = typeof teacherId === 'number' ? teacherId : parseInt(teacherId);
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        // Check if attendance already exists for this teacher and date
        const existing = await prisma.attendance.findUnique({
            where: {
                teacherId_date: {
                    teacherId: parsedTeacherId,
                    date: attendanceDate,
                },
            },
        });

        let record;
        if (existing) {
            // Update existing record
            record = await prisma.attendance.update({
                where: { id: existing.id },
                data: {
                    checkIn: checkIn ? new Date(checkIn) : null,
                    checkOut: checkOut ? new Date(checkOut) : null,
                    status: status || existing.status,
                    notes,
                },
                include: {
                    teacher: { select: { name: true } },
                },
            });
        } else {
            // Create new record
            record = await prisma.attendance.create({
                data: {
                    teacherId: parsedTeacherId,
                    date: attendanceDate,
                    checkIn: checkIn ? new Date(checkIn) : null,
                    checkOut: checkOut ? new Date(checkOut) : null,
                    status: status || 'present',
                    notes,
                },
                include: {
                    teacher: { select: { name: true } },
                },
            });
        }

        await createAuditLog({
            userId: session.id,
            action: existing ? 'update' : 'create',
            entity: 'attendance',
            entityId: record.id,
            details: { teacherId, date, status: record.status },
        });

        return NextResponse.json({ success: true, record }, { status: existing ? 200 : 201 });
    } catch (error) {
        console.error('Create/Update attendance error:', error);
        return NextResponse.json({ error: 'خطأ في تسجيل الحضور' }, { status: 500 });
    }
}
