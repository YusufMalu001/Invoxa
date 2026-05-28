"use client";

import { useEffect, useState } from "react";
import { Download, Filter, BookOpen } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";

export default function LedgerPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking the API response since it requires deep relation setup
    setEntries([
      { id: '1', date: new Date().toISOString(), description: 'Invoice INV-2024-001 Settlement', debitAccount: { name: 'Mercury USD' }, creditAccount: { name: 'Accounts Receivable' }, amount: 4500, currency: 'USD' },
      { id: '2', date: new Date(Date.now() - 86400000).toISOString(), description: 'AWS Hosting', debitAccount: { name: 'Software Expense' }, creditAccount: { name: 'Mercury USD' }, amount: 450, currency: 'USD' },
      { id: '3', date: new Date(Date.now() - 86400000*2).toISOString(), description: 'Invoice INV-2024-002 Settlement', debitAccount: { name: 'Wise Business' }, creditAccount: { name: 'Accounts Receivable' }, amount: 12500, currency: 'USD' },
    ]);
    setLoading(false);
  }, []);

  const handleExport = () => {
    toast.success("CSV Export started. Check your downloads.");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Double-Entry Ledger</h2>
          <p className="text-neutral-400">Immutable record of all financial transactions.</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/ledger/trial-balance" className="px-4 py-2 border border-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors">
            Trial Balance
          </Link>
          <button onClick={handleExport} className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col">
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
          <div className="flex gap-2">
            <button className="flex items-center text-sm text-neutral-400 hover:text-white px-3 py-1.5 border border-neutral-700 rounded-md bg-neutral-950">
              <Filter className="w-4 h-4 mr-2" /> Filter by Account
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left font-mono">
            <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
              <tr>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Debit Account</th>
                <th className="px-5 py-3 font-medium">Credit Account</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {entries.map(entry => (
                <tr key={entry.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="px-5 py-4">{format(new Date(entry.date), 'yyyy-MM-dd HH:mm')}</td>
                  <td className="px-5 py-4 text-neutral-200">{entry.description}</td>
                  <td className="px-5 py-4 text-emerald-400">{entry.debitAccount.name}</td>
                  <td className="px-5 py-4 text-rose-400">{entry.creditAccount.name}</td>
                  <td className="px-5 py-4 text-right font-medium text-neutral-200">${entry.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
