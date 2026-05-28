import { Building2, Wallet, RefreshCw, CircleDollarSign, Plus, ArrowRightLeft } from "lucide-react";

export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Accounts</h2>
          <p className="text-neutral-400">Manage balances, crypto holdings, and expenses.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Add Account
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Bank Account */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-neutral-800 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-200">Mercury USD</h3>
                <p className="text-xs text-neutral-500">Business Checking</p>
              </div>
            </div>
          </div>
          <div className="p-5 flex-1">
            <p className="text-3xl font-bold tracking-tight">$45,000.00</p>
          </div>
          <div className="bg-neutral-950/50 p-3 px-5 border-t border-neutral-800 flex justify-between">
            <button className="text-xs font-medium text-neutral-400 hover:text-white transition-colors flex items-center">
              View Ledger <ArrowRightLeft className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>

        {/* Wise Account */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-neutral-800 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-200">Wise Business</h3>
                <p className="text-xs text-neutral-500">Multi-Currency</p>
              </div>
            </div>
          </div>
          <div className="p-5 flex-1">
            <p className="text-3xl font-bold tracking-tight">$12,500.00</p>
          </div>
          <div className="bg-neutral-950/50 p-3 px-5 border-t border-neutral-800 flex justify-between">
            <button className="text-xs font-medium text-neutral-400 hover:text-white transition-colors flex items-center">
              View Ledger <ArrowRightLeft className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>

        {/* Crypto Wallet */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
          </div>
          <div className="p-5 border-b border-neutral-800 flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-200">USDC Treasury</h3>
                <p className="text-xs text-neutral-500">0x1234...7890</p>
              </div>
            </div>
          </div>
          <div className="p-5 flex-1">
            <p className="text-3xl font-bold tracking-tight">$10,000.00</p>
            <p className="text-xs text-indigo-400 mt-1 flex items-center">
              <CircleDollarSign className="w-3 h-3 mr-1" /> Live from CoinGecko
            </p>
          </div>
          <div className="bg-neutral-950/50 p-3 px-5 border-t border-neutral-800 flex justify-between">
            <button className="text-xs font-medium text-neutral-400 hover:text-white transition-colors flex items-center">
              View Ledger <ArrowRightLeft className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900/50">
        <div className="p-5 border-b border-neutral-800">
          <h3 className="font-medium text-neutral-200">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-950/30 text-neutral-500">
              <tr>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Account</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              <tr className="hover:bg-neutral-800/20 transition-colors">
                <td className="px-5 py-4">Oct 24, 2024</td>
                <td className="px-5 py-4">Invoice INV-2024-0012 Settlement</td>
                <td className="px-5 py-4"><span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-xs">Wise Business</span></td>
                <td className="px-5 py-4 text-right text-emerald-400">+$12,500.00</td>
              </tr>
              <tr className="hover:bg-neutral-800/20 transition-colors">
                <td className="px-5 py-4">Oct 22, 2024</td>
                <td className="px-5 py-4">Software Subscription (AWS)</td>
                <td className="px-5 py-4"><span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-md text-xs">Mercury USD</span></td>
                <td className="px-5 py-4 text-right">- $450.00</td>
              </tr>
              <tr className="hover:bg-neutral-800/20 transition-colors">
                <td className="px-5 py-4">Oct 20, 2024</td>
                <td className="px-5 py-4">Client Retainer - Globex</td>
                <td className="px-5 py-4"><span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md text-xs">USDC Treasury</span></td>
                <td className="px-5 py-4 text-right text-emerald-400">+$10,000.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
