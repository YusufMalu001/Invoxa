"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { ChevronRight, Loader2, Target, DollarSign, TrendingUp, CheckCircle2 } from "lucide-react";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    // We would fetch the actual project details and related milestones/expenses here
    // For now, setting a stub to satisfy UI structure
    setProject({
      id: id,
      name: "Acme Website Redesign",
      budget: 50000,
      currency: "USD",
      status: "ACTIVE",
      client: { name: "Acme Corp" },
      createdAt: new Date().toISOString(),
      milestones: [
        { id: "1", title: "Design Phase", amount: 15000, status: "PAID" },
        { id: "2", title: "Development Phase", amount: 25000, status: "INVOICED" },
        { id: "3", title: "Launch", amount: 10000, status: "PENDING" },
      ]
    });
  }, [id]);

  if (!project) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  const profitabilityScore = 78; // Mock calculated score

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center text-sm text-neutral-400 mb-2">
            <span className="hover:text-neutral-200 cursor-pointer" onClick={() => router.push('/projects')}>Projects</span>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-neutral-200">{project.name}</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
          <p className="text-neutral-400 mt-1">{project.client.name} • {format(new Date(project.createdAt), 'MMM d, yyyy')}</p>
        </div>
      </div>

      {/* P&L Panel */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-400">Total Budget</h3>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold">${project.budget.toLocaleString()}</div>
        </div>
        
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-400">Actual Spend</h3>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-rose-400">$12,450</div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-neutral-400">Profitability Score</h3>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">{profitabilityScore}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50">
          <div className="p-5 border-b border-neutral-800 flex justify-between items-center">
            <h3 className="font-medium text-neutral-200">Milestones</h3>
            <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300">Add Milestone</button>
          </div>
          <div className="divide-y divide-neutral-800">
            {project.milestones.map((m: any) => (
              <div key={m.id} className="p-5 flex justify-between items-center hover:bg-neutral-800/20">
                <div className="flex items-center gap-3">
                  {m.status === 'PAID' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <div className="w-5 h-5 rounded-full border-2 border-neutral-600"></div>}
                  <div>
                    <p className="font-medium text-sm text-neutral-200">{m.title}</p>
                    <p className="text-xs text-neutral-500">${m.amount.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                    m.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 
                    m.status === 'INVOICED' ? 'bg-blue-500/10 text-blue-400' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
