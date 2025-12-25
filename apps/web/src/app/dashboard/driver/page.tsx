'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSocket } from '@/hooks/use-socket';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Package, CheckCircle } from 'lucide-react';

export default function DriverPage() {
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

    useEffect(() => {
        if (!socket) return;

        socket.on('SHIPMENT_UPDATED', (updatedShipment: any) => {
            // Optimistic Update or Invalidate
            queryClient.setQueryData(['shipments'], (oldData: any[]) => {
                if (!oldData) return [updatedShipment];
                // If it's a new assignment for me, add it
                // If it's an update to my existing one, update it
                const exists = oldData.find(s => s.id === updatedShipment.id);
                if (exists) {
                    return oldData.map((s) =>
                        s.id === updatedShipment.id ? { ...s, ...updatedShipment } : s
                    );
                } else {
                    // New shipment assigned to me (assuming backend filters correctly)
                    // We might need to check if driverId matches, but getShipments filters it anyway
                    // For now, let's just invalidate to be safe and simple
                    queryClient.invalidateQueries({ queryKey: ['shipments'] });
                    toast({
                        title: 'New Job Assigned!',
                        description: `Tracking ID ${updatedShipment.trackingId} is ready for pickup.`,
                    });
                    return oldData;
                }
            });
        });

        return () => {
            socket.off('SHIPMENT_UPDATED');
        };
    }, [socket, queryClient, toast]);

    const handleDeliver = async (id: string) => {
        try {
            await api.post(`/shipments/${id}/deliver`);
            toast({
                title: 'Delivery Completed',
                description: 'Great job! Shipment marked as delivered.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to mark as delivered.',
                variant: 'destructive'
            });
        }
    };

    if (isLoading) return <div className="p-4">Loading tasks...</div>;

    const activeShipments = shipments?.filter((s: any) => s.status === 'IN_TRANSIT');

    return (
        <div className="space-y-6 p-4 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">My Deliveries</h1>

            {activeShipments?.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <CheckCircle className="mx-auto h-12 w-12 mb-4 text-green-500" />
                    <p>All caught up! No active deliveries.</p>
                </div>
            ) : (
                activeShipments?.map((shipment: any) => (
                    <Card key={shipment.id} className="shadow-lg border-l-4 border-l-blue-500">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{shipment.trackingId}</CardTitle>
                                <Badge variant="secondary">{shipment.status}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <div className="flex items-center text-gray-600 mb-2">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>123 Main St, Springfield (Simulated)</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Package className="h-4 w-4 mr-2" />
                                <span>Standard Delivery</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleDeliver(shipment.id)}
                            >
                                Complete Delivery
                            </Button>
                        </CardFooter>
                    </Card>
                ))
            )}
        </div>
    );
}
