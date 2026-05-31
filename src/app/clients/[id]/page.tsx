"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Edit3, ChevronRight, FileText, Plus, AlertCircle, FileStack, FolderOpen, Receipt, CalendarClock, Trash2 } from "lucide-react";
import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { toast } from "sonner";

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    PAID: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    SENT: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    OVERDUE: "bg-red-500/10 text-red-400 border-red-500/20",
    DRAFT: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    SETTLED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  const color = colors[status] || "bg-neutral-500/10 text-neutral-400 border-neutral-500/20";
  return (
    <span className={`px-2 py-1 text-xs font-medium border rounded-full ${color}`}>
      {status}
    </span>
  );
};

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Invoices');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const fetchClient = () => {
    fetch(`/api/clients/${id}`)
      .then(res => res.json())
      .then(data => {
        setClient(data);
        setFormData(data);
      })
      .catch(() => router.push('/clients'));
  };

  useEffect(() => {
    fetchClient();
  }, [id, router]);

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Client updated successfully");
        setIsEditOpen(false);
        fetchClient();
      } else {
        toast.error("Failed to update client");
      }
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  if (!client) {
    return (
      <div className="flex h-[80vh] justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const tabs = ['Invoices', 'Projects', 'Transactions', 'Upcoming'];

  return (
    <div className="space-y-6 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-neutral-400 mb-2">
        <span className="hover:text-neutral-200 cursor-pointer" onClick={() => router.push('/clients')}>Clients</span>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="text-neutral-200">{client.name}</span>
      </div>

      {/* Header Card */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-xl font-bold mr-4 shrink-0 shadow-lg">
            {client.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-1">{client.name}</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-400">
              <span><strong className="text-neutral-300">Email:</strong> {client.email || 'N/A'}</span>
              <span><strong className="text-neutral-300">Country:</strong> {client.country || 'N/A'}</span>
              <span><strong className="text-neutral-300">Currency:</strong> {client.currency}</span>
              <span><strong className="text-neutral-300">Terms:</strong> {client.preferredTerms || 'Net 30'}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsEditOpen(true)}
            className="flex items-center px-4 py-2 border border-neutral-700 bg-neutral-900 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors text-white"
          >
            <Edit3 className="w-4 h-4 mr-2" /> Edit Client
          </button>
          <button 
            onClick={() => router.push(`/invoices/new?clientId=${client.id}`)}
            className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> New Invoice
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5">
          <p className="text-sm font-medium text-neutral-400 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-white">${client.totalRevenue?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5">
          <p className="text-sm font-medium text-neutral-400 mb-1">Total Invoices</p>
          <p className="text-2xl font-bold text-white">{client.totalInvoices || 0}</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5">
          <p className="text-sm font-medium text-neutral-400 mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-amber-400">${client.outstandingAmount?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5">
          <p className="text-sm font-medium text-neutral-400 mb-1">Last Invoice Date</p>
          <p className="text-2xl font-bold text-white">{client.lastInvoiceDate ? format(new Date(client.lastInvoiceDate), 'MMM d, yyyy') : 'Never'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-neutral-900/80 rounded-lg w-max border border-neutral-800">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden min-h-[400px]">
        {activeTab === 'Invoices' && (
          <div className="overflow-x-auto">
            {client.invoices?.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
                  <tr>
                    <th className="px-5 py-4 font-medium">Invoice #</th>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 font-medium">Due Date</th>
                    <th className="px-5 py-4 font-medium">Amount</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {client.invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-white">{inv.invoiceNumber}</td>
                      <td className="px-5 py-4 text-neutral-400">{format(new Date(inv.createdAt), 'MMM d, yyyy')}</td>
                      <td className="px-5 py-4 text-neutral-400">{inv.dueDate ? format(new Date(inv.dueDate), 'MMM d, yyyy') : 'N/A'}</td>
                      <td className="px-5 py-4 text-white font-medium">${inv.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-5 py-4"><StatusBadge status={inv.status} /></td>
                      <td className="px-5 py-4 text-right">
                        <Link href={`/invoices/${inv.id}`} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                <FileStack className="w-12 h-12 mb-4 opacity-20" />
                <p>No invoices yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Projects' && (
          <div className="overflow-x-auto">
            <div className="p-4 border-b border-neutral-800 flex justify-end">
              <button className="flex items-center px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-md text-xs font-medium hover:bg-neutral-700 transition-colors text-white">
                <Plus className="w-3.5 h-3.5 mr-1" /> New Project
              </button>
            </div>
            {client.projects?.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
                  <tr>
                    <th className="px-5 py-4 font-medium">Project Name</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Budget</th>
                    <th className="px-5 py-4 font-medium">Start Date</th>
                    <th className="px-5 py-4 font-medium">End Date</th>
                    <th className="px-5 py-4 font-medium text-right">Profitability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {client.projects.map((proj: any) => (
                    <tr key={proj.id} className="hover:bg-neutral-800/30 transition-colors cursor-pointer" onClick={() => router.push(`/projects/${proj.id}`)}>
                      <td className="px-5 py-4 font-medium text-white">{proj.name}</td>
                      <td className="px-5 py-4"><StatusBadge status={proj.status} /></td>
                      <td className="px-5 py-4 text-neutral-300">{proj.budget ? `$${proj.budget.toLocaleString()}` : 'N/A'}</td>
                      <td className="px-5 py-4 text-neutral-400">{proj.startDate ? format(new Date(proj.startDate), 'MMM d, yyyy') : 'N/A'}</td>
                      <td className="px-5 py-4 text-neutral-400">{proj.endDate ? format(new Date(proj.endDate), 'MMM d, yyyy') : 'N/A'}</td>
                      <td className="px-5 py-4 text-right text-emerald-400 font-medium">--%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                <FolderOpen className="w-12 h-12 mb-4 opacity-20" />
                <p>No projects yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Transactions' && (
          <div className="overflow-x-auto">
            {client.settlements?.length > 0 ? (
              <>
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
                    <tr>
                      <th className="px-5 py-4 font-medium">Invoice #</th>
                      <th className="px-5 py-4 font-medium">Date</th>
                      <th className="px-5 py-4 font-medium">Invoiced USD</th>
                      <th className="px-5 py-4 font-medium">Net Realized</th>
                      <th className="px-5 py-4 font-medium">Settlement Gap</th>
                      <th className="px-5 py-4 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {client.settlements.map((settlement: any) => {
                      const gap = settlement.invoicedUSD - (settlement.receivedUSD || 0);
                      const inv = client.invoices.find((i: any) => i.id === settlement.invoiceId);
                      return (
                        <tr key={settlement.id} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="px-5 py-4 font-medium text-white">{inv?.invoiceNumber || 'Unknown'}</td>
                          <td className="px-5 py-4 text-neutral-400">{settlement.settledAt ? format(new Date(settlement.settledAt), 'MMM d, yyyy') : 'Pending'}</td>
                          <td className="px-5 py-4 text-neutral-300">${settlement.invoicedUSD?.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                          <td className="px-5 py-4 text-emerald-400 font-medium">${settlement.netRealized?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}</td>
                          <td className="px-5 py-4 text-amber-400">-${gap > 0 ? gap.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}</td>
                          <td className="px-5 py-4 text-right"><StatusBadge status={settlement.status} /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-neutral-950/50 border-t border-neutral-800 font-medium text-white">
                    <tr>
                      <td colSpan={2} className="px-5 py-4 text-right text-neutral-400">Summary:</td>
                      <td className="px-5 py-4">${client.settlements.reduce((s:number, x:any)=>s+(x.invoicedUSD||0),0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-5 py-4 text-emerald-400">${client.settlements.reduce((s:number, x:any)=>s+(x.netRealized||0),0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="px-5 py-4 text-amber-400">-${client.settlements.reduce((s:number, x:any)=>s+(x.invoicedUSD - (x.receivedUSD||0)),0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                <Receipt className="w-12 h-12 mb-4 opacity-20" />
                <p>No settlements recorded yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Upcoming' && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <CalendarClock className="w-5 h-5 mr-2 text-indigo-400" /> Scheduled Invoices
              </h3>
              {client.recurringWorkflows?.length > 0 ? (
                <div className="space-y-3">
                  {client.recurringWorkflows.map((wf: any) => (
                    <div key={wf.id} className="p-4 border border-neutral-800 rounded-lg bg-neutral-900/30 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white">{wf.name}</p>
                        <p className="text-sm text-neutral-400 mt-1">Next run: {format(new Date(wf.nextRunAt), 'MMM d, yyyy')} ({wf.frequency})</p>
                      </div>
                      <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 text-xs rounded-full border border-indigo-500/20">Active</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-neutral-500 border border-neutral-800 rounded-lg bg-neutral-900/10 border-dashed">
                  No recurring invoices scheduled.
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-rose-400" /> Pending & Overdue
              </h3>
              {client.upcomingInvoices?.length > 0 ? (
                <div className="space-y-3">
                  {client.upcomingInvoices.map((inv: any) => {
                    const isOverdue = inv.status === 'OVERDUE' || (inv.dueDate && new Date(inv.dueDate) < new Date());
                    const days = inv.dueDate ? Math.abs(differenceInDays(new Date(inv.dueDate), new Date())) : 0;
                    return (
                      <div key={inv.id} className={`p-4 border rounded-lg flex justify-between items-center ${isOverdue ? 'border-rose-900/50 bg-rose-950/10' : 'border-neutral-800 bg-neutral-900/30'}`}>
                        <div>
                          <p className="font-medium text-white">{inv.invoiceNumber} <span className="text-neutral-400 font-normal ml-2">${inv.total.toLocaleString()}</span></p>
                          <p className={`text-sm mt-1 font-medium ${isOverdue ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {isOverdue ? `${days} days overdue` : `Due in ${days} days`}
                          </p>
                        </div>
                        <Link href={`/invoices/${inv.id}`} className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded text-xs font-medium transition-colors text-white">
                          Pay Now
                        </Link>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-neutral-500 border border-neutral-800 rounded-lg bg-neutral-900/10 border-dashed">
                  All invoices are fully paid.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Drawer */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
          <div className="w-[400px] bg-neutral-900 h-full border-l border-neutral-800 flex flex-col shadow-2xl">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Edit Client</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-neutral-400 hover:text-white transition-colors">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-300 block mb-1">Name</label>
                <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-300 block mb-1">Email</label>
                <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors" />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-300 block mb-1">Country</label>
                <input type="text" value={formData.country || ''} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-300 block mb-1">Currency</label>
                  <select value={formData.currency || 'USD'} onChange={e => setFormData({...formData, currency: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-300 block mb-1">Terms</label>
                  <input type="text" value={formData.preferredTerms || ''} placeholder="Net 30" onChange={e => setFormData({...formData, preferredTerms: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors" />
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-neutral-800">
                <h4 className="text-sm font-medium text-white mb-4">Payment Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-300 block mb-1">Payment Method</label>
                    <select value={formData.paymentMethod || ''} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors">
                      <option value="">Select Method...</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Crypto">Crypto</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Wise">Wise</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-300 block mb-1">Bank Name</label>
                    <input type="text" value={formData.bankName || ''} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-300 block mb-1">Account Name</label>
                    <input type="text" value={formData.bankAccountName || ''} onChange={e => setFormData({...formData, bankAccountName: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-300 block mb-1">Account Number</label>
                    <input type="text" value={formData.accountNumber || ''} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm focus:border-indigo-500 outline-none transition-colors" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-neutral-800 bg-neutral-950">
              <button onClick={handleSaveEdit} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-md font-medium text-white shadow-lg shadow-indigo-900/20">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
