import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { login, me, getUsers } from './controllers/auth.controller';
import { getStats } from './controllers/analytics.controller';
import { authenticate, checkRole } from './middleware/auth.middleware';
import { assignShipment, getShipments, updateStatus, undoShipment, markDelivered } from './controllers/shipment.controller';

import { createServer } from 'http';
import { initSocket } from './lib/socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 4000;

// Initialize Socket.io
const io = initSocket(httpServer);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a warehouse room (For demo, everyone joins 'warehouse-1')
    // In real app, you'd get this from the auth token or handshake
    socket.join('warehouse-1');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.post('/auth/login', login);
app.get('/auth/me', authenticate, me);
app.get('/users', authenticate, getUsers);

// Protected Routes
app.get('/shipments', authenticate, getShipments);
app.post('/shipments/assign', authenticate, assignShipment);
app.post('/shipments/status', authenticate, updateStatus);
app.post('/shipments/undo', authenticate, undoShipment);
app.post('/shipments/:id/deliver', authenticate, markDelivered);

// Admin Routes
app.get('/admin/stats', authenticate, checkRole(['ADMIN']), getStats);

app.get('/', (req, res) => {
    res.send('Nexus API is running');
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
