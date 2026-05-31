export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  
  const client = await prisma.client.findUnique({ 
    where: { id },
    include: { 
      invoices: {
        include: {
          settlement: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      projects: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    } 
  });

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  }

  const recurringWorkflows = await prisma.recurringWorkflow.findMany({
    where: { clientId: id }
  });

  const totalRevenue = client.invoices
    .filter(i => i.status === 'PAID')
    .reduce((sum, i) => sum + i.total, 0);

  const totalInvoices = client.invoices.length;

  const outstandingAmount = client.invoices
    .filter(i => i.status === 'SENT' || i.status === 'OVERDUE')
    .reduce((sum, i) => sum + i.total, 0);

  const lastInvoice = client.invoices[0];
  const lastInvoiceDate = lastInvoice ? lastInvoice.createdAt : null;

  const upcomingInvoices = client.invoices
    .filter(i => i.status === 'SENT' || i.status === 'OVERDUE');

  const settlements = client.invoices
    .map(i => i.settlement)
    .filter(Boolean);

  return NextResponse.json({
    ...client,
    totalRevenue,
    totalInvoices,
    outstandingAmount,
    lastInvoiceDate,
    recurringWorkflows,
    upcomingInvoices,
    settlements
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const body = await req.json();
  const client = await prisma.client.update({ where: { id: (await params).id }, data: body });
  return NextResponse.json(client);
}