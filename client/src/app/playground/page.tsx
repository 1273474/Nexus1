'use client';
import { useState } from "react";
import { useEffect } from "react";

const mock_drivers = [
    { id: 1, name: "Ravi", active: true },
    { id: 2, name: "Sam", active: false },
    { id: 3, name: "Maria", active: true },
]

// 1. New Child Component
// It accepts "props", and we extract "isActive" from it.
function StatusBadge({ isActive }: { isActive: boolean }) {
    if (isActive) {
        return <span className="text-green-600 ml-2 font-bold">Active</span>;
    } else {
        return <span className="text-red-600 ml-2 font-bold">Inactive</span>;
    }
}

// 2. Main Parent Component
export default function Playground() {
    const driverName = "Ravi";
    const [isActive, setIsActive] = useState(true);

    return (
        <div>


            <div className="p-10">
                <h1 className="text-4xl font-bold mb-4">Driver List</h1>
                <p className="text-xl">
                    Driver: <b>{driverName}</b>
                </p>

                <p className="text-lg mt-4 mb-4">
                    Status: <StatusBadge isActive={isActive} />
                </p>

                <button
                    onClick={() => setIsActive(!isActive)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Toggle Status
                </button>
            </div>

            <div className="p-10">
                <h1 className="text-4xl font-bold mb-4">Driver List</h1>

                <ul className="space-y-4">
                    {/* 2. The Loop */}
                    {mock_drivers.map((driver) => (
                        <li key={driver.id} className="border p-4 rounded shadow flex justify-between w-64">
                            <span>{driver.name}</span>

                            {/* 3. Reusing your Component! */}
                            <StatusBadge isActive={driver.active} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}