'use client';

import { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Calendar,
    Users,
    Star,
    ClipboardCheck,
    Filter,
    FileSpreadsheet,
} from 'lucide-react';
import styles from './reports.module.css';

interface Teacher {
    id: number;
    name: string;
    employeeId: string;
}

type ReportType = 'attendance' | 'evaluations' | 'summary';

// PDF generation function using HTML print
const generatePDFFromData = (
    data: Record<string, unknown>[],
    metadata: { type: string; startDate: string; endDate: string }
) => {
    const reportTitle = metadata.type === 'attendance' ? 'تقرير الحضور والانصراف' :
        metadata.type === 'evaluations' ? 'تقرير التقييمات' : 'التقرير الشامل';

    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    // Create printable HTML
    const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>${reportTitle}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Tajawal', 'Arial', sans-serif;
            padding: 20px;
            background: white;
            direction: rtl;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #3b82f6;
        }
        
        .header h1 {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #6b7280;
            font-size: 14px;
            margin: 5px 0;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        th {
            background: #3b82f6;
            color: white;
            padding: 12px 8px;
            text-align: center;
            font-weight: 600;
            font-size: 14px;
            border: 1px solid #2563eb;
        }
        
        td {
            padding: 10px 8px;
            border: 1px solid #e5e7eb;
            font-size: 13px;
            text-align: center;
        }
        
        tr:nth-child(even) {
            background: #f9fafb;
        }
        
        tr:hover {
            background: #f3f4f6;
        }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }
        
        @media print {
            body { padding: 10px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${reportTitle}</h1>
        <p>الفترة: من ${metadata.startDate || '-'} إلى ${metadata.endDate || '-'}</p>
        <p>تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}</p>
    </div>
    
    <table>
        <thead>
            <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${data.map(row => `
                <tr>
                    ${headers.map(h => `<td>${row[h] ?? '-'}</td>`).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="footer">
        <p>منصة متابعة أداء المدرسين - تم إنشاء هذا التقرير آلياً</p>
    </div>
    
    <script>
        // Auto-print when page loads
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>`;

    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    }
};

export default function ReportsPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState<ReportType>('summary');
    const [teacherId, setTeacherId] = useState<string>('');
    const [startDate, setStartDate] = useState(
        new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]
    );
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const res = await fetch('/api/teachers?limit=100&status=active');
            const data = await res.json();
            setTeachers(data.teachers || []);
        } catch (error) {
            console.error('Failed to fetch teachers:', error);
        }
    };

    const generateReport = async (format: 'pdf' | 'excel') => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                type: reportType,
                format,
                startDate,
                endDate,
            });
            if (teacherId) params.set('teacherId', teacherId);

            const res = await fetch(`/api/reports?${params}`);

            if (!res.ok) {
                throw new Error('Failed to generate report');
            }

            if (format === 'excel') {
                // Excel comes as blob
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                // PDF: server returns JSON, we generate PDF client-side
                const result = await res.json();
                if (result.success && result.data) {
                    generatePDFFromData(result.data, {
                        type: reportType,
                        startDate,
                        endDate,
                    });
                } else {
                    throw new Error(result.error || 'Failed to generate report');
                }
            }
        } catch (error) {
            console.error('Failed to generate report:', error);
            alert('حدث خطأ في إنشاء التقرير');
        } finally {
            setLoading(false);
        }
    };

    const reportTypes = [
        {
            id: 'summary' as const,
            label: 'تقرير شامل',
            icon: <FileText size={24} />,
            description: 'ملخص شامل للأداء والحضور والتقييمات'
        },
        {
            id: 'attendance' as const,
            label: 'تقرير الحضور',
            icon: <ClipboardCheck size={24} />,
            description: 'تفاصيل سجل الحضور والانصراف'
        },
        {
            id: 'evaluations' as const,
            label: 'تقرير التقييمات',
            icon: <Star size={24} />,
            description: 'تفاصيل تقييمات الأداء'
        },
    ];

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>التقارير</h1>
                    <p className={styles.subtitle}>إنشاء وتصدير تقارير الأداء والحضور</p>
                </div>
            </div>

            {/* Report Type Selection */}
            <div className={styles.reportTypes}>
                {reportTypes.map((type) => (
                    <button
                        key={type.id}
                        className={`${styles.reportTypeCard} ${reportType === type.id ? styles.selected : ''}`}
                        onClick={() => setReportType(type.id)}
                    >
                        <div className={styles.reportTypeIcon}>{type.icon}</div>
                        <div className={styles.reportTypeInfo}>
                            <h3>{type.label}</h3>
                            <p>{type.description}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className={styles.filtersCard}>
                <h2 className={styles.sectionTitle}>
                    <Filter size={18} />
                    خيارات التقرير
                </h2>

                <div className={styles.filtersGrid}>
                    <div className={styles.filterGroup}>
                        <label>
                            <Calendar size={16} />
                            من تاريخ
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label>
                            <Calendar size={16} />
                            إلى تاريخ
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label>
                            <Users size={16} />
                            المدرس
                        </label>
                        <select
                            value={teacherId}
                            onChange={(e) => setTeacherId(e.target.value)}
                        >
                            <option value="">جميع المدرسين</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Export Buttons */}
            <div className={styles.exportCard}>
                <h2 className={styles.sectionTitle}>
                    <Download size={18} />
                    تصدير التقرير
                </h2>

                <div className={styles.exportButtons}>
                    <button
                        className={`${styles.exportBtn} ${styles.pdfBtn}`}
                        onClick={() => generateReport('pdf')}
                        disabled={loading}
                    >
                        <FileText size={20} />
                        <div>
                            <span>تصدير PDF</span>
                            <small>مستند قابل للطباعة</small>
                        </div>
                    </button>

                    <button
                        className={`${styles.exportBtn} ${styles.excelBtn}`}
                        onClick={() => generateReport('excel')}
                        disabled={loading}
                    >
                        <FileSpreadsheet size={20} />
                        <div>
                            <span>تصدير Excel</span>
                            <small>جدول بيانات للتحليل</small>
                        </div>
                    </button>
                </div>

                {loading && (
                    <div className={styles.loadingOverlay}>
                        <div className={styles.loader}></div>
                        <p>جاري إنشاء التقرير...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
