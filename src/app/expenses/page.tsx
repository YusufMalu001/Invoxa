"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Star, MessageCircle, Send, Mail, Link as LinkIcon, Share2, MoreVertical, Edit2, Trash2, Receipt, Filter, Eye } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [counts, setCounts] = useState({ all: 0, saved: 0, draft: 0, recurring: 0, overdue: 0 });
  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'draft' | 'recurring' | 'overdue'>('all');

  const fetchExpenses = (tab: string) => {
    let query = '';
    if (tab === 'saved') query = '?status=SAVED';
    if (tab === 'draft') query = '?status=DRAFT';
    if (tab === 'recurring') query = '?isRecurring=true';
    if (tab === 'overdue') query = '?isRecurring=true'; // Simplified for UI purposes

    fetch(`/api/expenses${query}`).then(res=>res.json()).then(data => {if(Array.isArray(data)) setExpenses(data);});
  };

  const fetchCounts = () => {
    fetch('/api/expenses/counts').then(res=>res.json()).then(data => {if(data) setCounts(data);});
  };

  useEffect(() => {
    fetchExpenses(activeTab);
    fetchCounts();
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense? This cannot be undone.')) return;
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    setExpenses(prev => prev.filter(e => e.id !== id));
    fetchCounts();
    toast.success('Expense deleted');
  };

  const handleShare = (expense: any, type: string) => {
    const text = `Expense: ${expense.vendor}\nCategory: ${expense.category}\nAmount: ${expense.currency} ${expense.amount}\nDate: ${format(new Date(expense.date), 'MMM d, yyyy')}`;
    const url = `${window.location.origin}/expenses/${expense.id}`;

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
    }
  };

  const tabs = [
    { id: 'all', label: 'All Expenses', count: counts.all },
    { id: 'saved', label: 'Saved', count: counts.saved },
    { id: 'draft', label: 'Draft', count: counts.draft },
    { id: 'recurring', label: 'Recurring', count: counts.recurring },
    { id: 'overdue', label: 'Overdue', count: counts.overdue },
  ];

  const renderNotesPreview = (expense: any) => {
    const text = expense.notes || (Array.isArray(expense.lineItems) && expense.lineItems[0] ? expense.lineItems[0].description : '');
    if (!text) return <span className="text-neutral-600 italic">No notes</span>;
    return text.length > 40 ? text.substring(0, 40) + '...' : text;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-neutral-400">Track and categorize outgoing payments.</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => router.push('/expenses/new')} className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" /> Add Expense
          </button>
        </div>
      </div>
      
      <div className="flex space-x-1 border-b border-neutral-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
            }`}
          >
            {tab.label} <span className="ml-1.5 px-2 py-0.5 rounded-full bg-neutral-800 text-xs text-neutral-300">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col">
        <div className="p-4 border-b border-neutral-800 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input type="text" placeholder="Search vendor..." className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 pl-9 pr-4 text-sm" />
          </div>
          <button className="flex items-center px-4 border border-neutral-800 bg-neutral-950 rounded-md text-sm"><Filter className="w-4 h-4 mr-2" /> Filter</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
              <tr>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Vendor</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Notes/Description</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {expenses.map(e => (
                <tr key={e.id} onClick={() => router.push(`/expenses/${e.id}`)} className="hover:bg-neutral-800/30 transition-colors cursor-pointer group">
                  <td className="px-5 py-4 text-neutral-400">{format(new Date(e.date), 'MMM d, yyyy')}</td>
                  <td className="px-5 py-4 font-medium flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-neutral-500" /> {e.vendor}
                    {e.status === 'DRAFT' && <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-700 text-neutral-300 ml-2">DRAFT</span>}
                  </td>
                  <td className="px-5 py-4"><span className="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-300">{e.category}</span></td>
                  <td className="px-5 py-4 text-neutral-400">{renderNotesPreview(e)}</td>
                  <td className="px-5 py-4 text-right font-medium text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: e.currency }).format(e.amount)}</td>
                  <td className="px-5 py-4 text-right" onClick={(ev) => ev.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-neutral-900 border-neutral-800 text-neutral-200">
                        <DropdownMenuItem onClick={() => router.push(`/expenses/${e.id}`)} className="hover:bg-neutral-800 cursor-pointer">
                          <Eye className="w-4 h-4 mr-2" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/expenses/${e.id}/edit`)} className="hover:bg-neutral-800 cursor-pointer">
                          <Edit2 className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-neutral-800" />
                        <DropdownMenuItem onClick={() => handleShare(e, 'whatsapp')} className="hover:bg-neutral-800 cursor-pointer">
                          <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(e, 'telegram')} className="hover:bg-neutral-800 cursor-pointer">
                          <Send className="w-4 h-4 mr-2" /> Telegram
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(e, 'email')} className="hover:bg-neutral-800 cursor-pointer">
                          <Mail className="w-4 h-4 mr-2" /> Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(e, 'copy')} className="hover:bg-neutral-800 cursor-pointer">
                          <LinkIcon className="w-4 h-4 mr-2" /> Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-neutral-800" />
                        <DropdownMenuItem onClick={() => handleDelete(e.id)} className="text-rose-500 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer">
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-neutral-500 flex-col items-center flex">
                    <Receipt className="w-8 h-8 text-neutral-700 mb-3" />
                    No expenses found.
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
