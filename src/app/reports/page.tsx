"use client";
import { BarChart2 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-neutral-400">Deep dive into your financial performance.</p>
        </div>
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-12 text-center text-neutral-500 flex flex-col items-center">
        <BarChart2 className="w-12 h-12 mb-4 text-indigo-500" />
        <h3 className="text-xl font-bold text-neutral-200 mb-2">Generating Analytics...</h3>
        <p>Comprehensive reporting module is being populated.</p>
      </div>
    </div>
  );
}
