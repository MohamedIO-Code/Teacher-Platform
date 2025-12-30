import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, PERMISSIONS, hasPermission } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import * as XLSX from 'xlsx';


export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || !hasPermission(session.role, PERMISSIONS.MANAGEMENT)) {
            return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'summary';
        const format = searchParams.get('format') || 'excel';
        const teacherId = searchParams.get('teacherId');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // Build date filter
        const dateFilter: Record<string, unknown> = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);

        // Fetch data based on report type
        let data: Record<string, unknown>[] = [];

        if (type === 'attendance') {
            const where: Record<string, unknown> = {};
            if (teacherId) where.teacherId = parseInt(teacherId);
            if (Object.keys(dateFilter).length > 0) where.date = dateFilter;

            const records = await prisma.attendance.findMany({
                where,
                include: { teacher: { select: { name: true, employeeId: true } } },
                orderBy: { date: 'desc' },
            });

            data = records.map((r) => ({
                'الرقم الوظيفي': r.teacher.employeeId,
                'اسم المدرس': r.teacher.name,
                'التاريخ': new Date(r.date).toLocaleDateString('ar-SA'),
                'وقت الحضور': r.checkIn ? new Date(r.checkIn).toLocaleTimeString('ar-SA') : '-',
                'وقت الانصراف': r.checkOut ? new Date(r.checkOut).toLocaleTimeString('ar-SA') : '-',
                'الحالة': getStatusLabel(r.status),
                'ملاحظات': r.notes || '-',
            }));
        } else if (type === 'evaluations') {
            const where: Record<string, unknown> = {};
            if (teacherId) where.teacherId = parseInt(teacherId);
            if (Object.keys(dateFilter).length > 0) where.date = dateFilter;

            const records = await prisma.evaluation.findMany({
                where,
                include: {
                    teacher: { select: { name: true, employeeId: true } },
                    evaluator: { select: { name: true } },
                },
                orderBy: { date: 'desc' },
            });

            data = records.map((r) => ({
                'الرقم الوظيفي': r.teacher.employeeId,
                'اسم المدرس': r.teacher.name,
                'تاريخ التقييم': new Date(r.date).toLocaleDateString('ar-SA'),
                'جودة التدريس': r.teachingQuality,
                'الالتزام بالمواعيد': r.punctuality,
                'التفاعل مع الطلاب': r.studentInteraction,
                'الالتزام بالخطة': r.curriculumAdherence,
                'التخطيط والإعداد للدرس': r.lessonPlanning || '-',
                'تنفيذ الدرس والتدريس': r.lessonExecution || '-',
                'إدارة الصف والبيئة التعليمية': r.classroomManagement || '-',
                'النمو المهني والمهنية': r.professionalGrowth || '-',
                'المعدل العام': r.overallScore.toFixed(1),
                'المقيم': r.evaluator.name,
                'ملاحظات': r.comments || '-',
            }));
        } else {
            // Summary report
            const teachers = await prisma.teacher.findMany({
                where: teacherId ? { id: parseInt(teacherId) } : { status: 'active' },
                include: {
                    department: { select: { name: true } },
                    subject: { select: { name: true } },
                },
            });

            for (const teacher of teachers) {
                const attendanceStats = await prisma.attendance.groupBy({
                    by: ['status'],
                    where: {
                        teacherId: teacher.id,
                        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
                    },
                    _count: true,
                });

                const avgEvaluation = await prisma.evaluation.aggregate({
                    where: {
                        teacherId: teacher.id,
                        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
                    },
                    _avg: {
                        overallScore: true,
                        teachingQuality: true,
                        punctuality: true,
                        studentInteraction: true,
                        curriculumAdherence: true,
                        lessonPlanning: true,
                        lessonExecution: true,
                        classroomManagement: true,
                        professionalGrowth: true,
                    },
                    _count: true,
                });

                const attendanceMap = attendanceStats.reduce((acc, curr) => {
                    acc[curr.status] = curr._count;
                    return acc;
                }, {} as Record<string, number>);

                const totalAttendance = Object.values(attendanceMap).reduce((a, b) => a + b, 0);
                const presentCount = (attendanceMap['present'] || 0) + (attendanceMap['late'] || 0);
                const attendanceRate = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : '0';

                data.push({
                    'الرقم الوظيفي': teacher.employeeId,
                    'اسم المدرس': teacher.name,
                    'القسم': teacher.department?.name || '-',
                    'المادة': teacher.subject?.name || '-',
                    'أيام الحضور': presentCount,
                    'أيام الغياب': attendanceMap['absent'] || 0,
                    'أيام التأخير': attendanceMap['late'] || 0,
                    'نسبة الحضور': `${attendanceRate}%`,
                    'عدد التقييمات': avgEvaluation._count,
                    'متوسط جودة التدريس': avgEvaluation._avg.teachingQuality?.toFixed(1) || '-',
                    'متوسط الالتزام بالمواعيد': avgEvaluation._avg.punctuality?.toFixed(1) || '-',
                    'متوسط التفاعل مع الطلاب': avgEvaluation._avg.studentInteraction?.toFixed(1) || '-',
                    'متوسط الالتزام بالمنهج': avgEvaluation._avg.curriculumAdherence?.toFixed(1) || '-',
                    'متوسط التخطيط للدرس': avgEvaluation._avg.lessonPlanning?.toFixed(1) || '-',
                    'متوسط تنفيذ الدرس': avgEvaluation._avg.lessonExecution?.toFixed(1) || '-',
                    'متوسط إدارة الصف': avgEvaluation._avg.classroomManagement?.toFixed(1) || '-',
                    'متوسط النمو المهني': avgEvaluation._avg.professionalGrowth?.toFixed(1) || '-',
                    'المعدل العام': avgEvaluation._avg.overallScore?.toFixed(1) || '-',
                });
            }
        }

        // Create audit log
        await createAuditLog({
            userId: session.id,
            action: 'export',
            entity: 'report',
            details: { type, format, teacherId, startDate, endDate },
        });

        // Generate file
        if (format === 'excel') {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'التقرير');

            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': `attachment; filename="report-${type}.xlsx"`,
                },
            });
        } else {
            // Return JSON data for client-side PDF generation
            return NextResponse.json({
                success: true,
                data,
                metadata: {
                    type,
                    startDate,
                    endDate,
                    generatedAt: new Date().toISOString(),
                }
            });
        }
    } catch (error) {
        console.error('Generate report error:', error);
        return NextResponse.json({ error: 'خطأ في إنشاء التقرير' }, { status: 500 });
    }
}

function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        present: 'حاضر',
        absent: 'غائب',
        late: 'متأخر',
        excused: 'إجازة',
    };
    return labels[status] || status;
}

