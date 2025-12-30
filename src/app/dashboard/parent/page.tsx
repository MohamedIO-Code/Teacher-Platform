import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Users } from 'lucide-react';
import ChildCard from './ChildCard';
import styles from './parent.module.css';

async function getParentData(userId: number) {
    const parent = await prisma.parent.findUnique({
        where: { id: userId },
        include: {
            students: {
                include: {
                    _count: {
                        select: { participations: true }
                    }
                }
            }
        }
    });
    return parent;
}

export default async function ParentDashboard() {
    const session = await getSession();

    if (!session || session.role !== 'parent') {
        redirect('/login');
    }

    const parent = await getParentData(session.id);

    if (!parent) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>
                    <h2>لم يتم العثور على بيانات ولي الأمر</h2>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>مرحباً، {parent.name}</h1>
                <p className={styles.subtitle}>متابعة الأداء التعليمي والأنشطة لأبنائك</p>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>
                    <Users size={24} />
                    أبنائي
                </div>

                <div className={styles.grid}>
                    {parent.students.length > 0 ? (
                        parent.students.map(student => (
                            <ChildCard key={student.id} student={student} />
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <p>لا يوجد طلاب مسجلين باسمك حالياً.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
