"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Star, MessageCircle, Send, Mail, Link as LinkIcon, Share2, MoreVertical, Edit2, Trash2, FileText } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [counts, setCounts] = useState({ all: 0, sent: 0, paid: 0, overdue: 0, draft: 0 });
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const fetchInvoices = (tab: string) => {
    let url = '/api/invoices';
    if (tab === 'all') url += '?status=active';
    else url += `?status=${tab.toUpperCase()}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setInvoices(data);
      })
      .catch(() => toast.error("Failed to load invoices"));
  };

  const fetchCounts = () => {
    fetch('/api/invoices/counts')
      .then(res => res.json())
      .then(data => setCounts(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchCounts();
    fetchInvoices(activeTab);
  }, [activeTab]);

  const filtered = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
                          inv.client.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const toggleStar = async (id: string, currentStarred: boolean) => {
    // optimistic
    setInvoices(invoices.map(i => i.id === id ? { ...i, starred: !currentStarred } : i));
    try {
      await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ starred: !currentStarred })
      });
    } catch {
      toast.error('Failed to update star');
      fetchInvoices(activeTab); // revert
    }
  };

  const deleteDraft = async (id: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;
    try {
      await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
      toast.success('Draft deleted');
      fetchInvoices(activeTab);
      fetchCounts();
    } catch {
      toast.error('Failed to delete draft');
    }
  };

  const handleShare = (option: string, invoice: any) => {
    const text = `Invoice ${invoice.invoiceNumber} | ${invoice.client.name} | ${invoice.currency} ${invoice.total}`;
    const fullUrl = `${window.location.origin}/invoices/${invoice.id}`;
    
    switch (option) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + fullUrl)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'gmail':
        const body = `Hi ${invoice.client.name},\n\nPlease find your invoice details below:\n\nInvoice #: ${invoice.invoiceNumber}\nAmount: ${invoice.currency} ${invoice.total}\nDue Date: ${invoice.dueDate ? format(new Date(invoice.dueDate), 'MMM d, yyyy') : 'N/A'}\n\nView invoice: ${fullUrl}\n\nThank you.`;
        window.open(`mailto:${invoice.client.email}?subject=${encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)}&body=${encodeURIComponent(body)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(fullUrl);
        toast.success('Link copied');
        break;
    }
  };

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
          <div className="flex space-x-1">
            {[
              { id: 'all', label: 'All Invoices', count: counts.all },
              { id: 'sent', label: 'Sent', count: counts.sent },
              { id: 'paid', label: 'Paid', count: counts.paid },
              { id: 'overdue', label: 'Overdue', count: counts.overdue },
              { id: 'draft', label: 'Drafts', count: counts.draft },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center ${activeTab === tab.id ? 'bg-indigo-600/10 text-indigo-400' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'}`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-indigo-600/20 text-indigo-300' : 'bg-neutral-800 text-neutral-500'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-neutral-400">
            <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
              <tr>
                <th className="px-4 py-3 font-medium w-10"></th>
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
                  <td className="px-4 py-4 text-center">
                    <button onClick={() => toggleStar(inv.id, inv.starred)} className="text-neutral-500 hover:text-yellow-500 transition-colors">
                      <Star className={`w-4 h-4 ${inv.starred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                    </button>
                  </td>
                  <td className="px-5 py-4 font-medium text-neutral-200">
                    <Link href={`/invoices/${inv.id}`} className="hover:underline">
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-neutral-300">{inv.client.name}</td>
                  <td className="px-5 py-4">{format(new Date(inv.createdAt), 'MMM d, yyyy')}</td>
                  <td className="px-5 py-4 text-right font-medium text-neutral-200">${inv.total.toFixed(2)}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(inv.status)}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {inv.status === 'DRAFT' && (
                        <>
                          <Link href={`/invoices/${inv.id}/edit`} className="p-1.5 text-neutral-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors" title="Edit Draft">
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button onClick={() => deleteDraft(inv.id)} className="p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors" title="Delete Draft">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {inv.status !== 'DRAFT' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors outline-none">
                            <Share2 className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 bg-neutral-900 border-neutral-800">
                            <DropdownMenuItem onClick={() => handleShare('whatsapp', inv)} className="hover:bg-neutral-800 cursor-pointer text-sm">
                              <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare('telegram', inv)} className="hover:bg-neutral-800 cursor-pointer text-sm">
                              <Send className="w-4 h-4 mr-2" /> Telegram
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare('gmail', inv)} className="hover:bg-neutral-800 cursor-pointer text-sm">
                              <Mail className="w-4 h-4 mr-2" /> Gmail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare('copy', inv)} className="hover:bg-neutral-800 cursor-pointer text-sm">
                              <LinkIcon className="w-4 h-4 mr-2" /> Copy Link
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      <Link href={`/invoices/${inv.id}`} className="p-1.5 text-neutral-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-neutral-500 flex-col items-center flex">
                    <FileText className="w-8 h-8 text-neutral-700 mb-3" />
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
