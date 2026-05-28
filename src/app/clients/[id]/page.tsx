"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Edit3, ChevronRight } from "lucide-react";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/clients/${params.id}`).then(res=>res.json()).then(data=>setClient(data)).catch(()=>router.push('/clients'));
  }, [params.id, router]);

  if (!client) return <div className="flex h-96 justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm text-neutral-400 mb-2">
        <span className="hover:text-neutral-200 cursor-pointer" onClick={() => router.push('/clients')}>Clients</span>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="text-neutral-200">{client.name}</span>
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 relative overflow-hidden">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-xl font-bold mr-4">{client.name.charAt(0)}</div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{client.name}</h2>
            <p className="text-neutral-400">{client.email || 'No email provided'} • {client.country || 'Global'}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 pt-6 border-t border-neutral-800">
          <div><p className="text-sm text-neutral-500 mb-1">Total Invoiced</p><p className="text-xl font-semibold">$0.00</p></div>
          <div><p className="text-sm text-neutral-500 mb-1">Total Settled</p><p className="text-xl font-semibold text-emerald-400">$0.00</p></div>
          <div><p className="text-sm text-neutral-500 mb-1">Outstanding</p><p className="text-xl font-semibold text-amber-400">$0.00</p></div>
          <div><p className="text-sm text-neutral-500 mb-1">Invoices</p><p className="text-xl font-semibold">{client.invoices?.length || 0}</p></div>
        </div>
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50">
        <div className="flex border-b border-neutral-800 px-4">
          {['Invoices', 'Settlements', 'Templates', 'Activity'].map((tab, i) => (
            <button key={tab} className={`py-4 px-4 text-sm font-medium border-b-2 ${i===0 ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}>{tab}</button>
          ))}
        </div>
        <div className="p-8 text-center text-neutral-500">View all {client.name} data here.</div>
      </div>
    </div>
  );
}
