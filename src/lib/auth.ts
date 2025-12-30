import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';

export interface UserPayload {
    id: number;
    email: string;
    name: string;
    role: string;
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: UserPayload): string {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

export function verifyToken(token: string): UserPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
        return decoded;
    } catch {
        return null;
    }
}

export async function getSession(): Promise<UserPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
        return null;
    }

    return verifyToken(token);
}

export async function login(email: string, password: string): Promise<{ success: boolean; user?: UserPayload; error?: string }> {
    // 1. Try to find user in User table
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (user) {
        if (!user.isActive) {
            return { success: false, error: 'الحساب غير نشط. يرجى التواصل مع المسؤول' };
        }

        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
        }

        const userPayload: UserPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };

        return { success: true, user: userPayload };
    }

    // 2. Try to find user in Parent table
    const parent = await prisma.parent.findUnique({
        where: { email },
    });

    if (parent) {
        if (!parent.isActive) {
            return { success: false, error: 'الحساب غير نشط. يرجى التواصل مع المسؤول' };
        }

        const isValid = await verifyPassword(password, parent.password);

        if (!isValid) {
            return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
        }

        // Use a distinct ID range or just rely on 'role' to distinguish
        // For simplicity reusing the same payload structure.
        // Role is explicit 'parent'.
        const userPayload: UserPayload = {
            id: parent.id,
            email: parent.email,
            name: parent.name,
            role: ROLES.PARENT,
        };

        return { success: true, user: userPayload };
    }

    return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
}

export function hasPermission(userRole: string, requiredRoles: readonly string[]): boolean {
    return requiredRoles.includes(userRole);
}

// Role-based access control
export const ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    TEACHER: 'teacher',
    PARENT: 'parent',
} as const;

export const PERMISSIONS = {
    // Full access
    ADMIN: ['admin'],
    // Admin and Manager
    MANAGEMENT: ['admin', 'manager'],
    // All staff
    ALL: ['admin', 'manager', 'teacher'],
    // Parent access
    PARENT: ['parent'],
} as const;
