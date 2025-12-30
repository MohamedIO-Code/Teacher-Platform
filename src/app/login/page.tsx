'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, SchoolIcon } from 'lucide-react';
import styles from './login.module.css';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'حدث خطأ في تسجيل الدخول');
                return;
            }

            router.push(callbackUrl);
            router.refresh();
        } catch {
            setError('حدث خطأ في الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginCard}>
            <div className={styles.logoSection}>
                <div className={styles.logoIcon}>
                    <SchoolIcon size={32} />
                </div>
                <h1 className={styles.title}>منصة متابعة أداء المدرسين</h1>
                <p className={styles.subtitle}>قم بتسجيل الدخول للوصول إلى لوحة التحكم</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="email">
                        البريد الإلكتروني
                    </label>
                    <div className={styles.inputWrapper}>
                        <Mail className={styles.inputIcon} size={18} />
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="admin@school.com"
                            required
                            autoComplete="email"
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="password">
                        كلمة المرور
                    </label>
                    <div className={styles.inputWrapper}>
                        <Lock className={styles.inputIcon} size={18} />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={styles.togglePassword}
                            aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={loading}
                >
                    {loading ? (
                        <span className={styles.loader}></span>
                    ) : (
                        'تسجيل الدخول'
                    )}
                </button>
            </form>

            <div className={styles.footer}>
                <div className={styles.demoCredentials}>
                    <p className={styles.demoTitle}>بيانات الدخول التجريبية:</p>
                    <div className={styles.credentialsList}>
                        <div className={styles.credential}>
                            <span className={styles.role}>مشرف:</span>
                            <code>admin@school.com / Admin123!</code>
                        </div>
                        <div className={styles.credential}>
                            <span className={styles.role}>إداري:</span>
                            <code>manager@school.com / Manager123!</code>
                        </div>
                        <div className={styles.credential}>
                            <span className={styles.role}>مدرس:</span>
                            <code>teacher@school.com / Teacher123!</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LoginFormFallback() {
    return (
        <div className={styles.loginCard}>
            <div className={styles.logoSection}>
                <div className={styles.logoIcon}>
                    <SchoolIcon size={32} />
                </div>
                <h1 className={styles.title}>منصة متابعة أداء المدرسين</h1>
                <p className={styles.subtitle}>جاري التحميل...</p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className={styles.container}>
            <div className={styles.background}>
                <div className={styles.bgPattern}></div>
            </div>

            <Suspense fallback={<LoginFormFallback />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
