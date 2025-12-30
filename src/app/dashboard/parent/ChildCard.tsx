'use client';

import { User, School, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import styles from './parent.module.css';

interface ChildCardProps {
    student: {
        id: number;
        name: string;
        studentId: string;
        grade: string | null;
        _count: {
            participations: number;
        };
    };
}

export default function ChildCard({ student }: ChildCardProps) {
    return (
        <div className={styles.childCard}>
            <div className={styles.childAvatar}>
                <User size={32} />
            </div>
            <div className={styles.childInfo}>
                <h3 className={styles.childName}>{student.name}</h3>
                <div className={styles.childDetails}>
                    <span className={styles.detailItem}>
                        <School size={14} />
                        الصف: {student.grade || 'غير محدد'}
                    </span>
                    <span className={styles.detailItem}>
                        رقم الطالب: {student.studentId}
                    </span>
                </div>
            </div>
            <div className={styles.cardActions}>
                <Link href={`/dashboard/parent/children/${student.id}`} className={styles.viewButton}>
                    عرض التفاصيل
                    <ArrowLeft size={16} />
                </Link>
            </div>
        </div>
    );
}
