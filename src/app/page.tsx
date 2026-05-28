"use client";

import { useEffect, useState } from "react";
import { Activity, CreditCard, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { toast } from "sonner";

const COLORS = ['#818cf8', '#a78bfa', '#f472b6', '#38bdf8'];

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/dashboard/charts')
        ]);
        
        if (statsRes.ok && chartsRes.ok) {
          setStats(await statsRes.json());
          setCharts(await chartsRes.json());
        } else {
          toast.error("Failed to fetch dashboard data");
        }
      } catch (error) {
        toast.error("Error loading dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-neutral-400">Your AI-assisted financial summary.</p>
      </div>

      {/* Row 1 - Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-neutral-400">Total Invoiced (USD)</h3>
            <DollarSign className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold">${stats?.invoicedCurrentMonthUSD?.toLocaleString(undefined, {minimumFractionDigits: 2}) || "0.00"}</div>
          <p className="text-xs text-emerald-400 mt-1">Current Month</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-neutral-400">Realized Revenue (INR)</h3>
            <CreditCard className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold">₹{stats?.realizedINR?.toLocaleString() || "0"}</div>
          <p className="text-xs text-neutral-500 mt-1">Total historically</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-neutral-400">Pending Settlements</h3>
            <Activity className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold">{stats?.pendingSettlementsCount || 0} Invoices</div>
          <p className="text-xs text-neutral-500 mt-1">Est value: ${stats?.pendingSettlementsUSD?.toLocaleString() || "0"}</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-neutral-400">Outstanding</h3>
            <TrendingUp className="h-4 w-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400">${stats?.outstandingReceivablesUSD?.toLocaleString() || "0.00"}</div>
          <p className="text-xs text-rose-500/70 mt-1">Overdue receivables</p>
        </div>
      </div>

      {/* Row 2 - Charts & Insights */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <h3 className="text-lg font-medium mb-4">Revenue vs Realized (6mo)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.revenueData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="name" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <RechartsTooltip cursor={{fill: '#262626'}} contentStyle={{backgroundColor: '#171717', borderColor: '#404040', color: '#fff'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                <Bar dataKey="invoiced" name="Invoiced" fill="#818cf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="realized" name="Realized" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <h3 className="text-lg font-medium mb-4">Expense Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts?.expenseData || []} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="total" nameKey="category">
                  {charts?.expenseData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{backgroundColor: '#171717', borderColor: '#404040', color: '#fff'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <h3 className="text-lg font-medium mb-4">90-Day Cashflow Forecast</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.forecastData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="name" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <RechartsTooltip contentStyle={{backgroundColor: '#171717', borderColor: '#404040', color: '#fff'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                <Line type="monotone" dataKey="projected" name="Projected Rev" stroke="#a78bfa" strokeWidth={2} dot={{r: 4}} />
                <Line type="monotone" dataKey="expenses" name="Proj Expenses" stroke="#f472b6" strokeWidth={2} dot={{r: 4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
