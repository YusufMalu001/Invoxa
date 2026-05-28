"use client";
import { useEffect, useState } from "react";
import { ArrowRightLeft, Download } from "lucide-react";

export default function SettlementsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settlement Intelligence</h2>
          <p className="text-neutral-400">Track cross-border realized payments and FX gaps.</p>
        </div>
        <button className="flex items-center px-4 py-2 border border-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors">
          <Download className="w-4 h-4 mr-2" /> Export
        </button>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <p className="text-sm text-neutral-400 mb-1">Total Invoiced (USD)</p>
          <p className="text-2xl font-bold">$0.00</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <p className="text-sm text-neutral-400 mb-1">Realized (INR)</p>
          <p className="text-2xl font-bold text-emerald-400">₹0</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <p className="text-sm text-neutral-400 mb-1">Settlement Gap (FX + Fees)</p>
          <p className="text-2xl font-bold text-rose-400">-$0.00</p>
        </div>
      </div>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-12 text-center text-neutral-500 flex flex-col items-center">
        <ArrowRightLeft className="w-12 h-12 mb-4 opacity-50" />
        <p>No settlements recorded yet.</p>
        <p className="text-sm mt-2">Settle an invoice from the invoice details page.</p>
      </div>
    </div>
  );
}
