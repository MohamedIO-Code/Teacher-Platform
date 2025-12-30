import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import {
    ArrowRight,
    User,
    BookOpen,
    Calendar,
    Award,
    Clock,
    CheckCircle,
    XCircle,
    MinusCircle
} from 'lucide-react';
import Link from 'next/link';
import styles from './student-details.module.css';

interface PageProps {
    params: Promise<{ id: string }>;
}

async function getStudentDetails(studentId: number, parentId: number) {
    const student = await prisma.student.findUnique({
        where: {
            id: studentId,
            parentId: parentId
        },
        include: {
            participations: {
                include: {
                    activity: {
                        select: {
                            id: true,
                            title: true,
                            date: true,
                            status: true
                        }
                    },
                    evaluations: {
                        include: {
                            evaluator: {
                                select: { name: true }
                            }
                        }
                    }
                },
                orderBy: {
                    activity: {
                        date: 'desc'
                    }
                }
            }
        }
    });

    return student;
}

export default async function StudentDetailsPage({ params }: PageProps) {
    const session = await getSession();

    if (!session || session.role !== 'parent') {
        redirect('/login');
    }

    const { id } = await params;
    const studentId = parseInt(id);

    if (isNaN(studentId)) {
        notFound();
    }

    const student = await getStudentDetails(studentId, session.id);

    if (!student) {
        notFound();
    }

    // Calculate stats
    const totalActivities = student.participations.length;
    const attendedActivities = student.participations.filter(p => p.status === 'attended').length;

    let totalScore = 0;
    let evalCount = 0;

    student.participations.forEach(p => {
        p.evaluations.forEach(e => {
            totalScore += e.score;
            evalCount++;
        });
    });

    const avgScore = evalCount > 0 ? (totalScore / evalCount).toFixed(1) : '0';

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'attended': return <CheckCircle size={16} />;
            case 'absent': return <XCircle size={16} />;
            default: return <MinusCircle size={16} />;
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            registered: 'مسجل',
            attended: 'حضر',
            completed: 'أتم النشاط',
            absent: 'غائب',
        };
        return labels[status] || status;
    };

    return (
        <div className={styles.container}>
            <Link href="/dashboard/parent" className={styles.backButton}>
                <ArrowRight size={20} />
                العودة إلى القائمة
            </Link>

            {/* Student Header */}
            <div className={styles.studentHeader}>
                <div className={styles.avatar}>
                    <User />
                </div>
                <div className={styles.info}>
                    <h1>{student.name}</h1>
                    <div className={styles.details}>
                        <span>الصف: {student.grade || 'غير محدد'}</span>
                        <span>•</span>
                        <span>رقم الطالب: {student.studentId}</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.blue}`}>
                        <BookOpen />
                    </div>
                    <div>
                        <div className={styles.statValue}>{totalActivities}</div>
                        <div className={styles.statLabel}>أنشطة مسجلة</div>
                    </div>
                </div>
                <div className={`${styles.statCard}`}>
                    <div className={`${styles.statIcon} ${styles.green}`}>
                        <CheckCircle />
                    </div>
                    <div>
                        <div className={styles.statValue}>{attendedActivities}</div>
                        <div className={styles.statLabel}>تم حضورها</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={`${styles.statIcon} ${styles.purple}`}>
                        <Award />
                    </div>
                    <div>
                        <div className={styles.statValue}>{avgScore}</div>
                        <div className={styles.statLabel}>متوسط التقييم</div>
                    </div>
                </div>
            </div>

            {/* Activities Timeline */}
            <h2 className={styles.sectionTitle}>
                <Calendar size={24} />
                سجل الأنشطة والتقييمات
            </h2>

            {student.participations.length === 0 ? (
                <div className={styles.emptyState}>
                    <h3>لا توجد مشاركات مسجلة</h3>
                    <p>لم يشارك الطالب في أي أنشطة حتى الآن</p>
                </div>
            ) : (
                <div className={styles.timeline}>
                    {student.participations.map((participation) => (
                        <div key={participation.id} className={styles.timelineItem}>
                            <div className={styles.timelineDot}></div>

                            <div className={styles.activityCard}>
                                <div className={styles.activityHeader}>
                                    <div>
                                        <h3 className={styles.activityTitle}>
                                            {participation.activity.title}
                                        </h3>
                                        <div className={styles.activityMeta}>
                                            <span>
                                                <Calendar size={14} />
                                                {new Date(participation.activity.date).toLocaleDateString('ar-SA')}
                                            </span>
                                            {participation.role !== 'participant' && (
                                                <span>• دور: {participation.role}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`${styles.statusBadge} ${styles[`status${participation.status.charAt(0).toUpperCase() + participation.status.slice(1)}`]}`}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {getStatusIcon(participation.status)}
                                            {getStatusLabel(participation.status)}
                                        </span>
                                    </div>
                                </div>

                                {participation.evaluations.length > 0 && (
                                    <div className={styles.evaluations}>
                                        <h4>التقييمات:</h4>
                                        {participation.evaluations.map(evalItem => (
                                            <div key={evalItem.id} className={styles.evaluationCard}>
                                                <div className={styles.evalHeader}>
                                                    <span className={styles.evaluatorName}>
                                                        بواسطة: {evalItem.evaluator.name}
                                                    </span>
                                                    <div className={styles.scoreBadge}>
                                                        <Award size={14} />
                                                        {evalItem.score}/10
                                                    </div>
                                                </div>
                                                {evalItem.performance && (
                                                    <div className={styles.evalPerformance}>
                                                        <strong>الأداء: </strong> {evalItem.performance}
                                                    </div>
                                                )}
                                                {evalItem.comments && (
                                                    <div className={styles.evalComment}>
                                                        {evalItem.comments}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
