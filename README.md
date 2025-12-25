# Nexus: Intelligent Logistics Management System

Nexus is a modern, real-time logistics and analytics platform designed to streamline warehouse operations, track shipments, and provide actionable insights. Built with a robust MERN stack (MongoDB, Express, React, Node) architecture within a Turborepo monorepo.

![Dashboard Preview](https://via.placeholder.com/1200x600?text=Nexus+Dashboard+Preview)

## 🚀 Features

*   **Real-time Tracking**: Monitor shipment status (`PENDING`, `IN_TRANSIT`, `DELIVERED`) updates instantly via WebSockets.
*   **Role-Based Access Control (RBAC)**: Secure driver, manager, and admin portals powered by JWT authentication.
*   **Live Analytics**: Visual dashboard tracking deliveries per hour, active drivers, and inventory flow.
*   **Smart Assignment**: Drag-and-drop driver assignment for pending shipments.
*   **Audit Logging**: Comprehensive activity logs for compliance and operational transparency.

## 🛠️ Tech Stack

### Core
*   **Monorepo**: Turborepo, NPM Workspaces
*   **Languages**: TypeScript (Frontend & Backend)

### Frontend (`apps/web`)
*   **Framework**: Next.js 14
*   **UI Library**: Radix UI, Tailwind CSS
*   **State & Data**: React Query, Axios
*   **Real-time**: Socket.io-client

### Backend (`apps/server`)
*   **Server**: Node.js, Express
*   **Database**: MongoDB Atlas
*   **ORM**: Prisma
*   **Real-time**: Socket.io
*   **Auth**: JWT, Bcrypt

## 📦 Project Structure

```bash
.
├── apps
│   ├── web/          # Next.js Frontend Application
│   └── server/       # Express.js Backend API
└── packages
    ├── database/     # Prisma Schema & Shared Types
    └── ...           # Other shared configs
```

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm (v9+)
*   MongoDB Atlas Connection String

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/nexus.git
    cd nexus
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="mongodb+srv://..."
    JWT_SECRET="your_secret_key"
    ```

4.  **Initialize Database**
    ```bash
    npx prisma generate
    npx prisma db push
    # Optional: Seed data
    # npx ts-node packages/database/seed.ts
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```

Access the web app at `http://localhost:3000` and the API at `http://localhost:4000`.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
