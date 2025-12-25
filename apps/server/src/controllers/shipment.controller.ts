import { Response } from 'express';
import { PrismaClient, ShipmentStatus } from '@repo/database';
import { AuthRequest } from '../middleware/auth.middleware';
import { getIO } from '../lib/socket';

const prisma = new PrismaClient();

export const assignShipment = async (req: AuthRequest, res: Response) => {
    try {
        const { shipmentId, driverId } = req.body;
        const managerId = req.user?.id;

        if (!managerId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Transaction to prevent race conditions
        const result = await prisma.$transaction(async (tx) => {
            // 1. Check if shipment is PENDING
            const shipment = await tx.shipment.findUnique({
                where: { id: shipmentId },
            });

            if (!shipment) {
                throw new Error('Shipment not found');
            }

            if (shipment.status !== ShipmentStatus.PENDING) {
                throw new Error('Shipment already assigned or delivered');
            }

            // 2. Update Shipment
            const updatedShipment = await tx.shipment.update({
                where: { id: shipmentId },
                data: {
                    status: ShipmentStatus.IN_TRANSIT,
                    driverId: driverId,
                },
                include: {
                    driver: {
                        select: { email: true, id: true }
                    }
                }
            });

            // 3. Create Audit Log
            await tx.auditLog.create({
                data: {
                    action: `ASSIGNED_SHIPMENT_${shipmentId}_TO_${driverId} `,
                    userId: managerId,
                },
            });

            return updatedShipment;
        });

        // Emit Real-Time Event
        getIO().to('warehouse-1').emit('SHIPMENT_UPDATED', result);

        return res.json(result);
    } catch (error: any) {
        console.error('Assignment error:', error);
        if (error.message === 'Shipment already assigned or delivered') {
            return res.status(409).json({ error: error.message }); // 409 Conflict
        }
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const getShipments = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;

        const whereClause: any = {};
        if (userRole === 'DRIVER') {
            whereClause.driverId = userId;
        }

        const shipments = await prisma.shipment.findMany({
            where: whereClause,
            include: {
                driver: {
                    select: { email: true, id: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return res.json(shipments);
    } catch (error) {
        console.error('Get shipments error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { shipmentId, status } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const result = await prisma.shipment.update({
            where: { id: shipmentId },
            data: { status },
            include: {
                driver: {
                    select: { email: true, id: true }
                }
            }
        });

        // Emit Real-Time Event
        getIO().to('warehouse-1').emit('SHIPMENT_UPDATED', result);

        return res.json(result);
    } catch (error) {
        console.error('Update status error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const undoShipment = async (req: AuthRequest, res: Response) => {
    try {
        const { shipmentId } = req.body;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const result = await prisma.$transaction(async (tx) => {
            const shipment = await tx.shipment.findUnique({
                where: { id: shipmentId },
            });

            if (!shipment) throw new Error('Shipment not found');

            let newStatus: ShipmentStatus;
            let shouldUnassignDriver = false;

            if (shipment.status === ShipmentStatus.DELIVERED) {
                newStatus = ShipmentStatus.IN_TRANSIT;
            } else if (shipment.status === ShipmentStatus.IN_TRANSIT) {
                newStatus = ShipmentStatus.PENDING;
                shouldUnassignDriver = true;
            } else {
                throw new Error('Cannot undo PENDING shipment');
            }

            const updatedShipment = await tx.shipment.update({
                where: { id: shipmentId },
                data: {
                    status: newStatus,
                    driverId: shouldUnassignDriver ? null : undefined
                },
                include: {
                    driver: {
                        select: { email: true, id: true }
                    }
                }
            });

            await tx.auditLog.create({
                data: {
                    action: `REVERTED_SHIPMENT_${shipmentId}_TO_${newStatus}`,
                    userId: userId,
                },
            });

            return updatedShipment;
        });

        getIO().to('warehouse-1').emit('SHIPMENT_UPDATED', result);

        return res.json(result);
    } catch (error: any) {
        console.error('Undo error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const markDelivered = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const result = await prisma.$transaction(async (tx) => {
            const shipment = await tx.shipment.findUnique({
                where: { id },
            });

            if (!shipment) throw new Error('Shipment not found');

            // Verify ownership (optional but good practice)
            if (shipment.driverId !== userId && req.user?.role === 'DRIVER') {
                throw new Error('Unauthorized to deliver this shipment');
            }

            if (shipment.status !== ShipmentStatus.IN_TRANSIT) {
                throw new Error('Shipment is not in transit');
            }

            const updatedShipment = await tx.shipment.update({
                where: { id },
                data: { status: ShipmentStatus.DELIVERED },
                include: {
                    driver: {
                        select: { email: true, id: true }
                    }
                }
            });

            await tx.auditLog.create({
                data: {
                    action: `DELIVERED_SHIPMENT_${id}`,
                    userId: userId,
                },
            });

            return updatedShipment;
        });

        getIO().to('warehouse-1').emit('SHIPMENT_UPDATED', result);

        return res.json(result);
    } catch (error: any) {
        console.error('Delivery error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
