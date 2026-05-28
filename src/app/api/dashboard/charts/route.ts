export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Expense Breakdown
    const expenses = await prisma.expense.groupBy({
      by: ['category'],
      _sum: { amount: true }
    });
    const expenseData = expenses.map(e => ({
      category: e.category,
      total: e._sum.amount || 0
    }));

    // 2. Revenue vs Realized (Mocked calculation since sqlite doesn't easily support month grouping in Prisma)
    // In PostgreSQL, you'd use raw SQL or date_trunc. Since this needs to work on Prisma natively:
    // We fetch last 6 months records and group in JS.
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const invoices = await prisma.invoice.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, total: true }
    });
    const settlements = await prisma.settlementRecord.findMany({
      where: { settledAt: { gte: sixMonthsAgo } },
      select: { settledAt: true, netRealized: true, invoicedUSD: true }
    });

    const monthlyData: Record<string, { invoiced: number, realized: number }> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const name = monthNames[d.getMonth()];
      monthlyData[name] = { invoiced: 0, realized: 0 };
    }

    invoices.forEach(inv => {
      const month = monthNames[inv.createdAt.getMonth()];
      if (monthlyData[month]) monthlyData[month].invoiced += inv.total;
    });

    settlements.forEach(set => {
      if (set.settledAt) {
        const month = monthNames[set.settledAt.getMonth()];
        if (monthlyData[month]) monthlyData[month].realized += set.invoicedUSD; // Proxy for demo
      }
    });

    const revenueData = Object.entries(monthlyData).map(([name, data]) => ({
      name,
      invoiced: data.invoiced,
      realized: data.realized, // Usually netRealized is INR, so we might keep it separate or convert.
    }));

    // 3. Cashflow Forecast (Simplified)
    const forecastData = [
      { name: 'Month + 1', projected: 25000, expenses: 12000 },
      { name: 'Month + 2', projected: 30000, expenses: 12500 },
      { name: 'Month + 3', projected: 28000, expenses: 11000 },
    ];

    return NextResponse.json({
      revenueData,
      expenseData,
      forecastData
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 });
  }
}
