"use client";

import { useEffect, useState } from "react";
import { FolderGit2, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(() => toast.error("Failed to load projects"));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-400';
      case 'COMPLETED': return 'bg-blue-500/10 text-blue-400';
      case 'ON_HOLD': return 'bg-amber-500/10 text-amber-400';
      case 'CANCELLED': return 'bg-neutral-500/10 text-neutral-400';
      default: return 'bg-neutral-500/10 text-neutral-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-neutral-400">Track milestones, budgets, and project profitability.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" /> New Project
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <div key={project.id} className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col overflow-hidden hover:border-neutral-700 transition-colors">
            <div className="p-5 border-b border-neutral-800 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-200 truncate w-40" title={project.name}>{project.name}</h3>
                  <p className="text-xs text-neutral-500">{project.client.name}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            
            <div className="p-5 flex-1 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-400">Budget</span>
                  <span className="font-medium">${project.budget?.toLocaleString() || "0"}</span>
                </div>
                <div className="w-full bg-neutral-950 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <p className="text-xs text-neutral-500 mt-2 text-right">45% utilized</p>
              </div>
            </div>
            
            <Link href={`/projects/${project.id}`} className="bg-neutral-950/50 p-3 px-5 border-t border-neutral-800 flex justify-between group hover:bg-indigo-600/10 transition-colors">
              <span className="text-sm font-medium text-neutral-400 group-hover:text-indigo-400 transition-colors">View Details</span>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-indigo-400 transition-colors" />
            </Link>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full text-center py-12 text-neutral-500 bg-neutral-900/30 rounded-xl border border-dashed border-neutral-800">
            No projects found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}
