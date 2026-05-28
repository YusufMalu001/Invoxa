const fs = require('fs');
const path = require('path');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const pages = [
  {
    path: 'middleware.ts',
    root: true,
    content: `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  
  if (isApiRoute) return NextResponse.next();

  const token = request.cookies.get('invoxa_auth')?.value;

  if (!token && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
`
  },
  {
    path: 'api/auth/login/route.ts',
    content: `import { NextResponse } from 'next/server';
export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (email && password) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('invoxa_auth', 'authenticated', { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 });
    return response;
  }
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}`
  },
  {
    path: 'api/auth/logout/route.ts',
    content: `import { NextResponse } from 'next/server';
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('invoxa_auth');
  return response;
}`
  },
  {
    path: 'login/page.tsx',
    content: `"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Network } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        toast.success("Welcome back");
        window.location.href = '/';
      } else {
        toast.error("Invalid credentials");
      }
    } catch {
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-950">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-12 bg-gradient-to-br from-indigo-900/40 to-neutral-950 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,100 C20,0 50,100 100,0" stroke="#818cf8" strokeWidth="0.5" fill="none" />
            <path d="M0,0 C30,100 70,0 100,100" stroke="#818cf8" strokeWidth="0.5" fill="none" />
          </svg>
        </div>
        <div className="z-10">
          <div className="flex items-center gap-2 mb-6">
            <Network className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Invoxa</h1>
          </div>
          <h2 className="text-4xl font-semibold text-white tracking-tight leading-tight max-w-lg mb-4">
            AI-Native Financial Operations for Modern Agencies
          </h2>
          <p className="text-indigo-200/70 text-lg max-w-md">
            Automate invoicing, reconcile double-entry ledgers, and extract receipts with intelligent OCR.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24">
        <div className="w-full max-w-sm mx-auto">
          <div className="flex justify-end mb-12">
            <div className="w-10 h-6 bg-neutral-800 rounded-full p-1 flex items-center justify-end cursor-pointer">
              <div className="w-4 h-4 bg-neutral-400 rounded-full"></div>
            </div>
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
            <h3 className="text-2xl font-semibold text-white mb-6">Welcome back</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1.5">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-white transition-shadow" 
                  placeholder="admin@invoxa.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1.5">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-white transition-shadow" 
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex items-center justify-between py-2">
                <label className="flex items-center text-sm text-neutral-400 cursor-pointer">
                  <input type="checkbox" className="mr-2 rounded border-neutral-700 bg-neutral-950 text-indigo-600 focus:ring-indigo-500" />
                  Remember me
                </label>
                <a href="#" className="text-sm text-indigo-400 hover:text-indigo-300">Forgot password?</a>
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}`
  },
  {
    path: 'clients/page.tsx',
    content: `"use client";
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
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => { if(Array.isArray(data)) setClients(data); })
      .catch(() => toast.error("Failed to fetch clients"));
  }, []);

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
          <p className="text-neutral-400">Manage client profiles and total revenue.</p>
        </div>
        <button onClick={() => setIsDrawerOpen(true)} className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" /> Add Client
        </button>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col">
        <div className="p-4 border-b border-neutral-800 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 pl-9 pr-4 text-sm focus:ring-1 focus:ring-indigo-500"
            />
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
                <tr key={c.id} className="hover:bg-neutral-800/30 transition-colors cursor-pointer group">
                  <td className="px-5 py-4 font-medium flex items-center">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center mr-3 text-neutral-400">
                      <User className="w-4 h-4" />
                    </div>
                    {c.name}
                  </td>
                  <td className="px-5 py-4 text-neutral-400">{c.country || 'N/A'}</td>
                  <td className="px-5 py-4 text-neutral-400">{c.currency}</td>
                  <td className="px-5 py-4 text-neutral-400">{format(new Date(c.createdAt), 'MMM d, yyyy')}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={\`/clients/\\${c.id}\`} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="w-5 h-5 ml-auto" />
                    </Link>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-neutral-500">No clients found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
          <div className="w-96 bg-neutral-900 h-full border-l border-neutral-800 p-6 flex flex-col slide-in-right">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">New Client</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>
            <form className="space-y-4 flex-1">
              <div>
                <label className="text-sm text-neutral-400 mb-1 block">Name</label>
                <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm" />
              </div>
              <div>
                <label className="text-sm text-neutral-400 mb-1 block">Email</label>
                <input type="email" className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm" />
              </div>
              <button type="button" onClick={() => {toast.success("Client added"); setIsDrawerOpen(false);}} className="w-full py-2 bg-indigo-600 rounded-md mt-4 font-medium hover:bg-indigo-700">Save Client</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}`
  },
  {
    path: 'clients/[id]/page.tsx',
    content: `"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Edit3, ChevronRight } from "lucide-react";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    fetch(\`/api/clients/\\${params.id}\`)
      .then(res => res.json())
      .then(data => setClient(data))
      .catch(() => router.push('/clients'));
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
        <div className="absolute top-0 right-0 p-4">
          <button className="p-2 border border-neutral-700 rounded-md text-neutral-400 hover:text-white transition-colors"><Edit3 className="w-4 h-4" /></button>
        </div>
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-xl font-bold mr-4">
            {client.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{client.name}</h2>
            <p className="text-neutral-400">{client.email || 'No email provided'} • {client.country || 'Global'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 pt-6 border-t border-neutral-800">
          <div>
            <p className="text-sm text-neutral-500 mb-1">Total Invoiced</p>
            <p className="text-xl font-semibold">$0.00</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-1">Total Settled</p>
            <p className="text-xl font-semibold text-emerald-400">$0.00</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-1">Outstanding</p>
            <p className="text-xl font-semibold text-amber-400">$0.00</p>
          </div>
          <div>
            <p className="text-sm text-neutral-500 mb-1">Invoices</p>
            <p className="text-xl font-semibold">{client.invoices?.length || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50">
        <div className="flex border-b border-neutral-800 px-4">
          {['Invoices', 'Settlements', 'Templates', 'Activity'].map((tab, i) => (
            <button key={tab} className={\`py-4 px-4 text-sm font-medium border-b-2 \\${i===0 ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-neutral-500 hover:text-neutral-300'}\`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="p-8 text-center text-neutral-500">
          View all {client.name} data here.
        </div>
      </div>
    </div>
  );
}`
  },
  {
    path: 'expenses/page.tsx',
    content: `"use client";
import { useEffect, useState } from "react";
import { Receipt, Search, Filter, Plus, ScanLine } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/expenses').then(res=>res.json()).then(data => {if(Array.isArray(data)) setExpenses(data);});
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-neutral-400">Track and categorize outgoing payments.</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/ai-ops" className="flex items-center px-4 py-2 border border-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors">
            <ScanLine className="w-4 h-4 mr-2 text-indigo-400" /> AI OCR Receipt
          </Link>
          <button className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" /> Add Expense
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col">
        <div className="p-4 border-b border-neutral-800 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input type="text" placeholder="Search vendor..." className="w-full bg-neutral-950 border border-neutral-800 rounded-md py-2 pl-9 pr-4 text-sm focus:ring-1 focus:ring-indigo-500" />
          </div>
          <button className="flex items-center px-4 border border-neutral-800 bg-neutral-950 rounded-md text-sm"><Filter className="w-4 h-4 mr-2" /> Category</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
              <tr>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Vendor</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Account</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {expenses.map(e => (
                <tr key={e.id} className="hover:bg-neutral-800/30 transition-colors cursor-pointer">
                  <td className="px-5 py-4 text-neutral-400">{format(new Date(e.date), 'MMM d, yyyy')}</td>
                  <td className="px-5 py-4 font-medium flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-neutral-500" /> {e.vendor}
                    {e.aiCategorized && <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400 ml-2">AI</span>}
                  </td>
                  <td className="px-5 py-4"><span className="px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-300">{e.category}</span></td>
                  <td className="px-5 py-4 text-neutral-400">{e.accountId || 'Unlinked'}</td>
                  <td className="px-5 py-4 text-right font-medium">{e.currency} {e.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-neutral-500">No expenses recorded.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}`
  },
  {
    path: 'settlements/page.tsx',
    content: `"use client";
import { useEffect, useState } from "react";
import { ArrowRightLeft, Download } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState<any[]>([]);

  useEffect(() => {
    // We would fetch from API here. For now it's a layout shell.
  }, []);

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
}`
  },
  {
    path: 'recurring/page.tsx',
    content: `"use client";
import { Calendar, Plus, RefreshCcw } from "lucide-react";

export default function RecurringPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recurring Workflows</h2>
          <p className="text-neutral-400">Automated invoices, reminders, and schedules.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4 mr-2" /> New Workflow
        </button>
      </div>

      <div className="flex gap-6">
        <div className="w-1/3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Schedule</h3>
            <Calendar className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="aspect-square bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-center text-neutral-500 text-sm">
            Calendar Component
          </div>
        </div>
        
        <div className="w-2/3 rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-950/30 text-neutral-500 border-b border-neutral-800">
              <tr>
                <th className="px-5 py-3 font-medium">Workflow</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Frequency</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan={4} className="py-12 text-center text-neutral-500">No active recurring workflows.</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}`
  },
  {
    path: 'ledger/trial-balance/page.tsx',
    content: `"use client";
import { useEffect, useState } from "react";
import { Download, AlertTriangle } from "lucide-react";

export default function TrialBalancePage() {
  const [balances, setBalances] = useState<any>({});
  
  useEffect(() => {
    fetch('/api/ledger/trial-balance').then(res=>res.json()).then(data => setBalances(data));
  }, []);

  let totalDebits = 0;
  let totalCredits = 0;
  Object.values(balances).forEach((b: any) => {
    totalDebits += b.debits;
    totalCredits += b.credits;
  });

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
          <p className="font-medium text-sm">Warning: Books are out of balance by $\\{Math.abs(totalDebits - totalCredits).toFixed(2)}</p>
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
            {\\{Object.entries(balances).map(([id, b]: any) => (
              <tr key={id} className="hover:bg-neutral-800/30">
                <td className="px-5 py-4">\\{id}</td>
                <td className="px-5 py-4 text-right">$\\{b.debits.toFixed(2)}</td>
                <td className="px-5 py-4 text-right">$\\{b.credits.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-neutral-700 bg-neutral-950 font-bold">
            <tr>
              <td className="px-5 py-4">TOTALS</td>
              <td className="px-5 py-4 text-right">$\\{totalDebits.toFixed(2)}</td>
              <td className="px-5 py-4 text-right">$\\{totalCredits.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}`
  },
  {
    path: 'reports/page.tsx',
    content: `"use client";
import { BarChart2 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-neutral-400">Deep dive into your financial performance.</p>
        </div>
      </div>
      
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-12 text-center text-neutral-500 flex flex-col items-center">
        <BarChart2 className="w-12 h-12 mb-4 text-indigo-500" />
        <h3 className="text-xl font-bold text-neutral-200 mb-2">Generating Analytics...</h3>
        <p>Comprehensive reporting module is being populated.</p>
      </div>
    </div>
  );
}`
  },
  {
    path: 'settings/page.tsx',
    content: `"use client";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-neutral-400">Configure your platform preferences.</p>
      </div>
      
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 flex flex-col min-h-[500px]">
        <div className="flex border-b border-neutral-800 px-4">
          {['Company', 'Invoices', 'Notifications', 'AI Integrations', 'Team'].map((tab, i) => (
            <button key={tab} className={\`py-4 px-4 text-sm font-medium border-b-2 \\${i===0 ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-neutral-500 hover:text-neutral-300'}\`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="p-8">
          <div className="max-w-xl space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5">Company Name</label>
              <input type="text" defaultValue="Invoxa Agency" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1.5">Base Currency</label>
              <select className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none text-white">
                <option>USD</option>
                <option>EUR</option>
                <option>INR</option>
              </select>
            </div>
            <button className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">Save Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}`
  }
];

pages.forEach(page => {
  const fullPath = page.root ? path.join(__dirname, 'src', page.path) : path.join(__dirname, 'src/app', page.path);
  ensureDir(path.dirname(fullPath));
  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, page.content);
    console.log('Created:', fullPath);
  }
});
