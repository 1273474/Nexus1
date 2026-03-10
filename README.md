# Nexus: Intelligent Logistics Management System

Nexus is a modern, real-time logistics and analytics platform designed to streamline warehouse operations, track shipments, and provide actionable insights. Built with a robust MERN stack (MongoDB, Express, React, Node).

## 🚀 Features

*   **Real-time Tracking**: Monitor shipment status (`PENDING`, `IN_TRANSIT`, `DELIVERED`) updates instantly via WebSockets.
*   **Role-Based Access Control (RBAC)**: Secure driver, manager, and admin portals powered by JWT authentication.
*   **Live Analytics**: Visual dashboard tracking deliveries per hour, active drivers, and inventory flow.
*   **Smart Assignment**: Drag-and-drop driver assignment for pending shipments.
*   **Audit Logging**: Comprehensive activity logs for compliance and operational transparency.

## 🛠️ Tech Stack

### Frontend (`client/`)
*   **Framework**: Next.js 14 (React)
*   **UI Library**: Tailwind CSS, lucide-react
*   **State & Data**: Zustand, Axios
*   **Real-time**: Socket.io-client

### Backend (`server/`)
*   **Server**: Node.js, Express.js
*   **Database**: MongoDB Atlas
*   **ORM**: Prisma
*   **Real-time**: Socket.io
*   **Auth**: JWT, bcryptjs

## 📦 Project Structure

```bash
.
├── client/           # Next.js Frontend Application
└── server/           # Express.js Backend API & Prisma Database
```

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas Connection String

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/1273474/Nexus1.git
    cd Nexus1
    ```

2.  **Setup Backend (Server)**
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory:
    ```env
    DATABASE_URL="mongodb+srv://..."
    JWT_SECRET="your_secret_key"
    ```
    Generate Prisma Client and Push Schema:
    ```bash
    npx prisma generate
    npx prisma db push
    ```
    Run the server:
    ```bash
    npm run dev
    ```

3.  **Setup Frontend (Client)**
    Open a new terminal window:
    ```bash
    cd client
    npm install
    npm run dev
    ```

Access the web app at `http://localhost:3000` and the API at `http://localhost:4000`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
