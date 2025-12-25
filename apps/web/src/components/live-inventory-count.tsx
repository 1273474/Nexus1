'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/components/providers/socket-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

interface LiveInventoryCountProps {
    initialCount: number;
}

export function LiveInventoryCount({ initialCount }: LiveInventoryCountProps) {
    const [count, setCount] = useState(initialCount);
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleShipmentUpdated = (data: any) => {
            // Logic:
            // If status changed TO 'IN_TRANSIT' (from PENDING), decrement.
            // If status changed TO 'PENDING' (from something else? unlikely flow but possible), increment.
            // Actually, simpler logic:
            // If we receive an update, we might just want to re-fetch or be smart.
            // Let's be smart:
            // The event data usually contains the *updated* shipment.
            // But we don't know the *previous* status easily unless we track it or the backend sends it.
            // For this demo, let's assume the backend sends { shipment, oldStatus } or we just listen for specific transitions.

            // Wait, the backend currently just sends { shipment }.
            // If shipment.status === 'IN_TRANSIT', it *left* the warehouse.
            // But we only want to decrement if it *was* PENDING.
            // Since we don't know what it was, this is tricky.

            // Alternative: The backend could emit 'inventory_count_updated' event?
            // Or we just decrement if we see IN_TRANSIT, assuming it was PENDING.
            // And increment if we see PENDING (new shipment created).

            if (data.shipment.status === 'IN_TRANSIT') {
                setCount((prev) => Math.max(0, prev - 1));
            } else if (data.shipment.status === 'PENDING') {
                // If it's a new shipment (created), we increment.
                // But update event is also fired for assignment.
                // We need to distinguish.
                // For now, let's just assume IN_TRANSIT means -1.
                // And if we had a "Shipment Created" event, that would be +1.
                // Since we seed data, maybe we don't create new ones live yet?
                // Let's stick to the "Assignment" flow: PENDING -> IN_TRANSIT.
            }
        };

        socket.on('shipment_updated', handleShipmentUpdated);

        return () => {
            socket.off('shipment_updated', handleShipmentUpdated);
        };
    }, [socket]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Warehouse Inventory</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">
                    Packages pending assignment
                </p>
            </CardContent>
        </Card>
    );
}
