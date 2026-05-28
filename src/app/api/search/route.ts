export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ clients: [], invoices: [], expenses: [], projects: [] });
    }

    const [clients, invoices, expenses, projects] = await Promise.all([
      prisma.client.findMany({
        where: { name: { contains: query } },
        take: 5
      }),
      prisma.invoice.findMany({
        where: {
          OR: [
            { invoiceNumber: { contains: query } },
            { client: { name: { contains: query } } }
          ]
        },
        include: { client: true },
        take: 5
      }),
      prisma.expense.findMany({
        where: { vendor: { contains: query } },
        take: 5
      }),
      prisma.project.findMany({
        where: { name: { contains: query } },
        take: 5
      })
    ]);

    return NextResponse.json({ clients, invoices, expenses, projects });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
