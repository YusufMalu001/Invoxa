"use client";
import { useEffect, useState } from "react";
import { Receipt, Search, Filter, Plus, ScanLine } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/expenses').then(res=>res.json()).then(data => {if(Array.isArray(data)) setExpenses(data);});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-neutral-400">Track and categorize outgoing payments.</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/ai-ops" className="flex items-center px-4 py-2 border border-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors">
            <ScanLine className="w-4 h-4 mr-2 text-indigo-400" /> AI OCR Receipt
          </Link>
          <Link href="/expenses/new" className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" /> Add Expense
          </Link>
        </div>
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col">
        <div className="p-4 border-b border-neutral-800 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input type="text" placeholder="Search vendor..." className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 pl-9 pr-4 text-sm" />
          </div>
          <button className="flex items-center px-4 border border-neutral-800 bg-neutral-950 rounded-md text-sm"><Filter className="w-4 h-4 mr-2" /> Category</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
              <tr>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Vendor</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Account</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {expenses.map(e => (
                <tr key={e.id} onClick={() => router.push(`/expenses/${e.id}`)} className="hover:bg-neutral-800/30 transition-colors cursor-pointer group">
                  <td className="px-5 py-4 text-neutral-400">{format(new Date(e.date), 'MMM d, yyyy')}</td>
                  <td className="px-5 py-4 font-medium flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-neutral-500" /> {e.vendor}
                    {e.aiCategorized && <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 ml-2">AI</span>}
                  </td>
                  <td className="px-5 py-4"><span className="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-300">{e.category}</span></td>
                  <td className="px-5 py-4 text-neutral-400">{e.account?.name || 'Unlinked'}</td>
                  <td className="px-5 py-4 text-right font-medium text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: e.currency }).format(e.amount)}</td>
                  <td className="px-5 py-4 text-right" onClick={(ev) => ev.stopPropagation()}>
                    <Link href={`/expenses/${e.id}`} className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-xs font-medium transition-colors text-white">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-neutral-500">No expenses recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
