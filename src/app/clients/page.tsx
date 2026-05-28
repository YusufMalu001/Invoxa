"use client";
import { useEffect, useState } from "react";
import { Search, Plus, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetch('/api/clients').then(res=>res.json()).then(data => {if(Array.isArray(data)) setClients(data)});
  }, []);

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
          <p className="text-neutral-400">Manage client profiles and total revenue.</p>
        </div>
        <button onClick={() => setIsDrawerOpen(true)} className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> Add Client
        </button>
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col">
        <div className="p-4 border-b border-neutral-800 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input type="text" placeholder="Search clients..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 pl-9 pr-4 text-sm" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Country</th>
                <th className="px-5 py-3 font-medium">Currency</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map(c => (
                <tr key={c.id} className="hover:bg-neutral-800/30 transition-colors group">
                  <td className="px-5 py-4 font-medium flex items-center">
                    <User className="w-4 h-4 mr-3 text-neutral-400" />{c.name}
                  </td>
                  <td className="px-5 py-4 text-neutral-400">{c.country || 'N/A'}</td>
                  <td className="px-5 py-4 text-neutral-400">{c.currency}</td>
                  <td className="px-5 py-4 text-neutral-400">{format(new Date(c.createdAt), 'MMM d, yyyy')}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/clients/${c.id}`} className="text-indigo-400 opacity-0 group-hover:opacity-100"><ArrowRight className="w-5 h-5 ml-auto" /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
          <div className="w-96 bg-neutral-900 h-full border-l border-neutral-800 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">New Client</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-neutral-400">✕</button>
            </div>
            <form className="space-y-4 flex-1">
              <div><label className="text-sm text-neutral-400 block mb-1">Name</label><input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm" /></div>
              <div><label className="text-sm text-neutral-400 block mb-1">Email</label><input type="email" className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm" /></div>
              <button type="button" onClick={() => {toast.success("Client added"); setIsDrawerOpen(false)}} className="w-full py-2 bg-indigo-600 rounded-md mt-4 font-medium">Save Client</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
