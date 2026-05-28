"use client";
import { Calendar, Plus } from "lucide-react";

export default function RecurringPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recurring Workflows</h2>
          <p className="text-neutral-400">Automated invoices, reminders, and schedules.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" /> New Workflow
        </button>
      </div>
      <div className="flex gap-6">
        <div className="w-1/3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="flex items-center justify-between mb-4"><h3 className="font-medium">Schedule</h3><Calendar className="w-4 h-4 text-neutral-400" /></div>
          <div className="aspect-square bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-center text-neutral-500 text-sm">Calendar Component</div>
        </div>
        <div className="w-2/3 rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
              <tr>
                <th className="px-5 py-3 font-medium">Workflow</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Frequency</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan={4} className="py-12 text-center text-neutral-500">No active recurring workflows.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
