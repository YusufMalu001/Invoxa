"use client";

import { use, useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit2, Trash2, Download, Loader2, Share2, MessageCircle, Send, Mail, Link as LinkIcon, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ExpensePDFDocument } from "@/components/ExpensePDFDocument";

const PDFViewer = dynamic(() => import('@react-pdf/renderer').then(mod => mod.PDFViewer), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-neutral-500"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading PDF...</div>
});

export default function ExpenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [expense, setExpense] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/expenses/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setExpense(data);
      })
      .catch(err => toast.error("Failed to load expense"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this expense? This cannot be undone.')) return;
    try {
      await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      toast.success('Expense deleted');
      router.push('/expenses');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleShare = (type: string) => {
    if (!expense) return;
    
    const text = `Expense: ${expense.vendor}\nCategory: ${expense.category}\nAmount: ${expense.currency} ${expense.amount}\nDate: ${format(new Date(expense.date), 'MMM d, yyyy')}`;
    const url = `${window.location.origin}/expenses/${id}`;

    switch (type) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(`Expense Receipt: ${expense.vendor}`)}&body=${encodeURIComponent(text + '\n\nView: ' + url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
        break;
      case 'pdf':
        window.open(`/api/expenses/${id}/pdf`, '_blank');
        break;
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-neutral-500" /></div>;
  }

  if (!expense) return <div className="text-center py-20">Expense not found</div>;

  const lineItems = Array.isArray(expense.lineItems) ? expense.lineItems : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/expenses" className="p-2 rounded-md hover:bg-neutral-800 transition-colors text-neutral-400">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            {expense.vendor} <span className="text-neutral-500 font-normal">#{expense.expenseNumber || id.slice(0,8)}</span>
          </h2>
          <div className="flex gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              expense.status === 'SAVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
            }`}>
              {expense.status}
            </span>
            {expense.isRecurring && <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400">Recurring</span>}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link href={`/expenses/${id}/edit`} className="p-2 bg-neutral-900 border border-neutral-800 rounded-md hover:bg-neutral-800 text-neutral-300">
            <Edit2 className="w-4 h-4" />
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-sm font-medium hover:bg-neutral-800 text-neutral-300">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-neutral-900 border-neutral-800 text-neutral-200">
              <DropdownMenuItem onClick={() => handleShare('whatsapp')} className="hover:bg-neutral-800 cursor-pointer">
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('telegram')} className="hover:bg-neutral-800 cursor-pointer">
                <Send className="w-4 h-4 mr-2" /> Telegram
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('email')} className="hover:bg-neutral-800 cursor-pointer">
                <Mail className="w-4 h-4 mr-2" /> Email
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-800" />
              <DropdownMenuItem onClick={() => handleShare('copy')} className="hover:bg-neutral-800 cursor-pointer">
                <LinkIcon className="w-4 h-4 mr-2" /> Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('pdf')} className="hover:bg-neutral-800 cursor-pointer">
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <a href={`/api/expenses/${id}/pdf`} target="_blank" rel="noreferrer" className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Download className="w-4 h-4 mr-2" /> PDF
          </a>

          <button onClick={handleDelete} className="p-2 border border-rose-500/20 bg-rose-500/10 text-rose-500 rounded-md hover:bg-rose-500/20 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
            <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider mb-4">Expense Details</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div><p className="text-sm text-neutral-500">Date</p><p className="font-medium text-neutral-200">{format(new Date(expense.date), 'MMM d, yyyy')}</p></div>
              <div><p className="text-sm text-neutral-500">Category</p><p className="font-medium text-neutral-200">{expense.category}</p></div>
              <div><p className="text-sm text-neutral-500">Currency</p><p className="font-medium text-neutral-200">{expense.currency}</p></div>
              <div><p className="text-sm text-neutral-500">Account</p><p className="font-medium text-neutral-200">{expense.account?.name || 'Unlinked'}</p></div>
              {expense.project && <div><p className="text-sm text-neutral-500">Project</p><p className="font-medium text-neutral-200">{expense.project.name}</p></div>}
              <div><p className="text-sm text-neutral-500">Payment Method</p><p className="font-medium text-neutral-200">{expense.paymentMethod || 'N/A'}</p></div>
            </div>
            
            {expense.notes && (
              <div className="pt-4 mt-4 border-t border-neutral-800">
                <p className="text-sm text-neutral-500 mb-1">Notes</p>
                <p className="text-sm text-neutral-300 whitespace-pre-wrap">{expense.notes}</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
                <tr>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium text-right">Qty</th>
                  <th className="px-5 py-3 font-medium text-right">Rate</th>
                  <th className="px-5 py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {lineItems.map((item: any, i: number) => {
                  if (item.isSection) {
                    return (
                      <tr key={i} className="bg-neutral-800/30"><td colSpan={4} className="px-5 py-2 font-medium text-indigo-400">{item.description}</td></tr>
                    )
                  }
                  return (
                    <tr key={i}>
                      <td className="px-5 py-4 text-neutral-300">{item.description}</td>
                      <td className="px-5 py-4 text-right text-neutral-400">{item.hours || item.qty || 0}</td>
                      <td className="px-5 py-4 text-right text-neutral-400">{item.cost || item.rate || 0}</td>
                      <td className="px-5 py-4 text-right font-medium text-white">${Number(item.amount || 0).toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            <div className="p-5 border-t border-neutral-800 bg-neutral-950/30 flex flex-col items-end space-y-2 text-sm">
              <div className="flex justify-between w-48 text-neutral-400"><span>Subtotal:</span><span>${Number(expense.subtotal || 0).toFixed(2)}</span></div>
              <div className="flex justify-between w-48 text-neutral-400"><span>Tax ({expense.taxRate || 0}%):</span><span>${(Number(expense.total || 0) - Number(expense.subtotal || 0)).toFixed(2)}</span></div>
              <div className="flex justify-between w-48 text-lg font-bold text-white pt-2 border-t border-neutral-800"><span>Total:</span><span>${Number(expense.total || expense.amount || 0).toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 hidden lg:flex rounded-xl border border-neutral-800 bg-neutral-900/50 flex-col overflow-hidden h-[800px]">
          <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
            <h3 className="text-sm font-medium flex items-center text-neutral-300">
              <FileText className="w-4 h-4 mr-2" /> Live PDF Preview
            </h3>
          </div>
          <div className="flex-1 w-full h-full bg-neutral-900">
            <PDFViewer width="100%" height="100%" className="border-0">
              <ExpensePDFDocument expense={expense} />
            </PDFViewer>
          </div>
        </div>
      </div>
    </div>
  );
}
