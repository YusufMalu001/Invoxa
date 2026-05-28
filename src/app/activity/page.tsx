"use client";

import { useEffect, useState } from "react";
import { Clock, FileText, Users, DollarSign, FolderGit2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function ActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/activity')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLogs(data);
      })
      .catch(() => toast.error("Failed to load activity logs"));
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Invoice': return <FileText className="w-5 h-5 text-indigo-400" />;
      case 'Client': return <Users className="w-5 h-5 text-purple-400" />;
      case 'Expense': return <DollarSign className="w-5 h-5 text-emerald-400" />;
      case 'Project': return <FolderGit2 className="w-5 h-5 text-amber-400" />;
      default: return <Clock className="w-5 h-5 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Activity Feed</h2>
        <p className="text-neutral-400">Global audit trail of all platform operations.</p>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <div className="space-y-8">
          {logs.map((log) => (
            <div key={log.id} className="relative flex gap-4 items-start">
              <div className="absolute top-8 left-4 w-px h-full bg-neutral-800 -z-10"></div>
              <div className="p-2 bg-neutral-950 rounded-full border border-neutral-800">
                {getIcon(log.entityType)}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-neutral-200">
                      {log.action} <span className="text-neutral-500 font-normal">on {log.entityType} ({log.entityId.slice(0,8)}...)</span>
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</p>
                  </div>
                </div>
                {log.changedFields && Object.keys(log.changedFields).length > 0 && (
                  <div className="mt-3 bg-neutral-950 border border-neutral-800 rounded-md p-3">
                    <pre className="text-xs text-neutral-400 overflow-x-auto">
                      {JSON.stringify(log.changedFields, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-center text-neutral-500 py-8">No activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
