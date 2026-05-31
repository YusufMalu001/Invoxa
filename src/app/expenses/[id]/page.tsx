"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Edit3, Download, Trash2, ChevronRight, FileText, Calendar, Building, Tag, FileStack, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [expense, setExpense] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const fetchExpense = () => {
    fetch('/api/expenses') // This fetches all. Wait, we don't have a GET /api/expenses/[id] endpoint? We must create one or use a specific one.
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
          const found = data.find(e => e.id === id);
          if (found) setExpense(found);
          else router.push('/expenses');
        }
      })
      .catch(() => router.push('/expenses'));
  };

  useEffect(() => {
    // Better to fetch specific endpoint if it exists, but since we didn't create GET /api/expenses/[id], 
    // we'll fetch all and filter or we can quickly create GET /api/expenses/[id] endpoint.
    fetch(`/api/expenses/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => {
        setExpense(data);
        // If audit logs endpoint exists, fetch it here
        fetch(`/api/audit?entityId=${id}`)
          .then(r => r.json())
          .then(logs => {
            if(Array.isArray(logs)) setAuditLogs(logs);
          }).catch(()=>{});
      })
      .catch(() => router.push('/expenses'));
  }, [id, router]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success("Expense deleted");
          router.push('/expenses');
        } else {
          toast.error("Failed to delete");
        }
      } catch (e) {
        toast.error("An error occurred");
      }
    }
  };

  if (!expense) {
    return (
      <div className="flex h-[80vh] justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const lineItems = Array.isArray(expense.lineItems) ? expense.lineItems : [];

  return (
    <div className="space-y-6 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-neutral-400 mb-2">
        <Link href="/expenses" className="hover:text-neutral-200">Expenses</Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="text-neutral-200">{expense.expenseNumber || expense.id}</span>
      </div>

      {/* Header */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">{expense.expenseNumber || 'Expense'}</h2>
            <span className="px-2.5 py-1 text-xs font-medium border rounded-full bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              {expense.status || 'SAVED'}
            </span>
            {expense.aiCategorized && (
               <span className="px-2.5 py-1 rounded text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">AI Categorized</span>
            )}
          </div>
          <p className="text-neutral-400 flex items-center space-x-4 text-sm">
            <span className="flex items-center"><Building className="w-4 h-4 mr-1" /> {expense.vendor}</span>
            <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {format(new Date(expense.date), 'MMM d, yyyy')}</span>
            <span className="flex items-center"><Tag className="w-4 h-4 mr-1" /> {expense.category}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push(`/expenses/${id}/edit`)} className="flex items-center px-4 py-2 border border-neutral-700 bg-neutral-900 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors text-white">
            <Edit3 className="w-4 h-4 mr-2" /> Edit
          </button>
          <a href={`/api/expenses/${id}/pdf`} target="_blank" rel="noreferrer" className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors text-white">
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </a>
          <button onClick={handleDelete} className="flex items-center px-4 py-2 border border-rose-900/50 bg-rose-950/20 rounded-md text-sm font-medium text-rose-400 hover:bg-rose-950/40 transition-colors">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Details */}
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <h3 className="text-lg font-medium text-white mb-4 border-b border-neutral-800 pb-2">Expense Details</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <p className="text-neutral-500 mb-1">Vendor</p>
                <p className="font-medium text-neutral-200">{expense.vendor}</p>
              </div>
              <div>
                <p className="text-neutral-500 mb-1">Category</p>
                <p className="font-medium text-neutral-200">{expense.category}</p>
              </div>
              <div>
                <p className="text-neutral-500 mb-1">Account</p>
                <p className="font-medium text-neutral-200">{expense.account?.name || 'Unlinked'}</p>
              </div>
              <div>
                <p className="text-neutral-500 mb-1">Project</p>
                <p className="font-medium text-neutral-200">{expense.project?.name || 'None'}</p>
              </div>
              <div>
                <p className="text-neutral-500 mb-1">Currency</p>
                <p className="font-medium text-neutral-200">{expense.currency}</p>
              </div>
              <div>
                <p className="text-neutral-500 mb-1">Payment Method</p>
                <p className="font-medium text-neutral-200">{expense.paymentMethod || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-neutral-500 mb-1">Notes</p>
                <p className="text-neutral-300 whitespace-pre-wrap">{expense.notes || 'No notes provided.'}</p>
              </div>
            </div>
            {expense.isRecurring && (
              <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 mr-2" />
                <span className="text-sm text-indigo-300">This is a recurring expense profile.</span>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <h3 className="text-lg font-medium text-white mb-4 border-b border-neutral-800 pb-2">Line Items</h3>
            {lineItems.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
                      <tr>
                        <th className="py-3 font-medium">Description</th>
                        <th className="py-3 font-medium text-center">Qty</th>
                        <th className="py-3 font-medium text-center">Rate</th>
                        <th className="py-3 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {lineItems.map((item: any, i: number) => {
                        if (item.isSection) {
                          return (
                            <tr key={i} className="bg-neutral-950/20">
                              <td colSpan={4} className="py-3 font-medium text-indigo-400">{item.description}</td>
                            </tr>
                          );
                        }
                        return (
                          <tr key={i}>
                            <td className="py-3 text-neutral-300">{item.description}</td>
                            <td className="py-3 text-center text-neutral-400">{item.qty}</td>
                            <td className="py-3 text-center text-neutral-400">{item.rate}</td>
                            <td className="py-3 text-right font-medium text-white">${Number(item.amount || 0).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end pt-4 border-t border-neutral-800">
                  <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between text-neutral-400">
                      <span>Subtotal</span>
                      <span>${Number(expense.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>Tax ({expense.taxRate || 0}%)</span>
                      <span>${(Number(expense.total || 0) - Number(expense.subtotal || 0)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-base text-white pt-2 border-t border-neutral-800">
                      <span>Total</span>
                      <span>${Number(expense.total || expense.amount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No line items recorded.</p>
            )}
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
            <h3 className="text-lg font-medium text-white mb-4 border-b border-neutral-800 pb-2">Audit Timeline</h3>
            {auditLogs.length > 0 ? (
              <div className="space-y-4">
                {auditLogs.map((log: any) => (
                  <div key={log.id} className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5" />
                      <div className="w-px h-full bg-neutral-800 my-1" />
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-white">{log.action}</p>
                      <p className="text-xs text-neutral-500">{format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')} • {log.user || 'System'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No audit events found.</p>
            )}
          </div>

        </div>

        {/* Right Column: PDF Preview */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col h-full min-h-[800px] overflow-hidden">
          <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex justify-between items-center">
            <h3 className="text-sm font-medium flex items-center text-neutral-300">
              <FileText className="w-4 h-4 mr-2" /> Live PDF Preview
            </h3>
          </div>
          <div className="flex-1 w-full h-full bg-neutral-900">
            <iframe 
              src={`/api/expenses/${id}/pdf`} 
              className="w-full h-full border-0" 
              title="Expense PDF Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
