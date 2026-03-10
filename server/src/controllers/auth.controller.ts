import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'nexus_secret_key';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        return res.json({ message: 'Login successful', user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const me = async (req: Request, res: Response) => {
    // @ts-ignore - user is attached by middleware
    const user = req.user;
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.json({ user });
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const { role } = req.query;
        const where: any = {};

        if (role) {
            where.role = role;
        }

        const users = await prisma.user.findMany({
            where,
            select: { id: true, email: true, name: true, role: true } // Don't return passwordHash
        });

        return res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
