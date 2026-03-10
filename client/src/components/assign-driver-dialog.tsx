'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Truck } from 'lucide-react';
import api from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

interface AssignDriverDialogProps {
    shipmentId: string;
    trigger?: React.ReactNode;
}

export function AssignDriverDialog({ shipmentId, trigger }: AssignDriverDialogProps) {
    const [open, setOpen] = useState(false);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            const fetchDrivers = async () => {
                try {
                    const res = await api.get('/users?role=DRIVER');
                    setDrivers(res.data);
                } catch (error) {
                    console.error('Failed to fetch drivers', error);
                }
            };
            fetchDrivers();
        }
    }, [open]);

    const handleAssign = async () => {
        if (!selectedDriver) return;

        setLoading(true);
        try {
            await api.post('/shipments/assign', {
                shipmentId,
                driverId: selectedDriver,
            });
            toast({
                title: 'Driver Assigned',
                description: 'Shipment has been assigned successfully.',
            });
            setOpen(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to assign driver.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Truck className="mr-2 h-4 w-4" /> Assign Driver
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-950 border-border shadow-lg text-black dark:text-white">
                <DialogHeader>
                    <DialogTitle className="text-black dark:text-white">Assign Driver</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Select onValueChange={setSelectedDriver} value={selectedDriver}>
                            <SelectTrigger className="w-full bg-white dark:bg-slate-950 border-input text-black dark:text-white">
                                <SelectValue placeholder="Select a driver" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-950 border-input z-[200]">
                                {drivers.map((driver) => (
                                    <SelectItem key={driver.id} value={driver.id} className="cursor-pointer hover:bg-accent hover:text-accent-foreground text-black dark:text-white">
                                        <span className="font-medium">{driver.name || 'Unknown Driver'}</span>
                                        <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">({driver.email})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter className="sm:justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)} className="text-black dark:text-white border-input hover:bg-accent hover:text-accent-foreground">
                        Cancel
                    </Button>
                    <Button onClick={handleAssign} disabled={!selectedDriver || loading} variant="default">
                        {loading ? 'Assigning...' : 'Confirm'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
