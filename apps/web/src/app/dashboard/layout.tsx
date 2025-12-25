'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { useEffect } from 'react';
import { LayoutDashboard, Truck, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const res = await api.get('/auth/me');
            return res.data.user;
        },
        retry: false,
    });

    useEffect(() => {
        if (isError) {
            router.push('/login');
        }
    }, [isError, router]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    if (!user) return null;

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white">
                <div className="p-6">
                    <h1 className="text-2xl font-bold">Nexus</h1>
                    <p className="text-sm text-slate-400">Role: {user.role}</p>
                </div>
                <nav className="space-y-2 px-4">
                    <Link href="/dashboard/shipments" className="flex items-center space-x-2 rounded px-4 py-2 hover:bg-slate-800">
                        <Truck size={20} />
                        <span>Shipments</span>
                    </Link>
                    {user.role === 'ADMIN' && (
                        <Link href="/dashboard/admin" className="flex items-center space-x-2 rounded px-4 py-2 hover:bg-slate-800">
                            <LayoutDashboard size={20} />
                            <span>Admin Dashboard</span>
                        </Link>
                    )}
                </nav>
                <div className="absolute bottom-4 left-4">
                    <Button variant="ghost" className="text-white hover:text-white hover:bg-slate-800" onClick={() => router.push('/login')}>
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-gray-50 p-8">
                {children}
            </main>
        </div>
    );
}
