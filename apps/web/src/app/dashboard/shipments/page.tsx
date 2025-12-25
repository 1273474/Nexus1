'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSocket } from '@/hooks/use-socket';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { LayoutDashboard, Truck, LogOut, RotateCcw } from 'lucide-react';
import { AssignDriverDialog } from '@/components/assign-driver-dialog';

export default function ShipmentsPage() {
    const queryClient = useQueryClient();
    const socket = useSocket();
    const { toast } = useToast();

    const { data: shipments, isLoading } = useQuery({
        queryKey: ['shipments'],
        queryFn: async () => {
            const res = await api.get('/shipments');
            return res.data;
        },
    });

    // Redirect Drivers to their own dashboard
    useEffect(() => {
        const checkRole = async () => {
            try {
                const res = await api.get('/auth/me');
                if (res.data.user.role === 'DRIVER') {
                    window.location.href = '/dashboard/driver';
                }
            } catch (error) {
                console.error('Failed to check role', error);
            }
        };
        checkRole();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('SHIPMENT_UPDATED', (updatedShipment: any) => {
            console.log('Real-time update received:', updatedShipment);

            toast({
                title: 'Shipment Updated',
                description: `Tracking ID ${updatedShipment.trackingId} is now ${updatedShipment.status}`,
            });

            // Optimistic Update or Invalidate
            queryClient.setQueryData(['shipments'], (oldData: any[]) => {
                if (!oldData) return [updatedShipment];
                return oldData.map((s) =>
                    s.id === updatedShipment.id ? { ...s, ...updatedShipment } : s
                );
            });

            // Also invalidate to be safe
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
        });

        return () => {
            socket.off('SHIPMENT_UPDATED');
        };
    }, [socket, queryClient, toast]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-500 hover:bg-yellow-600';
            case 'IN_TRANSIT':
                return 'bg-blue-500 hover:bg-blue-600';
            case 'DELIVERED':
                return 'bg-green-500 hover:bg-green-600';
            default:
                return 'bg-gray-500';
        }
    };

    if (isLoading) return <div>Loading shipments...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Shipments</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Active Shipments</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tracking ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned Driver</TableHead>
                                <TableHead>Created At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shipments?.map((shipment: any) => (
                                <TableRow key={shipment.id}>
                                    <TableCell className="font-medium">{shipment.trackingId}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(shipment.status)}>
                                            {shipment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {shipment.driver ? shipment.driver.email : <span className="text-gray-400">Unassigned</span>}
                                    </TableCell>
                                    <TableCell>{new Date(shipment.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {shipment.status === 'PENDING' && (
                                            <AssignDriverDialog shipmentId={shipment.id} />
                                        )}
                                        {shipment.status !== 'PENDING' && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="ml-2"
                                                onClick={async () => {
                                                    await api.post('/shipments/undo', {
                                                        shipmentId: shipment.id
                                                    });
                                                }}
                                            >
                                                <RotateCcw className="mr-2 h-4 w-4" /> Undo
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div >
    );
}
