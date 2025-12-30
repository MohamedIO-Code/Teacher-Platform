const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (new tables first due to foreign key constraints)
  await prisma.activityEvaluation.deleteMany();
  await prisma.activityParticipation.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.activityCategory.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();

  // Clear original tables
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.note.deleteMany();
  await prisma.evaluation.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const managerPassword = await bcrypt.hash('Manager123!', 10);
  const teacherPassword = await bcrypt.hash('Teacher123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@school.com',
      password: hashedPassword,
      name: 'مدير النظام',
      role: 'admin',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@school.com',
      password: managerPassword,
      name: 'أحمد المنسق',
      role: 'manager',
    },
  });

  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@school.com',
      password: teacherPassword,
      name: 'محمد المدرس',
      role: 'teacher',
    },
  });

  console.log('✅ Users created');

  // Create Departments
  const departments = await Promise.all([
    prisma.department.create({ data: { name: 'قسم اللغة العربية', description: 'تعليم اللغة العربية وآدابها' } }),
    prisma.department.create({ data: { name: 'قسم الرياضيات', description: 'تعليم الرياضيات والهندسة' } }),
    prisma.department.create({ data: { name: 'قسم العلوم', description: 'تعليم الفيزياء والكيمياء والأحياء' } }),
    prisma.department.create({ data: { name: 'قسم اللغة الإنجليزية', description: 'تعليم اللغة الإنجليزية' } }),
    prisma.department.create({ data: { name: 'قسم الدراسات الإسلامية', description: 'تعليم التربية الإسلامية' } }),
  ]);

  console.log('✅ Departments created');

  // Create Subjects
  const subjects = await Promise.all([
    prisma.subject.create({ data: { name: 'اللغة العربية', description: 'النحو والصرف والأدب' } }),
    prisma.subject.create({ data: { name: 'الرياضيات', description: 'الجبر والهندسة' } }),
    prisma.subject.create({ data: { name: 'الفيزياء', description: 'الميكانيكا والكهرباء' } }),
    prisma.subject.create({ data: { name: 'الكيمياء', description: 'الكيمياء العامة والعضوية' } }),
    prisma.subject.create({ data: { name: 'الأحياء', description: 'علم الأحياء' } }),
    prisma.subject.create({ data: { name: 'اللغة الإنجليزية', description: 'القراءة والكتابة والمحادثة' } }),
    prisma.subject.create({ data: { name: 'التربية الإسلامية', description: 'الفقه والعقيدة' } }),
  ]);

  console.log('✅ Subjects created');

  // Create Teachers
  const teacherNames = [
    { name: 'عبدالله السعيد', deptIdx: 0, subjIdx: 0 },
    { name: 'فاطمة الأحمد', deptIdx: 0, subjIdx: 0 },
    { name: 'خالد العمري', deptIdx: 1, subjIdx: 1 },
    { name: 'نورة الشمري', deptIdx: 1, subjIdx: 1 },
    { name: 'سعود المالكي', deptIdx: 2, subjIdx: 2 },
    { name: 'هند القحطاني', deptIdx: 2, subjIdx: 3 },
    { name: 'محمد الدوسري', deptIdx: 2, subjIdx: 4 },
    { name: 'سارة العتيبي', deptIdx: 3, subjIdx: 5 },
    { name: 'عمر الغامدي', deptIdx: 4, subjIdx: 6 },
    { name: 'ليلى الحربي', deptIdx: 3, subjIdx: 5 },
  ];

  const teachers = [];
  for (let i = 0; i < teacherNames.length; i++) {
    const t = teacherNames[i];
    const teacher = await prisma.teacher.create({
      data: {
        employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
        name: t.name,
        email: `teacher${i + 1}@school.com`,
        phone: `05${Math.floor(10000000 + Math.random() * 90000000)}`,
        departmentId: departments[t.deptIdx].id,
        subjectId: subjects[t.subjIdx].id,
        joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1),
        status: i < 9 ? 'active' : 'inactive',
      },
    });
    teachers.push(teacher);
  }

  console.log('✅ Teachers created');

  // Create Attendance records for the last 30 days
  const today = new Date();
  for (const teacher of teachers) {
    for (let d = 0; d < 30; d++) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);

      // Skip weekends (Friday = 5, Saturday = 6)
      if (date.getDay() === 5 || date.getDay() === 6) continue;

      const rand = Math.random();
      let status, checkIn, checkOut;

      if (rand < 0.85) {
        status = 'present';
        checkIn = new Date(date.setHours(7, Math.floor(Math.random() * 30), 0));
        checkOut = new Date(date.setHours(14, Math.floor(Math.random() * 30), 0));
      } else if (rand < 0.93) {
        status = 'late';
        checkIn = new Date(date.setHours(8, Math.floor(Math.random() * 60), 0));
        checkOut = new Date(date.setHours(14, Math.floor(Math.random() * 30), 0));
      } else if (rand < 0.97) {
        status = 'excused';
        checkIn = null;
        checkOut = null;
      } else {
        status = 'absent';
        checkIn = null;
        checkOut = null;
      }

      await prisma.attendance.create({
        data: {
          teacherId: teacher.id,
          date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          checkIn,
          checkOut,
          status,
        },
      });
    }
  }

  console.log('✅ Attendance records created');

  // Create Evaluations
  for (const teacher of teachers) {
    const numEvaluations = Math.floor(Math.random() * 3) + 2;
    for (let e = 0; e < numEvaluations; e++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - e * 2);

      const teachingQuality = Math.floor(Math.random() * 4) + 6;
      const punctuality = Math.floor(Math.random() * 4) + 6;
      const studentInteraction = Math.floor(Math.random() * 4) + 6;
      const curriculumAdherence = Math.floor(Math.random() * 4) + 6;
      const overallScore = (teachingQuality + punctuality + studentInteraction + curriculumAdherence) / 4;

      await prisma.evaluation.create({
        data: {
          teacherId: teacher.id,
          evaluatorId: manager.id,
          date,
          teachingQuality,
          punctuality,
          studentInteraction,
          curriculumAdherence,
          overallScore,
          comments: getRandomComment(overallScore),
        },
      });
    }
  }

  console.log('✅ Evaluations created');

  // Create Notes
  const noteTypes = ['positive', 'needs_improvement', 'warning', 'info'];
  const noteContents = {
    positive: [
      'أداء ممتاز في الفصل الدراسي',
      'التزام عالٍ بالمواعيد',
      'تفاعل إيجابي مع الطلاب',
      'إبداع في طرق التدريس',
    ],
    needs_improvement: [
      'يحتاج لتطوير مهارات إدارة الصف',
      'ينصح بتنويع أساليب التدريس',
      'يرجى الاهتمام بالواجبات المنزلية',
    ],
    warning: [
      'تأخر متكرر في الحضور',
      'غياب بدون إذن مسبق',
      'عدم الالتزام بالخطة الدراسية',
    ],
    info: [
      'حضر دورة تدريبية في التعليم الإلكتروني',
      'شارك في لجنة الاختبارات',
      'أنهى تحضير المنهج الدراسي',
    ],
  };

  for (const teacher of teachers) {
    const numNotes = Math.floor(Math.random() * 4) + 1;
    for (let n = 0; n < numNotes; n++) {
      const type = noteTypes[Math.floor(Math.random() * noteTypes.length)];
      const contents = noteContents[type];
      const content = contents[Math.floor(Math.random() * contents.length)];

      await prisma.note.create({
        data: {
          teacherId: teacher.id,
          authorId: Math.random() > 0.5 ? admin.id : manager.id,
          type,
          content,
        },
      });
    }
  }

  console.log('✅ Notes created');

  // Create Notifications
  const notificationTitles = [
    { title: 'تقييم جديد', message: 'تم إضافة تقييم جديد لأحد المدرسين', type: 'info' },
    { title: 'تنبيه غياب', message: 'يوجد مدرسين متغيبين اليوم', type: 'warning' },
    { title: 'تقرير جاهز', message: 'تقرير الأداء الشهري جاهز للمراجعة', type: 'success' },
    { title: 'تحديث النظام', message: 'تم تحديث النظام بنجاح', type: 'info' },
  ];

  for (const notif of notificationTitles) {
    await prisma.notification.create({
      data: {
        userId: admin.id,
        ...notif,
        isRead: Math.random() > 0.5,
      },
    });
    await prisma.notification.create({
      data: {
        userId: manager.id,
        ...notif,
        isRead: Math.random() > 0.5,
      },
    });
  }

  console.log('✅ Notifications created');

  // Create Audit Logs
  const actions = [
    { action: 'login', entity: 'user', details: JSON.stringify({ method: 'email' }) },
    { action: 'create', entity: 'teacher', details: JSON.stringify({ name: 'New Teacher' }) },
    { action: 'update', entity: 'attendance', details: JSON.stringify({ status: 'present' }) },
    { action: 'create', entity: 'evaluation', details: JSON.stringify({ score: 8.5 }) },
    { action: 'export', entity: 'report', details: JSON.stringify({ format: 'pdf' }) },
  ];

  for (let i = 0; i < 20; i++) {
    const actionData = actions[Math.floor(Math.random() * actions.length)];
    await prisma.auditLog.create({
      data: {
        userId: Math.random() > 0.5 ? admin.id : manager.id,
        ...actionData,
        entityId: Math.floor(Math.random() * 10) + 1,
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
      },
    });
  }

  console.log('✅ Audit logs created');

  // Create Activity Categories
  const activityCategories = await Promise.all([
    prisma.activityCategory.create({ data: { name: 'يوم اللغة العربية', description: 'احتفالية خاصة بيوم اللغة العربية العالمي', icon: 'BookOpen', color: '#1e3a5f' } }),
    prisma.activityCategory.create({ data: { name: 'يوم المكتبة', description: 'يوم مخصص لتعزيز ثقافة القراءة', icon: 'Library', color: '#2d5a8a' } }),
    prisma.activityCategory.create({ data: { name: 'يوم الشعر', description: 'أمسية شعرية تحتفي بالشعر العربي', icon: 'Feather', color: '#6b4c9a' } }),
    prisma.activityCategory.create({ data: { name: 'يوم الحقوق الإنسانية', description: 'فعالية توعوية عن حقوق الإنسان', icon: 'Users', color: '#2f855a' } }),
  ]);

  console.log('✅ Activity categories created');

  // Create Parents
  const parentPassword = await bcrypt.hash('Parent123!', 10);
  const parents = await Promise.all([
    prisma.parent.create({ data: { email: 'parent1@school.com', password: parentPassword, name: 'أحمد الوالد', phone: '0501234567' } }),
    prisma.parent.create({ data: { email: 'parent2@school.com', password: parentPassword, name: 'فاطمة الأم', phone: '0507654321' } }),
  ]);

  console.log('✅ Parents created');

  // Create Students
  const grades = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
  const students = await Promise.all([
    prisma.student.create({ data: { studentId: 'STU0001', name: 'محمد أحمد', grade: grades[2], parentId: parents[0].id } }),
    prisma.student.create({ data: { studentId: 'STU0002', name: 'سارة أحمد', grade: grades[4], parentId: parents[0].id } }),
    prisma.student.create({ data: { studentId: 'STU0003', name: 'علي فهد', grade: grades[3], parentId: parents[1].id } }),
    prisma.student.create({ data: { studentId: 'STU0004', name: 'نور العبدالله', grade: grades[1] } }),
    prisma.student.create({ data: { studentId: 'STU0005', name: 'خالد السعيد', grade: grades[5] } }),
  ]);

  console.log('✅ Students created');

  // Create Activities
  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        title: 'مسابقة الإلقاء والخطابة',
        description: 'مسابقة في الإلقاء الشعري والخطابة للمراحل المختلفة',
        categoryId: activityCategories[0].id,
        teacherId: teachers[0].id,
        date: new Date(2024, 11, 18),
        time: '10:00 صباحاً',
        location: 'قاعة المناسبات',
        status: 'upcoming',
      },
    }),
    prisma.activity.create({
      data: {
        title: 'معرض الكتاب المدرسي',
        description: 'معرض لعرض الكتب والمؤلفات الطلابية',
        categoryId: activityCategories[1].id,
        teacherId: teachers[1].id,
        date: new Date(2024, 10, 23),
        time: '09:00 صباحاً',
        location: 'المكتبة المركزية',
        status: 'completed',
      },
    }),
    prisma.activity.create({
      data: {
        title: 'أمسية شعرية',
        description: 'أمسية لتقديم القصائد العربية المختارة',
        categoryId: activityCategories[2].id,
        teacherId: teachers[0].id,
        date: new Date(2024, 11, 21),
        time: '05:00 مساءً',
        location: 'المسرح المدرسي',
        status: 'upcoming',
      },
    }),
  ]);

  console.log('✅ Activities created');

  // Create Participations
  await Promise.all([
    prisma.activityParticipation.create({ data: { activityId: activities[0].id, studentId: students[0].id, role: 'participant' } }),
    prisma.activityParticipation.create({ data: { activityId: activities[0].id, studentId: students[1].id, role: 'participant' } }),
    prisma.activityParticipation.create({ data: { activityId: activities[0].id, teacherId: teachers[1].id, role: 'judge' } }),
    prisma.activityParticipation.create({ data: { activityId: activities[1].id, studentId: students[2].id, role: 'presenter', status: 'completed' } }),
    prisma.activityParticipation.create({ data: { activityId: activities[1].id, studentId: students[3].id, role: 'participant', status: 'attended' } }),
    prisma.activityParticipation.create({ data: { activityId: activities[2].id, studentId: students[0].id, role: 'presenter' } }),
  ]);

  console.log('✅ Activity participations created');

  console.log('🎉 Database seeding completed!');
}

function getRandomComment(score) {
  if (score >= 9) return 'أداء متميز ويستحق التقدير';
  if (score >= 8) return 'أداء جيد جداً مع بعض نقاط القوة';
  if (score >= 7) return 'أداء جيد مع فرص للتطوير';
  if (score >= 6) return 'أداء مقبول يحتاج لمزيد من الاهتمام';
  return 'يحتاج لتحسين كبير في الأداء';
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
