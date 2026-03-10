import { Response } from 'express';
import { PrismaClient, ShipmentStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getStats = async (req: AuthRequest, res: Response) => {
    try {
        // 1. Inventory Count (Pending Shipments)
        const inventoryCount = await prisma.shipment.count({
            where: { status: ShipmentStatus.PENDING }
        });

        // 2. Active Drivers (Drivers with IN_TRANSIT shipments)
        // We count unique drivers who have at least one shipment IN_TRANSIT
        const activeDriversCount = await prisma.shipment.groupBy({
            by: ['driverId'],
            where: {
                status: ShipmentStatus.IN_TRANSIT,
                driverId: { not: null }
            },
        });

        // 3. Delivered Today (Last 24h)
        const twentyFourHoursAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        const deliveredToday = await prisma.shipment.count({
            where: {
                status: ShipmentStatus.DELIVERED,
                updatedAt: { gte: twentyFourHoursAgo }
            }
        });

        // 4. Chart Data: Deliveries per Hour (from Audit Logs)
        // We look for 'DELIVERED_SHIPMENT' actions in the last 24h
        const logs = await prisma.auditLog.findMany({
            where: {
                action: { startsWith: 'DELIVERED_SHIPMENT' },
                timestamp: { gte: twentyFourHoursAgo }
            },
            select: { timestamp: true }
        });

        // Group logs by hour
        const chartDataMap = new Map<string, number>();

        // Initialize last 24 hours with 0
        for (let i = 0; i < 24; i++) {
            const d = new Date();
            d.setHours(d.getHours() - i);
            const key = d.getHours().toString().padStart(2, '0') + ':00';
            chartDataMap.set(key, 0);
        }

        logs.forEach(log => {
            const key = log.timestamp.getHours().toString().padStart(2, '0') + ':00';
            if (chartDataMap.has(key)) {
                chartDataMap.set(key, (chartDataMap.get(key) || 0) + 1);
            }
        });

        // Convert to array and reverse to show oldest to newest
        const chartData = Array.from(chartDataMap.entries())
            .map(([time, count]) => ({ time, count }))
            .reverse();

        return res.json({
            inventoryCount,
            activeDrivers: activeDriversCount.length,
            deliveredToday,
            chartData
        });

    } catch (error) {
        console.error('Analytics error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
