"use client";
import { useEffect, useState } from "react";
import { Download, AlertTriangle } from "lucide-react";

export default function TrialBalancePage() {
  const [balances, setBalances] = useState<any>({});
  
  useEffect(() => {
    fetch('/api/ledger/trial-balance').then(res=>res.json()).then(data => setBalances(data));
  }, []);

  let totalDebits = 0;
  let totalCredits = 0;
  Object.values(balances).forEach((b: any) => { totalDebits += b.debits; totalCredits += b.credits; });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Trial Balance</h2>
          <p className="text-neutral-400">Snapshot as of {new Date().toLocaleDateString()}</p>
        </div>
        <button className="flex items-center px-4 py-2 border border-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </button>
      </div>
      {Math.abs(totalDebits - totalCredits) > 0.01 && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-3" />
          <p className="font-medium text-sm">Warning: Books are out of balance by ${Math.abs(totalDebits - totalCredits).toFixed(2)}</p>
        </div>
      )}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
        <table className="w-full text-sm text-left font-mono">
          <thead className="bg-neutral-950/30 text-neutral-500 border-b border-neutral-800 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 font-medium">Account ID</th>
              <th className="px-5 py-3 font-medium text-right text-emerald-400">Debit</th>
              <th className="px-5 py-3 font-medium text-right text-rose-400">Credit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {Object.entries(balances).map(([id, b]: any) => (
              <tr key={id} className="hover:bg-neutral-800/30">
                <td className="px-5 py-4">{id}</td>
                <td className="px-5 py-4 text-right">${b.debits.toFixed(2)}</td>
                <td className="px-5 py-4 text-right">${b.credits.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-neutral-700 bg-neutral-950 font-bold">
            <tr>
              <td className="px-5 py-4">TOTALS</td>
              <td className="px-5 py-4 text-right">${totalDebits.toFixed(2)}</td>
              <td className="px-5 py-4 text-right">${totalCredits.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
