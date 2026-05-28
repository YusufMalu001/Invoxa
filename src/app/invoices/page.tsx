"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setInvoices(data);
      })
      .catch(() => toast.error("Failed to load invoices"));
  }, []);

  const filtered = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
                          inv.client.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-500/10 text-emerald-400';
      case 'DRAFT': return 'bg-neutral-500/10 text-neutral-400';
      case 'SENT': return 'bg-blue-500/10 text-blue-400';
      case 'OVERDUE': return 'bg-rose-500/10 text-rose-400';
      default: return 'bg-neutral-500/10 text-neutral-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
          <p className="text-neutral-400">Manage and track your billing pipeline.</p>
        </div>
        <Link href="/invoices/new" className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" /> New Invoice
        </Link>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col">
        <div className="p-4 border-b border-neutral-800 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search by invoice # or client..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 pl-9 pr-4 text-sm text-neutral-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-neutral-400">
            <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
              <tr>
                <th className="px-5 py-3 font-medium">Invoice #</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium text-center">Status</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="px-5 py-4 font-medium text-neutral-200">{inv.invoiceNumber}</td>
                  <td className="px-5 py-4 text-neutral-300">{inv.client.name}</td>
                  <td className="px-5 py-4">{format(new Date(inv.createdAt), 'MMM d, yyyy')}</td>
                  <td className="px-5 py-4 text-right font-medium text-neutral-200">${inv.total.toFixed(2)}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/invoices/${inv.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-neutral-500">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
