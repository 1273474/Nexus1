import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Clean up existing data
    await prisma.auditLog.deleteMany();
    await prisma.shipment.deleteMany();
    await prisma.user.deleteMany();
    await prisma.warehouse.deleteMany();

    console.log('Deleted existing data.');

    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('admin', salt);
    const managerHash = await bcrypt.hash('manager', salt);
    const driverHash = await bcrypt.hash('driver', salt);

    // Create Admin and Manager
    await prisma.user.createMany({
        data: [
            { email: 'admin@nexus.com', passwordHash: adminHash, role: Role.ADMIN },
            { email: 'manager@nexus.com', passwordHash: managerHash, role: Role.MANAGER },
        ]
    });

    // Create 5 Drivers
    const drivers = [
        { email: 'alice@nexus.com', name: 'Alice Driver' },
        { email: 'bob@nexus.com', name: 'Bob Driver' },
        { email: 'charlie@nexus.com', name: 'Charlie Driver' },
        { email: 'dave@nexus.com', name: 'Dave Driver' },
        { email: 'eve@nexus.com', name: 'Eve Driver' },
    ];

    for (const d of drivers) {
        await prisma.user.create({
            data: {
                email: d.email,
                name: d.name,
                passwordHash: driverHash,
                role: Role.DRIVER,
            }
        });
    }

    // Create a Warehouse
    const warehouse = await prisma.warehouse.create({
        data: {
            name: 'Central Hub',
            location: 'New York, NY',
        }
    });

    // Create 10 Pending Shipments
    for (let i = 1; i <= 10; i++) {
        await prisma.shipment.create({
            data: {
                trackingId: `TRK-${100000 + i}`,
                status: 'PENDING',
                warehouseId: warehouse.id,
            }
        });
    }

    console.log('Seeding completed: 5 Drivers, 10 Pending Shipments.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
